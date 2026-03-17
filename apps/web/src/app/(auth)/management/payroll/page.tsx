'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { apiClient, extractData } from '@/lib/api-client';
import { useFaculty } from '@/hooks/use-api';
import { formatDate } from '@/lib/utils';

export default function ManagementPayrollPage() {
  const { data: facultyRes } = useFaculty();
  const staff = useMemo(() => (facultyRes as any)?.data ?? (facultyRes as any)?.items ?? (Array.isArray(facultyRes) ? facultyRes : []), [facultyRes]);
  const [staffId, setStaffId] = useState('');
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [slips, setSlips] = useState<any[]>([]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Payroll</h1>
      <p className="text-sm text-muted-foreground">Basic payslips viewer (API: `GET /hr/payroll/slips`)</p>

      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="grid gap-2 md:grid-cols-4">
          <select value={staffId} onChange={(e) => setStaffId(e.target.value)} className="h-10 rounded-lg border bg-background px-3 text-sm md:col-span-2">
            <option value="">All staff</option>
            {staff.map((s: any) => <option key={s.userId ?? s.id} value={s.userId ?? s.id}>{s.name}</option>)}
          </select>
          <input type="number" min={1} max={12} value={month} onChange={(e) => setMonth(Number(e.target.value))} className="h-10 rounded-lg border bg-background px-3 text-sm" />
          <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} className="h-10 rounded-lg border bg-background px-3 text-sm" />
        </div>
        <div className="mt-3 flex justify-end">
          <button
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              try {
                const res = await apiClient.get('/hr/payroll/slips', { params: { month, year, staffId: staffId || undefined } }).then(extractData);
                setSlips(Array.isArray(res) ? res : (res?.items ?? res?.data ?? []));
              } finally {
                setLoading(false);
              }
            }}
            className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? 'Loading…' : 'Load payslips'}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {slips.length ? slips.map((p: any) => (
          <div key={p.id} className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold">{p.staff?.name ?? p.staffName ?? 'Staff'}</p>
                <p className="mt-1 text-xs text-muted-foreground">{p.month}/{p.year} · Generated {p.createdAt ? formatDate(p.createdAt, 'short') : '—'}</p>
              </div>
              {p.netPay != null && <div className="text-sm font-semibold">₹{Number(p.netPay).toLocaleString()}</div>}
            </div>
          </div>
        )) : (
          <p className="text-sm text-muted-foreground">No payslips loaded.</p>
        )}
      </div>

      <Link href="/management/dashboard" className="text-sm font-medium text-primary hover:underline">Back to dashboard</Link>
    </div>
  );
}

