<?php

namespace App\Services;

use App\Models\Task;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class TaskService
{
    public function getTasks(array $filters = [], int $perPage = 15, ?int $userId = null): LengthAwarePaginator
    {
        $query = Task::with(['creator', 'executor', 'participants']);

        if ($userId) {
            $query->forUser($userId);
        }

        if (isset($filters['status']) && $filters['status']) {
            $query->filterByStatus($filters['status']);
        }

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }

    public function getTask(int $id, ?int $userId = null): ?Task
    {
        $query = Task::with(['creator', 'executor', 'participants']);

        if ($userId) {
            $query->forUser($userId);
        }

        return $query->find($id);
    }

    public function createTask(array $data): Task
    {
        $task = Task::create([
            'title' => $data['title'],
            'description' => $data['description'],
            'status' => $data['status'],
            'due_date' => $data['due_date'] ?? null,
            'creator_id' => $data['creator_id'],
            'executor_id' => $data['executor_id'] ?? null,
        ]);

        // Добавляем участников
        $participantsData = [];
        
        // Всегда добавляем создателя как участника с ролью creator
        $participantsData[$data['creator_id']] = ['role' => 'creator'];
        
        // Добавляем исполнителя как участника с ролью executor, если указан
        if (isset($data['executor_id']) && $data['executor_id']) {
            $participantsData[$data['executor_id']] = ['role' => 'executor'];
        }
        
        // Добавляем дополнительные участники, если они переданы
        if (isset($data['participants']) && is_array($data['participants'])) {
            foreach ($data['participants'] as $participant) {
                // Пропускаем, если пользователь уже добавлен как creator или executor
                if (!isset($participantsData[$participant['user_id']])) {
                    $participantsData[$participant['user_id']] = ['role' => $participant['role']];
                }
            }
        }
        
        $task->participants()->attach($participantsData);

        return $task->load(['creator', 'executor', 'participants']);
    }

    public function updateTask(int $id, array $data, ?int $userId = null): ?Task
    {
        $task = $this->getTask($id, $userId);
        if (!$task) {
            return null;
        }

        $task->update([
            'title' => $data['title'] ?? $task->title,
            'description' => $data['description'] ?? $task->description,
            'status' => $data['status'] ?? $task->status,
            'due_date' => $data['due_date'] ?? $task->due_date,
            'executor_id' => $data['executor_id'] ?? $task->executor_id,
        ]);

        // Обновляем участников, если они переданы
        if (isset($data['participants']) && is_array($data['participants'])) {
            $participantsData = [];
            
            // Всегда добавляем создателя как участника с ролью creator
            $participantsData[$task->creator_id] = ['role' => 'creator'];
            
            // Добавляем исполнителя как участника с ролью executor, если указан
            $executorId = $data['executor_id'] ?? $task->executor_id;
            if ($executorId) {
                $participantsData[$executorId] = ['role' => 'executor'];
            }
            
            // Добавляем дополнительные участники
            foreach ($data['participants'] as $participant) {
                // Пропускаем, если пользователь уже добавлен как creator или executor
                if (!isset($participantsData[$participant['user_id']])) {
                    $participantsData[$participant['user_id']] = ['role' => $participant['role']];
                }
            }
            
            $task->participants()->sync($participantsData);
        } else {
            // Если участники не переданы, обновляем только executor, если он изменился
            $executorId = $data['executor_id'] ?? $task->executor_id;
            if ($executorId && $executorId !== $task->executor_id) {
                // Удаляем старую роль executor
                $task->participants()->wherePivot('role', 'executor')->detach();
                // Добавляем нового исполнителя
                if (!$task->participants()->where('user_id', $executorId)->exists()) {
                    $task->participants()->attach($executorId, ['role' => 'executor']);
                } else {
                    $task->participants()->updateExistingPivot($executorId, ['role' => 'executor']);
                }
            }
        }

        return $task->load(['creator', 'executor', 'participants']);
    }

    public function deleteTask(int $id, ?int $userId = null): bool
    {
        $task = $this->getTask($id, $userId);
        if (!$task) {
            return false;
        }

        return $task->delete();
    }

    public function formatTaskForResponse(Task $task): array
    {
        return [
            'id' => $task->id,
            'title' => $task->title,
            'description' => $task->description,
            'status' => $task->status,
            'due_date' => $task->due_date ? $task->due_date->toIso8601String() : null,
            'creator' => [
                'id' => $task->creator->id,
                'name' => $task->creator->name,
                'email' => $task->creator->email,
            ],
            'executor' => $task->executor ? [
                'id' => $task->executor->id,
                'name' => $task->executor->name,
                'email' => $task->executor->email,
            ] : null,
            'participants' => $task->participants->map(function ($participant) {
                return [
                    'id' => $participant->id,
                    'name' => $participant->name,
                    'email' => $participant->email,
                    'role' => $participant->pivot->role,
                ];
            })->toArray(),
            'created_at' => $task->created_at->toIso8601String(),
            'updated_at' => $task->updated_at->toIso8601String(),
        ];
    }
}

