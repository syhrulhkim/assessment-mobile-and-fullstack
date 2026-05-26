'use client';

import { createTask } from '@/lib/api';
import { hasStoredToken } from '@/lib/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

const createTaskSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(255, 'Title is too long'),
  description: z.string().trim().max(1000, 'Description is too long').optional(),
  priority: z.enum(['low', 'medium', 'high']),
});

type CreateTaskValues = z.infer<typeof createTaskSchema>;

export default function CreateTaskPage() {
  const router = useRouter();

  useEffect(() => {
    if (!hasStoredToken()) router.replace('/login');
  }, [router]);

  const form = useForm<CreateTaskValues>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium',
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateTaskValues) => createTask(payload),
    onSuccess: () => router.push('/tasks'),
  });

  return (
    <Card className="border bg-white">
      <CardHeader>
        <CardTitle className="text-3xl font-semibold">Create task</CardTitle>
        <CardDescription>Add a clear task with the right priority for your team.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit((values) => {
            createMutation.mutate(values);
          })}
        >
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="Prepare weekly project summary" {...form.register('title')} />
            {form.formState.errors.title && <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={5} placeholder="Add useful context for the task" {...form.register('description')} />
            {form.formState.errors.description && (
              <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select id="priority" {...form.register('priority')}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </Select>
          </div>

          {createMutation.error && <p className="text-sm text-destructive">{(createMutation.error as Error).message}</p>}

          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Creating...' : 'Create Task'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
