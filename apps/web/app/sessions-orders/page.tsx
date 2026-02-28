'use client';

import { SessionsOrdersList } from '@/modules/sessions-orders/components/sessions-orders-list';

export default function SessionsOrdersPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground">Sessions & Orders</h1>
          <p className="mt-3 text-base text-muted-foreground/90">
            View incidents, sessions, orders, and release data
          </p>
        </div>

        <SessionsOrdersList />
      </main>
    </div>
  );
}
