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
        // Admin
        User::create(
            [
                'email' => 'admin@example.com',
                'name' => 'Admin',
                'password' => Hash::make('password'),
                'role' => UserRole::ADMIN,
                'email_verified_at' => now(),
            ]
        );

        // User
        User::create(
            [
                'email' => 'user1@example.com',
                'name' => 'User1',
                'password' => Hash::make('password'),
                'role' => UserRole::USER,
                'email_verified_at' => now(),
            ]
        );

        // User2
        User::create(
            [
                'email' => 'user2@example.com',
                'name' => 'User2',
                'password' => Hash::make('password'),
                'role' => UserRole::USER,
                'email_verified_at' => now(),
            ]
        );

        // User3
        User::create(
            [
                'email' => 'user3@example.com',
                'name' => 'User3',
                'password' => Hash::make('password'),
                'role' => UserRole::USER,
                'email_verified_at' => now(),
            ]
        );

        // User4
        User::create(
            [
                'email' => 'user4@example.com',
                'name' => 'User4',
                'password' => Hash::make('password'),
                'role' => UserRole::USER,
                'email_verified_at' => now(),
            ]
        );

        // User5
        User::create(
            [
                'email' => 'user5@example.com',
                'name' => 'User5',
                'password' => Hash::make('password'),
                'role' => UserRole::USER,
                'email_verified_at' => now(),
            ]
        );
    }
}


