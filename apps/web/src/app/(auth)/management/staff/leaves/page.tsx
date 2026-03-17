'use client';

import Link from 'next/link';
import { useLeaveRequests } from '@/hooks/use-api';
import { formatDate } from '@/lib/utils';

export default function ManagementLeaveApprovalsPage() {
  const { data, isLoading, error, refetch } = useLeaveRequests({ status: 'PENDING' });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Leave Approvals</h1>
          <p className="text-sm text-muted-foreground">Pending requests</p>
        </div>
        <button onClick={() => refetch()} className="rounded-lg border px-3 py-2 text-sm hover:bg-muted">
          Refresh
        </button>
      </div>

      {isLoading && <div className="text-sm text-muted-foreground">Loading…</div>}
      {error && <div className="text-sm text-destructive">Failed to load leave requests.</div>}

      <div className="space-y-2">
        {(data ?? []).length ? (data as any[]).map((l: any) => (
          <div key={l.id} className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold">{l.staff?.name ?? l.staffName ?? 'Staff'} — {l.type ?? 'Leave'}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {l.fromDate ? formatDate(l.fromDate, 'short') : '—'} → {l.toDate ? formatDate(l.toDate, 'short') : '—'}
                </p>
                {l.reason && <p className="mt-1 text-sm text-muted-foreground">{l.reason}</p>}
              </div>
              <div className="shrink-0 text-right text-xs text-muted-foreground">
                <div className="font-medium">{l.status ?? 'PENDING'}</div>
                <div className="mt-1">{l.createdAt ? formatDate(l.createdAt, 'short') : ''}</div>
              </div>
            </div>
          </div>
        )) : (
          !isLoading && <div className="text-sm text-muted-foreground">No pending requests.</div>
        )}
      </div>

      <Link href="/management/staff" className="text-sm font-medium text-primary hover:underline">
        Back to staff
      </Link>
    </div>
  );
}

