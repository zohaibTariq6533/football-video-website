<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use PhpParser\Node\Expr\FuncCall;

use function Laravel\Prompts\table;

class GameController extends Controller
{
    public function gamePage()
    {
        return view('games.addGame');
    }

    public function  allGames()
    {   
        if(Auth::user()->role=='Coache'){
            $userID = Auth::id();
            $gameData = DB::table('videos')->where('user_id', $userID)->orderBy('created_at','desc')->get();
        }
        else{
            $gameData = DB::table('videos')->orderBy('created_at','desc')->get();
        }   

        return view('games.adminGames', ['game' => $gameData]);
    }

    // public function createGame(Request $req)
    // {
    //     $validated = $req->validate([
    //         'title' => 'required|string|max:255',
    //         'video_url' => 'required|file|mimetypes:video/*', //url

    //     ]);
    //     $path = $req->file('video_url')->store('videos', 'public');

    //     // 3. Generate the public URL
    //     $videoUrl = asset('storage/' . $path);

    //     $videoSaved = DB::table('videos')->insertGetId([
    //         'user_id' => Auth::id(),
    //         'title' => $req->title,
    //         'video_url' => $videoUrl,
    //         'created_at' => Carbon::now(),
    //         'updated_at' => Carbon::now()
    //     ]);
    //     $videoData = Db::table('videos')->where('id', $videoSaved)->first();
    //     return redirect()->route('teamPage', ['video_id' => $videoSaved, 'videoData' => $videoData]);
    // }

    public function createGame(Request $req)
    {
        $validated = $req->validate([
            'title' => 'required|string|max:255',
            'video_url' => 'required|file|mimetypes:video/*',
        ]);

        $file = $req->file('video_url');
        $filename = uniqid() . '.' . $file->getClientOriginalExtension();
        $path = 'videos/' . $filename;
        
        // Use streaming to avoid memory issues
        $stream = fopen($file->getRealPath(), 'r+');
        Storage::disk('public')->put($path, $stream);
        fclose($stream);

        // Generate the public URL
        $videoUrl = asset('storage/' . $path);

        // Save to database
        $videoSaved = DB::table('videos')->insertGetId([
            'user_id' => Auth::id(),
            'title' => $req->title,
            'video_url' => $videoUrl,
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now()
        ]);

        $videoData = DB::table('videos')->where('id', $videoSaved)->first();

        dd($videoData);

        return redirect()->route('teamPage', ['video_id' => $videoSaved, 'videoData' => $videoData]);
    }

    public function uploadChunk(Request $req)
    {
        try {
            $req->validate([
                'file' => 'required|file',
                'file_id' => 'required|string',
                'chunk_index' => 'required|integer',
                'total_chunks' => 'required|integer',
            ]);

            $file = $req->file('file');
            $fileId = $req->input('file_id');
            $chunkIndex = $req->input('chunk_index');
            $totalChunks = $req->input('total_chunks');

            // Create temporary directory for chunks
            $tempDir = storage_path('app/temp/uploads/' . $fileId);
            if (!file_exists($tempDir)) {
                mkdir($tempDir, 0755, true);
            }

            // Store chunk
            $chunkPath = $tempDir . '/' . $chunkIndex;
            move_uploaded_file($file->getRealPath(), $chunkPath);

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function completeUpload(Request $req)
    {
        try {
            $req->validate([
                'file_id' => 'required|string',
                'title' => 'required|string|max:255',
                'original_name' => 'required|string',
                'total_chunks' => 'required|integer',
            ]);

            $fileId = $req->input('file_id');
            $title = $req->input('title');
            $originalName = $req->input('original_name');
            $totalChunks = $req->input('total_chunks');

            $tempDir = storage_path('app/temp/uploads/' . $fileId);
            $finalPath = storage_path('app/public/videos/' . uniqid() . '.' . pathinfo($originalName, PATHINFO_EXTENSION));

            // Merge chunks
            $finalFile = fopen($finalPath, 'w');
            for ($i = 0; $i < $totalChunks; $i++) {
                $chunkPath = $tempDir . '/' . $i;
                if (file_exists($chunkPath)) {
                    $chunk = fopen($chunkPath, 'r');
                    stream_copy_to_stream($chunk, $finalFile);
                    fclose($chunk);
                    unlink($chunkPath); // Delete chunk after merging
                }
            }
            fclose($finalFile);

            // Clean up temp directory
            rmdir($tempDir);

            // Generate public URL
            $videoUrl = asset('storage/videos/' . basename($finalPath));

            // Save to database
            $videoSaved = DB::table('videos')->insertGetId([
                'user_id' => Auth::id(),
                'title' => $title,
                'video_url' => $videoUrl,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now()
            ]);

            $videoData = DB::table('videos')->where('id', $videoSaved)->first();

            return redirect()->route('teamPage', ['video_id' => $videoSaved, 'videoData' => $videoData]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function gameCreatedPage(string $video_id)
    {
        $videoData = DB::table('videos')->where('id', $video_id)->first();
        return view('games.gameCreated', ['video' => $videoData]);
    }
    // public function recentGame(){

    //     $recentGame=DB::table('videos')->orderBy('created_at','desc')->take('5')->get();
    //     // Get the ID of the most recent game (if exists)
    //     $recentGameIds = $recentGame->pluck('id')->toArray();
    //     return view('dashboard',['recentGame'=>$recentGame,'recentGameIds' => $recentGameIds]);
    //     // return $recentGameId;
    // }
    public function recentGame()
    {   
        $userID=Auth::id();
        $recentGame = DB::table('videos')->orderBy('created_at', 'desc')->where('user_id',$userID)->take(1)->get();

        foreach ($recentGame as $game) {
            // Get all teams for this game
            $teams = DB::table('teams')->where('video_id', $game->id)->pluck('id');
            // Count all players in those teams
            $game->total_players = DB::table('players')->whereIn('team_id', $teams)->count();
        }

        $recentGameIds = collect($recentGame)->pluck('id')->toArray();

        return view('dashboard', [
            'recentGame' => $recentGame,
            'recentId'=>$recentGameIds 
        ]);
    }

    public function adminAnalyzedGame(){
        $adminAnalyzedGame = DB::table('videos')->where('status','In progress')->get();
        return view('games.inProgressGames',['video'=>$adminAnalyzedGame]);

    }

    // public function videoAnalyze(string $id){
    //     $video=DB::table('videos')->where('id',$id)->first();
    //     // dd($video);
    //     // return view('analyze-video',['video'=>$video]);
    //     return view('football.analyzer',['video'=>$video]);

    // }

    public function videoAnalyze(string $id){

        $video = DB::table('videos')->where('id', $id)->first();

        // get both teams for this video
        $both_teams = DB::table('teams')->where('video_id', $id)->get();

        if ($both_teams->count() < 2) {
            return response()->json(['error' => 'Not enough teams found'], 404);
        }

        $team_1 = $both_teams[0];
        $team_2 = $both_teams[1];

        // get players for each team
        $team_1_players = DB::table('players')->where('team_id', $team_1->id)->get();
        $team_2_players = DB::table('players')->where('team_id', $team_2->id)->get();

        // format both teams
        $teams = [
            [
                'id' => $team_1->id,
                'name' => $team_1->name,
                'color' => '#EF4444',
                'bgColor' => 'bg-red-600',
                'shortName' => 'Team A', // optional
                'players' => $team_1_players->map(function ($p) {
                    return [
                        'id' => $p->id,
                        'name' => $p->name . ' ' . $p->last_name,
                        'jerseyNo' => $p->jersey_number,
                    ];
                })->values(),
            ],
            [
                'id' => $team_2->id,
                'name' => $team_2->name,
                'color' => '#10B981',
                'bgColor' => 'bg-green-600',
                'shortName' => 'Team B',
                'players' => $team_2_players->map(function ($p) {
                    return [
                        'id' => $p->id,
                        'name' => $p->name . ' ' . $p->last_name,
                        'jerseyNo' => $p->jersey_number,
                    ];
                })->values(),
            ]
        ];


        // dd($teams);
        
        $videoId = $video->id;
        
        return view('football.analyzer', ['video' => $video, 'teams' => $teams, 'videoId' => $videoId]);
    }
}
