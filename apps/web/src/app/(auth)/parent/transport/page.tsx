'use client';

import Link from 'next/link';
import { useSelectedChildStudentId } from '@/lib/parent-child';
import { useStudentTransport } from '@/hooks/use-api';

export default function ParentTransportPage() {
  const { studentId, children, setStudentId } = useSelectedChildStudentId();
  const { data, isLoading, error, refetch } = useStudentTransport(studentId);
  const assignments = (data ?? []) as any[];
  const active = assignments.find((a) => a.status === 'ACTIVE') ?? assignments[0];

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Transport</h1>
      <p className="text-sm text-muted-foreground">Route and stop details for your child</p>

      <div className="flex justify-end">
        <button onClick={() => refetch()} className="rounded-lg border px-3 py-2 text-sm hover:bg-muted">
          Refresh
        </button>
      </div>

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

      {isLoading && <div className="text-sm text-muted-foreground">Loading…</div>}
      {error && <div className="text-sm text-destructive">Failed to load transport assignment.</div>}

      {active ? (
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <p className="text-sm font-semibold">Current assignment</p>
          <div className="mt-2 grid gap-3 md:grid-cols-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Route</p>
              <p className="font-semibold">{active.route?.name ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Stop</p>
              <p className="font-semibold">{active.stop?.name ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <p className="font-semibold">{active.status}</p>
            </div>
          </div>
        </div>
      ) : (
        !isLoading && <div className="rounded-xl border bg-card p-5 text-sm text-muted-foreground">No transport assigned.</div>
      )}

      <Link href="/parent/dashboard" className="text-sm font-medium text-primary hover:underline">
        Back to dashboard
      </Link>
    </div>
  );
}

