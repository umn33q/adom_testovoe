<?php

namespace App\Enums;

enum ParticipantRole: string
{
    case CREATOR = 'creator';
    case EXECUTOR = 'executor';
    case OBSERVER = 'observer';

    public function label(): string
    {
        return match ($this) {
            self::CREATOR => 'Постановщик',
            self::EXECUTOR => 'Исполнитель',
            self::OBSERVER => 'Наблюдатель',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
