<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\TaskRequest;
use App\Services\TaskService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function __construct(
        private readonly TaskService $taskService
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $filters = [
            'status' => $request->query('status'),
        ];

        $userId = $request->user()?->id;
        $tasks = $this->taskService->getTasks($filters, 15, $userId);

        $formattedTasks = $tasks->map(function ($task) {
            return $this->taskService->formatTaskForResponse($task);
        });

        return response()->json([
            'success' => true,
            'data' => [
                'data' => $formattedTasks,
                'current_page' => $tasks->currentPage(),
                'last_page' => $tasks->lastPage(),
                'per_page' => $tasks->perPage(),
                'total' => $tasks->total(),
            ],
        ]);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $userId = $request->user()?->id;
        $task = $this->taskService->getTask($id, $userId);

        if (!$task) {
            return response()->json([
                'success' => false,
                'message' => 'Задача не найдена',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $this->taskService->formatTaskForResponse($task),
        ]);
    }

    public function store(TaskRequest $request): JsonResponse
    {
        $task = $this->taskService->createTask($request->validated());

        return response()->json([
            'success' => true,
            'data' => $this->taskService->formatTaskForResponse($task),
        ], 201);
    }

    public function update(TaskRequest $request, int $id): JsonResponse
    {
        $userId = $request->user()?->id;
        $task = $this->taskService->updateTask($id, $request->validated(), $userId);

        if (!$task) {
            return response()->json([
                'success' => false,
                'message' => 'Задача не найдена',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $this->taskService->formatTaskForResponse($task),
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $userId = $request->user()?->id;
        $deleted = $this->taskService->deleteTask($id, $userId);

        if (!$deleted) {
            return response()->json([
                'success' => false,
                'message' => 'Задача не найдена',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Задача удалена',
        ]);
    }
}
