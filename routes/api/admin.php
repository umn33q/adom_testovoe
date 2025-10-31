<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\AuthController as AdminAuthController;
use App\Http\Controllers\Admin\TaskController;
use App\Http\Controllers\Admin\UsersController;
use App\Http\Controllers\Admin\CommentController;

Route::prefix('admin')->group(function () {
    Route::post('/login', [AdminAuthController::class, 'login'])->middleware('web');

    Route::middleware(['web', 'auth:sanctum'])->group(function () {
        Route::post('/logout', [AdminAuthController::class, 'logout']);
        Route::get('/me', [AdminAuthController::class, 'me']);

        // Tasks routes
        Route::apiResource('tasks', TaskController::class);

        // Comments routes (nested under tasks)
        Route::apiResource('tasks.comments', CommentController::class)->except(['show']);

        // Users routes
        Route::get('/users/search', [UsersController::class, 'search']);
    });
});

