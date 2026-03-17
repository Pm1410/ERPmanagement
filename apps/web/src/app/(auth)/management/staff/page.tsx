'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useCreateFaculty, useFaculty } from '@/hooks/use-api';

export default function ManagementStaffPage() {
  const { data, isLoading, error, refetch } = useFaculty();
  const rows = useMemo(() => (Array.isArray(data) ? data : (data?.items ?? data?.data ?? [])), [data]);
  const create = useCreateFaculty();
  const [form, setForm] = useState({ name: '', email: '', department: '', designation: 'PGT' });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Faculty & Staff</h1>
          <p className="text-sm text-muted-foreground">Directory</p>
        </div>
        <button onClick={() => refetch()} className="rounded-lg border px-3 py-2 text-sm hover:bg-muted">
          Refresh
        </button>
      </div>

      <div className="rounded-xl border bg-card p-4">
        <p className="text-sm font-semibold">Add staff (basic)</p>
        <div className="mt-3 grid gap-3 md:grid-cols-4">
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Name"
            className="h-10 rounded-lg border bg-muted/30 px-3 text-sm"
          />
          <input
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="Email"
            className="h-10 rounded-lg border bg-muted/30 px-3 text-sm"
          />
          <input
            value={form.department}
            onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
            placeholder="Department"
            className="h-10 rounded-lg border bg-muted/30 px-3 text-sm"
          />
          <button
            onClick={async () => {
              await create.mutateAsync(form as any);
              setForm({ name: '', email: '', department: '', designation: 'PGT' });
              refetch();
            }}
            disabled={create.isPending}
            className="h-10 rounded-lg bg-primary px-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {create.isPending ? 'Saving…' : 'Create'}
          </button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Note: full staff profile fields can be added next (phone, joining date, etc.).
        </p>
      </div>

      {isLoading && <div className="text-sm text-muted-foreground">Loading…</div>}
      {error && <div className="text-sm text-destructive">Failed to load staff.</div>}

      <div className="overflow-hidden rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Department</th>
              <th className="px-4 py-3 text-left">Designation</th>
            </tr>
          </thead>
          <tbody>
            {rows?.length ? rows.map((s: any) => (
              <tr key={s.id} className="border-t">
                <td className="px-4 py-3 font-medium">
                  <Link href={`/management/staff/${s.id}`} className="hover:underline">
                    {s.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{s.email}</td>
                <td className="px-4 py-3">{s.department ?? '—'}</td>
                <td className="px-4 py-3">{s.designation ?? '—'}</td>
              </tr>
            )) : (
              !isLoading && (
                <tr>
                  <td className="px-4 py-6 text-sm text-muted-foreground" colSpan={4}>
                    No staff found.
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

