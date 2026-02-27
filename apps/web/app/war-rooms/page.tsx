'use client';

import { WarRoomsList } from '@/modules/war-rooms/components/war-rooms-list';

export default function WarRoomsPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground">War Rooms</h1>
          <p className="mt-3 text-base text-muted-foreground/90">
            View and manage war room incident records
          </p>
        </div>
        <WarRoomsList />
      </main>
    </div>
  );
}
