'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useSelectedChildStudentId } from '@/lib/parent-child';
import { formatDate } from '@/lib/utils';
import { apiClient } from '@/lib/api-client';
import { useAcademicYears, useStudent, useTimetable } from '@/hooks/use-api';

export default function ParentMessagesPage() {
  const { user } = useAuthStore();
  const { children, studentId } = useSelectedChildStudentId();
  const child = useMemo(() => children.find((c: any) => c.id === studentId), [children, studentId]);
  const classTeacherUserId = child?.section?.classTeacher?.userId as string | undefined;

  const { data: student } = useStudent(studentId);
  const { data: years } = useAcademicYears();
  const academicYearId = (years as any[])?.find((y) => y.isCurrent)?.id ?? (years as any[])?.[0]?.id;
  const { data: slots } = useTimetable(student?.classId ?? '', student?.sectionId ?? '', academicYearId);

  const teacherOptions = useMemo(() => {
    const out: Array<{ id: string; label: string; userId: string }> = [];
    const seen = new Set<string>();
    if (child?.section?.classTeacher?.userId) {
      const u = child.section.classTeacher.userId as string;
      out.push({ id: `classTeacher:${u}`, label: `Class Teacher — ${child.section.classTeacher.name}`, userId: u });
      seen.add(u);
    }
    (slots ?? []).forEach((s: any) => {
      const u = s.faculty?.userId;
      if (!u || seen.has(u)) return;
      seen.add(u);
      out.push({
        id: `faculty:${u}`,
        label: `${s.subject?.name ?? 'Subject'} — ${s.faculty?.name ?? 'Teacher'}`,
        userId: u,
      });
    });
    return out;
  }, [child?.section?.classTeacher, slots]);

  const [recipientKey, setRecipientKey] = useState<string>('');
  const recipientUserId = teacherOptions.find((t) => t.id === recipientKey)?.userId ?? classTeacherUserId;

  const [body, setBody] = useState('');
  const [thread, setThread] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!recipientUserId) return;
    setLoading(true);
    try {
      const res = await apiClient.get('/notices/messages', { params: { otherUserId: recipientUserId } });
      setThread(res.data.data ?? res.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Messages</h1>
      <p className="text-sm text-muted-foreground">Message your child’s class teacher</p>

      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <p className="text-sm font-semibold">Recipient</p>
        {teacherOptions.length ? (
          <select
            value={recipientKey}
            onChange={(e) => setRecipientKey(e.target.value)}
            className="mt-2 w-full rounded-md border bg-background px-2 py-2 text-sm"
          >
            <option value="">Auto (class teacher)</option>
            {teacherOptions.map((t) => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
        ) : (
          <p className="mt-1 text-sm text-muted-foreground">No teacher mapping yet (timetable not published).</p>
        )}
        <div className="mt-3 flex gap-2">
          <button
            onClick={load}
            disabled={!recipientUserId || loading}
            className="rounded-lg border px-3 py-2 text-sm hover:bg-muted disabled:opacity-60"
          >
            {loading ? 'Loading…' : 'Load conversation'}
          </button>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <p className="text-sm font-semibold">Send message</p>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="mt-2 min-h-24 w-full rounded-md border bg-background px-2 py-2 text-sm"
          placeholder="Write your message…"
        />
        <div className="mt-3 flex justify-end">
          <button
            disabled={!recipientUserId || !body.trim()}
            onClick={async () => {
              await apiClient.post('/notices/messages', { recipientId: recipientUserId, body });
              setBody('');
              await load();
            }}
            className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            Send
          </button>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <p className="text-sm font-semibold">Conversation</p>
        <div className="mt-3 space-y-2">
          {thread.length ? thread.map((m: any) => (
            <div
              key={m.id}
              className="rounded-lg border bg-muted/20 p-3 text-sm"
            >
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{m.sender?.name ?? (m.senderId === user?.id ? 'You' : 'Teacher')}</span>
                <span>{m.createdAt ? formatDate(m.createdAt, 'short') : ''}</span>
              </div>
              <p className="mt-1">{m.body}</p>
            </div>
          )) : (
            <p className="text-sm text-muted-foreground">No messages yet.</p>
          )}
        </div>
      </div>

      <Link href="/parent/dashboard" className="text-sm font-medium text-primary hover:underline">
        Back to dashboard
      </Link>
    </div>
  );
}

