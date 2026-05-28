'use client';

import { deleteTask, getTasks, Task, updateTask, searchTasks } from '@/lib/api';
import { hasStoredToken } from '@/lib/auth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ListChecks, RefreshCcw, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TaskListClient() {
  const router = useRouter();
  const [status, setStatus] = useState<string>('');
  const [priority, setPriority] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState<'pending' | 'completed'>('pending');
  const [editPriority, setEditPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!hasStoredToken()) router.replace('/login');
  }, [router]);

  const tasksQuery = useQuery({
    queryKey: ['tasks', status, priority],
    queryFn: () => getTasks(status || undefined, priority || undefined),
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
  });

  const searchQuery = useQuery({
    queryKey: ['tasks', 'search', searchTerm],
    queryFn: () => searchTasks(searchTerm),
    enabled: !!searchTerm.trim(),
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<Task> }) => updateTask(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteTask(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const tasks = tasksQuery.data ?? [];
  const searchResults = searchQuery.data ?? [];
  const isSearching = !!searchTerm.trim();
  const visibleTasks = isSearching ? searchResults : tasks;

  function startEdit(task: Task) {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditStatus(task.status);
    setEditPriority(task.priority);
  }

  function handleSearchTerm(value: string) {
    setSearchTerm(value);
    setStatus('');
    setPriority('');
  }

  function cancelEdit() {
    setEditingTaskId(null);
  }

  function saveEdit(taskId: number) {
    updateMutation.mutate(
      {
        id: taskId,
        payload: {
          title: editTitle.trim(),
          description: editDescription.trim(),
          status: editStatus,
          priority: editPriority,
        },
      },
      {
        onSuccess: () => {
          setEditingTaskId(null);
        },
      }
    );
  }

  return (
    <Card className="border bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl font-semibold sm:text-3xl">
          <ListChecks className="h-6 w-6 text-primary" />
          Task List
        </CardTitle>
        <CardDescription>Filter, complete, and clean up tasks quickly.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchTerm}
              placeholder="Search tasks by title..."
              onChange={(event) => handleSearchTerm(event.target.value)}
              className="h-10 pl-9 pr-24"
            />
            {searchTerm && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchTerm('')}
                className="absolute right-1 top-1/2 h-8 -translate-y-1/2 px-3 text-xs"
              >
                Clear
              </Button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select value={status} onChange={(event) => setStatus(event.target.value)} className="w-full sm:max-w-52">
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </Select>
            <Select value={priority} onChange={(event) => setPriority(event.target.value)} className="w-full sm:max-w-52">
              <option value="">All priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </Select>
            <Button
              variant="secondary"
              onClick={() => tasksQuery.refetch()}
              className="w-full border sm:ml-auto sm:w-auto"
            >
              <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
            </Button>
          </div>
        </div>

        {tasksQuery.isLoading && <p className="text-sm text-muted-foreground">Loading tasks...</p>}
        {tasksQuery.error && (
          <p className="whitespace-pre-line text-sm text-destructive">{(tasksQuery.error as Error).message}</p>
        )}
        {searchQuery.error && (
          <p className="whitespace-pre-line text-sm text-destructive">{(searchQuery.error as Error).message}</p>
        )}

        {!tasksQuery.isLoading && !searchQuery.isLoading && !visibleTasks.length && (
          <div className="rounded-md border border-dashed bg-secondary/30 p-6 text-center text-sm text-muted-foreground">
            No tasks found.
          </div>
        )}

        <div className="grid gap-2">
          {visibleTasks.map((task) => (
            <article key={task.id} className="rounded-md border bg-card px-4 pb-4 pt-5">
              {editingTaskId === task.id ? (
                <div className="space-y-3">
                  <Input value={editTitle} onChange={(event) => setEditTitle(event.target.value)} />
                  <Textarea value={editDescription} onChange={(event) => setEditDescription(event.target.value)} rows={3} />
                  <div className="flex flex-wrap gap-2">
                    <Select value={editStatus} onChange={(event) => setEditStatus(event.target.value as 'pending' | 'completed')}>
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                    </Select>
                    <Select
                      value={editPriority}
                      onChange={(event) => setEditPriority(event.target.value as 'low' | 'medium' | 'high')}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </Select>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" disabled={updateMutation.isPending || !editTitle.trim()} onClick={() => saveEdit(task.id)}>
                      Save
                    </Button>
                    <Button size="sm" variant="secondary" onClick={cancelEdit}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="font-semibold">{task.title}</h3>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="capitalize">
                        {task.status}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {task.priority}
                      </Badge>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{task.description || 'No description'}</p>
                  <Separator className="my-3" />
                  <div className="flex flex-wrap gap-2">
                    {task.status === 'completed' ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="w-full sm:w-auto"
                        disabled={updateMutation.isPending}
                        onClick={() => updateMutation.mutate({ id: task.id, payload: { status: 'pending' } })}
                      >
                        Mark Pending
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="w-full sm:w-auto"
                        disabled={updateMutation.isPending}
                        onClick={() => updateMutation.mutate({ id: task.id, payload: { status: 'completed' } })}
                      >
                        Mark Completed
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className="w-full sm:w-auto" onClick={() => startEdit(task)}>
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="w-full sm:w-auto"
                      disabled={deleteMutation.isPending}
                      onClick={() => deleteMutation.mutate(task.id)}
                    >
                      <Trash2 className="mr-1 h-4 w-4" /> Delete
                    </Button>
                  </div>
                </>
              )}
            </article>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
