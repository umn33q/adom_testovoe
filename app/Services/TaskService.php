<?php

namespace App\Services;

use App\Enums\ParticipantRole;
use App\Events\TaskCreated;
use App\Events\TaskUpdated;
use App\Models\Task;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class TaskService
{
    public function getTasksForPublicUser(int $userId, array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Task::with(['participants'])
            ->forUserAsExecutorOrObserver($userId);

        if (isset($filters['status']) && $filters['status']) {
            $query->filterByStatus($filters['status']);
        }

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }

    public function getTaskForPublicUser(int $id, int $userId): ?Task
    {
        return Task::with(['participants', 'comments.user'])
            ->forUserAsExecutorOrObserver($userId)
            ->find($id);
    }

    public function getTasks(array $filters = [], int $perPage = 15, ?int $userId = null): LengthAwarePaginator
    {
        $query = Task::with(['participants']);

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
        $query = Task::with(['participants']);

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
        ]);

        // Добавляем участников - все должны быть в массиве participants
        $participantsData = [];
        
        // Проверяем наличие creator в participants
        $hasCreator = false;
        foreach ($data['participants'] as $participant) {
            if ($participant['role'] === ParticipantRole::CREATOR->value) {
                $hasCreator = true;
            }
            $participantsData[$participant['user_id']] = ['role' => $participant['role']];
        }
        
        if (!$hasCreator) {
            throw new \InvalidArgumentException('В participants должен быть указан хотя бы один участник с ролью creator');
        }
        
        $task->participants()->attach($participantsData);

        $task->load(['participants']);
        
        // Отправляем событие о создании задачи
        event(new TaskCreated($task));

        return $task;
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
        ]);

        // Обновляем участников, если они переданы
        if (isset($data['participants']) && is_array($data['participants'])) {
            $participantsData = [];
            
            // Добавляем всех участников из массива
            foreach ($data['participants'] as $participant) {
                $participantsData[$participant['user_id']] = ['role' => $participant['role']];
            }
            
            // Убеждаемся, что есть creator (если не передан, берем текущего)
            $hasCreator = false;
            foreach ($participantsData as $role) {
                if ($role['role'] === ParticipantRole::CREATOR->value) {
                    $hasCreator = true;
                    break;
                }
            }
            
            if (!$hasCreator && $task->creator) {
                $participantsData[$task->creator->id] = ['role' => ParticipantRole::CREATOR->value];
            }
            
            $task->participants()->sync($participantsData);
        }

        $task->load(['participants']);
        
        // Отправляем событие об обновлении задачи
        event(new TaskUpdated($task));

        return $task;
    }

    public function deleteTask(int $id, ?int $userId = null): bool
    {
        $task = $this->getTask($id, $userId);
        if (!$task) {
            return false;
        }

        return $task->delete();
    }

    public function formatTaskForResponse(Task $task, bool $includeComments = false): array
    {
        $result = [
            'id' => $task->id,
            'title' => $task->title,
            'description' => $task->description,
            'status' => $task->status,
            'due_date' => $task->due_date ? $task->due_date->toIso8601String() : null,
            'creator' => $task->creator ? [
                'id' => $task->creator->id,
                'name' => $task->creator->name,
                'email' => $task->creator->email,
            ] : null,
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

        if ($includeComments && $task->relationLoaded('comments')) {
            $result['comments'] = $task->comments->map(function ($comment) {
                return [
                    'id' => $comment->id,
                    'content' => $comment->content,
                    'task_id' => $comment->task_id,
                    'user' => $comment->user ? [
                        'id' => $comment->user->id,
                        'name' => $comment->user->name,
                        'email' => $comment->user->email,
                    ] : null,
                    'created_at' => $comment->created_at->toIso8601String(),
                    'updated_at' => $comment->updated_at->toIso8601String(),
                ];
            })->toArray();
        }

        return $result;
    }
}

