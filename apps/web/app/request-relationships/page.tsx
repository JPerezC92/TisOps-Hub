'use client';

import { RequestRelationshipsContent } from '@/modules/request-relationships/components/request-relationships-content';

export default function RequestRelationshipsPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground">
            Request Relationships
          </h1>
          <p className="mt-3 text-base text-muted-foreground/90">
            Parent-Child Request Management
          </p>
        </div>

        <RequestRelationshipsContent />
      </main>
    </div>
  );
}
