'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useAcademicYears, useCreateAcademicYear, useSetCurrentAcademicYear } from '@/hooks/use-api';

export default function ManagementAcademicsHomePage() {
  const { data: years, refetch } = useAcademicYears();
  const createYear = useCreateAcademicYear();
  const setCurrent = useSetCurrentAcademicYear();
  const [form, setForm] = useState({ name: '', startDate: '', endDate: '' });

  const rows = useMemo(() => years ?? [], [years]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Academics</h1>
        <p className="text-sm text-muted-foreground">Academic years, classes, sections, subjects, timetable</p>
      </div>

      <div className="grid gap-2 sm:grid-cols-3 text-sm">
        <Link href="/management/academics/classes" className="rounded-lg border bg-card px-3 py-2 font-medium hover:bg-muted/40">
          Classes & Sections →
        </Link>
        <Link href="/management/academics/subjects" className="rounded-lg border bg-card px-3 py-2 font-medium hover:bg-muted/40">
          Subjects →
        </Link>
        <Link href="/management/academics/timetable" className="rounded-lg border bg-card px-3 py-2 font-medium hover:bg-muted/40">
          Timetable Builder →
        </Link>
      </div>

      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">Academic years</p>
            <p className="text-xs text-muted-foreground">Create and set current year</p>
          </div>
          <button onClick={() => refetch()} className="rounded-lg border px-3 py-2 text-sm hover:bg-muted">
            Refresh
          </button>
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Name (e.g. 2026-27)"
            className="h-10 rounded-lg border bg-muted/30 px-3 text-sm"
          />
          <input
            type="date"
            value={form.startDate}
            onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
            className="h-10 rounded-lg border bg-background px-3 text-sm"
          />
          <input
            type="date"
            value={form.endDate}
            onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
            className="h-10 rounded-lg border bg-background px-3 text-sm"
          />
        </div>
        <div className="mt-3 flex justify-end">
          <button
            disabled={createYear.isPending || !form.name || !form.startDate || !form.endDate}
            onClick={async () => {
              await createYear.mutateAsync(form);
              setForm({ name: '', startDate: '', endDate: '' });
              refetch();
            }}
            className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {createYear.isPending ? 'Creating…' : 'Create year'}
          </button>
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Start</th>
                <th className="px-4 py-3 text-left">End</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((y: any) => (
                <tr key={y.id} className="border-t">
                  <td className="px-4 py-3 font-medium">
                    {y.name} {y.isCurrent ? <span className="ml-2 rounded bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">current</span> : null}
                  </td>
                  <td className="px-4 py-3">{String(y.startDate).slice(0, 10)}</td>
                  <td className="px-4 py-3">{String(y.endDate).slice(0, 10)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      disabled={setCurrent.isPending || y.isCurrent}
                      onClick={async () => { await setCurrent.mutateAsync(y.id); refetch(); }}
                      className="rounded-lg border px-3 py-1.5 text-sm hover:bg-muted disabled:opacity-60"
                    >
                      Set current
                    </button>
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td className="px-4 py-6 text-sm text-muted-foreground" colSpan={4}>
                    No academic years.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

