'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useCollectFee, useFeeHeads, useStudents } from '@/hooks/use-api';
import { useFeeCollectionStats } from '@/hooks/use-api';
import { formatCurrency } from '@/lib/utils';

export default function ManagementFeeCollectionPage() {
  const { data, isLoading, error, refetch } = useFeeCollectionStats(new Date().getFullYear());
  const collect = useCollectFee();
  const { data: heads } = useFeeHeads();
  const headRows = useMemo(() => (Array.isArray(heads) ? heads : (heads as any)?.items ?? (heads as any)?.data ?? []), [heads]);

  const [search, setSearch] = useState('');
  const { data: studentsRes } = useStudents(search ? { q: search } : undefined);
  const students = (studentsRes as any)?.data ?? (studentsRes as any)?.items ?? (Array.isArray(studentsRes) ? studentsRes : []);

  const [studentId, setStudentId] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<'CASH' | 'CHEQUE' | 'DD' | 'NEFT' | 'ONLINE'>('CASH');
  const [feeHeadIds, setFeeHeadIds] = useState<string[]>([]);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [remarks, setRemarks] = useState('');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Fee Collection</h1>
          <p className="text-sm text-muted-foreground">Monthly collection summary</p>
        </div>
        <button onClick={() => refetch()} className="rounded-lg border px-3 py-2 text-sm hover:bg-muted">
          Refresh
        </button>
      </div>

      {isLoading && <div className="text-sm text-muted-foreground">Loading…</div>}
      {error && <div className="text-sm text-destructive">Failed to load collection stats.</div>}

      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div>
          <p className="text-sm font-semibold">Collect fee (offline)</p>
          <p className="text-xs text-muted-foreground">Uses `POST /fees/collect`</p>
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-xs text-muted-foreground">Find student</label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name/email/admission…"
              className="h-10 w-full rounded-lg border bg-muted/30 px-3 text-sm"
            />
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="h-10 w-full rounded-lg border bg-background px-3 text-sm"
            >
              <option value="">— select —</option>
              {students.map((s: any) => (
                <option key={s.id} value={s.id}>
                  {s.name} · {s.admissionNumber ?? '—'} · {s.class?.name ?? ''}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-xs text-muted-foreground">Amount</label>
            <input
              type="number"
              min={1}
              value={amount || ''}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="h-10 w-full rounded-lg border bg-background px-3 text-sm"
            />
            <div className="grid grid-cols-2 gap-2">
              <label className="space-y-1 text-sm">
                <span className="text-xs text-muted-foreground">Payment mode</span>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value as any)}
                  className="h-10 w-full rounded-lg border bg-background px-3 text-sm"
                >
                  <option value="CASH">CASH</option>
                  <option value="CHEQUE">CHEQUE</option>
                  <option value="DD">DD</option>
                  <option value="NEFT">NEFT</option>
                  <option value="ONLINE">ONLINE</option>
                </select>
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-xs text-muted-foreground">Reference #</span>
                <input
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  className="h-10 w-full rounded-lg border bg-background px-3 text-sm"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="mt-3">
          <p className="text-xs font-medium text-muted-foreground">Fee heads</p>
          <div className="mt-2 grid gap-2 md:grid-cols-3">
            {headRows.map((h: any) => {
              const checked = feeHeadIds.includes(h.id);
              return (
                <label key={h.id} className="flex items-center gap-2 rounded-lg border bg-muted/10 px-3 py-2 text-sm">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                      setFeeHeadIds((prev) => (e.target.checked ? [...prev, h.id] : prev.filter((x) => x !== h.id)));
                    }}
                  />
                  <span className="font-medium">{h.name}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="mt-3">
          <label className="block text-xs text-muted-foreground">Remarks</label>
          <input
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="h-10 w-full rounded-lg border bg-background px-3 text-sm"
          />
        </div>

        <div className="mt-3 flex justify-end">
          <button
            disabled={!studentId || amount <= 0 || feeHeadIds.length === 0 || collect.isPending}
            onClick={async () => {
              await collect.mutateAsync({ studentId, amount, paymentMode, feeHeadIds, referenceNumber: referenceNumber || undefined, remarks: remarks || undefined } as any);
              setAmount(0);
              setFeeHeadIds([]);
              setReferenceNumber('');
              setRemarks('');
              refetch();
            }}
            className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {collect.isPending ? 'Submitting…' : 'Collect'}
          </button>
        </div>
      </div>

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
                  No data.
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

