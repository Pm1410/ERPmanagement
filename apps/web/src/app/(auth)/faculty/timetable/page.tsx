'use client';

import Link from 'next/link';
import { useMyFacultyProfile, useFacultyTimetable } from '@/hooks/use-api';

export default function FacultyTimetablePage() {
  const { data: me, isLoading: loadingMe } = useMyFacultyProfile();
  const facultyId = (me as any)?.id ?? '';
  const { data, isLoading, error, refetch } = useFacultyTimetable(facultyId);
  const slots = (data ?? []) as any[];

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Timetable</h1>
      <p className="text-sm text-muted-foreground">Your teaching schedule</p>

      <div className="flex justify-end">
        <button onClick={() => refetch()} className="rounded-lg border px-3 py-2 text-sm hover:bg-muted">
          Refresh
        </button>
      </div>

      {(loadingMe || isLoading) && <div className="text-sm text-muted-foreground">Loading…</div>}
      {error && <div className="text-sm text-destructive">Failed to load timetable.</div>}

      <div className="overflow-hidden rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Day</th>
              <th className="px-4 py-3 text-left">Time</th>
              <th className="px-4 py-3 text-left">Class</th>
              <th className="px-4 py-3 text-left">Section</th>
              <th className="px-4 py-3 text-left">Subject</th>
            </tr>
          </thead>
          <tbody>
            {slots.map((s: any) => (
              <tr key={s.id} className="border-t">
                <td className="px-4 py-3 font-medium">{s.day}</td>
                <td className="px-4 py-3">{s.startTime}–{s.endTime}</td>
                <td className="px-4 py-3">{s.class?.name ?? '—'}</td>
                <td className="px-4 py-3">{s.section?.name ?? '—'}</td>
                <td className="px-4 py-3">{s.subject?.name ?? '—'}</td>
              </tr>
            ))}
            {!slots.length && !(loadingMe || isLoading) && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-sm text-muted-foreground">
                  No timetable published yet.
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

