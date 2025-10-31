<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Public\AuthController as PublicAuthController;
use App\Http\Controllers\Public\TaskController as PublicTaskController;
use App\Http\Controllers\Public\CommentController as PublicCommentController;

Route::prefix('public')->group(function () {
    Route::post('/register', [PublicAuthController::class, 'register'])->middleware('web');
    Route::post('/login', [PublicAuthController::class, 'login'])->middleware('web');

    Route::middleware(['web', 'auth:sanctum'])->group(function () {
        Route::post('/logout', [PublicAuthController::class, 'logout']);
        Route::get('/me', [PublicAuthController::class, 'me']);

        // Tasks routes
        Route::get('/tasks', [PublicTaskController::class, 'index']);
        Route::get('/tasks/{id}', [PublicTaskController::class, 'show']);

        // Comments routes
        Route::post('/tasks/{taskId}/comments', [PublicCommentController::class, 'store']);
    });
});

