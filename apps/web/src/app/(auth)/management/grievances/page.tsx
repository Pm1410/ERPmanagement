'use client';

import Link from 'next/link';
import { useGrievances } from '@/hooks/use-api';
import { formatDate } from '@/lib/utils';

export default function ManagementGrievancesPage() {
  const { data, isLoading, error, refetch } = useGrievances();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Grievances</h1>
          <p className="text-sm text-muted-foreground">Tickets and resolutions</p>
        </div>
        <button onClick={() => refetch()} className="rounded-lg border px-3 py-2 text-sm hover:bg-muted">
          Refresh
        </button>
      </div>

      {isLoading && <div className="text-sm text-muted-foreground">Loading…</div>}
      {error && <div className="text-sm text-destructive">Failed to load grievances.</div>}

      <div className="space-y-2">
        {(data ?? []).length ? (data as any[]).map((g: any) => (
          <div key={g.id} className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold">{g.subject ?? 'Grievance'}</p>
                <p className="mt-1 text-sm text-muted-foreground">{g.description ?? ''}</p>
              </div>
              <div className="shrink-0 text-right text-xs text-muted-foreground">
                <div className="font-medium">{g.status ?? 'OPEN'}</div>
                <div className="mt-1">{g.createdAt ? formatDate(g.createdAt, 'short') : '—'}</div>
              </div>
            </div>
          </div>
        )) : (
          !isLoading && <div className="text-sm text-muted-foreground">No grievances.</div>
        )}
      </div>

      <Link href="/management/dashboard" className="text-sm font-medium text-primary hover:underline">
        Back to dashboard
      </Link>
    </div>
  );
}

