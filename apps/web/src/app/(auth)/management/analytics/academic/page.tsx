'use client';

import Link from 'next/link';
import { useAcademicDashboard } from '@/hooks/use-api';

function toRows(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.classPerformance)) return data.classPerformance;
  if (Array.isArray(data?.classes)) return data.classes;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

export default function AcademicAnalyticsPage() {
  const { data, isLoading, error, refetch } = useAcademicDashboard();
  const rows = toRows(data);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Analytics — Academic</h1>
          <p className="text-sm text-muted-foreground">Academic KPIs and trends</p>
        </div>
        <button onClick={() => refetch()} className="rounded-lg border px-3 py-2 text-sm hover:bg-muted">
          Refresh
        </button>
      </div>

      {isLoading && <div className="text-sm text-muted-foreground">Loading…</div>}
      {error && <div className="text-sm text-destructive">Failed to load academic analytics.</div>}

      {rows.length ? (
        <div className="overflow-hidden rounded-xl border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Class</th>
                <th className="px-4 py-3 text-right">Pass</th>
                <th className="px-4 py-3 text-right">Fail</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-right">Pass rate</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r: any, i: number) => (
                <tr key={r.classId ?? r.className ?? i} className="border-t">
                  <td className="px-4 py-3 font-medium">{r.className ?? r.name ?? '—'}</td>
                  <td className="px-4 py-3 text-right">{r.pass ?? 0}</td>
                  <td className="px-4 py-3 text-right">{r.fail ?? 0}</td>
                  <td className="px-4 py-3 text-right">{r.total ?? 0}</td>
                  <td className="px-4 py-3 text-right">{r.passRate ?? 0}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">No academic analytics data yet.</p>
        </div>
      )}

      <Link href="/management/dashboard" className="text-sm font-medium text-primary hover:underline">
        Back to dashboard
      </Link>
    </div>
  );
}

