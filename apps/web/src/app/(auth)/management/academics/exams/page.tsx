'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAcademicYears, useExams } from '@/hooks/use-api';
import { formatDate } from '@/lib/utils';

export default function ManagementExamSchedulePage() {
  const { data: years } = useAcademicYears();
  const current = years?.find((y: any) => y.isCurrent)?.id ?? years?.[0]?.id;
  const [yearId] = useState<string | undefined>(current);
  const { data, isLoading, error, refetch } = useExams(yearId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Exam Schedule</h1>
          <p className="text-sm text-muted-foreground">Published exams</p>
        </div>
        <button onClick={() => refetch()} className="rounded-lg border px-3 py-2 text-sm hover:bg-muted">
          Refresh
        </button>
      </div>

      {isLoading && <div className="text-sm text-muted-foreground">Loading…</div>}
      {error && <div className="text-sm text-destructive">Failed to load exams.</div>}

      <div className="space-y-2">
        {(data ?? []).length ? (data as any[]).map((e: any) => (
          <div key={e.id} className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold">{e.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{e.description ?? ''}</p>
              </div>
              <div className="shrink-0 text-right text-xs text-muted-foreground">
                <div>{e.startDate ? formatDate(e.startDate, 'short') : '—'} → {e.endDate ? formatDate(e.endDate, 'short') : '—'}</div>
                <div className="mt-1 font-medium">{e.examType ?? ''}</div>
              </div>
            </div>
          </div>
        )) : (
          !isLoading && <div className="text-sm text-muted-foreground">No exams found.</div>
        )}
      </div>

      <Link href="/management/dashboard" className="text-sm font-medium text-primary hover:underline">
        Back to dashboard
      </Link>
    </div>
  );
}

