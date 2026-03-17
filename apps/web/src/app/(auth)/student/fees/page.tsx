'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { useMyStudentProfile, useStudentFees, useFeeHistory } from '@/hooks/use-api';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function StudentFeesPage() {
  const { user } = useAuthStore();
  const { data: me } = useMyStudentProfile();
  const studentId = me?.id ?? '';
  const { data, isLoading, error, refetch } = useStudentFees(studentId);
  const { data: history } = useFeeHistory(studentId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Fees</h1>
          <p className="text-sm text-muted-foreground">Your dues and payment history</p>
        </div>
        <button onClick={() => refetch()} className="rounded-lg border px-3 py-2 text-sm hover:bg-muted">
          Refresh
        </button>
      </div>

      {isLoading && <div className="text-sm text-muted-foreground">Loading…</div>}
      {error && <div className="text-sm text-destructive">Failed to load fees.</div>}

      {data && (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">Total paid</p>
            <p className="mt-1 text-2xl font-bold text-green-600">{formatCurrency(data.totalPaid)}</p>
          </div>
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">Outstanding</p>
            <p className="mt-1 text-2xl font-bold">{formatCurrency(data.totalDue)}</p>
          </div>
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">Student</p>
            <p className="mt-1 text-sm font-semibold">{data.student?.name ?? '—'}</p>
            <p className="text-xs text-muted-foreground">{data.student?.class?.name ?? '—'} · {data.student?.section?.name ?? '—'}</p>
          </div>
        </div>
      )}

      {data?.dues?.length ? (
        <div className="overflow-hidden rounded-xl border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Fee head</th>
                <th className="px-4 py-3 text-right">Due</th>
              </tr>
            </thead>
            <tbody>
              {data.dues.map((d: any) => (
                <tr key={d.feeHeadId} className="border-t">
                  <td className="px-4 py-3">{d.feeHeadName}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatCurrency(d.due)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !isLoading && <div className="text-sm text-muted-foreground">No dues.</div>
      )}

      {history?.length ? (
        <div className="overflow-hidden rounded-xl border bg-card">
          <div className="border-b px-4 py-3 text-sm font-semibold">Recent payments</div>
          <div className="divide-y">
            {history.slice(0, 10).map((p: any) => (
              <div key={p.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <div>
                  <p className="font-medium">{p.method ?? 'Payment'}</p>
                  <p className="text-xs text-muted-foreground">{p.paidAt ? formatDate(p.paidAt, 'short') : '—'}</p>
                </div>
                <div className="font-semibold">{formatCurrency(p.amount)}</div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <Link href="/student/dashboard" className="text-sm font-medium text-primary hover:underline">
        Back to dashboard
      </Link>
    </div>
  );
}

