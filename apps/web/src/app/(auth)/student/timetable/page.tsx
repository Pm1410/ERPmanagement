'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useAcademicYears, useClasses, useSections, useTimetable, useMyStudentProfile } from '@/hooks/use-api';

export default function StudentTimetablePage() {
  const { user } = useAuthStore();
  const { data: me } = useMyStudentProfile();
  const { data: years } = useAcademicYears();
  const currentYearId = years?.find((y: any) => y.isCurrent)?.id ?? years?.[0]?.id;

  const { data: classes } = useClasses(currentYearId);
  const defaultClassId = me?.classId ?? classes?.[0]?.id;

  const [classId, setClassId] = useState<string | undefined>(defaultClassId);
  const { data: sections } = useSections(classId ?? '');
  const defaultSectionId = me?.sectionId ?? sections?.[0]?.id;
  const [sectionId, setSectionId] = useState<string | undefined>(defaultSectionId);

  useEffect(() => {
    if (!me) return;
    if (me.classId && classId !== me.classId) setClassId(me.classId);
    if (me.sectionId && sectionId !== me.sectionId) setSectionId(me.sectionId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me?.id]);

  const { data: slots, isLoading, error, refetch } = useTimetable(classId ?? '', sectionId ?? '', currentYearId);

  const days = useMemo(() => {
    const map = new Map<string, any[]>();
    (slots ?? []).forEach((s: any) => {
      const day = s.day ?? 'DAY';
      map.set(day, [...(map.get(day) ?? []), s]);
    });
    return Array.from(map.entries());
  }, [slots]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Timetable</h1>
          <p className="text-sm text-muted-foreground">{user?.name}</p>
        </div>
        <button onClick={() => refetch()} className="rounded-lg border px-3 py-2 text-sm hover:bg-muted">
          Refresh
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">Academic year</p>
          <p className="mt-1 text-sm font-semibold">{years?.find((y: any) => y.id === currentYearId)?.name ?? '—'}</p>
        </div>
        <label className="rounded-xl border bg-card p-4">
          <span className="text-xs text-muted-foreground">Class</span>
          <select
            value={classId}
            onChange={(e) => { setClassId(e.target.value); setSectionId(undefined); }}
            className="mt-1 w-full rounded-md border bg-background px-2 py-2 text-sm"
          >
            {(classes ?? []).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <label className="rounded-xl border bg-card p-4">
          <span className="text-xs text-muted-foreground">Section</span>
          <select
            value={sectionId}
            onChange={(e) => setSectionId(e.target.value)}
            className="mt-1 w-full rounded-md border bg-background px-2 py-2 text-sm"
          >
            {(sections ?? []).map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </label>
      </div>

      {isLoading && <div className="text-sm text-muted-foreground">Loading…</div>}
      {error && <div className="text-sm text-destructive">Failed to load timetable.</div>}

      <div className="grid gap-3 lg:grid-cols-2">
        {days.length ? days.map(([day, ds]) => (
          <div key={day} className="rounded-xl border bg-card p-4">
            <p className="text-sm font-semibold">{day}</p>
            <div className="mt-2 space-y-2">
              {ds.map((s: any) => (
                <div key={s.id} className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2 text-sm">
                  <span className="font-medium">{s.subject?.name ?? 'Subject'}</span>
                  <span className="text-xs text-muted-foreground">{s.startTime ?? ''}–{s.endTime ?? ''}</span>
                </div>
              ))}
            </div>
          </div>
        )) : (
          !isLoading && <div className="text-sm text-muted-foreground">No timetable published yet.</div>
        )}
      </div>

      <Link href="/student/dashboard" className="text-sm font-medium text-primary hover:underline">
        Back to dashboard
      </Link>
    </div>
  );
}

