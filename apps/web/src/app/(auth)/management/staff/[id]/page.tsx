'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  useAcademicYears,
  useAssignFacultySubjects,
  useClasses,
  useDeactivateFaculty,
  useFacultyOne,
  useFacultyTimetable,
  useSections,
  useSubjects,
  useUpdateFaculty,
} from '@/hooks/use-api';
import { formatDate } from '@/lib/utils';

export default function StaffDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const { data, isLoading, error, refetch } = useFacultyOne(id);
  const update = useUpdateFaculty(id);
  const deactivate = useDeactivateFaculty(id);

  const { data: years } = useAcademicYears();
  const academicYearId = years?.find((y: any) => y.isCurrent)?.id ?? years?.[0]?.id ?? '';
  const { data: classes } = useClasses(academicYearId);
  const [classId, setClassId] = useState<string>('');
  const { data: sections } = useSections(classId || '');
  const [sectionId, setSectionId] = useState<string>('');
  const { data: subjects } = useSubjects(classId || '');
  const [subjectIds, setSubjectIds] = useState<string[]>([]);
  const assign = useAssignFacultySubjects(id);

  const { data: timetable } = useFacultyTimetable(id);

  const [edit, setEdit] = useState(false);
  const form = useMemo(() => ({
    name: (data as any)?.name ?? '',
    email: (data as any)?.email ?? '',
    phone: (data as any)?.phone ?? '',
    department: (data as any)?.department ?? '',
    designation: (data as any)?.designation ?? '',
    employmentType: (data as any)?.employmentType ?? 'FULL_TIME',
    joiningDate: (data as any)?.joiningDate?.slice?.(0, 10) ?? '',
    qualification: (data as any)?.qualification ?? '',
    specialization: (data as any)?.specialization ?? '',
  }), [data]);

  const [draft, setDraft] = useState(form);
  if (!edit && JSON.stringify(draft) !== JSON.stringify(form) && data) setDraft(form);

  const assignments = (data as any)?.assignments ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Staff</h1>
          <p className="text-sm text-muted-foreground">{id}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/management/staff" className="rounded-lg border px-3 py-2 text-sm hover:bg-muted">
            Back
          </Link>
          <button onClick={() => refetch()} className="rounded-lg border px-3 py-2 text-sm hover:bg-muted">
            Refresh
          </button>
        </div>
      </div>

      {isLoading && <div className="text-sm text-muted-foreground">Loading…</div>}
      {error && <div className="text-sm text-destructive">Failed to load staff.</div>}

      {data && (
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">{(data as any).name}</p>
              <p className="text-xs text-muted-foreground">
                {(data as any).email} · Active: {(data as any).isActive ? 'Yes' : 'No'} · Last login:{' '}
                {(data as any).user?.lastLoginAt ? formatDate((data as any).user.lastLoginAt, 'short') : '—'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {!edit ? (
                <button onClick={() => setEdit(true)} className="rounded-lg border px-3 py-2 text-sm hover:bg-muted">
                  Edit
                </button>
              ) : (
                <>
                  <button
                    onClick={() => { setEdit(false); setDraft(form); }}
                    className="rounded-lg border px-3 py-2 text-sm hover:bg-muted"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={update.isPending}
                    onClick={async () => { await update.mutateAsync(draft as any); setEdit(false); }}
                    className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    {update.isPending ? 'Saving…' : 'Save'}
                  </button>
                </>
              )}
              <button
                disabled={deactivate.isPending}
                onClick={async () => { await deactivate.mutateAsync(undefined); }}
                className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive hover:bg-destructive/15 disabled:opacity-60"
              >
                {deactivate.isPending ? 'Deactivating…' : 'Deactivate'}
              </button>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {([
              ['Name', 'name'],
              ['Email', 'email'],
              ['Phone', 'phone'],
              ['Department', 'department'],
              ['Designation', 'designation'],
              ['Employment Type', 'employmentType'],
              ['Joining Date', 'joiningDate'],
              ['Qualification', 'qualification'],
              ['Specialization', 'specialization'],
            ] as const).map(([label, key]) => (
              <label key={key} className="space-y-1 text-sm">
                <span className="text-xs text-muted-foreground">{label}</span>
                <input
                  disabled={!edit || key === 'email'}
                  value={(draft as any)[key] ?? ''}
                  onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))}
                  className="h-10 w-full rounded-lg border bg-muted/30 px-3 disabled:opacity-70"
                />
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Subject assignments */}
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div>
          <p className="text-sm font-semibold">Assign subjects</p>
          <p className="text-xs text-muted-foreground">Assign subjects for a class/section/year</p>
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <label className="space-y-1 text-sm">
            <span className="text-xs text-muted-foreground">Class</span>
            <select
              value={classId}
              onChange={(e) => { setClassId(e.target.value); setSectionId(''); setSubjectIds([]); }}
              className="h-10 w-full rounded-lg border bg-background px-3"
            >
              <option value="">—</option>
              {(classes ?? []).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-xs text-muted-foreground">Section</span>
            <select
              value={sectionId}
              onChange={(e) => setSectionId(e.target.value)}
              className="h-10 w-full rounded-lg border bg-background px-3"
            >
              <option value="">—</option>
              {(sections ?? []).map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </label>
          <div className="space-y-1 text-sm">
            <span className="text-xs text-muted-foreground">Academic year</span>
            <div className="h-10 rounded-lg border bg-muted/30 px-3 text-sm flex items-center">
              {years?.find((y: any) => y.id === academicYearId)?.name ?? '—'}
            </div>
          </div>
        </div>

        <div className="mt-3 rounded-xl border bg-muted/20 p-3">
          <p className="text-xs font-medium text-muted-foreground">Subjects</p>
          <div className="mt-2 grid gap-2 md:grid-cols-3">
            {(subjects ?? []).map((sub: any) => {
              const checked = subjectIds.includes(sub.id);
              return (
                <label key={sub.id} className="flex items-center gap-2 rounded-lg bg-card px-3 py-2 text-sm">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                      setSubjectIds((prev) =>
                        e.target.checked ? [...prev, sub.id] : prev.filter((x) => x !== sub.id),
                      );
                    }}
                  />
                  <span className="font-medium">{sub.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{sub.code ?? ''}</span>
                </label>
              );
            })}
            {!classId && <p className="text-sm text-muted-foreground">Select a class to load subjects.</p>}
          </div>
        </div>

        <div className="mt-3 flex justify-end">
          <button
            disabled={!classId || !sectionId || !academicYearId || subjectIds.length === 0 || assign.isPending}
            onClick={async () => {
              await assign.mutateAsync({ classId, sectionId, academicYearId, subjectIds });
              refetch();
            }}
            className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {assign.isPending ? 'Assigning…' : 'Assign subjects'}
          </button>
        </div>

        <div className="mt-4">
          <p className="text-sm font-semibold">Current assignments</p>
          <div className="mt-2 space-y-2">
            {assignments.length ? assignments.map((a: any) => (
              <div key={a.id} className="rounded-lg border bg-muted/10 px-3 py-2 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium">{a.subject?.name ?? 'Subject'}</span>
                  <span className="text-xs text-muted-foreground">
                    {a.class?.name ?? 'Class'} · {a.section?.name ?? 'Section'}
                  </span>
                </div>
              </div>
            )) : (
              <p className="text-sm text-muted-foreground">No subject assignments yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Timetable */}
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div>
          <p className="text-sm font-semibold">Timetable</p>
          <p className="text-xs text-muted-foreground">Generated from timetable slots</p>
        </div>
        <div className="mt-3 space-y-2">
          {(timetable ?? []).length ? (timetable as any[]).slice(0, 20).map((t: any) => (
            <div key={t.id} className="flex items-center justify-between rounded-lg border bg-muted/10 px-3 py-2 text-sm">
              <span className="font-medium">{t.subject?.name ?? 'Subject'}</span>
              <span className="text-xs text-muted-foreground">
                {t.day} · {t.startTime}-{t.endTime} · {t.class?.name ?? ''} {t.section?.name ?? ''}
              </span>
            </div>
          )) : (
            <p className="text-sm text-muted-foreground">No timetable slots.</p>
          )}
        </div>
      </div>
    </div>
  );
}

