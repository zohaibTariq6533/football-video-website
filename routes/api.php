<?php

use App\Http\Controllers\Api\AnalysisController;
use App\Http\Controllers\FootballAnalyzerController;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;

// Route::post('match/analysis/bulk', [FootballAnalyzerController::class, 'storeBulk']);

// routes/api.php
// Route::post('match/analysis/bulk', function (Illuminate\Http\Request $request) {
//     return response()->json([
//         'status' => 'success',
//         'message' => 'All analysis data saved successfully',
//         'saved_data' => $request->analysis_data
//     ]);
// });

Route::middleware('auth:api')->get('/user', function (Request $request) {
    return $request->user();
});

Route::post('/save-analysis', [AnalysisController::class, 'save']);
Route::get('/video/{video}/stats', [AnalysisController::class, 'stats']);
Route::get('/video/{video}/export', [AnalysisController::class, 'export']);

