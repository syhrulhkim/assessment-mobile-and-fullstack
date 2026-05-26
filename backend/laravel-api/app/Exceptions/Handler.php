<?php

namespace App\Exceptions;

use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Throwable;

class Handler extends ExceptionHandler
{
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    public function register(): void
    {
        $this->renderable(function (ModelNotFoundException $exception): JsonResponse {
            return response()->json([
                'message' => 'Resource not found',
                'errors' => [
                    'resource' => [$exception->getMessage()],
                ],
            ], 404);
        });
    }

    protected function invalidJson($request, ValidationException $exception): JsonResponse
    {
        return response()->json([
            'message' => 'Validation failed',
            'errors' => $exception->errors(),
        ], $exception->status);
    }

    protected function unauthenticated($request, AuthenticationException $exception): JsonResponse
    {
        return response()->json([
            'message' => 'Unauthenticated',
            'errors' => [
                'auth' => ['Please provide a valid API token.'],
            ],
        ], 401);
    }

    public function render($request, Throwable $exception)
    {
        if ($request->expectsJson() && ! $exception instanceof ValidationException && ! $exception instanceof AuthenticationException) {
            $statusCode = $exception instanceof HttpExceptionInterface ? $exception->getStatusCode() : 500;

            return response()->json([
                'message' => $statusCode >= 500 ? 'Server error' : $exception->getMessage(),
                'errors' => [
                    'exception' => [config('app.debug') ? $exception->getMessage() : 'Unexpected error occurred.'],
                ],
            ], $statusCode);
        }

        return parent::render($request, $exception);
    }
}
