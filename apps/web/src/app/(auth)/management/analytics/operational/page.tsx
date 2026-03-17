'use client';

import Link from 'next/link';
import { useOperationalDashboard } from '@/hooks/use-api';
import { formatDate } from '@/lib/utils';

export default function OperationalAnalyticsPage() {
  const { data, isLoading, error, refetch } = useOperationalDashboard();
  const attendanceRows = (data as any)?.attendanceSummaryByClass ?? [];
  const library = (data as any)?.libraryUtilization;
  const grievances = (data as any)?.grievanceSummary;
  const leaves = (data as any)?.staffLeaveSummary;
  const hostel = (data as any)?.hostelOccupancy;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Analytics — Operational</h1>
          <p className="text-sm text-muted-foreground">Operational overview</p>
        </div>
        <button onClick={() => refetch()} className="rounded-lg border px-3 py-2 text-sm hover:bg-muted">
          Refresh
        </button>
      </div>

      {isLoading && <div className="text-sm text-muted-foreground">Loading…</div>}
      {error && <div className="text-sm text-destructive">Failed to load operational analytics.</div>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Library issued (this month)</p>
          <p className="mt-1 text-2xl font-bold">{library?.issuedThisMonth ?? 0}</p>
          <p className="mt-1 text-xs text-muted-foreground">Overdue: {library?.currentlyOverdue ?? 0}</p>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Grievances open</p>
          <p className="mt-1 text-2xl font-bold">{grievances?.open ?? 0}</p>
          <p className="mt-1 text-xs text-muted-foreground">In progress: {grievances?.inProgress ?? 0}</p>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Leaves pending</p>
          <p className="mt-1 text-2xl font-bold">{leaves?.pendingApprovals ?? 0}</p>
          <p className="mt-1 text-xs text-muted-foreground">On leave today: {leaves?.onLeaveToday ?? 0}</p>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Hostel occupancy</p>
          <p className="mt-1 text-2xl font-bold">{hostel?.occupancyRate ?? 0}%</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Beds: {hostel?.occupiedBeds ?? 0}/{hostel?.totalBeds ?? 0} · Rooms: {hostel?.totalRooms ?? 0}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="border-b px-4 py-3">
          <p className="text-sm font-semibold">Attendance (month-to-date)</p>
          <p className="text-xs text-muted-foreground">By class</p>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Class</th>
              <th className="px-4 py-3 text-right">Present</th>
              <th className="px-4 py-3 text-right">Absent</th>
              <th className="px-4 py-3 text-right">Late</th>
              <th className="px-4 py-3 text-right">Leave</th>
              <th className="px-4 py-3 text-right">%</th>
            </tr>
          </thead>
          <tbody>
            {(attendanceRows as any[]).map((r: any, i: number) => (
              <tr key={r.className ?? i} className="border-t">
                <td className="px-4 py-3 font-medium">{r.className}</td>
                <td className="px-4 py-3 text-right">{r.present ?? 0}</td>
                <td className="px-4 py-3 text-right">{r.absent ?? 0}</td>
                <td className="px-4 py-3 text-right">{r.late ?? 0}</td>
                <td className="px-4 py-3 text-right">{r.leave ?? 0}</td>
                <td className="px-4 py-3 text-right font-semibold">{r.percentage ?? 0}%</td>
              </tr>
            ))}
            {(!attendanceRows || (attendanceRows as any[]).length === 0) && (
              <tr>
                <td className="px-4 py-6 text-sm text-muted-foreground" colSpan={6}>
                  No attendance data yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground">Updated: {formatDate(new Date(), 'short')}</p>

      <Link href="/management/dashboard" className="text-sm font-medium text-primary hover:underline">
        Back to dashboard
      </Link>
    </div>
  );
}

