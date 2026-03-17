'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAssignmentSubmissions, useGradeSubmission } from '@/hooks/use-api';
import { cn, formatDate } from '@/lib/utils';
import { useMemo, useState } from 'react';

export default function FacultyGradeAssignmentPage() {
  const params = useParams<{ id: string }>();
  const assignmentId = params?.id ?? '';

  const { data, isLoading, error, refetch } = useAssignmentSubmissions(assignmentId);
  const grade = useGradeSubmission();

  const submissions = (data ?? []) as any[];
  const [draft, setDraft] = useState<Record<string, { marksObtained: string; feedback: string }>>({});

  const rows = useMemo(
    () =>
      submissions.map((s) => ({
        ...s,
        _draft: draft[s.id] ?? { marksObtained: s.marksObtained ? String(s.marksObtained) : '', feedback: s.feedback ?? '' },
      })),
    [submissions, draft],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Grade submissions</h1>
          <p className="text-sm text-muted-foreground">Assignment: <span className="font-mono">{assignmentId}</span></p>
        </div>
        <button onClick={() => refetch()} className="rounded-lg border px-3 py-2 text-sm hover:bg-muted">
          Refresh
        </button>
      </div>

      {isLoading && <div className="text-sm text-muted-foreground">Loading…</div>}
      {error && <div className="text-sm text-destructive">Failed to load submissions.</div>}

      <div className="space-y-2">
        {rows.length ? rows.map((s: any) => (
          <div key={s.id} className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold">{s.student?.name ?? 'Student'}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Submitted {s.submittedAt ? formatDate(s.submittedAt, 'short') : '—'} · Status: {s.status}
                </p>
                {s.fileUrl ? (
                  <a
                    href={s.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block text-xs font-medium text-primary hover:underline"
                  >
                    View file →
                  </a>
                ) : null}
              </div>
              <span className={cn('shrink-0 rounded-md px-2 py-1 text-xs font-semibold',
                s.status === 'GRADED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700')}>
                {s.status}
              </span>
            </div>

            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <label className="space-y-1">
                <span className="text-xs text-muted-foreground">Marks</span>
                <input
                  value={s._draft.marksObtained}
                  onChange={(e) => setDraft((d) => ({ ...d, [s.id]: { ...s._draft, marksObtained: e.target.value } }))}
                  className="w-full rounded-md border bg-background px-2 py-2 text-sm"
                  placeholder="e.g. 18"
                  inputMode="decimal"
                />
              </label>
              <label className="space-y-1 md:col-span-2">
                <span className="text-xs text-muted-foreground">Feedback (optional)</span>
                <input
                  value={s._draft.feedback}
                  onChange={(e) => setDraft((d) => ({ ...d, [s.id]: { ...s._draft, feedback: e.target.value } }))}
                  className="w-full rounded-md border bg-background px-2 py-2 text-sm"
                  placeholder="Short feedback…"
                />
              </label>
            </div>

            <div className="mt-3 flex justify-end">
              <button
                disabled={grade.isPending || !s._draft.marksObtained}
                onClick={async () => {
                  await grade.mutateAsync({
                    submissionId: s.id,
                    marksObtained: Number(s._draft.marksObtained),
                    feedback: s._draft.feedback || undefined,
                  });
                  refetch();
                }}
                className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {grade.isPending ? 'Saving…' : 'Save grade'}
              </button>
            </div>
          </div>
        )) : (
          !isLoading && <div className="text-sm text-muted-foreground">No submissions yet.</div>
        )}
      </div>

      <Link href="/faculty/dashboard" className="text-sm font-medium text-primary hover:underline">
        Back to dashboard
      </Link>
    </div>
  );
}

