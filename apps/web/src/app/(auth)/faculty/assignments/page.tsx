'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { useAssignments, useCreateAssignment, useMyFacultyProfile } from '@/hooks/use-api';
import { cn, formatDate } from '@/lib/utils';
import { useMemo, useState } from 'react';

export default function FacultyAssignmentsPage() {
  const { user } = useAuthStore();
  const { data: me } = useMyFacultyProfile();
  const facultyId = me?.id ?? user?.id ?? '';
  const { data, isLoading, error, refetch } = useAssignments({ facultyId });
  const create = useCreateAssignment();

  const assignmentOptions = useMemo(() => (me as any)?.assignments ?? [], [me]);
  const [selectedAssignmentKey, setSelectedAssignmentKey] = useState<string>(assignmentOptions?.[0]?.id ?? '');
  const selected = assignmentOptions.find((a: any) => a.id === selectedAssignmentKey);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState(() => new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10));
  const [instructions, setInstructions] = useState('');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Assignments</h1>
          <p className="text-sm text-muted-foreground">Created assignments</p>
        </div>
        <button onClick={() => refetch()} className="rounded-lg border px-3 py-2 text-sm hover:bg-muted">
          Refresh
        </button>
      </div>

      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <p className="text-sm font-semibold">Create assignment</p>
        <p className="text-xs text-muted-foreground">Choose a class/section/subject you’re assigned to.</p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <label className="space-y-1">
            <span className="text-xs text-muted-foreground">Class / Section / Subject</span>
            <select
              value={selectedAssignmentKey}
              onChange={(e) => setSelectedAssignmentKey(e.target.value)}
              className="w-full rounded-md border bg-background px-2 py-2 text-sm"
            >
              {assignmentOptions.map((a: any) => (
                <option key={a.id} value={a.id}>
                  {a.class?.name} · {a.section?.name} · {a.subject?.name}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-xs text-muted-foreground">Due date</span>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-md border bg-background px-2 py-2 text-sm"
            />
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className="text-xs text-muted-foreground">Title</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-md border bg-background px-2 py-2 text-sm"
              placeholder="e.g., Algebra worksheet 3"
            />
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className="text-xs text-muted-foreground">Instructions (optional)</span>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="min-h-24 w-full rounded-md border bg-background px-2 py-2 text-sm"
              placeholder="Write any instructions for students…"
            />
          </label>
        </div>
        <div className="mt-3 flex justify-end gap-2">
          <button
            onClick={() => { setTitle(''); setInstructions(''); }}
            className="rounded-lg border px-3 py-2 text-sm hover:bg-muted"
          >
            Clear
          </button>
          <button
            disabled={!selected?.classId || !selected?.sectionId || !selected?.subjectId || !title || create.isPending}
            onClick={async () => {
              await create.mutateAsync({
                title,
                instructions: instructions || undefined,
                classId: selected.classId,
                sectionId: selected.sectionId,
                subjectId: selected.subjectId,
                dueDate: new Date(dueDate).toISOString(),
              } as any);
              setTitle('');
              setInstructions('');
              refetch();
            }}
            className={cn('rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white disabled:opacity-60')}
          >
            {create.isPending ? 'Creating…' : 'Create'}
          </button>
        </div>
      </div>

      {isLoading && <div className="text-sm text-muted-foreground">Loading…</div>}
      {error && <div className="text-sm text-destructive">Failed to load assignments.</div>}

      <div className="space-y-2">
        {(data ?? []).length ? (data as any[]).map((a: any) => (
          <div key={a.id} className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold">{a.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {a.subject?.name ?? 'Subject'} · Due {a.dueDate ? formatDate(a.dueDate, 'short') : '—'}
                </p>
              </div>
              <span className="shrink-0 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                {a.status ?? 'OPEN'}
              </span>
            </div>
          </div>
        )) : (
          !isLoading && <div className="text-sm text-muted-foreground">No assignments.</div>
        )}
      </div>

      <Link href="/faculty/dashboard" className="text-sm font-medium text-primary hover:underline">
        Back to dashboard
      </Link>
    </div>
  );
}

