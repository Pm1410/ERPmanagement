'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useMySettings, useUpdateMySettings } from '@/hooks/use-api';
import { useSelectedChildStudentId } from '@/lib/parent-child';

export default function ParentSettingsPage() {
  const { user } = useAuthStore();
  const { data, isLoading, error, refetch } = useMySettings();
  const update = useUpdateMySettings();
  const { children, studentId, setStudentId } = useSelectedChildStudentId();

  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState(user?.avatar ?? '');

  useEffect(() => {
    if (!data) return;
    setName((data as any).name ?? user?.name ?? '');
    setPhone((data as any).phone ?? '');
    setAvatar((data as any).avatar ?? user?.avatar ?? '');
  }, [data, user?.avatar, user?.name]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Settings</h1>
          <p className="text-sm text-muted-foreground">Parent profile</p>
        </div>
        <button onClick={() => refetch()} className="rounded-lg border px-3 py-2 text-sm hover:bg-muted">Refresh</button>
      </div>

      {isLoading && <div className="text-sm text-muted-foreground">Loading…</div>}
      {error && <div className="text-sm text-destructive">Failed to load settings.</div>}

      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1">
            <span className="text-xs text-muted-foreground">Name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-md border bg-background px-2 py-2 text-sm" />
          </label>
          <label className="space-y-1">
            <span className="text-xs text-muted-foreground">Phone</span>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-md border bg-background px-2 py-2 text-sm" />
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className="text-xs text-muted-foreground">Avatar URL</span>
            <input value={avatar ?? ''} onChange={(e) => setAvatar(e.target.value)} className="w-full rounded-md border bg-background px-2 py-2 text-sm" placeholder="https://…" />
          </label>
        </div>
        <div className="mt-3 flex justify-end">
          <button
            disabled={update.isPending}
            onClick={async () => {
              await update.mutateAsync({ name, phone, avatar: avatar || undefined });
            }}
            className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {update.isPending ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {children.length > 1 && (
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-sm font-semibold">Default child</p>
          <p className="text-xs text-muted-foreground">This portal remembers your last selected child on this device.</p>
          <select value={studentId} onChange={(e) => setStudentId(e.target.value)} className="mt-2 w-full rounded-md border bg-background px-2 py-2 text-sm">
            {children.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      )}

      <Link href="/parent/dashboard" className="text-sm font-medium text-primary hover:underline">Back to dashboard</Link>
    </div>
  );
}

