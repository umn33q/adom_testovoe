<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CommentRequest;
use App\Services\CommentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    public function __construct(
        private readonly CommentService $commentService
    ) {
    }

    public function index(Request $request, int $taskId): JsonResponse
    {
        $comments = $this->commentService->getCommentsForTask($taskId);

        $formattedComments = $comments->map(function ($comment) {
            return $this->commentService->formatCommentForResponse($comment);
        });

        return response()->json([
            'success' => true,
            'data' => $formattedComments,
        ]);
    }

    public function show(Request $request, int $taskId, int $id): JsonResponse
    {
        $comment = $this->commentService->getComment($id);

        if (!$comment || $comment->task_id !== $taskId) {
            return response()->json([
                'success' => false,
                'message' => 'Комментарий не найден',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $this->commentService->formatCommentForResponse($comment),
        ]);
    }

    public function store(CommentRequest $request, int $taskId): JsonResponse
    {
        $userId = $request->user()?->id;

        $data = $request->validated();
        $data['task_id'] = $taskId;

        $comment = $this->commentService->createComment($data, $userId);

        return response()->json([
            'success' => true,
            'data' => $this->commentService->formatCommentForResponse($comment),
        ], 201);
    }

    public function update(CommentRequest $request, int $taskId, int $id): JsonResponse
    {
        $userId = $request->user()?->id;

        $comment = $this->commentService->updateComment($id, $request->validated(), $userId);

        if (!$comment || $comment->task_id !== $taskId) {
            return response()->json([
                'success' => false,
                'message' => 'Комментарий не найден',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $this->commentService->formatCommentForResponse($comment),
        ]);
    }

    public function destroy(Request $request, int $taskId, int $id): JsonResponse
    {
        $userId = $request->user()?->id;

        $deleted = $this->commentService->deleteComment($id, $userId);

        if (!$deleted) {
            return response()->json([
                'success' => false,
                'message' => 'Комментарий не найден',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Комментарий удален',
        ]);
    }
}
