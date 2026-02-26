'use client';

import { ProblemsList } from '@/modules/problems/components/problems-list';

export default function ProblemsPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground">
            Problems Dashboard
          </h1>
          <p className="mt-3 text-base text-muted-foreground/90">
            View and manage reported problems from XD PROBLEMAS NUEVOS
          </p>
        </div>
        <ProblemsList />
      </main>
    </div>
  );
}
