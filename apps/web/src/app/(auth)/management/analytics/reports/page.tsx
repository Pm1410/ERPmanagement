'use client';

import Link from 'next/link';
import { useFeeCollectionStats } from '@/hooks/use-api';
import { formatCurrency } from '@/lib/utils';

export default function CustomReportsPage() {
  const { data, isLoading, error, refetch } = useFeeCollectionStats(new Date().getFullYear());

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Analytics — Reports</h1>
          <p className="text-sm text-muted-foreground">Basic report snapshots</p>
        </div>
        <button onClick={() => refetch()} className="rounded-lg border px-3 py-2 text-sm hover:bg-muted">
          Refresh
        </button>
      </div>

      {isLoading && <div className="text-sm text-muted-foreground">Loading…</div>}
      {error && <div className="text-sm text-destructive">Failed to load reports.</div>}

      <div className="overflow-hidden rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Month</th>
              <th className="px-4 py-3 text-right">Collected</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((m: any) => (
              <tr key={m.month} className="border-t">
                <td className="px-4 py-3 font-medium">{m.month}</td>
                <td className="px-4 py-3 text-right font-semibold">{formatCurrency(m.amount ?? 0)}</td>
              </tr>
            ))}
            {!isLoading && !(data ?? []).length && (
              <tr>
                <td className="px-4 py-6 text-sm text-muted-foreground" colSpan={2}>
                  No report data.
                </td>
              </tr>
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

