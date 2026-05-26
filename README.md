# Full-Stack Technical Assignment Solution

This repository contains a full implementation of the assignment across:
- Backend: Laravel API (`backend/laravel-api`)
- Frontend: Next.js web app (`frontend/nextjs-app`)
- Mobile: React Native app via Expo (`mobile/react-native-app`)

## Setup Instructions

### Quick Start (One Command)

From the repository root:

```bash
chmod +x run.sh
./run.sh
```

This command automatically creates missing local env files (if needed) and starts:
- MySQL (`localhost:3307`)
- Laravel API (`http://localhost:8000`)
- Next.js frontend (`http://localhost:3000`)

Use this as the default way to run the project for testing.
If `docker` is not in your PATH on macOS, `run.sh` also checks Docker Desktop's built-in binary automatically.

### 1) Backend (Laravel API)

```bash
cd backend/laravel-api
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

Backend base URL: `http://localhost:8000`

Auth flow for protected task routes:

1. `POST /api/auth/register` (or `POST /api/auth/login`)
2. Copy returned token
3. Use `Authorization: Bearer <token>` for `/api/tasks` endpoints

### 2) Frontend (Next.js)

```bash
cd frontend/nextjs-app
npm install
cp .env.example .env.local
npm run dev
```

Frontend URL: `http://localhost:3000`
Use the `/login` page to register/login; the frontend stores the API token in local storage and uses it for protected task routes.

If you see `404` errors for `/_next/static/...` chunks or missing `layout.css` after code changes, run a clean dev boot:

```bash
cd frontend/nextjs-app
npm run dev:clean
```

### 3) Mobile (React Native + Expo)

```bash
cd mobile/react-native-app
npm install
cp .env.example .env
npm run start
```

Use Expo Go or emulator/simulator to run.

### 4) Optional Docker

```bash
docker compose up --build
```

## API Endpoints Implemented

- `POST /api/tasks`
- `GET /api/tasks`
- `PUT /api/tasks/{id}`
- `DELETE /api/tasks/{id}`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`

Supported filter:
- `GET /api/tasks?status=pending`
- `GET /api/tasks?status=completed`
- `GET /api/tasks?priority=low|medium|high`
- `GET /api/tasks?status=completed&priority=medium`

API docs:
- Swagger UI: `GET /api/docs`
- OpenAPI JSON: `GET /api/openapi.json`

## Assignment Features Completed

### Backend (Laravel)
- Migrations implemented for tasks table.
- Eloquent model used (`Task`).
- Request validation with FormRequest.
- JSON response format for all endpoints.
- Status filtering implemented.
- Edge case implemented: prevent duplicate task titles within 10 seconds.
- Pagination implemented with `per_page` query parameter.
- Repository/Service pattern implemented (`TaskRepository`, `TaskService`).
- Sanctum token authentication added to protect task routes.
- Unified JSON error response strategy added via exception handler.

### Frontend (Next.js)
- `/tasks` page for list, filter, complete, delete.
- `/login` page for register/login/logout flow.
- `/tasks/create` page for task creation.
- API integration through environment variable `NEXT_PUBLIC_API_URL`.
- Loading and error handling states.
- TanStack Query for server state, cache invalidation, and refetch.
- Advanced form validation using React Hook Form + Zod.
- Environment-based API URL switching (`dev` / `staging` / `prod`) via config.

### Mobile (React Native)
- Login screen with mock authentication and required validation.
- Data fetching from public API after login.
- Loading and error states.
- List screen using `FlatList`.
- Pull-to-refresh implemented.
- Form submission screen with validation and feedback.
- TypeScript across app.
- Offline support with AsyncStorage cache fallback for list data.
- Environment-based API URL switching (`dev` / `staging` / `prod`) via config.

## Assumptions Made

- Authentication is required for all `/api/tasks` routes and `/api/auth/logout` (`auth:sanctum`).
- Web app consumes the Laravel API directly via `NEXT_PUBLIC_API_URL`.
- Mobile test requirements are implemented against a public mock API (`jsonplaceholder`) as allowed by the prompt.
- Task API and mobile test app are intentionally separate to satisfy both assignment specs.

## Libraries Used

### Backend
- Laravel Framework
- Carbon
- PHPUnit

### Frontend
- Next.js
- React
- TypeScript
- `@tanstack/react-query`
- `react-hook-form`
- `zod`
- `@hookform/resolvers`

### Mobile
- Expo
- React Native
- React Navigation
- TypeScript
- `@react-native-async-storage/async-storage`

## Architecture Decisions

- Backend uses `FormRequest` classes to isolate validation rules and keep controllers clean.
- Backend uses Repository/Service pattern to separate controller, domain logic, and persistence concerns.
- Backend routes are protected with Sanctum and token-based access for task actions.
- Backend exceptions are normalized to a consistent `message + errors` JSON shape.
- Duplicate prevention is handled in service logic using timestamp query window (`created_at >= now - 10 seconds`).
- Frontend centralizes HTTP calls in `lib/api.ts` and uses TanStack Query for query/mutation state and cache invalidation.
- Frontend form validation uses schema-first approach (Zod) integrated with React Hook Form.
- Mobile uses a screen-driven architecture with isolated `services/api.ts` for network logic.
- Mobile offline fallback persists latest fetched list data to AsyncStorage and reads cache when network fails.

## Automated Tests

Backend includes feature tests:
- `tests/Feature/TaskApiTest.php`
  - duplicate-title edge case test
  - status filtering test
  - pagination behavior test

Run:

```bash
cd backend/laravel-api
php artisan test
```
