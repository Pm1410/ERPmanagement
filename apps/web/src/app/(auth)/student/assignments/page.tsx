'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { useAssignments, useMyStudentProfile } from '@/hooks/use-api';
import { formatDate } from '@/lib/utils';

export default function StudentAssignmentsPage() {
  const { user } = useAuthStore();
  const { data: me } = useMyStudentProfile();
  const studentId = me?.id ?? '';
  const { data, isLoading, error, refetch } = useAssignments({ studentId });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Assignments</h1>
          <p className="text-sm text-muted-foreground">Your homework and submissions</p>
        </div>
        <button onClick={() => refetch()} className="rounded-lg border px-3 py-2 text-sm hover:bg-muted">
          Refresh
        </button>
      </div>

      {isLoading && <div className="text-sm text-muted-foreground">Loading…</div>}
      {error && <div className="text-sm text-destructive">Failed to load assignments.</div>}

      <div className="space-y-2">
        {(data ?? []).length ? (data as any[]).map((a: any) => (
          <div key={a.id} className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold">{a.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {a.subject?.name ?? 'Subject'} · Due {a.dueDate ? formatDate(a.dueDate, 'short') : '—'}
                </p>
              </div>
              <span className="shrink-0 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                {a.status ?? 'OPEN'}
              </span>
            </div>
          </div>
        )) : (
          !isLoading && <div className="text-sm text-muted-foreground">No assignments.</div>
        )}
      </div>

      <Link href="/student/dashboard" className="text-sm font-medium text-primary hover:underline">
        Back to dashboard
      </Link>
    </div>
  );
}

