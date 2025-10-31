<?php

namespace App\Enums;

enum UserRole: string
{
    case USER = 'user';
    case ADMIN = 'admin';

    public function label(): string
    {
        return match ($this) {
            self::USER => 'Пользователь',
            self::ADMIN => 'Администратор',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}


