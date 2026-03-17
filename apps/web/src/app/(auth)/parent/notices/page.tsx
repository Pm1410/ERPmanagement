'use client';

import Link from 'next/link';
import { useNotices } from '@/hooks/use-api';
import { formatDate } from '@/lib/utils';
import { useSelectedChildStudentId } from '@/lib/parent-child';
import { useStudent } from '@/hooks/use-api';

export default function ParentNoticesPage() {
  const { studentId } = useSelectedChildStudentId();
  const { data: student } = useStudent(studentId);
  const { data, isLoading, error, refetch } = useNotices(student?.classId ? { classId: student.classId } : undefined);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Notices</h1>
          <p className="text-sm text-muted-foreground">Announcements</p>
        </div>
        <button onClick={() => refetch()} className="rounded-lg border px-3 py-2 text-sm hover:bg-muted">
          Refresh
        </button>
      </div>

      {isLoading && <div className="text-sm text-muted-foreground">Loading…</div>}
      {error && <div className="text-sm text-destructive">Failed to load notices.</div>}

      <div className="space-y-2">
        {(data ?? []).length ? (data as any[]).map((n: any) => (
          <div key={n.id} className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold">{n.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
              </div>
              <div className="shrink-0 text-xs text-muted-foreground">
                {n.createdAt ? formatDate(n.createdAt, 'short') : '—'}
              </div>
            </div>
          </div>
        )) : (
          !isLoading && <div className="text-sm text-muted-foreground">No notices yet.</div>
        )}
      </div>

      <Link href="/parent/dashboard" className="text-sm font-medium text-primary hover:underline">
        Back to dashboard
      </Link>
    </div>
  );
}

