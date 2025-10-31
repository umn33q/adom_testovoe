<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Enums\UserRole;

class UserRoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Admin user
        User::create(
            [
                'email' => 'admin@example.com',
                'name' => 'Admin',
                'password' => Hash::make('password'),
                'role' => UserRole::ADMIN,
                'email_verified_at' => now(),
            ]
        );

        // Regular user
        User::create(
            [
                'email' => 'user@example.com',
                'name' => 'User',
                'password' => Hash::make('password'),
                'role' => UserRole::USER,
                'email_verified_at' => now(),
            ]
        );
    }
}


