'use client';

import Link from 'next/link';

export default function ManagementFinanceHomePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Finance</h1>
      <p className="text-sm text-muted-foreground">Use the sidebar to open Finance modules.</p>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 text-sm">
        <Link href="/management/finance/collection" className="rounded-lg border bg-card px-3 py-2 font-medium hover:bg-muted/40">
          Fee Collection →
        </Link>
        <Link href="/management/finance/structures" className="rounded-lg border bg-card px-3 py-2 font-medium hover:bg-muted/40">
          Fee Structures →
        </Link>
        <Link href="/management/finance/defaulters" className="rounded-lg border bg-card px-3 py-2 font-medium hover:bg-muted/40">
          Defaulters →
        </Link>
        <Link href="/management/finance/reports" className="rounded-lg border bg-card px-3 py-2 font-medium hover:bg-muted/40">
          Reports →
        </Link>
      </div>
    </div>
  );
}

