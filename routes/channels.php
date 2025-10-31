<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('user.{id}', function ($user, $id) {
    // Проверяем, что пользователь авторизован и это его собственный канал
    if (!$user) {
        return false;
    }
    return (int) $user->id === (int) $id;
});


