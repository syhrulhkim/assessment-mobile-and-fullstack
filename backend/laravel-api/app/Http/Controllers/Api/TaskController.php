<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Models\Task;
use App\Services\TaskService;
use DomainException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function __construct(private readonly TaskService $taskService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $tasks = $this->taskService->listTasks(
            $request->query('status'),
            $request->query('priority'),
            (int) $request->query('per_page', 10)
        );

        return response()->json([
            'message' => 'Tasks fetched successfully',
            'data' => $tasks,
        ]);
    }

    public function store(StoreTaskRequest $request): JsonResponse
    {
        try {
            $task = $this->taskService->createTask($request->validated());
        } catch (DomainException $exception) {
            return response()->json([
                'message' => 'Duplicate task title detected within 10 seconds.',
                'errors' => [
                    'title' => [$exception->getMessage()],
                ],
            ], 422);
        }

        return response()->json([
            'message' => 'Task created successfully',
            'data' => $task,
        ], 201);
    }

    public function search(Request $request): JsonResponse
    {
        $title = $request->query('title');

        if (empty($title)) {
            return response()->json([
                'message' => 'Title query parameter is required.',
                'errors' => [
                    'title' => ['The title query parameter is required.'],
                ],
            ], 422);
        }

        $tasks = $this->taskService->searchTasksByTitle($title);

        return response()->json([
            'message' => 'Tasks fetched successfully',
            'data' => $tasks,
        ]);
    }

    public function update(UpdateTaskRequest $request, Task $task): JsonResponse
    {
        return response()->json([
            'message' => 'Task updated successfully',
            'data' => $this->taskService->updateTask($task, $request->validated()),
        ]);
    }

    public function destroy(Task $task): JsonResponse
    {
        $this->taskService->deleteTask($task);

        return response()->json([
            'message' => 'Task deleted successfully',
        ]);
    }
}
