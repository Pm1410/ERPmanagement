'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useMaterials, useMyStudentProfile } from '@/hooks/use-api';
import { cn, formatDate } from '@/lib/utils';

export default function StudentMaterialsPage() {
  const { data: me, isLoading: loadingMe, error: meErr } = useMyStudentProfile();
  const [onlyMySection, setOnlyMySection] = useState(true);

  const params = useMemo(() => {
    if (!me?.classId) return undefined;
    return {
      classId: me.classId,
      ...(onlyMySection && me.sectionId ? { sectionId: me.sectionId } : {}),
    };
  }, [me?.classId, me?.sectionId, onlyMySection]);

  const { data, isLoading, error, refetch } = useMaterials(params);
  const items = (data ?? []) as any[];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Materials</h1>
          <p className="text-sm text-muted-foreground">Notes, worksheets and uploads from your teachers</p>
        </div>
        <button onClick={() => refetch()} className="rounded-lg border px-3 py-2 text-sm hover:bg-muted">
          Refresh
        </button>
      </div>

      {loadingMe && <div className="text-sm text-muted-foreground">Loading…</div>}
      {meErr && <div className="text-sm text-destructive">Failed to load student profile.</div>}

      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">Filters</p>
            <p className="text-xs text-muted-foreground">
              Class: {me?.class?.name ?? '—'} · Section: {me?.section?.name ?? '—'}
            </p>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={onlyMySection}
              onChange={(e) => setOnlyMySection(e.target.checked)}
            />
            Only my section
          </label>
        </div>
      </div>

      {isLoading && <div className="text-sm text-muted-foreground">Loading materials…</div>}
      {error && <div className="text-sm text-destructive">Failed to load materials.</div>}

      <div className="space-y-2">
        {items.length ? items.map((m: any) => (
          <div key={m.id} className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold">{m.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {m.subject?.name ?? 'General'} · {m.section?.name ?? 'All sections'}
                </p>
                {m.description ? <p className="mt-2 text-sm text-muted-foreground">{m.description}</p> : null}
                <a
                  href={m.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={cn('mt-2 inline-block text-sm font-medium text-primary hover:underline')}
                >
                  Download {m.fileName} →
                </a>
                <p className="mt-1 text-xs text-muted-foreground">
                  Uploaded {m.createdAt ? formatDate(m.createdAt, 'short') : '—'}
                  {m.uploadedBy?.name ? <> · By {m.uploadedBy.name}</> : null}
                </p>
              </div>
            </div>
          </div>
        )) : (
          !isLoading && <div className="text-sm text-muted-foreground">No materials available yet.</div>
        )}
      </div>

      <Link href="/student/dashboard" className="text-sm font-medium text-primary hover:underline">
        Back to dashboard
      </Link>
    </div>
  );
}

