'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useAcademicYears, useBulkMarksEntry, useClassResults, useExamSchedules, useExams, useMyFacultyProfile, useStudents } from '@/hooks/use-api';
import { cn } from '@/lib/utils';

export default function FacultyExamsPage() {
  const { data: years } = useAcademicYears();
  const academicYearId = (years as any[])?.find((y) => y.isCurrent)?.id ?? (years as any[])?.[0]?.id;

  const { data: me, isLoading: loadingMe } = useMyFacultyProfile();
  const assignments = ((me as any)?.assignments ?? []) as any[];

  const classOptions = useMemo(() => {
    const map = new Map<string, { classId: string; sectionId: string; className: string; sectionName: string }>();
    for (const a of assignments) {
      const key = `${a.classId}:${a.sectionId}`;
      if (!map.has(key)) {
        map.set(key, { classId: a.classId, sectionId: a.sectionId, className: a.class?.name, sectionName: a.section?.name });
      }
    }
    return Array.from(map.values());
  }, [assignments]);

  const { data: exams } = useExams(academicYearId);
  const [examId, setExamId] = useState<string>('');
  const [classKey, setClassKey] = useState<string>('');

  useEffect(() => {
    if (!examId && (exams as any[])?.[0]?.id) setExamId((exams as any[])[0].id);
  }, [exams, examId]);
  useEffect(() => {
    if (!classKey && classOptions[0]) setClassKey(`${classOptions[0].classId}:${classOptions[0].sectionId}`);
  }, [classOptions, classKey]);

  const selectedClass = classOptions.find((c) => `${c.classId}:${c.sectionId}` === classKey);
  const classId = selectedClass?.classId;
  const sectionId = selectedClass?.sectionId;

  const { data: schedules, isLoading: loadingSchedules } = useExamSchedules(examId, classId);
  const scheduleOptions = (schedules ?? []) as any[];
  const [scheduleId, setScheduleId] = useState<string>('');

  useEffect(() => {
    if (!scheduleId && scheduleOptions?.[0]?.id) setScheduleId(scheduleOptions[0].id);
  }, [scheduleOptions, scheduleId]);

  const selectedSchedule = scheduleOptions.find((s) => s.id === scheduleId);

  const { data: studentsResp } = useStudents(classId && sectionId ? { classId, sectionId, limit: 200 } : undefined);
  const students = (studentsResp as any)?.data ?? (studentsResp as any[]) ?? [];

  const bulk = useBulkMarksEntry();
  const [marks, setMarks] = useState<Record<string, string>>({});

  const { data: classResults } = useClassResults(examId, classId, sectionId);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Exam Marks</h1>
      <p className="text-sm text-muted-foreground">Enter marks for scheduled exams and view class results</p>

      <div className="grid gap-3 md:grid-cols-3">
        <label className="rounded-xl border bg-card p-4">
          <span className="text-xs text-muted-foreground">Exam</span>
          <select
            value={examId}
            onChange={(e) => { setExamId(e.target.value); setScheduleId(''); }}
            className="mt-1 w-full rounded-md border bg-background px-2 py-2 text-sm"
          >
            {(exams ?? []).map((e: any) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </label>
        <label className="rounded-xl border bg-card p-4">
          <span className="text-xs text-muted-foreground">Class / Section</span>
          <select
            value={classKey}
            onChange={(e) => { setClassKey(e.target.value); setScheduleId(''); setMarks({}); }}
            className="mt-1 w-full rounded-md border bg-background px-2 py-2 text-sm"
          >
            {classOptions.map((c) => (
              <option key={`${c.classId}:${c.sectionId}`} value={`${c.classId}:${c.sectionId}`}>
                {c.className} · {c.sectionName}
              </option>
            ))}
          </select>
        </label>
        <label className="rounded-xl border bg-card p-4">
          <span className="text-xs text-muted-foreground">Schedule (subject)</span>
          <select
            value={scheduleId}
            onChange={(e) => { setScheduleId(e.target.value); setMarks({}); }}
            className="mt-1 w-full rounded-md border bg-background px-2 py-2 text-sm"
            disabled={!scheduleOptions.length}
          >
            {scheduleOptions.map((s: any) => (
              <option key={s.id} value={s.id}>
                {s.subject?.name ?? 'Subject'} · {s.date ? new Date(s.date).toLocaleDateString() : ''}
              </option>
            ))}
          </select>
          {loadingSchedules && <p className="mt-2 text-xs text-muted-foreground">Loading schedules…</p>}
        </label>
      </div>

      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <p className="text-sm font-semibold">Marks entry</p>
        <p className="text-xs text-muted-foreground">
          {selectedSchedule?.subject?.name ?? 'Subject'} · Max marks: {selectedSchedule?.maxMarks ?? 100}
        </p>
        <div className="mt-3 overflow-hidden rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Student</th>
                <th className="px-4 py-3 text-right">Roll</th>
                <th className="px-4 py-3 text-right">Marks</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s: any) => (
                <tr key={s.id} className="border-t">
                  <td className="px-4 py-3 font-medium">{s.name}</td>
                  <td className="px-4 py-3 text-right">{s.rollNumber ?? '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <input
                      value={marks[s.id] ?? ''}
                      onChange={(e) => setMarks((m) => ({ ...m, [s.id]: e.target.value }))}
                      className="w-24 rounded-md border bg-background px-2 py-1 text-right text-sm"
                      inputMode="numeric"
                      placeholder="0"
                    />
                  </td>
                </tr>
              ))}
              {!students.length && !loadingMe && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-sm text-muted-foreground">
                    No students found for this class/section.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex justify-end">
          <button
            disabled={!scheduleId || !students.length || bulk.isPending}
            onClick={async () => {
              await bulk.mutateAsync({
                examScheduleId: scheduleId,
                entries: students
                  .filter((s: any) => marks[s.id] !== undefined && marks[s.id] !== '')
                  .map((s: any) => ({ studentId: s.id, marksObtained: Number(marks[s.id]) })),
              } as any);
            }}
            className={cn('rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60')}
          >
            {bulk.isPending ? 'Saving…' : 'Save marks'}
          </button>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <p className="text-sm font-semibold">Class results</p>
        <p className="text-xs text-muted-foreground">Ranking snapshot for selected exam and class/section</p>
        {!(classResults as any)?.ranked?.length ? (
          <div className="mt-3 rounded-lg border bg-muted/20 p-4 text-sm text-muted-foreground">
            No results found yet for this exam/class/section.
          </div>
        ) : (
          (() => {
            const grades = ((classResults as any)?.grades ?? []) as any[];
            const ranked = ((classResults as any)?.ranked ?? []) as any[];

            const studentMap = new Map<string, { name?: string; rollNumber?: string }>();
            for (const g of grades) {
              if (!studentMap.has(g.studentId)) studentMap.set(g.studentId, { name: g.student?.name, rollNumber: g.student?.rollNumber });
            }

            const totals = ranked.map((r: any) => r.total).filter((n: any) => typeof n === 'number');
            const avgTotal = totals.length ? Math.round(totals.reduce((a: number, b: number) => a + b, 0) / totals.length) : 0;
            const top = ranked[0];
            const topStudent = top ? studentMap.get(top.studentId) : null;

            const bySubject = new Map<string, { subject: string; count: number; total: number; passed: number }>();
            for (const g of grades) {
              const subject = g.subject?.name ?? 'Subject';
              const row = bySubject.get(subject) ?? { subject, count: 0, total: 0, passed: 0 };
              row.count += 1;
              row.total += Number(g.marksObtained ?? 0);
              row.passed += g.isPassed ? 1 : 0;
              bySubject.set(subject, row);
            }
            const subjectRows = Array.from(bySubject.values()).map((r) => ({
              ...r,
              avg: r.count ? Math.round(r.total / r.count) : 0,
              passRate: r.count ? Math.round((r.passed / r.count) * 100) : 0,
            }));

            return (
              <div className="mt-3 space-y-4">
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-xl border bg-muted/10 p-4">
                    <p className="text-xs text-muted-foreground">Students</p>
                    <p className="mt-1 text-2xl font-bold">{ranked.length}</p>
                  </div>
                  <div className="rounded-xl border bg-muted/10 p-4">
                    <p className="text-xs text-muted-foreground">Average total</p>
                    <p className="mt-1 text-2xl font-bold">{avgTotal}</p>
                  </div>
                  <div className="rounded-xl border bg-muted/10 p-4">
                    <p className="text-xs text-muted-foreground">Top rank</p>
                    <p className="mt-1 text-sm font-semibold">
                      {topStudent?.name ?? '—'} {topStudent?.rollNumber ? <span className="text-muted-foreground">({topStudent.rollNumber})</span> : null}
                    </p>
                    <p className="text-xs text-muted-foreground">Total: {top?.total ?? '—'}</p>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="overflow-hidden rounded-xl border">
                    <div className="bg-muted/40 px-4 py-3 text-xs font-semibold text-muted-foreground">Ranking</div>
                    <table className="w-full text-sm">
                      <thead className="bg-muted/20 text-xs text-muted-foreground">
                        <tr>
                          <th className="px-4 py-2 text-left">Rank</th>
                          <th className="px-4 py-2 text-left">Student</th>
                          <th className="px-4 py-2 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ranked.slice(0, 30).map((r: any) => {
                          const s = studentMap.get(r.studentId);
                          return (
                            <tr key={r.studentId} className="border-t">
                              <td className="px-4 py-2 font-semibold">{r.rank}</td>
                              <td className="px-4 py-2">
                                <div className="font-medium">{s?.name ?? '—'}</div>
                                <div className="text-xs text-muted-foreground">Roll: {s?.rollNumber ?? '—'}</div>
                              </td>
                              <td className="px-4 py-2 text-right font-semibold">{r.total}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    {ranked.length > 30 && (
                      <div className="border-t bg-muted/10 px-4 py-2 text-xs text-muted-foreground">
                        Showing top 30 of {ranked.length}
                      </div>
                    )}
                  </div>

                  <div className="overflow-hidden rounded-xl border">
                    <div className="bg-muted/40 px-4 py-3 text-xs font-semibold text-muted-foreground">Subject summary</div>
                    <table className="w-full text-sm">
                      <thead className="bg-muted/20 text-xs text-muted-foreground">
                        <tr>
                          <th className="px-4 py-2 text-left">Subject</th>
                          <th className="px-4 py-2 text-right">Avg</th>
                          <th className="px-4 py-2 text-right">Pass%</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subjectRows.map((r) => (
                          <tr key={r.subject} className="border-t">
                            <td className="px-4 py-2 font-medium">{r.subject}</td>
                            <td className="px-4 py-2 text-right">{r.avg}</td>
                            <td className="px-4 py-2 text-right">{r.passRate}%</td>
                          </tr>
                        ))}
                        {!subjectRows.length && (
                          <tr>
                            <td colSpan={3} className="px-4 py-6 text-sm text-muted-foreground">
                              No subject grades yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })()
        )}
      </div>

      <Link href="/faculty/dashboard" className="text-sm font-medium text-primary hover:underline">
        Back to dashboard
      </Link>
    </div>
  );
}

