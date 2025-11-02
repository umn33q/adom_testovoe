<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Services\TaskService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function __construct(private TaskService $taskService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $filters = [
            'status' => $request->query('status'),
        ];

        $perPage = (int) $request->query('per_page', 15);

        $tasks = $this->taskService->getTasksForPublicUser($user->id, $filters, $perPage);

        return response()->json([
            'success' => true,
            'data' => $tasks->items(),
            'meta' => [
                'current_page' => $tasks->currentPage(),
                'last_page' => $tasks->lastPage(),
                'per_page' => $tasks->perPage(),
                'total' => $tasks->total(),
            ],
        ]);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        $task = $this->taskService->getTaskForPublicUser($id, $user->id);

        if (!$task) {
            return response()->json([
                'success' => false,
                'message' => 'Задача не найдена',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $this->taskService->formatTaskForResponse($task, true),
        ]);
    }
}

