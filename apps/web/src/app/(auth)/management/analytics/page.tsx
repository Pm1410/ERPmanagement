'use client';

import Link from 'next/link';

export default function ManagementAnalyticsHomePage() {
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">Analytics</h1>
      <p className="text-sm text-muted-foreground">Use the sidebar to open Analytics modules.</p>
      <div className="space-y-1 text-sm">
        <Link href="/management/analytics/academic" className="block font-medium text-primary hover:underline">
          Academic →
        </Link>
        <Link href="/management/analytics/financial" className="block font-medium text-primary hover:underline">
          Financial →
        </Link>
        <Link href="/management/analytics/operational" className="block font-medium text-primary hover:underline">
          Operational →
        </Link>
        <Link href="/management/analytics/reports" className="block font-medium text-primary hover:underline">
          Reports →
        </Link>
      </div>
    </div>
  );
}

