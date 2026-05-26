import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './config';

export type Task = {
  id: number;
  title: string;
  description: string | null;
  status: 'pending' | 'completed';
  priority: 'low' | 'medium' | 'high';
};

export type TaskStatus = Task['status'];
export type TaskPriority = Task['priority'];

const TASKS_CACHE_KEY = 'cached_tasks_v1';
const AUTH_TOKEN_KEY = 'auth_token_v1';

type FetchTasksResult = {
  data: Task[];
  source: 'network' | 'cache';
};

async function getAuthToken(): Promise<string> {
  return (await AsyncStorage.getItem(AUTH_TOKEN_KEY)) || '';
}

async function buildHeaders(withContentType = false): Promise<Record<string, string>> {
  const token = await getAuthToken();
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (withContentType) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  return headers;
}

export async function login(input: { email: string; password: string }): Promise<void> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.message ?? 'Failed to login.');

  const token = payload?.data?.token;
  if (!token) throw new Error('Token not returned by backend.');
  await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
}

export async function logout(): Promise<void> {
  try {
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: await buildHeaders(),
    });
  } finally {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
  }
}

export async function fetchTasks(status?: TaskStatus | '', priority?: TaskPriority | ''): Promise<FetchTasksResult> {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (priority) params.set('priority', priority);
  const query = params.toString() ? `?${params.toString()}` : '';

  try {
    const response = await fetch(`${API_URL}/tasks${query}`, {
      headers: await buildHeaders(),
    });

    if (!response.ok) throw new Error('Failed to fetch data.');

    const payload = await response.json();
    const tasks = (payload?.data?.data ?? payload?.data ?? []) as Task[];
    await AsyncStorage.setItem(TASKS_CACHE_KEY, JSON.stringify(tasks));

    return { data: tasks, source: 'network' };
  } catch (error) {
    const cached = await AsyncStorage.getItem(TASKS_CACHE_KEY);

    if (cached) {
      return {
        data: JSON.parse(cached) as Task[],
        source: 'cache',
      };
    }

    throw error;
  }
}

export async function createTask(payload: { title: string; description: string; priority?: TaskPriority }) {
  const response = await fetch(`${API_URL}/tasks`, {
    method: 'POST',
    headers: await buildHeaders(true),
    body: JSON.stringify({
      title: payload.title,
      description: payload.description,
      status: 'pending',
      priority: payload.priority ?? 'medium',
    }),
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body?.message ?? 'Failed to create task.');

  return body;
}

export async function updateTask(id: number, payload: Partial<Task>) {
  const response = await fetch(`${API_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: await buildHeaders(true),
    body: JSON.stringify(payload),
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body?.message ?? 'Failed to update task.');

  return body;
}

export async function deleteTask(id: number) {
  const response = await fetch(`${API_URL}/tasks/${id}`, {
    method: 'DELETE',
    headers: await buildHeaders(),
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body?.message ?? 'Failed to delete task.');

  return body;
}
