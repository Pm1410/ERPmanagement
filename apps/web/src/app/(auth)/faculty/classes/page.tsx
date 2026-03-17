'use client';

import Link from 'next/link';
import { useMyFacultyProfile } from '@/hooks/use-api';

export default function FacultyClassesPage() {
  const { data: me, isLoading, error, refetch } = useMyFacultyProfile();
  const assignments = (me as any)?.assignments ?? [];

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">My Classes</h1>
      <p className="text-sm text-muted-foreground">Your assigned classes, sections and subjects</p>

      <div className="flex justify-end">
        <button onClick={() => refetch()} className="rounded-lg border px-3 py-2 text-sm hover:bg-muted">
          Refresh
        </button>
      </div>

      {isLoading && <div className="text-sm text-muted-foreground">Loading…</div>}
      {error && <div className="text-sm text-destructive">Failed to load faculty profile.</div>}

      <div className="space-y-2">
        {assignments.length ? assignments.map((a: any) => (
          <div key={a.id} className="rounded-xl border bg-card p-4 shadow-sm">
            <p className="font-semibold">{a.class?.name} · {a.section?.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">Subject: {a.subject?.name}</p>
          </div>
        )) : (
          !isLoading && <div className="text-sm text-muted-foreground">No class assignments yet.</div>
        )}
      </div>

      <Link href="/faculty/dashboard" className="text-sm font-medium text-primary hover:underline">
        Back to dashboard
      </Link>
    </div>
  );
}

