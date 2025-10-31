<?php

namespace App\Services;

use App\Events\CommentCreated;
use App\Models\Comment;
use App\Models\Task;
use Illuminate\Database\Eloquent\Collection;

class CommentService
{
    public function getCommentsForTask(int $taskId): Collection
    {
        return Comment::with('user')
            ->where('task_id', $taskId)
            ->orderBy('created_at', 'asc')
            ->get();
    }

    public function getComment(int $id): ?Comment
    {
        return Comment::with('user')->find($id);
    }

    public function createComment(array $data, int $userId): Comment
    {
        $comment = Comment::create([
            'content' => $data['content'],
            'task_id' => $data['task_id'],
            'user_id' => $userId,
        ]);

        $comment->load('user');
        
        // Отправляем событие о создании комментария
        event(new CommentCreated($comment));

        return $comment;
    }

    public function updateComment(int $id, array $data, int $userId): ?Comment
    {
        $comment = Comment::where('id', $id)
            ->where('user_id', $userId)
            ->first();

        if (!$comment) {
            return null;
        }

        $comment->update([
            'content' => $data['content'] ?? $comment->content,
        ]);

        return $comment->load('user');
    }

    public function deleteComment(int $id, int $userId): bool
    {
        $comment = Comment::where('id', $id)
            ->where('user_id', $userId)
            ->first();

        if (!$comment) {
            return false;
        }

        return $comment->delete();
    }

    public function formatCommentForResponse(Comment $comment): array
    {
        return [
            'id' => $comment->id,
            'content' => $comment->content,
            'task_id' => $comment->task_id,
            'user' => [
                'id' => $comment->user->id,
                'name' => $comment->user->name,
                'email' => $comment->user->email,
            ],
            'created_at' => $comment->created_at->toIso8601String(),
            'updated_at' => $comment->updated_at->toIso8601String(),
        ];
    }
}

