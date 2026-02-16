'use client';

import { CorrectiveStatusList } from '@/modules/corrective-status-registry/components/corrective-status-list';

export default function CorrectiveStatusRegistryPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground">Corrective Status Registry</h1>
          <p className="mt-3 text-base text-muted-foreground/90">
            Manage status mappings for corrective maintenance data (Spanish → English)
          </p>
        </div>

        <CorrectiveStatusList />
      </main>
    </div>
  );
}
