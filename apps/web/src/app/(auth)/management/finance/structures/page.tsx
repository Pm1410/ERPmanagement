'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useAcademicYears, useClasses, useCreateFeeStructure, useFeeHeads, useFeeStructure } from '@/hooks/use-api';
import { formatCurrency } from '@/lib/utils';

export default function ManagementFeeStructuresPage() {
  const { data: years } = useAcademicYears();
  const academicYearId = years?.find((y: any) => y.isCurrent)?.id ?? years?.[0]?.id ?? '';
  const { data: classes } = useClasses(academicYearId);
  const [classId, setClassId] = useState<string>(classes?.[0]?.id ?? '');
  const { data: heads } = useFeeHeads();
  const { data: structure, isLoading, error, refetch } = useFeeStructure(classId, academicYearId);
  const save = useCreateFeeStructure();

  const headRows = useMemo(() => (Array.isArray(heads) ? heads : heads?.items ?? heads?.data ?? []), [heads]);
  const [frequency, setFrequency] = useState('ANNUAL');
  const [lateFeePerDay, setLateFeePerDay] = useState<number>(10);
  const [dueDate, setDueDate] = useState<string>('');
  const [amounts, setAmounts] = useState<Record<string, number>>({});

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Fee Structures</h1>
          <p className="text-sm text-muted-foreground">Heads and structure lookup</p>
        </div>
        <button onClick={() => refetch()} className="rounded-lg border px-3 py-2 text-sm hover:bg-muted">
          Refresh
        </button>
      </div>

      <label className="block rounded-xl border bg-card p-4">
        <span className="text-xs text-muted-foreground">Class</span>
        <select
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
          className="mt-1 w-full rounded-md border bg-background px-2 py-2 text-sm"
        >
          {(classes ?? []).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </label>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm font-semibold">Fee heads</p>
          <div className="mt-2 space-y-1 text-sm">
            {headRows.length ? headRows.map((h: any) => (
              <div key={h.id} className="grid grid-cols-6 items-center gap-2 rounded-lg bg-muted/40 px-3 py-2">
                <span className="col-span-3 font-medium">{h.name}</span>
                <input
                  type="number"
                  min={0}
                  value={amounts[h.id] ?? ''}
                  onChange={(e) => setAmounts((a) => ({ ...a, [h.id]: Number(e.target.value) }))}
                  placeholder="Amount"
                  className="col-span-2 h-9 rounded-md border bg-background px-2 text-sm"
                />
                <span className="text-xs text-muted-foreground text-right">{h.id.slice(0, 8)}…</span>
              </div>
            )) : (
              <p className="text-sm text-muted-foreground">No heads found.</p>
            )}
          </div>
          <div className="mt-3 grid gap-2 md:grid-cols-3">
            <label className="space-y-1 text-sm">
              <span className="text-xs text-muted-foreground">Frequency</span>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="h-10 w-full rounded-lg border bg-background px-3"
              >
                <option value="MONTHLY">MONTHLY</option>
                <option value="QUARTERLY">QUARTERLY</option>
                <option value="ANNUAL">ANNUAL</option>
                <option value="ONE_TIME">ONE_TIME</option>
              </select>
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-xs text-muted-foreground">Late fee/day</span>
              <input
                type="number"
                value={lateFeePerDay}
                onChange={(e) => setLateFeePerDay(Number(e.target.value))}
                className="h-10 w-full rounded-lg border bg-background px-3"
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-xs text-muted-foreground">Due date</span>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="h-10 w-full rounded-lg border bg-background px-3"
              />
            </label>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Total: <span className="font-semibold text-foreground">
                {formatCurrency(Object.values(amounts).reduce((a, b) => a + (Number.isFinite(b) ? b : 0), 0))}
              </span>
            </div>
            <button
              disabled={!classId || !academicYearId || save.isPending}
              onClick={async () => {
                const items = Object.entries(amounts)
                  .filter(([, v]) => Number.isFinite(v) && v > 0)
                  .map(([feeHeadId, amount]) => ({ feeHeadId, amount }));
                await save.mutateAsync({ classId, academicYearId, frequency, items, lateFeePerDay, dueDate: dueDate || undefined } as any);
                refetch();
              }}
              className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {save.isPending ? 'Saving…' : 'Save structure'}
            </button>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm font-semibold">Current structure</p>
          {isLoading && <p className="mt-2 text-sm text-muted-foreground">Loading…</p>}
          {error && <p className="mt-2 text-sm text-destructive">Failed to load structure.</p>}
          {!isLoading && !structure && (
            <p className="mt-2 text-sm text-muted-foreground">No structure for this class/year yet.</p>
          )}
          {structure && (
            <pre className="mt-2 whitespace-pre-wrap break-words rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
              {JSON.stringify(structure, null, 2)}
            </pre>
          )}
        </div>
      </div>

      <Link href="/management/dashboard" className="text-sm font-medium text-primary hover:underline">
        Back to dashboard
      </Link>
    </div>
  );
}

