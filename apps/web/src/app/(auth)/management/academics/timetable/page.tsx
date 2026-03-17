'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useAcademicYears, useClasses, useFaculty, useSaveTimetable, useSections, useSubjects, useTimetable } from '@/hooks/use-api';

export default function ManagementTimetableBuilderPage() {
  const { data: years } = useAcademicYears();
  const academicYearId = years?.find((y: any) => y.isCurrent)?.id ?? years?.[0]?.id ?? '';
  const { data: classes } = useClasses(academicYearId);
  const [classId, setClassId] = useState<string>('');
  const { data: sections } = useSections(classId || '');
  const [sectionId, setSectionId] = useState<string>('');
  const { data: subjects } = useSubjects(classId || '');
  const { data: facultyRes } = useFaculty();
  const staff = (facultyRes as any)?.data ?? (facultyRes as any)?.items ?? (Array.isArray(facultyRes) ? facultyRes : []);

  const { data: existing, refetch } = useTimetable(classId || '', sectionId || '', academicYearId);
  const save = useSaveTimetable();

  const [slot, setSlot] = useState({ day: 'MON', startTime: '09:00', endTime: '09:45', subjectId: '', facultyId: '', room: '' });
  const [slots, setSlots] = useState<any[]>([]);

  const mergedSlots = useMemo(() => (slots.length ? slots : (existing ?? [])), [slots, existing]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Timetable Builder</h1>
          <p className="text-sm text-muted-foreground">Create timetable for a class & section</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => refetch()} className="rounded-lg border px-3 py-2 text-sm hover:bg-muted">
            Refresh
          </button>
          <Link href="/management/academics/classes" className="rounded-lg border px-3 py-2 text-sm hover:bg-muted">
            Classes
          </Link>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <label className="rounded-xl border bg-card p-4">
          <span className="text-xs text-muted-foreground">Class</span>
          <select
            value={classId}
            onChange={(e) => { setClassId(e.target.value); setSectionId(''); setSlots([]); }}
            className="mt-1 w-full rounded-md border bg-background px-2 py-2 text-sm"
          >
            <option value="">—</option>
            {(classes ?? []).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <label className="rounded-xl border bg-card p-4">
          <span className="text-xs text-muted-foreground">Section</span>
          <select
            value={sectionId}
            onChange={(e) => { setSectionId(e.target.value); setSlots([]); }}
            className="mt-1 w-full rounded-md border bg-background px-2 py-2 text-sm"
          >
            <option value="">—</option>
            {(sections ?? []).map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </label>
        <div className="rounded-xl border bg-card p-4">
          <span className="text-xs text-muted-foreground">Academic year</span>
          <div className="mt-1 text-sm font-semibold">
            {years?.find((y: any) => y.id === academicYearId)?.name ?? '—'}
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <p className="text-sm font-semibold">Add slot</p>
        <div className="mt-3 grid gap-2 md:grid-cols-6">
          <select value={slot.day} onChange={(e) => setSlot((s) => ({ ...s, day: e.target.value }))} className="h-10 rounded-lg border bg-background px-2 text-sm">
            {['MON','TUE','WED','THU','FRI','SAT'].map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <input value={slot.startTime} onChange={(e) => setSlot((s) => ({ ...s, startTime: e.target.value }))} className="h-10 rounded-lg border bg-background px-2 text-sm" />
          <input value={slot.endTime} onChange={(e) => setSlot((s) => ({ ...s, endTime: e.target.value }))} className="h-10 rounded-lg border bg-background px-2 text-sm" />
          <select value={slot.subjectId} onChange={(e) => setSlot((s) => ({ ...s, subjectId: e.target.value }))} className="h-10 rounded-lg border bg-background px-2 text-sm">
            <option value="">Subject</option>
            {(subjects ?? []).map((sub: any) => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
          </select>
          <select value={slot.facultyId} onChange={(e) => setSlot((s) => ({ ...s, facultyId: e.target.value }))} className="h-10 rounded-lg border bg-background px-2 text-sm">
            <option value="">Faculty</option>
            {staff.map((f: any) => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
          <button
            disabled={!classId || !sectionId || !slot.subjectId || !slot.facultyId}
            onClick={() => setSlots((prev) => [...prev, { ...slot, room: slot.room || undefined }])}
            className="h-10 rounded-lg bg-primary px-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            Add
          </button>
        </div>

        <div className="mt-4 space-y-2">
          {(mergedSlots ?? []).length ? (mergedSlots as any[]).map((s: any, idx: number) => (
            <div key={s.id ?? idx} className="flex items-center justify-between rounded-lg border bg-muted/10 px-3 py-2 text-sm">
              <span className="font-medium">{s.day} {s.startTime}-{s.endTime}</span>
              <span className="text-xs text-muted-foreground">
                {s.subject?.name ?? (subjects ?? []).find((x: any) => x.id === s.subjectId)?.name ?? 'Subject'} ·{' '}
                {s.faculty?.name ?? staff.find((x: any) => x.id === s.facultyId)?.name ?? 'Faculty'}
              </span>
            </div>
          )) : (
            <p className="text-sm text-muted-foreground">No slots yet.</p>
          )}
        </div>

        <div className="mt-3 flex justify-end gap-2">
          <button onClick={() => setSlots([])} className="rounded-lg border px-3 py-2 text-sm hover:bg-muted">
            Reset
          </button>
          <button
            disabled={!classId || !sectionId || save.isPending || !(mergedSlots ?? []).length}
            onClick={async () => {
              const payloadSlots = (mergedSlots as any[]).map((x) => ({
                day: x.day,
                startTime: x.startTime,
                endTime: x.endTime,
                subjectId: x.subjectId ?? x.subject?.id,
                facultyId: x.facultyId ?? x.faculty?.id,
                room: x.room,
              }));
              await save.mutateAsync({ classId, sectionId, academicYearId, slots: payloadSlots } as any);
              setSlots([]);
              refetch();
            }}
            className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {save.isPending ? 'Saving…' : 'Save timetable'}
          </button>
        </div>
      </div>
    </div>
  );
}

