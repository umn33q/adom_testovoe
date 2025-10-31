<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Enums\UserRole;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'role' => UserRole::class,
        ];
    }

    public function participatedTasks()
    {
        return $this->belongsToMany(Task::class, 'task_participants')
            ->withPivot('role')
            ->withTimestamps();
    }

    public function createdTasks()
    {
        return $this->belongsToMany(Task::class, 'task_participants')
            ->wherePivot('role', 'creator')
            ->withTimestamps();
    }

    public function executedTasks()
    {
        return $this->belongsToMany(Task::class, 'task_participants')
            ->wherePivot('role', 'executor')
            ->withTimestamps();
    }
}
