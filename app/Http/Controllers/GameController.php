<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use PhpParser\Node\Expr\FuncCall;

use function Laravel\Prompts\table;

class GameController extends Controller
{
    public function gamePage()
    {
        return view('games/addGame');
    }
    public function  allGames()
    {   if(Auth::user()->role=='Coache'){
        $userID = Auth::id();
        $gameData = DB::table('videos')->where('user_id', $userID)->get();
    }
    else{
        $gameData = DB::table('videos')->get();
    }
        return view('games/adminGames', ['game' => $gameData]);
    }
    public function createGame(Request $req)
    {
        $validated = $req->validate([
            'title' => 'required|string|max:255',
            'video_url' => 'required|file|mimetypes:video/*|max:51200', //url

        ]);
        $path = $req->file('video_url')->store('videos', 'public');

        // 3. Generate the public URL
        $videoUrl = asset('storage/' . $path);

        $videoSaved = DB::table('videos')->insertGetId([
            'user_id' => Auth::id(),
            'title' => $req->title,
            'video_url' => $videoUrl,
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now()
        ]);
        $videoData = Db::table('videos')->where('id', $videoSaved)->first();
        return redirect()->route('teamPage', ['video_id' => $videoSaved, 'videoData' => $videoData]);
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
    
    return view('football.analyzer', ['video' => $video, 'teams' => $teams]);
}
}
