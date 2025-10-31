<?php

namespace App\Events;

use App\Models\Comment;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CommentCreated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Comment $comment;

    /**
     * Create a new event instance.
     */
    public function __construct(Comment $comment)
    {
        $this->comment = $comment->load(['user', 'task.participants']);
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        $channels = [];
        
        // Отправляем уведомление всем участникам задачи (кроме автора комментария)
        foreach ($this->comment->task->participants as $participant) {
            if ($participant->id !== $this->comment->user_id) {
                $channels[] = new PrivateChannel('user.' . $participant->id);
            }
        }

        return $channels;
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'comment.created';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'comment' => [
                'id' => $this->comment->id,
                'content' => $this->comment->content,
                'task_id' => $this->comment->task_id,
                'user' => [
                    'id' => $this->comment->user->id,
                    'name' => $this->comment->user->name,
                    'email' => $this->comment->user->email,
                ],
                'created_at' => $this->comment->created_at->toIso8601String(),
            ],
            'task' => [
                'id' => $this->comment->task->id,
                'title' => $this->comment->task->title,
            ],
            'message' => $this->comment->user->name . ' добавил комментарий к задаче: ' . $this->comment->task->title,
            'type' => 'comment.created',
        ];
    }
}
