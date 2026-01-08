'use client';

import { RequestTagsUpload } from '@/modules/request-tags/components/request-tags-upload';
import { RequestTagsActions } from '@/modules/request-tags/components/request-tags-actions';
import { RequestTagsList } from '@/modules/request-tags/components/request-tags-list';

export default function RequestTagsPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground">Request Tags</h1>
          <p className="mt-3 text-base text-muted-foreground/90">
            View and manage request tag data from REP01 XD TAG 2025 imports
          </p>
        </div>

        <RequestTagsUpload />
        <RequestTagsActions />
        <RequestTagsList />
      </main>
    </div>
  );
}
