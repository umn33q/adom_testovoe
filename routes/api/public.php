<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Public\AuthController as PublicAuthController;

Route::prefix('public')->group(function () {
    Route::post('/register', [PublicAuthController::class, 'register'])->middleware('web');
    Route::post('/login', [PublicAuthController::class, 'login'])->middleware('web');

    Route::middleware(['web', 'auth:sanctum'])->group(function () {
        Route::post('/logout', [PublicAuthController::class, 'logout']);
        Route::get('/me', [PublicAuthController::class, 'me']);
    });
});

