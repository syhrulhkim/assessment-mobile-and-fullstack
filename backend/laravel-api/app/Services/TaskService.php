<?php

namespace App\Services;

use App\Models\Task;
use App\Repositories\TaskRepository;
use DomainException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class TaskService
{
    public function __construct(private readonly TaskRepository $taskRepository)
    {
    }

    public function listTasks(?string $status, ?string $priority, int $perPage = 10): LengthAwarePaginator
    {
        return $this->taskRepository->paginateByStatusAndPriority($status, $priority, $perPage);
    }

    public function searchTasksByTitle(string $title)
    {
        return $this->taskRepository->searchByTitle($title);
    }

    public function createTask(array $validated): Task
    {
        if ($this->taskRepository->hasRecentDuplicateTitle($validated['title'])) {
            throw new DomainException('A task with this title was just created. Please wait 10 seconds.');
        }

        return $this->taskRepository->create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'status' => $validated['status'] ?? 'pending',
            'priority' => $validated['priority'] ?? 'medium',
        ]);
    }

    public function updateTask(Task $task, array $validated): Task
    {
        return $this->taskRepository->update($task, $validated);
    }

    public function deleteTask(Task $task): void
    {
        $this->taskRepository->delete($task);
    }
}
