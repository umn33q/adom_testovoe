<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: [
            __DIR__.'/../routes/api/public.php',
            __DIR__.'/../routes/api/admin.php',
        ],
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        // health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // CORS для web группы (где Broadcasting)
        $middleware->web(prepend: [
            \Illuminate\Http\Middleware\HandleCors::class,
        ]);
        
        // Исключаем broadcasting/auth из CSRF проверки
        $middleware->validateCsrfTokens(except: [
            'broadcasting/auth',
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
