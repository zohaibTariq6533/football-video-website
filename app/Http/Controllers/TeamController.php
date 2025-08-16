<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Dotenv\Util\Str;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use PHPUnit\Framework\Constraint\Count;

use function Laravel\Prompts\select;

class TeamController extends Controller
{
    

    // public function deleteTeam(string $id)
    // {
    //     $delete = DB::table('teams')->where('id', $id)->delete();
    //     return redirect()->route('showTeams');
    // }

    

    public function showCreatePage(string $video_id)
    {   
        $videoData=DB::table('videos')->where('id',$video_id)->first();
        return view('teams/teamPage',['video_id'=>$video_id,'video'=>$videoData]);
    }
    //     
    //     
    // public function createTeam(Request $req, string $video_i)
    // {

    //     $validated = $req->validate([
    //         'team_name' => 'required|string|max:255',
    //         'players' => 'nullable|array|max:22',
    //         'players.*.first_name' => 'required|string|max:255',
    //         'players.*.last_name' => 'required|string|max:255',
    //         'players.*.number' => 'required|integer|min:0|max:99',
    //     ]);

    //     // Validate unique jersey numbers within the team
    //     if (isset($validated['players'])) {
    //         $jerseyNumbers = array_column($validated['players'], 'number');
    //         if (count($jerseyNumbers) !== count(array_unique($jerseyNumbers))) {
    //             return back()->withErrors(['players' => 'Jersey numbers must be unique within the team.'])->withInput();
    //         }
    //     }

    //     // Use database transaction for data integrity
    //     try {
    //         DB::beginTransaction();

    //         // Insert Team
    //         $teamId = DB::table('teams')->insertGetId([
    //             'video_id' => $video_i,
    //             'name' => $validated['team_name'],
    //             'created_at' => now(),
    //             'updated_at' => now()
    //         ]);

    //         if (!$teamId) {
    //             throw new \Exception('Failed to create team');
    //         }

    //         // Insert Players if any were added
    //         if (isset($validated['players']) && !empty($validated['players'])) {
    //             $playersData = [];
    //             foreach ($validated['players'] as $player) {
    //                 $playersData[] = [
    //                     'team_id' => $teamId,
    //                     'name' => trim($player['first_name']),
    //                     'last_name' => trim($player['last_name']),
    //                     'jersey_number' => $player['number'],
    //                     'created_at' => now(),
    //                     'updated_at' => now()
    //                 ];
    //             }

    //             // Insert players in smaller batches to handle large datasets
    //             $chunks = array_chunk($playersData, 10);
    //             foreach ($chunks as $chunk) {
    //                 $result = DB::table('players')->insert($chunk);
    //                 if (!$result) {
    //                     throw new \Exception('Failed to insert players batch');
    //                 }
    //             }
    //         }

    //         DB::commit();
    //         return redirect()->back()->with('success_team1', 'Team created successfully!');
            
    //         // return redirect()->route('showTeams')->with('success', 'Team created successfully with ' . (isset($validated['players']) ? count($validated['players']) : 0) . ' players!');
    //     } catch (\Exception $e) {
    //         DB::rollBack();

    //         // Log the error for debugging
    //         Log::error('Team creation failed: ' . $e->getMessage(), [
    //             'video_id' => $video_i,
    //             'team_name' => $validated['team_name'],
    //             'players_count' => isset($validated['players']) ? count($validated['players']) : 0,
    //             'error' => $e->getMessage(),
    //             'trace' => $e->getTraceAsString()
    //         ]);

    //         return back()->withErrors(['error' => 'Failed to create team. Please try again. If the problem persists, contact support.'])->withInput();
    //     }
    // }
    // public function deletePlayer(string $id){
    //     // Get the team_id before deleting the player
    //     // Get the player to retrieve the team_id before deletion
    // $player = DB::table('players')->where('id', $id)->first();

    // // Safety check: if player doesn't exist
    // if (!$player) {
    //     return redirect()->back()->with('error', 'Player not found.');
    // }

    // Delete the player
    // DB::table('players')->where('id', $id)->delete();

    // // Redirect back to the team detail page with team ID
    // return redirect()->route('teamDetailPage', ['id' => $player->team_id])
    //                  ->with('success', 'Player deleted successfully!');
    // }

    public function createTeam(Request $req, string $video_id)
    {
        $validated = $req->validate([
            'team1_name' => 'required|string|max:255',
            'team2_name' => 'required|string|max:255',
            'team1_players' => 'nullable|array|max:22',
            'team1_players.*.first_name' => 'required|string|max:255',
            'team1_players.*.last_name' => 'required|string|max:255',
            'team1_players.*.number' => 'required|min:0|max:99',
            'team2_players' => 'nullable|array|max:22',
            'team2_players.*.first_name' => 'required|string|max:255',
            'team2_players.*.last_name' => 'required|string|max:255',
            'team2_players.*.number' => 'required|integer|min:0|max:99',
        ]);

        // Validate unique team names
        if ($validated['team1_name'] === $validated['team2_name']) {
            return back()->withErrors(['team2_name' => 'Team names must be different.'])->withInput();
        }

        // Check if team names already exist for this video
        $existingTeams = DB::table('teams')
            ->where('video_id', $video_id)
            ->whereIn('name', [$validated['team1_name'], $validated['team2_name']])
            ->pluck('name')
            ->toArray();

        if (!empty($existingTeams)) {
            $errorMessage = 'The following team names already exist: ' . implode(', ', $existingTeams);
            return back()->withErrors(['error' => $errorMessage])->withInput();
        }

        // Validate unique jersey numbers within each team
        foreach (['team1_players', 'team2_players'] as $teamKey) {
            if (isset($validated[$teamKey])) {
                $jerseyNumbers = array_column($validated[$teamKey], 'number');
                if (count($jerseyNumbers) !== count(array_unique($jerseyNumbers))) {
                    $teamName = $teamKey === 'team1_players' ? 'Team 1' : 'Team 2';
                    return back()->withErrors([$teamKey => "Jersey numbers must be unique within {$teamName}."])->withInput();
                }
            }
        }

        // Use database transaction for data integrity
        try {
            DB::beginTransaction();

            $createdTeams = [];
            $totalPlayers = 0;

            // Create both teams
            foreach ([
                ['name' => $validated['team1_name'], 'players' => $validated['team1_players'] ?? [], 'type' => 'team1'],
                ['name' => $validated['team2_name'], 'players' => $validated['team2_players'] ?? [], 'type' => 'team2']
            ] as $teamData) {
                
                // Insert Team
                $teamId = DB::table('teams')->insertGetId([
                    'video_id' => $video_id,
                    'name' => $teamData['name'],
                    'team_type' => $teamData['type'],
                    'created_at' => now(),
                    'updated_at' => now()
                ]);

                if (!$teamId) {
                    throw new \Exception("Failed to create {$teamData['name']}");
                }

                $createdTeams[] = [
                    'id' => $teamId,
                    'name' => $teamData['name'],
                    'type' => $teamData['type'],
                    'players_count' => count($teamData['players'])
                ];

                // Insert Players if any were added
                if (!empty($teamData['players'])) {
                    $playersData = [];
                    foreach ($teamData['players'] as $player) {
                        $playersData[] = [
                            'team_id' => $teamId,
                            'name' => trim($player['first_name']),
                            'last_name' => trim($player['last_name']),
                            'jersey_number' => $player['number'],
                            'created_at' => now(),
                            'updated_at' => now()
                        ];
                    }

                    // Insert players in batches
                    $chunks = array_chunk($playersData, 10);
                    foreach ($chunks as $chunk) {
                        $result = DB::table('players')->insert($chunk);
                        if (!$result) {
                            throw new \Exception("Failed to insert players for {$teamData['name']}");
                        }
                    }
                    
                    $totalPlayers += count($playersData);
                }
            }

            DB::commit();

            // Create success message
            $successMessage = "Both teams created successfully! ";
            $successMessage .= "Team 1: '{$createdTeams[0]['name']}' with {$createdTeams[0]['players_count']} players, ";
            $successMessage .= "Team 2: '{$createdTeams[1]['name']}' with {$createdTeams[1]['players_count']} players. ";
            $successMessage .= "Total: {$totalPlayers} players added.";

            return redirect()->route('gamecreatedPage', ['video_id' => $video_id]);
            // return [$video_id,$teamId];

        } catch (\Exception $e) {
            DB::rollBack();
            dd($e->getMessage());
            // Log the error for debugging
            // Log::error('Teams creation failed: ' . $e->getMessage(), [
            //     'video_id' => $video_id,
            //     'team1_name' => $validated['team1_name'],
            //     'team2_name' => $validated['team2_name'],
            //     'team1_players_count' => isset($validated['team1_players']) ? count($validated['team1_players']) : 0,
            //     'team2_players_count' => isset($validated['team2_players']) ? count($validated['team2_players']) : 0,
            //     'error' => $e->getMessage(),
            //     'trace' => $e->getTraceAsString()
            // ]);

            // return back()->withErrors(['error' => 'Failed to create teams. Please try again. If the problem persists, contact support.'])->withInput();
        }
    }
}
