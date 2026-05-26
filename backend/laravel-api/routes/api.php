<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TaskController;
use Illuminate\Support\Facades\Route;

Route::get('/openapi.json', function () {
    return response()->json([
        'openapi' => '3.0.3',
        'info' => [
            'title' => 'Task Manager API',
            'version' => '1.0.0',
            'description' => 'Authentication and task management API',
        ],
        'servers' => [
            ['url' => rtrim(config('app.url'), '/') . '/api'],
        ],
        'components' => [
            'securitySchemes' => [
                'bearerAuth' => [
                    'type' => 'http',
                    'scheme' => 'bearer',
                    'bearerFormat' => 'Token',
                ],
            ],
            'schemas' => [
                'Task' => [
                    'type' => 'object',
                    'properties' => [
                        'id' => ['type' => 'integer'],
                        'title' => ['type' => 'string'],
                        'description' => ['type' => 'string', 'nullable' => true],
                        'status' => ['type' => 'string', 'enum' => ['pending', 'completed']],
                        'priority' => ['type' => 'string', 'enum' => ['low', 'medium', 'high']],
                        'created_at' => ['type' => 'string', 'format' => 'date-time'],
                        'updated_at' => ['type' => 'string', 'format' => 'date-time'],
                    ],
                ],
            ],
        ],
        'paths' => [
            '/auth/register' => [
                'post' => [
                    'summary' => 'Register user',
                    'requestBody' => [
                        'required' => true,
                        'content' => [
                            'application/json' => [
                                'schema' => [
                                    'type' => 'object',
                                    'required' => ['name', 'email', 'password', 'password_confirmation'],
                                    'properties' => [
                                        'name' => ['type' => 'string'],
                                        'email' => ['type' => 'string', 'format' => 'email'],
                                        'password' => ['type' => 'string'],
                                        'password_confirmation' => ['type' => 'string'],
                                    ],
                                ],
                            ],
                        ],
                    ],
                    'responses' => ['201' => ['description' => 'Registered']],
                ],
            ],
            '/auth/login' => [
                'post' => [
                    'summary' => 'Login user',
                    'requestBody' => [
                        'required' => true,
                        'content' => [
                            'application/json' => [
                                'schema' => [
                                    'type' => 'object',
                                    'required' => ['email', 'password'],
                                    'properties' => [
                                        'email' => ['type' => 'string', 'format' => 'email'],
                                        'password' => ['type' => 'string'],
                                    ],
                                ],
                            ],
                        ],
                    ],
                    'responses' => ['200' => ['description' => 'Logged in']],
                ],
            ],
            '/tasks' => [
                'get' => [
                    'summary' => 'List tasks',
                    'security' => [['bearerAuth' => []]],
                    'parameters' => [
                        [
                            'name' => 'status',
                            'in' => 'query',
                            'schema' => ['type' => 'string', 'enum' => ['pending', 'completed']],
                        ],
                        [
                            'name' => 'priority',
                            'in' => 'query',
                            'schema' => ['type' => 'string', 'enum' => ['low', 'medium', 'high']],
                        ],
                    ],
                    'responses' => ['200' => ['description' => 'Task list']],
                ],
                'post' => [
                    'summary' => 'Create task',
                    'security' => [['bearerAuth' => []]],
                    'requestBody' => [
                        'required' => true,
                        'content' => [
                            'application/json' => [
                                'schema' => [
                                    'type' => 'object',
                                    'required' => ['title'],
                                    'properties' => [
                                        'title' => ['type' => 'string'],
                                        'description' => ['type' => 'string'],
                                        'status' => ['type' => 'string', 'enum' => ['pending', 'completed']],
                                        'priority' => ['type' => 'string', 'enum' => ['low', 'medium', 'high']],
                                    ],
                                ],
                            ],
                        ],
                    ],
                    'responses' => ['201' => ['description' => 'Created']],
                ],
            ],
            '/tasks/{task}' => [
                'put' => [
                    'summary' => 'Update task',
                    'security' => [['bearerAuth' => []]],
                    'parameters' => [
                        ['name' => 'task', 'in' => 'path', 'required' => true, 'schema' => ['type' => 'integer']],
                    ],
                    'responses' => ['200' => ['description' => 'Updated']],
                ],
                'delete' => [
                    'summary' => 'Delete task',
                    'security' => [['bearerAuth' => []]],
                    'parameters' => [
                        ['name' => 'task', 'in' => 'path', 'required' => true, 'schema' => ['type' => 'integer']],
                    ],
                    'responses' => ['200' => ['description' => 'Deleted']],
                ],
            ],
            '/auth/logout' => [
                'post' => [
                    'summary' => 'Logout user',
                    'security' => [['bearerAuth' => []]],
                    'responses' => ['200' => ['description' => 'Logged out']],
                ],
            ],
        ],
    ]);
});

Route::get('/docs', function () {
    $openApiUrl = rtrim(config('app.url'), '/') . '/api/openapi.json';
    return response(
        '<!doctype html><html><head><meta charset="utf-8"><title>Task API Docs</title><link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css"></head><body><div id="swagger-ui"></div><script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script><script>window.onload=function(){window.ui=SwaggerUIBundle({url:"' . $openApiUrl . '",dom_id:"#swagger-ui"})}</script></body></html>',
        200,
        ['Content-Type' => 'text/html']
    );
});

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::prefix('tasks')->group(function () {
        Route::get('/', [TaskController::class, 'index']);
        Route::post('/', [TaskController::class, 'store']);
        Route::put('/{task}', [TaskController::class, 'update']);
        Route::delete('/{task}', [TaskController::class, 'destroy']);
    });
});
