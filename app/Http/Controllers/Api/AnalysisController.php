<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Video;
use App\Models\AnalysisEvent;
use App\Models\Team;
use App\Models\Player;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AnalysisController extends Controller
{
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


     public function showStats($matchId, $videoId)
    {
        // Fetch the analysis data
        $analyses = AnalysisEvent::where('video_id', $videoId)->get();
        
        if ($analyses->isEmpty()) {
            abort(404, 'Analysis not found');
        }

        // Convert the collection to array format
        $markers = $analyses->map(function($analysis) {
            return [
                'eventType' => $analysis->event_type,
                'time' => $analysis->time,
                'endTime' => $analysis->end_time,
                'team' => $analysis->team ? $analysis->team->name : null,
                'playerName' => $analysis->player ? $analysis->player->name : null,
                'jerseyNo' => $analysis->player ? $analysis->player->jersey_number : null,
                'action' => $analysis->action,
                'assistPlayerName' => $analysis->assistPlayer ? $analysis->assistPlayer->name : null,
                'assistJerseyNo' => $analysis->assistPlayer ? $analysis->assistPlayer->jersey_number : null,
                'color' => $analysis->color,
            ];
        })->toArray();

        // Debug the data
        
        
        // Process the data for stats
        $stats = $this->processStatsData($markers);
        
        return view('football.stats', compact('matchId', 'videoId', 'stats'));
    }

    
    public function showFilter($matchId, $videoId)
    {
        // Fetch the analysis data
        $analysis = AnalysisEvent::where('video_id', $videoId)->get();
        
        if ($analysis->isEmpty()) {
            abort(404, 'Analysis not found');
        }

        // Convert the collection to array format
        $markers = $analysis->map(function($analysis) {
            return [
                'eventType' => $analysis->event_type,
                'time' => $analysis->time,
                'endTime' => $analysis->end_time,
                'team' => $analysis->team ? $analysis->team->name : null,
                'playerName' => $analysis->player ? $analysis->player->name : null,
                'jerseyNo' => $analysis->player ? $analysis->player->jersey_number : null,
                'action' => $analysis->action,
                'assistPlayerName' => $analysis->assistPlayer ? $analysis->assistPlayer->name : null,
                'assistJerseyNo' => $analysis->assistPlayer ? $analysis->assistPlayer->jersey_number : null,
                'color' => $analysis->color,
            ];
        })->toArray();
        
        // Process the data for filtering
        $filterData = $this->processFilterData($markers);
        
        return view('football.filter', compact('matchId', 'videoId', 'filterData'));
    }
    
    private function processStatsData($markers)
    {
        // Process markers to generate stats
        $stats = [
            'totalEvents' => count($markers),
            'eventsByType' => [],
            'eventsByTeam' => [],
            'goals' => 0,
            'shots' => 0,
            'fouls' => 0,
        ];
        
        foreach ($markers as $marker) {
            // Count by event type
            if (!isset($stats['eventsByType'][$marker['eventType']])) {
                $stats['eventsByType'][$marker['eventType']] = 0;
            }
            $stats['eventsByType'][$marker['eventType']]++;
            
            // Count by team
            if (!empty($marker['team'])) {
                if (!isset($stats['eventsByTeam'][$marker['team']])) {
                    $stats['eventsByTeam'][$marker['team']] = 0;
                }
                $stats['eventsByTeam'][$marker['team']]++;
            }
            
            // Count specific events
            if ($marker['eventType'] === 'Shot') {
                $stats['shots']++;
                if ($marker['action'] === 'Goal') {
                    $stats['goals']++;
                }
            }
            
            if ($marker['eventType'] === 'Foul') {
                $stats['fouls']++;
            }
        }
        // dd($stats);
        return $stats;
    }
    
    private function processFilterData($markers)
    {
        // Process markers for filtering
        $filterData = [
            'teams' => [],
            'eventTypes' => [],
            'players' => [],
            'timeRanges' => [
                'firstHalf' => ['start' => 0, 'end' => 2700],
                'secondHalf' => ['start' => 2700, 'end' => 5400],
            ],
            'allMarkers' => $markers,
        ];
        
        foreach ($markers as $marker) {
            // Collect teams
            if (!empty($marker['team']) && !in_array($marker['team'], $filterData['teams'])) {
                $filterData['teams'][] = $marker['team'];
            }
            
            // Collect event types
            if (!in_array($marker['eventType'], $filterData['eventTypes'])) {
                $filterData['eventTypes'][] = $marker['eventType'];
            }
            
            // Collect players
            if (!empty($marker['playerName']) && !in_array($marker['playerName'], $filterData['players'])) {
                $filterData['players'][] = $marker['playerName'];
            }
        }
        // dd($filterData);
        
        return $filterData;
    }
}
