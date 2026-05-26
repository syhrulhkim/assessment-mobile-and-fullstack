import { API_TOKEN, API_URL } from '@/lib/config';
import { getStoredToken, removeStoredToken, setStoredToken } from '@/lib/auth';

export type TaskStatus = 'pending' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';

export type Task = {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  created_at: string;
  updated_at: string;
};

function getAuthToken(): string {
  if (typeof window !== 'undefined') return getStoredToken() || API_TOKEN || '';
  return API_TOKEN || '';
}

function buildHeaders(): HeadersInit {
  const token = getAuthToken();
  const baseHeaders: HeadersInit = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  if (!token) return baseHeaders;

  return {
    ...baseHeaders,
    Authorization: `Bearer ${token}`,
  };
}

export function saveAuthToken(token: string): void {
  setStoredToken(token);
}

export function clearAuthToken(): void {
  removeStoredToken();
}

export async function register(input: {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}): Promise<string> {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.message ?? 'Failed to register');

  const token = payload?.data?.token;
  if (!token) throw new Error('Token not returned by backend');
  saveAuthToken(token);
  return token;
}

export async function login(input: { email: string; password: string }): Promise<string> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.message ?? 'Failed to login');

  const token = payload?.data?.token;
  if (!token) throw new Error('Token not returned by backend');
  saveAuthToken(token);
  return token;
}

export async function logout(): Promise<void> {
  const response = await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    headers: buildHeaders(),
  });

  clearAuthToken();
  if (!response.ok && response.status !== 401) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload?.message ?? 'Failed to logout');
  }
}

function handleNetworkError(error: unknown, action: string): never {
  if (error instanceof TypeError) {
    throw new Error(
      `Cannot reach API at ${API_URL}. ${action} failed. Start backend on port 8000 or set NEXT_PUBLIC_API_URL correctly in .env.local.`
    );
  }
  throw error;
}

export async function getTasks(status?: string, priority?: string): Promise<Task[]> {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (priority) params.set('priority', priority);
  const query = params.toString() ? `?${params.toString()}` : '';
  let response: Response;
  try {
    response = await fetch(`${API_URL}/tasks${query}`, {
      cache: 'no-store',
      headers: getAuthToken()
        ? { Accept: 'application/json', Authorization: `Bearer ${getAuthToken()}` }
        : { Accept: 'application/json' },
    });
  } catch (error) {
    handleNetworkError(error, 'Fetching tasks');
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    if (response.status === 401) {
      throw new Error(
        'Unauthorized: backend requires auth token. Set NEXT_PUBLIC_API_TOKEN in frontend/.env.local using token from /api/auth/login.'
      );
    }
    throw new Error(payload?.message ?? 'Failed to fetch tasks');
  }

  const payload = await response.json();
  return payload.data.data ?? payload.data;
}

export async function createTask(input: {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
}): Promise<void> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify(input),
    });
  } catch (error) {
    handleNetworkError(error, 'Creating task');
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    if (response.status === 401) {
      throw new Error(
        'Unauthorized: backend requires auth token. Set NEXT_PUBLIC_API_TOKEN in frontend/.env.local using token from /api/auth/login.'
      );
    }
    throw new Error(payload?.message ?? 'Failed to create task');
  }
}

export async function updateTask(id: number, input: Partial<Task>): Promise<void> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: buildHeaders(),
      body: JSON.stringify(input),
    });
  } catch (error) {
    handleNetworkError(error, 'Updating task');
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    if (response.status === 401) {
      throw new Error(
        'Unauthorized: backend requires auth token. Set NEXT_PUBLIC_API_TOKEN in frontend/.env.local using token from /api/auth/login.'
      );
    }
    throw new Error(payload?.message ?? 'Failed to update task');
  }
}

export async function deleteTask(id: number): Promise<void> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}/tasks/${id}`, {
      method: 'DELETE',
      headers: getAuthToken()
        ? { Accept: 'application/json', Authorization: `Bearer ${getAuthToken()}` }
        : { Accept: 'application/json' },
    });
  } catch (error) {
    handleNetworkError(error, 'Deleting task');
  }
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    if (response.status === 401) {
      throw new Error(
        'Unauthorized: backend requires auth token. Set NEXT_PUBLIC_API_TOKEN in frontend/.env.local using token from /api/auth/login.'
      );
    }
    throw new Error(payload?.message ?? 'Failed to delete task');
  }
}
