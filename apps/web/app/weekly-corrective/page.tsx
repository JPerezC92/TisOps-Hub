'use client';

import { WeeklyCorrectiveList } from '@/modules/weekly-corrective/components/weekly-corrective-list';

export default function WeeklyCorrectivePage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground">Weekly Corrective</h1>
          <p className="mt-3 text-base text-muted-foreground/90">
            Weekly corrective action reports
          </p>
        </div>
        <WeeklyCorrectiveList />
      </main>
    </div>
  );
}
