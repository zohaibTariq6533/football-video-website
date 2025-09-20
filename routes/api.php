<?php

use App\Http\Controllers\Api\AnalysisController;
use App\Http\Controllers\FootballAnalyzerController;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;

Route::middleware('auth:api')->get('/user', function (Request $request) {
    return $request->user();
});

Route::get('/video/{videoId}/events', [AnalysisController::class, 'getEvents']);
Route::post('/save-analysis', [AnalysisController::class, 'save']);
Route::get('/video/{videoId}/stats', [AnalysisController::class, 'showStats'])->name('video.analysis.stats');
Route::get('/video/{video}/export', [AnalysisController::class, 'export']);

