<?php

namespace App\Http\Controllers;

use App\Models\MatchAnalysis;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class FootballAnalyzerController extends Controller
{
    public function index()
    {
        return view('football.analyzer');
    }

    public function getMatchData($matchId)
    {
        // Sample data - replace with actual database query
        $events = [
            ['id' => 1, 'type' => 'Possession', 'time' => 300, 'team' => 'Barca', 'duration' => 180],
            ['id' => 2, 'type' => 'Transition', 'time' => 480, 'team' => 'Real', 'duration' => 45],
            ['id' => 3, 'type' => 'Set Play', 'time' => 720, 'team' => 'Barca', 'duration' => 30],
            ['id' => 4, 'type' => 'Attack 3rd', 'time' => 1200, 'team' => 'Real', 'duration' => 90],
            ['id' => 5, 'type' => 'Shot', 'time' => 1500, 'team' => 'Barca', 'duration' => 15],
            ['id' => 6, 'type' => 'Foul', 'time' => 1800, 'team' => 'Real', 'duration' => 20],
            ['id' => 7, 'type' => 'Offside', 'time' => 2100, 'team' => 'Barca', 'duration' => 10],
            ['id' => 8, 'type' => 'Goal', 'time' => 2700, 'team' => 'Real', 'duration' => 30],
        ];

        return response()->json([
            'match_id' => $matchId,
            'duration' => 6000, // 100 minutes in seconds
            'events' => $events,
            'video_url' => asset('videos/match_' . $matchId . '.mp4')
        ]);
    }

    public function saveAnalysis(Request $request)
    {
        try {
            $validated = $request->validate([
                'match_id' => 'required|integer',
                'event_type' => 'required|string',
                'start_time' => 'required|integer',
                'end_time' => 'required|integer',
                'team' => 'nullable|string',
                'action' => 'nullable|string'
            ]);

            // Log the analysis data (you can save to database here)
            Log::info('Analysis saved:', $validated);

            // Here you would typically save to your database
            // Example:
            // MatchAnalysis::create($validated);

            return response()->json([
                'success' => true,
                'message' => 'Analysis saved successfully',
                'data' => $validated
            ]);

        } catch (\Exception $e) {
            Log::error('Error saving analysis: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error saving analysis: ' . $e->getMessage()
            ], 500);
        }
    }

    public function storeBulk(Request $request)
    {
        $validated = $request->validate([
            // 'match_id' => 'required|integer|exists:matches,id',
            'analysis_data' => 'required|array',
            'analysis_data.*.event_type' => 'required|string',
            'analysis_data.*.start_time' => 'required|string',
            'analysis_data.*.team' => 'required|string',
            'analysis_data.*.action' => 'nullable|string',
        ]);

        foreach ($validated['analysis_data'] as $data) {
            MatchAnalysis::create([
                // 'match_id' => $validated['match_id'],
                'event_type' => $data['event_type'],
                'start_time' => $data['start_time'],
                'team' => $data['team'],
                'action' => $data['action'] ?? null,
            ]);
        }

        return response()->json(['success' => true, 'message' => 'Analysis saved successfully']);
    }
}