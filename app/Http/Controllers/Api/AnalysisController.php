<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Video;
use App\Models\AnalysisEvent;
use App\Models\Team;
use App\Models\Player;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AnalysisController extends Controller
{

    public function getEvents($videoId)
    {
        $events = AnalysisEvent::with(['team', 'player', 'assistPlayer'])
            ->where('video_id', $videoId)
            ->get()
            ->map(function($event) {
                return [
                    'id' => $event->id,
                    'time' => $event->time,
                    'endTime' => $event->end_time,
                    'eventType' => $event->event_type,
                    'team' => $event->team ? $event->team->name : null,
                    'team_id' => $event->team_id,
                    'player_id' => $event->player_id,
                    'jerseyNo' => $event->player ? $event->player->jersey_number : null,
                    'playerName' => $event->player ? $event->player->name : null,
                    'action' => $event->action,
                    'assist_player_id' => $event->assist_player_id,
                    'assistJerseyNo' => $event->assistPlayer ? $event->assistPlayer->jersey_number : null,
                    'assistPlayerName' => $event->assistPlayer ? $event->assistPlayer->name : null,
                    'color' => $event->color,
                    'isTimeBased' => $event->is_time_based,
                    'isConfigured' => true // Mark as configured since it's saved
                ];
            });

        return response()->json($events);
    }

    public function save(Request $request)
    {
        $request->validate([
            'video_id' => 'required|exists:videos,id',
            'markers' => 'required|array',
            'markers.*.eventType' => 'required|string',
            'markers.*.time' => 'required|integer',
            'markers.*.endTime' => 'nullable|integer',
            'markers.*.team' => 'nullable|string',
            'markers.*.playerName' => 'nullable|string',
            'markers.*.jerseyNo' => 'nullable|integer',
            'markers.*.action' => 'nullable|string',
            'markers.*.assistPlayerName' => 'nullable|string',
            'markers.*.assistJerseyNo' => 'nullable|integer',
            'markers.*.color' => 'required|string',
            'markers.*.isTimeBased' => 'required|boolean',
            'markers.*.team_id' => 'nullable|integer',
            'markers.*.player_id' => 'nullable|integer',
            'markers.*.assist_player_id' => 'nullable|integer',
        ]);

        // Get the video
        $video = Video::findOrFail($request->video_id);
        
        // Delete existing events for this video to avoid duplicates
        AnalysisEvent::where('video_id', $video->id)->delete();
        
        // Create new events
        foreach ($request->markers as $marker) {
            // Use the provided team_id if available, otherwise find it by team name
            $teamId = $marker['team_id'] ?? null;
            if (!$teamId && $marker['team'] && $marker['team'] !== 'Match') {
                $team = \App\Models\Team::where('name', $marker['team'])->first();
                $teamId = $team ? $team->id : null;
            }
            
            // Use the provided player_id if available, otherwise find it by jersey number and team
            $playerId = $marker['player_id'] ?? null;
            if (!$playerId && $marker['jerseyNo'] && $teamId) {
                $player = \App\Models\Player::where('jersey_no', $marker['jerseyNo'])
                    ->where('team_id', $teamId)
                    ->first();
                $playerId = $player ? $player->id : null;
            }
            
            // Use the provided assist_player_id if available, otherwise find it by jersey number and team
            $assistPlayerId = $marker['assist_player_id'] ?? null;
            if (!$assistPlayerId && $marker['assistJerseyNo'] && $teamId) {
                $assistPlayer = \App\Models\Player::where('jersey_no', $marker['assistJerseyNo'])
                    ->where('team_id', $teamId)
                    ->first();
                $assistPlayerId = $assistPlayer ? $assistPlayer->id : null;
            }
            
            // Special handling for Transition events
            if ($marker['eventType'] === 'Transition' && !$teamId && $marker['team']) {
                // Try to extract team name from the team field
                $teamName = $marker['team'];
                if (strpos($teamName, 'Team A') !== false) {
                    $team = \App\Models\Team::where('name', 'LIKE', '%Team A%')->first();
                    $teamId = $team ? $team->id : null;
                } else if (strpos($teamName, 'Team B') !== false) {
                    $team = \App\Models\Team::where('name', 'LIKE', '%Team B%')->first();
                    $teamId = $team ? $team->id : null;
                }
            }
            
            // Create the event
            AnalysisEvent::create([
                'video_id' => $video->id,
                'event_type' => $marker['eventType'],
                'time' => $marker['time'],
                'end_time' => $marker['endTime'] ?? null,
                'team_id' => $teamId,
                'player_id' => $playerId,
                'action' => $marker['action'] ?? null,
                'assist_player_id' => $assistPlayerId,
                'color' => $marker['color'],
                'is_time_based' => $marker['isTimeBased'],
            ]);
        }
        
        return response()->json([
            'success' => true,
            'video_id' => $video->id
        ]);
    }

    public function stats($videoId)
    {
        $video = Video::with(['events.team', 'events.player', 'events.assistPlayer'])
            ->findOrFail($videoId);

        // Prepare team statistics
        $teamsStats = [];
        $playersStats = [];

        foreach ($video->events as $event) {
            // Team stats
            if ($event->team) {
                $teamName = $event->team->name;
                if (!isset($teamsStats[$teamName])) {
                    $teamsStats[$teamName] = [
                        'possession' => 0,
                        'shots' => 0,
                        'goals' => 0,
                        'fouls' => 0,
                        'corners' => 0,
                    ];
                }

                // Update based on event type
                switch ($event->event_type) {
                    case 'Possession':
                        // Calculate possession time (if we have end_time)
                        if ($event->end_time) {
                            $duration = $event->end_time - $event->time;
                            $teamsStats[$teamName]['possession'] += $duration;
                        }
                        break;
                    case 'Shot':
                        $teamsStats[$teamName]['shots']++;
                        if ($event->action === 'Goal') {
                            $teamsStats[$teamName]['goals']++;
                        }
                        break;
                    case 'Foul':
                        $teamsStats[$teamName]['fouls']++;
                        break;
                    case 'Set Play':
                        if ($event->action === 'Corner Kick') {
                            $teamsStats[$teamName]['corners']++;
                        }
                        break;
                }
            }

            // Player stats
            if ($event->player) {
                $playerId = $event->player->id;
                if (!isset($playersStats[$playerId])) {
                    $playersStats[$playerId] = [
                        'jerseyNo' => $event->player->jersey_number,
                        'name' => $event->player->name,
                        'goals' => 0,
                        'assists' => 0,
                        'fouls' => 0,
                    ];
                }

                switch ($event->event_type) {
                    case 'Shot':
                        if ($event->action === 'Goal') {
                            $playersStats[$playerId]['goals']++;
                        }
                        break;
                    case 'Foul':
                        $playersStats[$playerId]['fouls']++;
                        break;
                }

                // Assists
                if ($event->assistPlayer) {
                    $assistPlayerId = $event->assistPlayer->id;
                    if (!isset($playersStats[$assistPlayerId])) {
                        $playersStats[$assistPlayerId] = [
                            'jerseyNo' => $event->assistPlayer->jersey_number,
                            'name' => $event->assistPlayer->name,
                            'goals' => 0,
                            'assists' => 0,
                            'fouls' => 0,
                        ];
                    }
                    $playersStats[$assistPlayerId]['assists']++;
                }
            }
        }

        // Calculate total possession time to convert to percentage
        $totalPossession = array_sum(array_column($teamsStats, 'possession'));
        if ($totalPossession > 0) {
            foreach ($teamsStats as &$teamStats) {
                $teamStats['possession'] = round(($teamStats['possession'] / $totalPossession) * 100);
            }
        }

        // Prepare timeline
        $timeline = [];
        foreach ($video->events as $event) {
            $timeline[] = [
                'eventType' => $event->event_type,
                'time' => $event->time,
                'endTime' => $event->end_time,
                'team' => $event->team ? $event->team->name : null,
                'playerName' => $event->player ? $event->player->name : null,
                'jerseyNo' => $event->player ? $event->player->jersey_number : null,
                'action' => $event->action,
                'assistPlayerName' => $event->assistPlayer ? $event->assistPlayer->name : null,
                'assistJerseyNo' => $event->assistPlayer ? $event->assistPlayer->jersey_number : null,
                'color' => $event->color,
            ];
        }

        // Sort timeline by time
        usort($timeline, function ($a, $b) {
            return $a['time'] - $b['time'];
        });

        return response()->json([
            'teams' => $teamsStats,
            'players' => array_values($playersStats),
            'timeline' => $timeline,
        ]);
    }

    public function export($videoId)
    {
        $video = Video::with(['events.team', 'events.player', 'events.assistPlayer'])
            ->findOrFail($videoId);

        // Prepare CSV data
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="analysis_' . $videoId . '.csv"',
        ];

        $callback = function() use ($video) {
            $file = fopen('php://output', 'w');
            
            // Add CSV headers
            fputcsv($file, ['Event Type', 'Time', 'End Time', 'Team', 'Player', 'Jersey No', 'Action', 'Assist Player', 'Assist Jersey No']);
            
            // Add data rows
            foreach ($video->events as $event) {
                fputcsv($file, [
                    $event->event_type,
                    $event->time,
                    $event->end_time,
                    $event->team ? $event->team->name : '',
                    $event->player ? $event->player->name : '',
                    $event->player ? $event->player->jersey_number : '',
                    $event->action,
                    $event->assistPlayer ? $event->assistPlayer->name : '',
                    $event->assistPlayer ? $event->assistPlayer->jersey_number : '',
                ]);
            }
            
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }


    public function showStats($videoId)
    {
        $video = Video::findOrFail($videoId);
        $teams = Team::where('video_id', $videoId)->get();
        
        // Get all events for this video
        $events = AnalysisEvent::with(['team', 'player', 'assistPlayer'])
            ->where('video_id', $videoId)
            ->get();
        
        // Calculate statistics
        $stats = $this->calculateStats($events, $teams);
        
        return view('football.stats', compact('video', 'teams', 'stats', 'videoId'));
    }

    private function calculateStats($events, $teams)
    {
        $stats = [
            'events' => [],
            'possession' => [
                'team1' => 0,
                'team2' => 0,
            ]
        ];
        
        // Initialize event types
        $eventTypes = [
            'Shot' => ['Goal', 'Save', 'Wide', 'Blocked'],
            'Foul' => ['Yellow Card', 'Red Card'],
            'Set Play' => ['Kick off', 'Free Kick', 'Throw In', 'Penalty Kick', 'Goal Kick', 'Corner Kick'],
            'Transition' => ['Transition'],
            'Offside' => ['Offside'],
            'Aerial Duel' => ['Aerial Duel'],
        ];
        
        // Initialize stats array
        foreach ($eventTypes as $eventType => $actions) {
            $stats['events'][$eventType] = [
                'actions' => [],
                'team1' => 0,
                'team2' => 0,
                'total' => 0
            ];
            
            foreach ($actions as $action) {
                $stats['events'][$eventType]['actions'][$action] = [
                    'team1' => 0,
                    'team2' => 0,
                    'total' => 0
                ];
            }
        }
        
        // Calculate possession
        $totalPossessionTime = 0;
        $team1Possession = 0;
        $team2Possession = 0;
        
        foreach ($events as $event) {
            // Handle possession events
            if ($event->event_type === 'Possession' && $event->end_time) {
                $duration = $event->end_time - $event->time;
                $totalPossessionTime += $duration;
                
                if ($event->team_id === $teams[0]->id) {
                    $team1Possession += $duration;
                } elseif ($event->team_id === $teams[1]->id) {
                    $team2Possession += $duration;
                }
            }
            
            // Skip if event type is not in our list
            if (!isset($stats['events'][$event->event_type])) {
                continue;
            }
            
            // Determine team index
            $teamIndex = null;
            if ($event->team_id === $teams[0]->id) {
                $teamIndex = 'team1';
            } elseif ($event->team_id === $teams[1]->id) {
                $teamIndex = 'team2';
            }
            
            // Get action name or use event type as default
            $action = $event->action ?? $event->event_type;
            
            // Skip if action is not in our list for this event type
            if (!isset($stats['events'][$event->event_type]['actions'][$action])) {
                continue;
            }
            
            // Increment counts
            if ($teamIndex) {
                $stats['events'][$event->event_type]['actions'][$action][$teamIndex]++;
                $stats['events'][$event->event_type]['actions'][$action]['total']++;
                $stats['events'][$event->event_type][$teamIndex]++;
                $stats['events'][$event->event_type]['total']++;
            }
        }
        
        // Calculate possession percentages
        if ($totalPossessionTime > 0) {
            $stats['possession']['team1'] = round(($team1Possession / $totalPossessionTime) * 100);
            $stats['possession']['team2'] = round(($team2Possession / $totalPossessionTime) * 100);
        }
        
        return $stats;
    }

    public function showFilter($videoId)
    {
        // Fetch the analysis data with relationships
        $analysis = AnalysisEvent::with(['team', 'player', 'assistPlayer'])
            ->where('video_id', $videoId)
            ->get();
        
        if ($analysis->isEmpty()) {
            abort(404, 'Analysis not found');
        }
        
        // Convert the collection to array format
        $markers = $analysis->map(function($event) {
            return [
                'id' => $event->id,
                'eventType' => $event->event_type,
                'time' => $event->time,
                'endTime' => $event->end_time,
                'team_id' => $event->team_id,
                'team' => $event->team ? $event->team->name : null,
                'player_id' => $event->player_id,
                'playerName' => $event->player ? $event->player->name : null,
                'jerseyNo' => $event->player ? $event->player->jersey_number : null,
                'action' => $event->action,
                'assist_player_id' => $event->assist_player_id,
                'assistPlayerName' => $event->assistPlayer ? $event->assistPlayer->name : null,
                'assistJerseyNo' => $event->assistPlayer ? $event->assistPlayer->jersey_number : null,
                'color' => $event->color,
                'isTimeBased' => true,
            ];
        })->toArray();
        
        // Get teams data
        $teams = Team::where('video_id', $videoId)->get();

        // Add players to teams
        foreach ($teams as $team) {
            $team->players = Player::where('team_id', $team->id)->get();
        }
        
        // Get video data
        $video = Video::find($videoId);
        
        // Create analysis object with markers
        $analysisData = [
            'markers' => $markers, // This is the key change - wrap markers in an object
        ];
        
        return view('football.filter', compact('videoId', 'teams', 'video', 'analysisData'));
    }
    
    public function downloadPdf($videoId)
    {
        // Get the same data you use for the stats page
        $video = Video::findOrFail($videoId);
        $teams = Team::where('video_id', $videoId)->get();
        $events = AnalysisEvent::with(['team', 'player', 'assistPlayer'])
            ->where('video_id', $videoId)
            ->get();
        $teams = Team::where('video_id', $videoId)->get();
        $stats = $this->calculateStats($events, $teams); // Use the existing calculateStats method
        
        $pdf = Pdf::loadView('football.pdf', [
            'video' => $video,
            'teams' => $teams,
            'stats' => $stats,
            'videoId' => $videoId
        ]);
        
        return $pdf->download('match_statistics_' . $video->title . '.pdf');
    }

}
