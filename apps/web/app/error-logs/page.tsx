'use client';

import { ErrorLogsStats } from '@/modules/error-logs/components/error-logs-stats';
import { ErrorLogsList } from '@/modules/error-logs/components/error-logs-list';

export default function ErrorLogsPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground">Error Logs</h1>
          <p className="mt-3 text-base text-muted-foreground/90">
            Monitor and track all system errors and exceptions
          </p>
        </div>

        <ErrorLogsStats />
        <ErrorLogsList />
      </main>
    </div>
  );
}
