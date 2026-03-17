'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useCreateParent, useLinkParentStudent, useParents, useStudents } from '@/hooks/use-api';
import { cn, formatDate } from '@/lib/utils';

export default function ManagementParentsPage() {
  const { data, isLoading, error, refetch } = useParents();
  const create = useCreateParent();

  const { data: studentsResp } = useStudents({ limit: 200 });
  const students = (studentsResp as any)?.data ?? (studentsResp as any[]) ?? [];

  const parents = (data ?? []) as any[];

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [studentIds, setStudentIds] = useState<string[]>([]);

  const [linkParentId, setLinkParentId] = useState<string>('');
  const link = useLinkParentStudent(linkParentId || '___');
  const [linkStudentId, setLinkStudentId] = useState<string>('');

  const studentOptions = useMemo(() => students.map((s: any) => ({ id: s.id, label: `${s.name} (${s.class?.name ?? ''} ${s.section?.name ?? ''})` })), [students]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Parents</h1>
          <p className="text-sm text-muted-foreground">Create parent IDs and link them to students</p>
        </div>
        <button onClick={() => refetch()} className="rounded-lg border px-3 py-2 text-sm hover:bg-muted">
          Refresh
        </button>
      </div>

      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <p className="text-sm font-semibold">Create parent</p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <label className="space-y-1">
            <span className="text-xs text-muted-foreground">Name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-md border bg-background px-2 py-2 text-sm" />
          </label>
          <label className="space-y-1">
            <span className="text-xs text-muted-foreground">Email</span>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-md border bg-background px-2 py-2 text-sm" />
          </label>
          <label className="space-y-1">
            <span className="text-xs text-muted-foreground">Phone</span>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-md border bg-background px-2 py-2 text-sm" />
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className="text-xs text-muted-foreground">Link students (optional)</span>
            <select
              multiple
              value={studentIds}
              onChange={(e) => setStudentIds(Array.from(e.target.selectedOptions).map((o) => o.value))}
              className="min-h-28 w-full rounded-md border bg-background px-2 py-2 text-sm"
            >
              {studentOptions.map((s: any) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </label>
        </div>
        <div className="mt-3 flex justify-end gap-2">
          <button
            onClick={() => { setName(''); setEmail(''); setPhone(''); setStudentIds([]); }}
            className="rounded-lg border px-3 py-2 text-sm hover:bg-muted"
          >
            Clear
          </button>
          <button
            disabled={!name || !email || create.isPending}
            onClick={async () => {
              const res = await create.mutateAsync({ name, email, phone: phone || undefined, studentIds });
              // res includes tempPassword for admin to share
              alert(`Parent created. Temporary password: ${res?.tempPassword ?? '(see API response)'}`);
              setName(''); setEmail(''); setPhone(''); setStudentIds([]);
              refetch();
            }}
            className={cn('rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white disabled:opacity-60')}
          >
            {create.isPending ? 'Creating…' : 'Create parent'}
          </button>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <p className="text-sm font-semibold">Link student to parent</p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <label className="space-y-1">
            <span className="text-xs text-muted-foreground">Parent</span>
            <select value={linkParentId} onChange={(e) => setLinkParentId(e.target.value)} className="w-full rounded-md border bg-background px-2 py-2 text-sm">
              <option value="">Select parent…</option>
              {parents.map((p: any) => <option key={p.id} value={p.id}>{p.name} ({p.email})</option>)}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-xs text-muted-foreground">Student</span>
            <select value={linkStudentId} onChange={(e) => setLinkStudentId(e.target.value)} className="w-full rounded-md border bg-background px-2 py-2 text-sm">
              <option value="">Select student…</option>
              {studentOptions.map((s: any) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </label>
        </div>
        <div className="mt-3 flex justify-end">
          <button
            disabled={!linkParentId || !linkStudentId || link.isPending}
            onClick={async () => {
              await link.mutateAsync({ studentId: linkStudentId, isPrimary: true });
              setLinkStudentId('');
              refetch();
            }}
            className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {link.isPending ? 'Linking…' : 'Link as primary'}
          </button>
        </div>
      </div>

      {isLoading && <div className="text-sm text-muted-foreground">Loading…</div>}
      {error && <div className="text-sm text-destructive">Failed to load parents.</div>}

      <div className="space-y-2">
        {parents.map((p: any) => (
          <div key={p.id} className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.email} {p.phone ? `· ${p.phone}` : ''}</p>
                <p className="mt-2 text-xs text-muted-foreground">Created {formatDate(p.createdAt, 'short')}</p>
                <div className="mt-2 text-sm">
                  <p className="text-xs text-muted-foreground">Linked students</p>
                  <ul className="mt-1 list-disc pl-4">
                    {(p.students ?? []).map((ps: any) => (
                      <li key={ps.id}>
                        {ps.student?.name} · {ps.student?.class?.name ?? ''} {ps.student?.section?.name ?? ''}
                        {ps.isPrimary ? ' (primary)' : ''}
                      </li>
                    ))}
                    {!(p.students ?? []).length && <li className="text-muted-foreground">None</li>}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ))}
        {!parents.length && !isLoading && (
          <div className="rounded-xl border bg-card p-5 text-sm text-muted-foreground">No parents yet.</div>
        )}
      </div>

      <Link href="/management/dashboard" className="text-sm font-medium text-primary hover:underline">
        Back to dashboard
      </Link>
    </div>
  );
}

