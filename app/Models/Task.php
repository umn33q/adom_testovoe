<?php

namespace App\Models;

use App\Enums\ParticipantRole;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'status',
        'due_date',
    ];

    protected function casts(): array
    {
        return [
            'due_date' => 'datetime',
        ];
    }

    public function participants(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'task_participants')
            ->withPivot('role')
            ->withTimestamps();
    }

    public function getCreatorAttribute(): ?User
    {
        if ($this->relationLoaded('participants')) {
            return $this->participants->firstWhere('pivot.role', ParticipantRole::CREATOR->value);
        }
        
        return $this->participants()
            ->wherePivot('role', ParticipantRole::CREATOR->value)
            ->first();
    }

    public function getExecutorAttribute(): ?User
    {
        if ($this->relationLoaded('participants')) {
            return $this->participants->firstWhere('pivot.role', ParticipantRole::EXECUTOR->value);
        }
        
        return $this->participants()
            ->wherePivot('role', ParticipantRole::EXECUTOR->value)
            ->first();
    }

    public function scopeForUser($query, $userId)
    {
        return $query->whereHas('participants', function ($q) use ($userId) {
            $q->where('user_id', $userId);
        });
    }

    public function scopeFilterByStatus($query, $status)
    {
        if ($status) {
            return $query->where('status', $status);
        }
        return $query;
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }
}
