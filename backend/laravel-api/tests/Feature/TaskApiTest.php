<?php

namespace Tests\Feature;

use App\Models\Task;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TaskApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Sanctum::actingAs(User::factory()->create());
    }

    public function test_prevents_duplicate_title_within_ten_seconds(): void
    {
        Carbon::setTestNow(now());

        Task::create([
            'title' => 'Duplicate Title',
            'description' => 'First',
            'status' => 'pending',
            'priority' => 'medium',
        ]);

        $response = $this->postJson('/api/tasks', [
            'title' => 'Duplicate Title',
            'description' => 'Second',
            'status' => 'pending',
            'priority' => 'high',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['title']);
    }

    public function test_filters_tasks_by_status(): void
    {
        Task::create([
            'title' => 'Pending Task',
            'status' => 'pending',
            'priority' => 'low',
        ]);

        Task::create([
            'title' => 'Completed Task',
            'status' => 'completed',
            'priority' => 'high',
        ]);

        $response = $this->getJson('/api/tasks?status=completed');

        $response->assertOk();
        $this->assertCount(1, $response->json('data.data'));
    }

    public function test_paginates_tasks(): void
    {
        Task::factory()->count(12)->create();

        $response = $this->getJson('/api/tasks?per_page=5');

        $response->assertOk();
        $this->assertCount(5, $response->json('data.data'));
        $this->assertSame(12, $response->json('data.total'));
    }
}
