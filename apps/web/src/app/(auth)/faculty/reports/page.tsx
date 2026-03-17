'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useAcademicYears, useClassResults, useExams, useMyFacultyProfile } from '@/hooks/use-api';

export default function FacultyReportsPage() {
  const { data: years } = useAcademicYears();
  const academicYearId = (years as any[])?.find((y) => y.isCurrent)?.id ?? (years as any[])?.[0]?.id;
  const { data: exams } = useExams(academicYearId);
  const { data: me } = useMyFacultyProfile();
  const assignments = ((me as any)?.assignments ?? []) as any[];

  const classOptions = useMemo(() => {
    const map = new Map<string, any>();
    for (const a of assignments) {
      const key = `${a.classId}:${a.sectionId}`;
      if (!map.has(key)) map.set(key, a);
    }
    return Array.from(map.values());
  }, [assignments]);

  const [examId, setExamId] = useState<string>('');
  const [classKey, setClassKey] = useState<string>('');

  useEffect(() => {
    if (!examId && (exams as any[])?.[0]?.id) setExamId((exams as any[])[0].id);
  }, [exams, examId]);
  useEffect(() => {
    if (!classKey && classOptions[0]) setClassKey(`${classOptions[0].classId}:${classOptions[0].sectionId}`);
  }, [classOptions, classKey]);

  const selected = classOptions.find((a) => `${a.classId}:${a.sectionId}` === classKey);
  const { data } = useClassResults(examId, selected?.classId, selected?.sectionId);
  const ranked = (data as any)?.ranked ?? [];

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Reports</h1>
      <p className="text-sm text-muted-foreground">Quick exam ranking report</p>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="rounded-xl border bg-card p-4">
          <span className="text-xs text-muted-foreground">Exam</span>
          <select value={examId} onChange={(e) => setExamId(e.target.value)} className="mt-1 w-full rounded-md border bg-background px-2 py-2 text-sm">
            {(exams ?? []).map((e: any) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </label>
        <label className="rounded-xl border bg-card p-4">
          <span className="text-xs text-muted-foreground">Class / Section</span>
          <select value={classKey} onChange={(e) => setClassKey(e.target.value)} className="mt-1 w-full rounded-md border bg-background px-2 py-2 text-sm">
            {classOptions.map((a: any) => (
              <option key={`${a.classId}:${a.sectionId}`} value={`${a.classId}:${a.sectionId}`}>
                {a.class?.name} · {a.section?.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Rank</th>
              <th className="px-4 py-3 text-left">Student</th>
              <th className="px-4 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((r: any) => (
              <tr key={r.studentId} className="border-t">
                <td className="px-4 py-3 font-semibold">{r.rank}</td>
                <td className="px-4 py-3 font-medium">{r.studentId}</td>
                <td className="px-4 py-3 text-right">{r.total}</td>
              </tr>
            ))}
            {!ranked.length && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-sm text-muted-foreground">
                  No results yet for this selection.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Link href="/faculty/dashboard" className="text-sm font-medium text-primary hover:underline">
        Back to dashboard
      </Link>
    </div>
  );
}

