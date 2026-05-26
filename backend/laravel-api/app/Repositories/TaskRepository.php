<?php

namespace App\Repositories;

use App\Models\Task;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class TaskRepository
{
    public function paginateByStatusAndPriority(?string $status, ?string $priority, int $perPage): LengthAwarePaginator
    {
        $query = Task::query()->latest();

        if ($status !== null && $status !== '') {
            $query->where('status', $status);
        }

        if ($priority !== null && $priority !== '') {
            $query->where('priority', $priority);
        }

        return $query->paginate($perPage);
    }

    public function hasRecentDuplicateTitle(string $title, int $seconds = 10): bool
    {
        return Task::query()
            ->where('title', $title)
            ->where('created_at', '>=', Carbon::now()->subSeconds($seconds))
            ->exists();
    }

    public function create(array $payload): Task
    {
        return Task::create($payload);
    }

    public function update(Task $task, array $payload): Task
    {
        $task->update($payload);

        return $task->fresh();
    }

    public function delete(Task $task): void
    {
        $task->delete();
    }
}
