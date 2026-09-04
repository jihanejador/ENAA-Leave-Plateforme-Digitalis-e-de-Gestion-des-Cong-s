<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\LeaveRequestController;
use App\Models\LeaveType;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);

    Route::get('/leave-requests', [LeaveRequestController::class, 'index']);
    Route::post('/leave-requests', [LeaveRequestController::class, 'store']);

    Route::get('/manager/leave-requests/pending', [LeaveRequestController::class, 'pendingForManager']);
    Route::patch('/manager/leave-requests/{id}/status', [LeaveRequestController::class, 'managerApprove']);

    Route::get('/hr/leave-requests/pending', [LeaveRequestController::class, 'pendingForHR']);
    Route::patch('/hr/leave-requests/{id}/status', [LeaveRequestController::class, 'hrApprove']);

    Route::get('/leave-types', function () {
        return response()->json(LeaveType::all());
    });

    Route::post('/leave-types', function (Request $request) {
        $request->validate([
            'name' => 'required|string|max:255',
            'default_days' => 'required|numeric',
        ]);

        $type = LeaveType::create([
            'name' => $request->name,
            'default_days' => $request->default_days,
            'requires_proof' => $request->boolean('requires_proof'),
        ]);

        return response()->json($type, 201);
    });

    Route::get('/notifications', function (Request $request) {
        return response()->json($request->user()->unreadNotifications);
    });

    Route::post('/notifications/{id}/read', function (Request $request, $id) {
        $notification = $request->user()->notifications()->find($id);
        if ($notification) {
            $notification->markAsRead();
        }
        return response()->json(['message' => 'Notification marquée comme lue']);
    });

    Route::get('/colleagues', function (Request $request) {
        return response()->json(
            \App\Models\User::where('id', '!=', $request->user()->id)->get(['id', 'name'])
        );
    });
});
