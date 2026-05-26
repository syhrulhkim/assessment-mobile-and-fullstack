'use client';

import { login, register } from '@/lib/api';
import { hasStoredToken } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState('Demo User');
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('password');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (hasStoredToken()) router.replace('/tasks');
  }, [router]);

  async function handleLogin() {
    try {
      setLoading(true);
      setMessage('');
      setMode('idle');
      await login({ email: email.trim(), password });
      setMode('success');
      router.push('/tasks');
    } catch (error) {
      setMode('error');
      setMessage((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister() {
    try {
      setLoading(true);
      setMessage('');
      setMode('idle');
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        password_confirmation: password,
      });
      setMode('success');
      router.push('/tasks');
    } catch (error) {
      setMode('error');
      setMessage((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="mx-auto max-w-xl border bg-white">
      <CardHeader>
        <CardTitle className="text-3xl font-semibold">Welcome back</CardTitle>
        <CardDescription>Sign in to manage tasks, or register if this is your first time.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md border bg-secondary/50 px-3 py-2 text-xs text-muted-foreground">
          Demo: use <strong>demo3@example.com</strong> and <strong>password</strong> to login.
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Name (for register)</Label>
          <Input id="name" value={name} onChange={(event) => setName(event.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleLogin} disabled={loading} className="min-w-28">
            {loading ? 'Please wait...' : 'Login'}
          </Button>
          <Button variant="outline" onClick={handleRegister} disabled={loading} className="min-w-28">
            {loading ? 'Please wait...' : 'Register'}
          </Button>
        </div>
        {!!message && (
          <p className={`text-sm ${mode === 'error' ? 'text-destructive' : 'text-emerald-700'}`}>{message}</p>
        )}
      </CardContent>
    </Card>
  );
}
