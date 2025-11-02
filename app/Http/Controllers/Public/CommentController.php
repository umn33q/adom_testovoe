<?php

namespace App\Http\Controllers\Public;

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

    public function store(CommentRequest $request, int $taskId): JsonResponse
    {
        $data = $request->validated();
        $data['task_id'] = $taskId;

        $comment = $this->commentService->createComment($data, $request->user()?->id);

        return response()->json([
            'success' => true,
            'data' => $this->commentService->formatCommentForResponse($comment),
        ], 201);
    }
}

