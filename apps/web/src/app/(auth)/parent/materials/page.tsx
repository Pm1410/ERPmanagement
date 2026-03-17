'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useMaterials, useStudent } from '@/hooks/use-api';
import { useSelectedChildStudentId } from '@/lib/parent-child';
import { cn, formatDate } from '@/lib/utils';

export default function ParentMaterialsPage() {
  const { studentId, children, setStudentId } = useSelectedChildStudentId();
  const { data: student } = useStudent(studentId);
  const [onlyMySection, setOnlyMySection] = useState(true);

  const params = useMemo(() => {
    if (!student?.classId) return undefined;
    return {
      classId: student.classId,
      ...(onlyMySection && student.sectionId ? { sectionId: student.sectionId } : {}),
    };
  }, [student?.classId, student?.sectionId, onlyMySection]);

  const { data, isLoading, error, refetch } = useMaterials(params);
  const items = (data ?? []) as any[];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Materials</h1>
          <p className="text-sm text-muted-foreground">Notes and worksheets for your child</p>
        </div>
        <button onClick={() => refetch()} className="rounded-lg border px-3 py-2 text-sm hover:bg-muted">
          Refresh
        </button>
      </div>

      {children.length > 1 && (
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-sm font-semibold">Child</p>
          <select
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="mt-2 w-full rounded-md border bg-background px-2 py-2 text-sm"
          >
            {children.map((c: any) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">Filters</p>
            <p className="text-xs text-muted-foreground">
              Class: {student?.class?.name ?? '—'} · Section: {student?.section?.name ?? '—'}
            </p>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={onlyMySection} onChange={(e) => setOnlyMySection(e.target.checked)} />
            Only my section
          </label>
        </div>
      </div>

      {isLoading && <div className="text-sm text-muted-foreground">Loading materials…</div>}
      {error && <div className="text-sm text-destructive">Failed to load materials.</div>}

      <div className="space-y-2">
        {items.length ? items.map((m: any) => (
          <div key={m.id} className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="min-w-0">
              <p className="truncate font-semibold">{m.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {m.subject?.name ?? 'General'} · {m.section?.name ?? 'All sections'}
              </p>
              {m.description ? <p className="mt-2 text-sm text-muted-foreground">{m.description}</p> : null}
              <a href={m.fileUrl} target="_blank" rel="noreferrer" className={cn('mt-2 inline-block text-sm font-medium text-primary hover:underline')}>
                Download {m.fileName} →
              </a>
              <p className="mt-1 text-xs text-muted-foreground">
                Uploaded {m.createdAt ? formatDate(m.createdAt, 'short') : '—'}
                {m.uploadedBy?.name ? <> · By {m.uploadedBy.name}</> : null}
              </p>
            </div>
          </div>
        )) : (
          !isLoading && <div className="text-sm text-muted-foreground">No materials available yet.</div>
        )}
      </div>

      <Link href="/parent/dashboard" className="text-sm font-medium text-primary hover:underline">
        Back to dashboard
      </Link>
    </div>
  );
}

