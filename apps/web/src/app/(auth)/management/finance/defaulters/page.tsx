'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useDefaulters } from '@/hooks/use-api';
import { formatCurrency } from '@/lib/utils';

export default function ManagementDefaultersPage() {
  const [page] = useState(1);
  const { data, isLoading, error, refetch } = useDefaulters(page, 50);
  const rows = (data as any)?.items ?? (data as any)?.data ?? (Array.isArray(data) ? data : []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Fee Defaulters</h1>
          <p className="text-sm text-muted-foreground">Outstanding dues</p>
        </div>
        <button onClick={() => refetch()} className="rounded-lg border px-3 py-2 text-sm hover:bg-muted">
          Refresh
        </button>
      </div>

      {isLoading && <div className="text-sm text-muted-foreground">Loading…</div>}
      {error && <div className="text-sm text-destructive">Failed to load defaulters.</div>}

      <div className="overflow-hidden rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Student</th>
              <th className="px-4 py-3 text-left">Class</th>
              <th className="px-4 py-3 text-right">Due</th>
            </tr>
          </thead>
          <tbody>
            {rows?.length ? rows.map((r: any, idx: number) => (
              <tr key={r.studentId ?? r.id ?? idx} className="border-t">
                <td className="px-4 py-3 font-medium">{r.studentName ?? r.student?.name ?? '—'}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.className ?? r.student?.class?.name ?? '—'}</td>
                <td className="px-4 py-3 text-right font-semibold">{formatCurrency(r.totalDue ?? r.due ?? 0)}</td>
              </tr>
            )) : (
              !isLoading && (
                <tr>
                  <td className="px-4 py-6 text-sm text-muted-foreground" colSpan={3}>
                    No defaulters.
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      <Link href="/management/dashboard" className="text-sm font-medium text-primary hover:underline">
        Back to dashboard
      </Link>
    </div>
  );
}

