<?php

use App\Http\Controllers\Api\AnalysisController;
use App\Http\Controllers\GameController;
use App\Http\Controllers\TeamController;
use App\Http\Controllers\UserController;
use App\Http\Middleware\AdminCheck;
// use App\Http\Middleware\TestUser;
use App\Http\Middleware\ValidUser;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\FootballAnalyzerController;


//Public Pages
Route::get('/', [UserController::class,'loginPage'])->name('login');
Route::post('/login',[UserController::class,'loginUser'])->name('loginUser');



Route::middleware(['isUserValid',AdminCheck::class])->group(function(){
    Route::get('/admin',[UserController::class,'adminView'])->name('admin')->withoutMiddleware(AdminCheck::class);
    //Dashboard
    Route::get('/admin/dashboard', [GameController::class,'recentGame'])->name('dashboard')->withoutMiddleware(AdminCheck::class);
    //Games 
    Route::get('/admin/games',[GameController::class,'allGames'])->name('games')->withoutMiddleware(AdminCheck::class);
    

    //Users Management
    Route::get('/admin/users',[UserController::class,'userList'])->name('users');
    Route::get('/admin/users/add-new-user',[UserController::class,'form'])->name('add-user');
    Route::post('/admin/users/add-new-user/add',[UserController::class,'createUser'])->name('addUser');

    //Update User
    Route::get('/admin/users/updateUser/{id}',[UserController::class,'showUpdateUser'])->name('showUpdateUser');
    Route::post('/admin/users/updateUser/update/{id}',[UserController::class,'updateUser'])->name('updateUser');
    //Delete User
    Route::get('admin/users/delete/{id}',[UserController::class,'deleteUser'])->name('delete-user');
    //Logout User
    Route::get('/logout',[UserController::class,'logoutUser'])->name('logoutUser')->withoutMiddleware(AdminCheck::class);
    //Logout page
    Route::get('/logoutPage', function () {
        return view('users.logout');
    })->name('logout')->withoutMiddleware(AdminCheck::class);
    

                    //Game section
    
    // Route::post('/admin/games/add-new-game/chooseteam',[GameController::class,'chooseTeamList'])->name('chooseTeamsPage');


    // Route::get('admin/teams/{video_id}',[TeamController::class,'showTeams'])->name('showTeams');
    // Route::get('/admin/teams/delete{id}',[TeamController::class,'deleteTeam'])->name('deleteTeam');
    // Route::get('/admin/teams/team/{id}',[TeamController::class,'showTeamDetails'])->name('teamDetailPage');
    // Route::get('/admin/players/delete/{id}',[TeamController::class,'deletePlayer'])->name('deletePlayer');

    Route::get('/admin/game/inprogress',[GameController::class,'adminAnalyzedGame'])->name('progressGame');
    
    Route::get('/admin/games/add-new-game',[GameController::class,'gamePage'])->name('gamePage')->withoutMiddleware(AdminCheck::class);
    // Route::get('admin/teams/{video_id}',[TeamController::class,'showTeams'])->name('showTeams');
    Route::post('/admin/games/add-new-game/add',[GameController::class,'createGame'])->name('createGamefuntion')->withoutMiddleware(AdminCheck::class);
    Route::post('/upload-chunk', [GameController::class, 'uploadChunk'])->name('upload.chunk')->withoutMiddleware(AdminCheck::class);
    Route::post('/complete-upload', [GameController::class, 'completeUpload'])->name('upload.complete')->withoutMiddleware(AdminCheck::class);

    Route::get('/admin/games/add-new-game/{video_id}/add-teams',[TeamController::class,'showCreatePage'])->name('teamPage')->withoutMiddleware(AdminCheck::class);

    Route::post('/admin/teams/add-new-teams/add/{video_id}',[TeamController::class,'createTeam'])->name('createTeams')->withoutMiddleware(AdminCheck::class);

    // Update team players or lineup
    Route::get('/admin/games/update-game/{video_id}/update-teams',[TeamController::class,'toUpdateTeam'])->name('updateTeamPage')->withoutMiddleware(AdminCheck::class);
    Route::get('/admin/games/update-game/{video_id}/update-teams',[TeamController::class,'toUpdateTeam'])->name('updateTeamPage')->withoutMiddleware(AdminCheck::class);

    Route::get('/admin/teams/update-team',function(){
        return view('teams.updatePlayers');
    })->name('updateTeams')->withoutMiddleware(AdminCheck::class);

    
    Route::get('/admin/game/{video_id}/game-created/',[GameController::class,'gameCreatedPage'])->name('gamecreatedPage')->withoutMiddleware(AdminCheck::class);


    Route::get('/admin/user-folder',[UserController::class,'userFolder'])->name('user-folder');
    Route::get('/admin/user-folder/{id}/detail',[UserController::class,'showUserDetail'])->name('user-detail');
    Route::get('/admin/edit-video/{id}',[UserController::class,'videoDetailEditPage'])->name('videoDetailEdit');
    Route::post('/admin/edit-video/update/{id}',[UserController::class,'videoUpdate'])->name('videoUpdate');
    Route::get('/admin/videos/delete/{id}',[UserController::class,'videoDelete'])->name('videoDelete');


    //Analyze game part
    Route::get('/admin/dashboard/video-analyze/{id}',[GameController::class,'videoAnalyze'])->name('analyze-video-page');
    

    Route::get('/video/{video}/stats', function ($video) {
        return view('football.stats', [
            'videoId' => $video,
            'teams' => App\Models\Team::all(),
            'video' => App\Models\Video::find($video)
        ]);
    });
    

    Route::get('/admin/dashboard/video-analyze/stats/{videoId}', [AnalysisController::class, 'showStats'])->name('video.analysis.stats');

    Route::get('/admin/dashboard/video-analyze/filter/{videoId}', [AnalysisController::class, 'showFilter'])->name('video.analysis.filter');

    Route::get('/stats/download/{videoId}', [AnalysisController::class, 'downloadPdf'])->name('stats.download.pdf');

});
