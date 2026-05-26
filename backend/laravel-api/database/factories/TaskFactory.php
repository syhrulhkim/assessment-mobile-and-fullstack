<?php

namespace Database\Factories;

use App\Models\Task;
use Illuminate\Database\Eloquent\Factories\Factory;

class TaskFactory extends Factory
{
    protected $model = Task::class;

    public function definition(): array
    {
        return [
            'title' => fake()->unique()->sentence(3),
            'description' => fake()->sentence(),
            'status' => fake()->randomElement(['pending', 'completed']),
            'priority' => fake()->randomElement(['low', 'medium', 'high']),
        ];
    }
}
