<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PublicAuthController;

Route::post('/login', [PublicAuthController::class, 'login'])->middleware('web');

Route::middleware(['web', 'auth:sanctum'])->group(function () {
    Route::post('/logout', [PublicAuthController::class, 'logout']);
    Route::get('/me', [PublicAuthController::class, 'me']);
});
