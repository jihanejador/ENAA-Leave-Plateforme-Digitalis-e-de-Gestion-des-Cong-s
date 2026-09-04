<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\LeaveRequestController;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::get('/leave-requests', [LeaveRequestController::class, 'index']);
    Route::post('/leave-requests', [LeaveRequestController::class, 'store']);

    Route::get('/manager/leave-requests/pending', [LeaveRequestController::class, 'pendingForManager']);
    Route::patch('/manager/leave-requests/{id}/status', [LeaveRequestController::class, 'managerApprove']);

    Route::get('/hr/leave-requests/pending', [LeaveRequestController::class, 'pendingForHR']);
    Route::patch('/hr/leave-requests/{id}/status', [LeaveRequestController::class, 'hrApprove']);

    Route::get('/colleagues', function (Request $request) {
        return response()->json(
            \App\Models\User::where('id', '!=', $request->user()->id)->get(['id', 'name'])
        );
    });
});
