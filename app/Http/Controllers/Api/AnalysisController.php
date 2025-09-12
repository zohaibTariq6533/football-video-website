<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Video;
use App\Models\AnalysisEvent;
use Illuminate\Http\Request;

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
        ]);

        // Get the video
        $video = Video::findOrFail($request->video_id);

        // Delete existing events for this video to avoid duplicates
        AnalysisEvent::where('video_id', $video->id)->delete();

        // Create new events
        foreach ($request->markers as $marker) {
            // Find team by name
            $team = null;
            if ($marker['team'] && $marker['team'] !== 'Match') {
                $team = \App\Models\Team::where('name', $marker['team'])->first();
            }

            // Find player by jersey number and team
            $player = null;
            if ($marker['jerseyNo'] && $team) {
                $player = \App\Models\Player::where('jersey_number', $marker['jerseyNo'])
                    ->where('team_id', $team->id)
                    ->first();
            }

            // Find assist player by jersey number and team
            $assistPlayer = null;
            if ($marker['assistJerseyNo'] && $team) {
                $assistPlayer = \App\Models\Player::where('jersey_number', $marker['assistJerseyNo'])
                    ->where('team_id', $team->id)
                    ->first();
            }

            AnalysisEvent::create([
                'video_id' => $video->id,
                'event_type' => $marker['eventType'],
                'time' => $marker['time'],
                'end_time' => $marker['endTime'] ?? null,
                'team_id' => $team ? $team->id : null,
                'player_id' => $player ? $player->id : null,
                'action' => $marker['action'] ?? null,
                'assist_player_id' => $assistPlayer ? $assistPlayer->id : null,
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
}
