'use client';

import Link from 'next/link';
import { useFinancialDashboard } from '@/hooks/use-api';
import { formatCurrency } from '@/lib/utils';

function pickCards(data: any): Array<{ label: string; value: string }> {
  if (!data || typeof data !== 'object') return [];
  const cards: Array<{ label: string; value: string }> = [];
  const add = (label: string, v: any, fmt?: (x: any) => string) => {
    if (v == null) return;
    cards.push({ label, value: fmt ? fmt(v) : String(v) });
  };
  add('Total collected', data.totalCollected, (v) => formatCurrency(Number(v)));
  add('Total due', data.totalDue, (v) => formatCurrency(Number(v)));
  add('Total students', data.totalStudents);
  add('Defaulters', data.defaultersCount);
  return cards;
}

function pickMonthly(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.monthlyCollection)) return data.monthlyCollection;
  if (Array.isArray(data?.feeCollection)) return data.feeCollection;
  return [];
}

export default function FinancialAnalyticsPage() {
  const { data, isLoading, error, refetch } = useFinancialDashboard();
  const cards = pickCards(data);
  const monthly = pickMonthly(data);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Analytics — Financial</h1>
          <p className="text-sm text-muted-foreground">Collections and dues</p>
        </div>
        <button onClick={() => refetch()} className="rounded-lg border px-3 py-2 text-sm hover:bg-muted">
          Refresh
        </button>
      </div>

      {isLoading && <div className="text-sm text-muted-foreground">Loading…</div>}
      {error && <div className="text-sm text-destructive">Failed to load financial analytics.</div>}

      {cards.length ? (
        <div className="grid gap-4 md:grid-cols-4">
          {cards.map((c) => (
            <div key={c.label} className="rounded-xl border bg-card p-4 shadow-sm">
              <p className="text-xs text-muted-foreground">{c.label}</p>
              <p className="mt-1 text-2xl font-bold">{c.value}</p>
            </div>
          ))}
        </div>
      ) : null}

      {monthly.length ? (
        <div className="overflow-hidden rounded-xl border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Month</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-right">Transactions</th>
              </tr>
            </thead>
            <tbody>
              {monthly.map((m: any, i: number) => (
                <tr key={m.month ?? i} className="border-t">
                  <td className="px-4 py-3 font-medium">{m.month}</td>
                  <td className="px-4 py-3 text-right font-semibold">{formatCurrency(Number(m.amount ?? 0))}</td>
                  <td className="px-4 py-3 text-right">{m.transactions ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">No financial analytics data yet.</p>
        </div>
      )}

      <Link href="/management/dashboard" className="text-sm font-medium text-primary hover:underline">
        Back to dashboard
      </Link>
    </div>
  );
}

