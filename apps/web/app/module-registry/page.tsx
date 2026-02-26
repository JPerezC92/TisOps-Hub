'use client';

import { ModuleRegistryList } from '@/modules/module-registry/components/module-registry-list';

export default function ModuleRegistryPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground">Module Registry</h1>
          <p className="mt-3 text-base text-muted-foreground/90">
            Manage module mappings (Source Value &rarr; Display Value) with application indicators
          </p>
        </div>
        <ModuleRegistryList />
      </main>
    </div>
  );
}
