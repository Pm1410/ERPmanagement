'use client';

import { useAuthStore } from '@/store/auth.store';
import { useAssignments, useLeaveRequests, useNotices, useMyFacultyProfile } from '@/hooks/use-api';
import { formatDate, cn } from '@/lib/utils';
import { ClipboardList, FileText, Bell, Calendar, CheckCircle2, Clock, BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function FacultyDashboard() {
  const { user } = useAuthStore();
  const { data: me } = useMyFacultyProfile();
  const now = new Date();

  const { data: assignments } = useAssignments({ facultyId: me?.id ?? user?.id });
  const { data: leaves } = useLeaveRequests({ staffUserId: user?.id, status: 'PENDING' });
  const { data: notices } = useNotices();

  const ungraded = (assignments as any[])?.filter(
    (a) => a._count?.submissions > 0,
  ) ?? [];

  const upcoming = (assignments as any[])?.filter(
    (a) => new Date(a.dueDate) > now,
  ).sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()) ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Welcome, {user?.name.split(' ')[0]}! 👋</h1>
        <p className="text-sm text-muted-foreground">{formatDate(now, 'long')}</p>
      </div>

      {/* Quick action cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Mark Attendance', href: '/faculty/attendance', icon: ClipboardList, color: 'bg-blue-50 text-blue-600 border-blue-100' },
          { label: 'Create Assignment', href: '/faculty/assignments', icon: FileText, color: 'bg-teal-50 text-teal-600 border-teal-100' },
          { label: 'Enter Exam Marks', href: '/faculty/exams', icon: BookOpen, color: 'bg-purple-50 text-purple-600 border-purple-100' },
          { label: 'Upload Materials', href: '/faculty/materials', icon: Calendar, color: 'bg-amber-50 text-amber-600 border-amber-100' },
        ].map((a) => (
          <Link key={a.label} href={a.href}
            className={cn('flex items-center gap-3 rounded-xl border p-4 transition-shadow hover:shadow-md', a.color)}>
            <a.icon className="h-5 w-5" />
            <span className="text-sm font-semibold">{a.label}</span>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Assignments to grade */}
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">Submissions to Grade</h3>
            </div>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
              {ungraded.length}
            </span>
          </div>
          <div className="space-y-2">
            {ungraded.slice(0, 5).map((a: any) => (
              <Link key={a.id} href={`/faculty/assignments/${a.id}/grade`}
                className="flex items-center justify-between rounded-lg bg-muted/50 p-2 text-xs hover:bg-muted">
                <div>
                  <p className="font-medium">{a.title}</p>
                  <p className="text-muted-foreground">{a.subject?.name}</p>
                </div>
                <span className="shrink-0 rounded bg-amber-50 px-1.5 py-0.5 font-medium text-amber-700">
                  {a._count?.submissions} pending
                </span>
              </Link>
            ))}
            {ungraded.length === 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                All caught up!
              </div>
            )}
          </div>
        </div>

        {/* Upcoming assignment deadlines */}
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Upcoming Deadlines</h3>
          </div>
          <div className="space-y-2">
            {upcoming.slice(0, 5).map((a: any) => {
              const daysLeft = Math.ceil((new Date(a.dueDate).getTime() - now.getTime()) / 86400000);
              return (
                <div key={a.id} className="flex items-start justify-between rounded-lg bg-muted/50 p-2 text-xs">
                  <div>
                    <p className="font-medium">{a.title}</p>
                    <p className="text-muted-foreground">{a.subject?.name}</p>
                  </div>
                  <span className={cn('shrink-0 rounded px-1.5 py-0.5 font-medium',
                    daysLeft <= 1 ? 'bg-red-100 text-red-700' :
                    daysLeft <= 3 ? 'bg-amber-100 text-amber-700' :
                    'bg-blue-50 text-blue-700')}>
                    {daysLeft}d left
                  </span>
                </div>
              );
            })}
            {upcoming.length === 0 && (
              <p className="text-sm text-muted-foreground">No upcoming deadlines</p>
            )}
          </div>
        </div>

        {/* Notices + leave status */}
        <div className="space-y-4">
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">Latest Notices</h3>
            </div>
            <div className="space-y-2">
              {(notices as any[])?.slice(0, 3).map((n: any) => (
                <div key={n.id} className="rounded-lg bg-muted/50 p-2 text-xs">
                  <p className="font-medium">{n.title}</p>
                  <p className="mt-0.5 text-muted-foreground">{formatDate(n.createdAt, 'short')}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Leave Balance</span>
              <Link href="/faculty/leaves" className="text-xs text-primary hover:underline">Apply leave</Link>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
              {[{ type: 'CL', used: 3, total: 12 }, { type: 'EL', used: 5, total: 21 }, { type: 'ML', used: 0, total: 15 }].map((l) => (
                <div key={l.type} className="rounded-lg bg-muted/50 p-2">
                  <p className="font-bold text-base">{l.total - l.used}</p>
                  <p className="text-muted-foreground">{l.type} left</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
