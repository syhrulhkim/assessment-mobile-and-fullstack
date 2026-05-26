'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { buttonVariants } from '@/components/ui/button';
import { clearAuthToken, logout } from '@/lib/api';
import { hasStoredToken } from '@/lib/auth';

export default function AuthNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    setIsAuthenticated(hasStoredToken());
  }, [pathname]);

  async function handleLogout() {
    try {
      setIsLoggingOut(true);
      await logout();
    } catch {
      clearAuthToken();
    } finally {
      setIsAuthenticated(false);
      setIsLoggingOut(false);
      router.push('/login');
      router.refresh();
    }
  }

  if (!isAuthenticated) {
    return (
      <nav className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto">
        <span className="hidden rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground sm:inline-block">
          Not signed in
        </span>
        <Link href="/login" prefetch={false} className={`${buttonVariants()} w-full sm:w-auto`}>
          Login
        </Link>
      </nav>
    );
  }

  return (
    <nav className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto">
      <span className="hidden rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 sm:inline-block">
        Signed in
      </span>
      <Link href="/tasks" prefetch={false} className={`${buttonVariants({ variant: 'outline' })} w-full sm:w-auto`}>
        Tasks
      </Link>
      <Link href="/tasks/create" prefetch={false} className={`${buttonVariants()} w-full sm:w-auto`}>
        Create Task
      </Link>
      <button
        type="button"
        onClick={handleLogout}
        disabled={isLoggingOut}
        className={`${buttonVariants({ variant: 'secondary' })} w-full sm:w-auto`}
      >
        {isLoggingOut ? 'Logging out...' : 'Logout'}
      </button>
    </nav>
  );
}
