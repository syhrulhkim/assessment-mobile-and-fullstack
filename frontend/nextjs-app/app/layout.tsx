import './globals.css';
import type { ReactNode } from 'react';
import Providers from '@/components/Providers';
import AuthNav from '@/components/AuthNav';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-6 sm:px-8">
            <header className="mb-6 rounded-lg border bg-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs tracking-[0.12em] text-muted-foreground">TASK WORKSPACE</p>
                  <h1 className="text-xl font-semibold leading-tight sm:text-2xl">Practical Task Manager</h1>
                </div>
                <AuthNav />
              </div>
            </header>
            <main className="flex-1">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
