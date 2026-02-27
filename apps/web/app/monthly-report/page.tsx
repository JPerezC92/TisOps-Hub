'use client';

import { MonthlyReportList } from '@/modules/monthly-report/components/monthly-report-list';

export default function MonthlyReportPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground">Monthly Report</h1>
          <p className="mt-3 text-base text-muted-foreground/90">
            Monthly incident reports and tracking
          </p>
        </div>
        <MonthlyReportList />
      </main>
    </div>
  );
}
