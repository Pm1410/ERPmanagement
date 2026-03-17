'use client';

import Link from 'next/link';
import { useStudentResults } from '@/hooks/use-api';
import { cn, formatDate } from '@/lib/utils';
import { useSelectedChildStudentId } from '@/lib/parent-child';

export default function ParentProgressPage() {
  const { studentId, children, setStudentId } = useSelectedChildStudentId();
  const { data, isLoading, error, refetch } = useStudentResults(studentId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Progress</h1>
          <p className="text-sm text-muted-foreground">Exam performance</p>
        </div>
        <button onClick={() => refetch()} className="rounded-lg border px-3 py-2 text-sm hover:bg-muted">
          Refresh
        </button>
      </div>

      {isLoading && <div className="text-sm text-muted-foreground">Loading…</div>}
      {error && <div className="text-sm text-destructive">Failed to load results.</div>}

      <div className="space-y-2">
        {(data ?? []).length ? (data as any[]).map((r: any) => (
          <div key={r.examId ?? r.id} className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold">{r.examName ?? 'Exam'}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Published {r.publishedAt ? formatDate(r.publishedAt, 'short') : '—'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{r.percentage ?? 0}%</p>
                <span className={cn(
                  'inline-block rounded-md px-2 py-0.5 text-xs font-semibold',
                  r.isPassed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700',
                )}>
                  {r.overallGrade ?? (r.isPassed ? 'PASS' : 'FAIL')}
                </span>
              </div>
            </div>
          </div>
        )) : (
          !isLoading && <div className="text-sm text-muted-foreground">No results yet.</div>
        )}
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

      <Link href="/parent/dashboard" className="text-sm font-medium text-primary hover:underline">
        Back to dashboard
      </Link>
    </div>
  );
}

