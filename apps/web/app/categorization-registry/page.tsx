'use client';

import { CategorizationsList } from '@/modules/categorization-registry/components/categorizations-list';

export default function CategorizationRegistryPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground">Categorization Registry</h1>
          <p className="mt-3 text-base text-muted-foreground/90">
            Manage categorization mappings (Source Value → Display Value)
          </p>
        </div>

        <CategorizationsList />
      </main>
    </div>
  );
}
