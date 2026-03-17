'use client';

import { useAuthStore } from '@/store/auth.store';
import {
  useStudentAttendance, useStudentResults, useStudentFees,
  useAssignments, useIssuedBooks, useNotices, useMyStudentProfile,
} from '@/hooks/use-api';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { BookOpen, ClipboardList, DollarSign, Bell, FileText, Calendar, AlertTriangle } from 'lucide-react';
import { formatCurrency, formatDate, getAttendanceColor, cn } from '@/lib/utils';
import Link from 'next/link';

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const { data: me } = useMyStudentProfile();
  const studentId = me?.id ?? '';
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const { data: attendance } = useStudentAttendance(studentId, month);
  const { data: results } = useStudentResults(studentId);
  const { data: fees } = useStudentFees(studentId);
  const { data: assignments } = useAssignments({ studentId });
  const { data: issuedBooks } = useIssuedBooks(studentId);
  const { data: notices } = useNotices(me?.classId ? { classId: me.classId } : undefined);

  const attendancePct = attendance?.percentage ?? 0;
  const attendancePieData = attendance
    ? [
        { name: 'Present', value: attendance.present, color: '#16A34A' },
        { name: 'Absent', value: attendance.absent, color: '#DC2626' },
        { name: 'Late', value: attendance.late, color: '#D97706' },
        { name: 'Leave', value: attendance.leave, color: '#7C3AED' },
      ].filter((d) => d.value > 0)
    : [];

  const latestResult = results?.[0];
  const pendingAssignments = (assignments as any[])?.filter(
    (a) => new Date(a.dueDate) > new Date() && !a.submissions?.length,
  ) ?? [];
  const overdueBooks = (issuedBooks as any[])?.filter(
    (b) => !b.returnedAt && new Date(b.dueDate) < new Date(),
  ) ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Good {now.getHours() < 12 ? 'morning' : now.getHours() < 18 ? 'afternoon' : 'evening'}, {user?.name.split(' ')[0]}! 👋</h1>
        <p className="text-sm text-muted-foreground">{formatDate(now, 'long')}</p>
      </div>

      {/* Warning banners */}
      {attendancePct > 0 && attendancePct < 75 && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>Your attendance is <strong>{attendancePct}%</strong>. Minimum 75% is required.</span>
        </div>
      )}
      {fees && fees.totalDue > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          <DollarSign className="h-4 w-4 shrink-0" />
          <span>You have an outstanding fee of <strong>{formatCurrency(fees.totalDue)}</strong>.</span>
          <Link href="/student/fees" className="ml-auto font-medium underline">Pay now</Link>
        </div>
      )}

      {/* Main grid */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

        {/* Attendance */}
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">Attendance — {MONTH_NAMES[now.getMonth()]}</h3>
            </div>
            <span className={cn('text-2xl font-bold', getAttendanceColor(attendancePct))}>
              {attendancePct}%
            </span>
          </div>
          {attendancePieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie data={attendancePieData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value">
                  {attendancePieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
              No records this month
            </div>
          )}
          <div className="mt-2 flex flex-wrap gap-2">
            {attendancePieData.map((d) => (
              <span key={d.name} className="flex items-center gap-1 text-xs text-muted-foreground">
                <span className="h-2 w-2 rounded-full" style={{ background: d.color }} />
                {d.name}: {d.value}
              </span>
            ))}
          </div>
        </div>

        {/* Latest results */}
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Latest Exam Results</h3>
          </div>
          {latestResult ? (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">{latestResult.examName}</p>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold">{latestResult.percentage}%</span>
                <span className="mb-0.5 text-sm text-muted-foreground">/ 100</span>
                <span className={cn('ml-auto rounded-md px-2 py-0.5 text-sm font-semibold',
                  latestResult.isPassed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>
                  {latestResult.overallGrade}
                </span>
              </div>
              <div className="space-y-1">
                {latestResult.subjects.slice(0, 3).map((g: any) => (
                  <div key={g.id} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{g.subject?.name}</span>
                    <span className="font-medium">{Number(g.marksObtained)}/{g.maxMarks}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No results yet</p>
          )}
          <Link href="/student/exams" className="mt-3 block text-xs text-primary hover:underline">
            View all results →
          </Link>
        </div>

        {/* Pending assignments */}
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">Pending Assignments</h3>
            </div>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
              {pendingAssignments.length}
            </span>
          </div>
          <div className="space-y-2">
            {pendingAssignments.slice(0, 4).map((a: any) => (
              <div key={a.id} className="flex items-start justify-between rounded-lg bg-muted/50 p-2 text-xs">
                <div>
                  <p className="font-medium">{a.title}</p>
                  <p className="text-muted-foreground">{a.subject?.name}</p>
                </div>
                <span className="shrink-0 rounded bg-amber-50 px-1.5 py-0.5 text-amber-700">
                  {formatDate(a.dueDate, 'short')}
                </span>
              </div>
            ))}
            {pendingAssignments.length === 0 && (
              <p className="text-sm text-muted-foreground">All assignments submitted! 🎉</p>
            )}
          </div>
          <Link href="/student/assignments" className="mt-3 block text-xs text-primary hover:underline">
            View all assignments →
          </Link>
        </div>

        {/* Fee summary */}
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Fee Summary</h3>
          </div>
          {fees ? (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total paid</span>
                <span className="font-semibold text-green-600">{formatCurrency(fees.totalPaid)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Outstanding</span>
                <span className={cn('font-semibold', fees.totalDue > 0 ? 'text-red-600' : 'text-green-600')}>
                  {formatCurrency(fees.totalDue)}
                </span>
              </div>
              {fees.totalDue > 0 && (
                <Link
                  href="/student/fees"
                  className="block rounded-lg bg-primary px-3 py-2 text-center text-xs font-semibold text-white hover:opacity-90"
                >
                  Pay {formatCurrency(fees.totalDue)}
                </Link>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Loading fees…</p>
          )}
        </div>

        {/* Library */}
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">Library Books</h3>
            </div>
            {overdueBooks.length > 0 && (
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                {overdueBooks.length} overdue
              </span>
            )}
          </div>
          <div className="space-y-2">
            {(issuedBooks as any[])?.filter((b) => !b.returnedAt).slice(0, 3).map((b: any) => (
              <div key={b.id} className="flex justify-between rounded-lg bg-muted/50 p-2 text-xs">
                <span className="truncate font-medium">{b.book?.title}</span>
                <span className={cn('shrink-0 ml-2', new Date(b.dueDate) < new Date() ? 'text-red-600 font-semibold' : 'text-muted-foreground')}>
                  Due {formatDate(b.dueDate, 'short')}
                </span>
              </div>
            ))}
            {!issuedBooks?.length && (
              <p className="text-sm text-muted-foreground">No books currently issued</p>
            )}
          </div>
        </div>

        {/* Recent notices */}
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Recent Notices</h3>
          </div>
          <div className="space-y-2">
            {(notices as any[])?.slice(0, 4).map((n: any) => (
              <div key={n.id} className="rounded-lg bg-muted/50 p-2 text-xs">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{n.title}</p>
                  <span className={cn('rounded px-1.5 py-0.5 text-[10px] font-semibold',
                    n.priority === 'URGENT' ? 'bg-red-100 text-red-700' :
                    n.priority === 'EMERGENCY' ? 'bg-red-200 text-red-800' :
                    'bg-blue-50 text-blue-700')}>
                    {n.priority}
                  </span>
                </div>
                <p className="mt-0.5 text-muted-foreground">{formatDate(n.createdAt, 'short')}</p>
              </div>
            ))}
            {!(notices as any[])?.length && (
              <p className="text-sm text-muted-foreground">No notices</p>
            )}
          </div>
          <Link href="/student/notices" className="mt-3 block text-xs text-primary hover:underline">
            View all notices →
          </Link>
        </div>
      </div>
    </div>
  );
}

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
