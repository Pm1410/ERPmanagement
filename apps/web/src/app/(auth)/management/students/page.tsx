'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useStudents } from '@/hooks/use-api';

export default function ManagementStudentsPage() {
  const [q, setQ] = useState('');
  const { data, isLoading, error, refetch } = useStudents(q ? { q } : undefined);
  const rows = useMemo(() => {
    const r = (data as any)?.data ?? (data as any)?.items ?? (Array.isArray(data) ? data : []);
    return Array.isArray(r) ? r : [];
  }, [data]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Students</h1>
          <p className="text-sm text-muted-foreground">All enrolled students</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/management/students/new"
            className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            Add student
          </Link>
          <button onClick={() => refetch()} className="rounded-lg border px-3 py-2 text-sm hover:bg-muted">
            Refresh
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name / admission / email…"
          className="h-10 w-full max-w-md rounded-lg border bg-muted/30 px-3 text-sm"
        />
        <button
          onClick={() => refetch()}
          className="h-10 rounded-lg border px-3 text-sm hover:bg-muted"
        >
          Search
        </button>
      </div>

      {isLoading && <div className="text-sm text-muted-foreground">Loading…</div>}
      {error && <div className="text-sm text-destructive">Failed to load students.</div>}

      <div className="overflow-hidden rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Class</th>
              <th className="px-4 py-3 text-left">Section</th>
              <th className="px-4 py-3 text-left">Roll</th>
            </tr>
          </thead>
          <tbody>
            {rows?.length ? rows.map((s: any) => (
              <tr key={s.id} className="border-t">
                <td className="px-4 py-3 font-medium">
                  <Link href={`/management/students/${s.id}`} className="hover:underline">
                    {s.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{s.email}</td>
                <td className="px-4 py-3">{s.class?.name ?? '—'}</td>
                <td className="px-4 py-3">{s.section?.name ?? '—'}</td>
                <td className="px-4 py-3">{s.rollNumber ?? '—'}</td>
              </tr>
            )) : (
              !isLoading && (
                <tr>
                  <td className="px-4 py-6 text-sm text-muted-foreground" colSpan={5}>
                    No students found. (Make sure DB is seeded.)
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

