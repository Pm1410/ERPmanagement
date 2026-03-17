'use client';

import { useStudent, useStudentAttendance, useStudentResults, useStudentFees, useNotices } from '@/hooks/use-api';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, ClipboardList, GraduationCap, Bell, Truck } from 'lucide-react';
import { formatCurrency, formatDate, getAttendanceColor, cn } from '@/lib/utils';
import Link from 'next/link';
import { useSelectedChildStudentId } from '@/lib/parent-child';

export default function ParentDashboard() {
  const { children, studentId, setStudentId } = useSelectedChildStudentId();
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const { data: student } = useStudent(studentId);
  const { data: attendance } = useStudentAttendance(studentId, month);
  const { data: results } = useStudentResults(studentId);
  const { data: fees } = useStudentFees(studentId);
  const { data: notices } = useNotices(student?.classId ? { classId: student.classId } : undefined);

  const attendancePct = attendance?.percentage ?? 0;
  const pieData = attendance
    ? [
        { name: 'Present', value: attendance.present, color: '#16A34A' },
        { name: 'Absent', value: attendance.absent, color: '#DC2626' },
        { name: 'Late', value: attendance.late, color: '#D97706' },
      ].filter((d) => d.value > 0)
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Parent Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Monitoring {student?.name ?? 'your child'} · {formatDate(now, 'long')}
        </p>
      </div>

      {/* Child selector */}
      {children.length > 1 && (
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-sm font-semibold">Select child</p>
          <select
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="mt-2 w-full rounded-md border bg-background px-2 py-2 text-sm"
          >
            {children.map((c: any) => (
              <option key={c.id} value={c.id}>
                {c.name} · {c.class?.name ?? ''} {c.section?.name ? `(${c.section.name})` : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Child info card */}
      {student && (
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
              {student.name.charAt(0)}
            </div>
            <div className="grid flex-1 grid-cols-2 gap-x-6 gap-y-1 text-sm md:grid-cols-4">
              <div><p className="text-xs text-muted-foreground">Name</p><p className="font-semibold">{student.name}</p></div>
              <div><p className="text-xs text-muted-foreground">Class</p><p className="font-semibold">{student.class?.name} - {student.section?.name}</p></div>
              <div><p className="text-xs text-muted-foreground">Roll No</p><p className="font-semibold">{student.rollNumber}</p></div>
              <div><p className="text-xs text-muted-foreground">Admission No</p><p className="font-semibold">{student.admissionNumber}</p></div>
            </div>
          </div>
        </div>
      )}

      {/* Fee alert */}
      {fees && fees.totalDue > 0 && (
        <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          <span>Outstanding fees: <strong>{formatCurrency(fees.totalDue)}</strong></span>
          <Link href="/parent/fees" className="font-semibold underline">Pay now →</Link>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Attendance */}
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="mb-2 flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Attendance This Month</h3>
          </div>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={100} height={100}>
              <PieChart>
                <Pie data={pieData.length ? pieData : [{ name: 'N/A', value: 1, color: '#e2e8f0' }]}
                  cx="50%" cy="50%" innerRadius={32} outerRadius={44} dataKey="value">
                  {(pieData.length ? pieData : [{ color: '#e2e8f0' }]).map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div>
              <p className={cn('text-3xl font-bold', getAttendanceColor(attendancePct))}>{attendancePct}%</p>
              <p className="text-xs text-muted-foreground">
                {attendance?.present ?? 0} days present
              </p>
              {attendancePct < 75 && (
                <p className="mt-1 text-xs font-medium text-red-600">⚠ Below 75%</p>
              )}
            </div>
          </div>
          <Link href="/parent/attendance" className="mt-2 block text-xs text-primary hover:underline">
            View full calendar →
          </Link>
        </div>

        {/* Latest result */}
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="mb-2 flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Latest Result</h3>
          </div>
          {results?.[0] ? (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">{results[0].examName}</p>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold">{results[0].percentage}%</span>
                <span className={cn('rounded-md px-2 py-0.5 text-sm font-semibold',
                  results[0].isPassed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>
                  {results[0].overallGrade}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {results[0].totalObtained} / {results[0].totalMax} marks
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No results published yet</p>
          )}
          <Link href="/parent/progress" className="mt-2 block text-xs text-primary hover:underline">
            View full report card →
          </Link>
        </div>

        {/* Fee summary */}
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="mb-2 flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Fee Status</h3>
          </div>
          {fees ? (
            <div className="space-y-3">
              {fees.dues.slice(0, 3).map((d: any) => (
                <div key={d.feeHeadId} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{d.feeHeadName}</span>
                  <span className={cn('font-semibold', d.due > 0 ? 'text-red-600' : 'text-green-600')}>
                    {d.due > 0 ? `₹${d.due.toLocaleString()} due` : '✓ Paid'}
                  </span>
                </div>
              ))}
              {fees.totalDue > 0 && (
                <Link href="/parent/fees"
                  className="block rounded-lg bg-primary px-3 py-2 text-center text-xs font-semibold text-white hover:opacity-90">
                  Pay {formatCurrency(fees.totalDue)}
                </Link>
              )}
            </div>
          ) : <p className="text-sm text-muted-foreground">Loading…</p>}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: 'Send message to teacher', href: '/parent/messages', icon: Bell },
          { label: 'Apply for leave', href: '/parent/attendance', icon: ClipboardList },
          { label: 'Track school bus', href: '/parent/transport', icon: Truck },
        ].map((l) => (
          <Link key={l.label} href={l.href}
            className="flex items-center gap-3 rounded-xl border bg-card p-4 text-sm font-medium transition-shadow hover:shadow-md">
            <l.icon className="h-5 w-5 text-primary" />
            {l.label}
          </Link>
        ))}
      </div>

      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Latest Notices</h3>
          </div>
          <Link href="/parent/notices" className="text-xs text-primary hover:underline">View all</Link>
        </div>
        <div className="space-y-2">
          {(notices as any[])?.slice(0, 3).map((n: any) => (
            <div key={n.id} className="rounded-lg bg-muted/50 p-2 text-xs">
              <p className="font-medium">{n.title}</p>
              <p className="mt-0.5 text-muted-foreground">{formatDate(n.createdAt, 'short')}</p>
            </div>
          ))}
          {!(notices as any[])?.length && (
            <p className="text-sm text-muted-foreground">No notices.</p>
          )}
        </div>
      </div>
    </div>
  );
}
