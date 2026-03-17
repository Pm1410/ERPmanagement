'use client';

import Link from 'next/link';
import { useStudentAttendance } from '@/hooks/use-api';
import { formatDate } from '@/lib/utils';
import { useSelectedChildStudentId } from '@/lib/parent-child';

export default function ParentAttendancePage() {
  const { studentId, children, setStudentId } = useSelectedChildStudentId();
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const { data, isLoading, error, refetch } = useStudentAttendance(studentId, month);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Attendance</h1>
          <p className="text-sm text-muted-foreground">{formatDate(now, 'long')}</p>
        </div>
        <button onClick={() => refetch()} className="rounded-lg border px-3 py-2 text-sm hover:bg-muted">
          Refresh
        </button>
      </div>

      {isLoading && <div className="text-sm text-muted-foreground">Loading…</div>}
      {error && <div className="text-sm text-destructive">Failed to load attendance.</div>}

      {data && (
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">Present</p>
            <p className="mt-1 text-2xl font-bold">{data.present}</p>
          </div>
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">Absent</p>
            <p className="mt-1 text-2xl font-bold">{data.absent}</p>
          </div>
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">Late</p>
            <p className="mt-1 text-2xl font-bold">{data.late}</p>
          </div>
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">Percentage</p>
            <p className="mt-1 text-2xl font-bold">{data.percentage}%</p>
          </div>
        </div>
      )}

      {children.length > 1 && (
        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm font-semibold">Child</p>
          <select
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="mt-2 w-full rounded-md border bg-background px-2 py-2 text-sm"
          >
            {children.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      )}

      <Link href="/parent/dashboard" className="text-sm font-medium text-primary hover:underline">
        Back to dashboard
      </Link>
    </div>
  );
}

