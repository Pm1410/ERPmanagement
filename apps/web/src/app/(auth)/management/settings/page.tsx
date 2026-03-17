'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  useInstitutionSettings,
  useUpdateInstitutionSettings,
  useNotificationStatus,
  useSecuritySettings,
  useTestEmail,
  useTestSms,
} from '@/hooks/use-api';
import { cn } from '@/lib/utils';

export default function ManagementSettingsPage() {
  const { data: inst, isLoading: instLoading, error: instErr, refetch: refetchInst } = useInstitutionSettings();
  const updateInst = useUpdateInstitutionSettings();

  const { data: sec } = useSecuritySettings();
  const { data: notif, refetch: refetchNotif } = useNotificationStatus();
  const testEmail = useTestEmail();
  const testSms = useTestSms();

  const [tab, setTab] = useState<'institution' | 'notifications' | 'security'>('institution');

  const initial = useMemo(() => ({
    name: inst?.name ?? '',
    address: inst?.address ?? '',
    phone: inst?.phone ?? '',
    email: inst?.email ?? '',
    website: inst?.website ?? '',
    logo: inst?.logo ?? '',
  }), [inst]);

  const [form, setForm] = useState(initial);
  useEffect(() => setForm(initial), [initial]);

  const [testEmailTo, setTestEmailTo] = useState('');
  const [testSmsTo, setTestSmsTo] = useState('');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Management Settings</h1>
          <p className="text-sm text-muted-foreground">Institution, notifications, and security</p>
        </div>
        <button onClick={() => { refetchInst(); refetchNotif(); }} className="rounded-lg border px-3 py-2 text-sm hover:bg-muted">
          Refresh
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { id: 'institution', label: 'Institution' },
          { id: 'notifications', label: 'Notifications' },
          { id: 'security', label: 'Security' },
        ].map((t: any) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'rounded-lg border px-3 py-2 text-sm',
              tab === t.id ? 'bg-primary/10 border-primary/30 text-primary font-semibold' : 'hover:bg-muted',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'institution' && (
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          {instLoading && <div className="text-sm text-muted-foreground">Loading…</div>}
          {instErr && <div className="text-sm text-destructive">Failed to load institution settings.</div>}

          <div className="grid gap-3 md:grid-cols-2">
            {([
              ['Name', 'name'],
              ['Phone', 'phone'],
              ['Email', 'email'],
              ['Website', 'website'],
              ['Logo URL', 'logo'],
            ] as const).map(([label, key]) => (
              <label key={key} className={cn('space-y-1', key === 'name' || key === 'logo' ? 'md:col-span-2' : '')}>
                <span className="text-xs text-muted-foreground">{label}</span>
                <input
                  value={(form as any)[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="w-full rounded-md border bg-background px-2 py-2 text-sm"
                />
              </label>
            ))}
            <label className="space-y-1 md:col-span-2">
              <span className="text-xs text-muted-foreground">Address</span>
              <textarea
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                className="min-h-24 w-full rounded-md border bg-background px-2 py-2 text-sm"
              />
            </label>
          </div>

          <div className="mt-3 flex justify-end gap-2">
            <button onClick={() => setForm(initial)} className="rounded-lg border px-3 py-2 text-sm hover:bg-muted">
              Reset
            </button>
            <button
              disabled={updateInst.isPending}
              onClick={async () => { await updateInst.mutateAsync(form as any); }}
              className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {updateInst.isPending ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      )}

      {tab === 'notifications' && (
        <div className="rounded-xl border bg-card p-4 shadow-sm space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border bg-muted/10 p-4">
              <p className="text-xs text-muted-foreground">Email provider</p>
              <p className="mt-1 text-lg font-bold">{notif?.emailProvider ?? '—'}</p>
            </div>
            <div className="rounded-xl border bg-muted/10 p-4">
              <p className="text-xs text-muted-foreground">SMS provider</p>
              <p className="mt-1 text-lg font-bold">{notif?.smsProvider ?? '—'}</p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-1">
              <span className="text-xs text-muted-foreground">Test email (to)</span>
              <input value={testEmailTo} onChange={(e) => setTestEmailTo(e.target.value)} className="w-full rounded-md border bg-background px-2 py-2 text-sm" />
              <button
                disabled={!testEmailTo || testEmail.isPending}
                onClick={async () => { await testEmail.mutateAsync({ to: testEmailTo, subject: 'Test email', message: 'Hello from ERP Settings.' }); }}
                className="mt-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {testEmail.isPending ? 'Queuing…' : 'Send test email'}
              </button>
            </label>
            <label className="space-y-1">
              <span className="text-xs text-muted-foreground">Test SMS (to)</span>
              <input value={testSmsTo} onChange={(e) => setTestSmsTo(e.target.value)} className="w-full rounded-md border bg-background px-2 py-2 text-sm" />
              <button
                disabled={!testSmsTo || testSms.isPending}
                onClick={async () => { await testSms.mutateAsync({ to: testSmsTo, message: 'Hello from ERP Settings.' }); }}
                className="mt-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {testSms.isPending ? 'Queuing…' : 'Send test SMS'}
              </button>
            </label>
          </div>

          <div className="rounded-xl border bg-muted/10 p-4">
            <p className="text-sm font-semibold">Queue</p>
            <pre className="mt-2 overflow-auto rounded-lg bg-background/50 p-3 text-xs">{JSON.stringify(notif?.queue ?? {}, null, 2)}</pre>
          </div>
        </div>
      )}

      {tab === 'security' && (
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-sm font-semibold">Read-only security settings</p>
          <pre className="mt-3 overflow-auto rounded-lg bg-muted/20 p-3 text-xs">{JSON.stringify(sec ?? {}, null, 2)}</pre>
        </div>
      )}

      <Link href="/management/dashboard" className="text-sm font-medium text-primary hover:underline">
        Back to dashboard
      </Link>
    </div>
  );
}

