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
        // health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->use([
            \Illuminate\Http\Middleware\HandleCors::class,
        ]);

        // Sanctum: поддержка session-based SPA auth
        $middleware->appendToGroup('web', \Laravel\Sanctum\Http\Middleware\AuthenticateSession::class);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
