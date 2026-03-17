'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAcademicYears, useClasses, useCreateSubject, useSubjects } from '@/hooks/use-api';

export default function ManagementSubjectsPage() {
  const { data: years } = useAcademicYears();
  const current = years?.find((y: any) => y.isCurrent)?.id ?? years?.[0]?.id;
  const { data: classes } = useClasses(current);
  const [classId, setClassId] = useState<string>(classes?.[0]?.id ?? '');
  const { data: subjects, isLoading, error, refetch } = useSubjects(classId);
  const create = useCreateSubject();
  const [form, setForm] = useState({ name: '', code: '', type: 'THEORY', maxMarks: 100, passMarks: 33, weeklyPeriods: 6 });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Subjects</h1>
          <p className="text-sm text-muted-foreground">Curriculum by class</p>
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

      {isLoading && <div className="text-sm text-muted-foreground">Loading…</div>}
      {error && <div className="text-sm text-destructive">Failed to load subjects.</div>}

      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <p className="text-sm font-semibold">Create subject</p>
        <div className="mt-3 grid gap-2 md:grid-cols-6">
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Name"
            className="h-10 rounded-lg border bg-muted/30 px-3 text-sm md:col-span-2"
          />
          <input
            value={form.code}
            onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
            placeholder="Code"
            className="h-10 rounded-lg border bg-muted/30 px-3 text-sm"
          />
          <input
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
            placeholder="Type"
            className="h-10 rounded-lg border bg-muted/30 px-3 text-sm"
          />
          <input
            type="number"
            value={form.weeklyPeriods}
            onChange={(e) => setForm((f) => ({ ...f, weeklyPeriods: Number(e.target.value) }))}
            className="h-10 rounded-lg border bg-muted/30 px-3 text-sm"
          />
          <button
            disabled={!classId || !form.name || create.isPending}
            onClick={async () => {
              await create.mutateAsync({ ...form, classId } as any);
              setForm({ name: '', code: '', type: 'THEORY', maxMarks: 100, passMarks: 33, weeklyPeriods: 6 });
              refetch();
            }}
            className="h-10 rounded-lg bg-primary px-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {create.isPending ? 'Creating…' : 'Create'}
          </button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Max/pass marks are optional in API; add them later if needed.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Code</th>
              <th className="px-4 py-3 text-right">Max</th>
              <th className="px-4 py-3 text-right">Pass</th>
            </tr>
          </thead>
          <tbody>
            {(subjects ?? []).map((s: any) => (
              <tr key={s.id} className="border-t">
                <td className="px-4 py-3 font-medium">{s.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.code}</td>
                <td className="px-4 py-3 text-right">{s.maxMarks ?? '—'}</td>
                <td className="px-4 py-3 text-right">{s.passMarks ?? '—'}</td>
              </tr>
            ))}
            {!isLoading && !(subjects ?? []).length && (
              <tr>
                <td className="px-4 py-6 text-sm text-muted-foreground" colSpan={4}>
                  No subjects found.
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

