'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useAcademicYears, useMyFacultyProfile, useStudents, useMarkAttendance } from '@/hooks/use-api';
import { cn, formatDate } from '@/lib/utils';

export default function FacultyAttendancePage() {
  const now = new Date();
  const { data: years } = useAcademicYears();
  const academicYearId = (years as any[])?.find((y) => y.isCurrent)?.id ?? (years as any[])?.[0]?.id;

  const { data: me, isLoading: loadingMe, error: meErr } = useMyFacultyProfile();
  const assignments = ((me as any)?.assignments ?? []) as any[];

  const options = useMemo(() => {
    // Unique class-section-subject combos
    const map = new Map<string, any>();
    for (const a of assignments) {
      const key = `${a.classId}:${a.sectionId}:${a.subjectId}`;
      if (!map.has(key)) map.set(key, a);
    }
    return Array.from(map.values());
  }, [assignments]);

  const [key, setKey] = useState<string>(() => {
    const a = options[0];
    return a ? `${a.classId}:${a.sectionId}:${a.subjectId}` : '';
  });
  const selected = useMemo(() => options.find((a) => `${a.classId}:${a.sectionId}:${a.subjectId}` === key), [options, key]);

  const [date, setDate] = useState<string>(() => now.toISOString().slice(0, 10));
  const classId = selected?.classId ?? '';
  const sectionId = selected?.sectionId ?? '';
  const subjectId = selected?.subjectId ?? '';

  const { data: studentsResp, isLoading: loadingStudents, error: studentsErr, refetch } = useStudents(
    classId && sectionId ? { classId, sectionId, limit: 200 } : undefined,
  );
  const students = (studentsResp as any)?.data ?? (studentsResp as any[]) ?? [];

  const mark = useMarkAttendance();
  const [statusByStudent, setStatusByStudent] = useState<Record<string, string>>({});

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Attendance</h1>
          <p className="text-sm text-muted-foreground">Mark attendance for your assigned class</p>
        </div>
        <button onClick={() => refetch()} className="rounded-lg border px-3 py-2 text-sm hover:bg-muted">
          Refresh
        </button>
      </div>

      {loadingMe && <div className="text-sm text-muted-foreground">Loading…</div>}
      {meErr && <div className="text-sm text-destructive">Failed to load faculty profile.</div>}

      <div className="grid gap-3 md:grid-cols-3">
        <label className="rounded-xl border bg-card p-4">
          <span className="text-xs text-muted-foreground">Date</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 w-full rounded-md border bg-background px-2 py-2 text-sm"
          />
        </label>
        <label className="rounded-xl border bg-card p-4 md:col-span-2">
          <span className="text-xs text-muted-foreground">Class / Section / Subject</span>
          <select
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="mt-1 w-full rounded-md border bg-background px-2 py-2 text-sm"
          >
            {options.map((a) => (
              <option key={`${a.classId}:${a.sectionId}:${a.subjectId}`} value={`${a.classId}:${a.sectionId}:${a.subjectId}`}>
                {a.class?.name} · {a.section?.name} · {a.subject?.name}
              </option>
            ))}
          </select>
          {!options.length && !loadingMe && (
            <p className="mt-2 text-xs text-muted-foreground">No subject assignments yet. Ask admin to assign subjects.</p>
          )}
        </label>
      </div>

      {studentsErr && <div className="text-sm text-destructive">Failed to load students.</div>}
      {loadingStudents && <div className="text-sm text-muted-foreground">Loading students…</div>}

      <div className="overflow-hidden rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Student</th>
              <th className="px-4 py-3 text-right">Roll</th>
              <th className="px-4 py-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s: any) => {
              const st = statusByStudent[s.id] ?? 'PRESENT';
              return (
                <tr key={s.id} className="border-t">
                  <td className="px-4 py-3">
                    <div className="font-medium">{s.name}</div>
                    <div className="text-xs text-muted-foreground">{s.admissionNumber ?? ''}</div>
                  </td>
                  <td className="px-4 py-3 text-right">{s.rollNumber ?? '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <select
                      value={st}
                      onChange={(e) => setStatusByStudent((m) => ({ ...m, [s.id]: e.target.value }))}
                      className="rounded-md border bg-background px-2 py-1 text-xs"
                    >
                      {['PRESENT', 'ABSENT', 'LATE', 'LEAVE'].map((x) => (
                        <option key={x} value={x}>{x}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              );
            })}
            {!students.length && !loadingStudents && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-sm text-muted-foreground">
                  No students found for this class/section.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Academic year: {academicYearId ?? '—'} · {formatDate(new Date(date), 'short')}</p>
        <button
          disabled={!academicYearId || !classId || !sectionId || !subjectId || !students.length || mark.isPending}
          onClick={async () => {
            await mark.mutateAsync({
              academicYearId,
              classId,
              sectionId,
              subjectId,
              date,
              records: students.map((s: any) => ({
                studentId: s.id,
                status: statusByStudent[s.id] ?? 'PRESENT',
              })),
            } as any);
          }}
          className={cn('rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60')}
        >
          {mark.isPending ? 'Saving…' : 'Save attendance'}
        </button>
      </div>

      <Link href="/faculty/dashboard" className="text-sm font-medium text-primary hover:underline">
        Back to dashboard
      </Link>
    </div>
  );
}

