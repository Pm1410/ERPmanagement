'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useCreateFeeHead, useFeeHeads } from '@/hooks/use-api';

export default function ManagementFeeHeadsPage() {
  const { data, isLoading, error, refetch } = useFeeHeads();
  const create = useCreateFeeHead();
  const rows = useMemo(() => (Array.isArray(data) ? data : (data?.items ?? data?.data ?? [])), [data]);
  const [form, setForm] = useState({ name: '', description: '' });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Fee Heads</h1>
          <p className="text-sm text-muted-foreground">Configure fee head categories</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/management/finance" className="rounded-lg border px-3 py-2 text-sm hover:bg-muted">
            Back
          </Link>
          <button onClick={() => refetch()} className="rounded-lg border px-3 py-2 text-sm hover:bg-muted">
            Refresh
          </button>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <p className="text-sm font-semibold">Create fee head</p>
        <div className="mt-3 grid gap-2 md:grid-cols-4">
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Name"
            className="h-10 rounded-lg border bg-muted/30 px-3 text-sm"
          />
          <input
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Description"
            className="h-10 rounded-lg border bg-muted/30 px-3 text-sm md:col-span-2"
          />
          <button
            disabled={!form.name || create.isPending}
            onClick={async () => {
              await create.mutateAsync(form as any);
              setForm({ name: '', description: '' });
              refetch();
            }}
            className="h-10 rounded-lg bg-primary px-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {create.isPending ? 'Creating…' : 'Create'}
          </button>
        </div>
      </div>

      {isLoading && <div className="text-sm text-muted-foreground">Loading…</div>}
      {error && <div className="text-sm text-destructive">Failed to load fee heads.</div>}

      <div className="overflow-hidden rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Description</th>
              <th className="px-4 py-3 text-left">ID</th>
            </tr>
          </thead>
          <tbody>
            {rows?.length ? rows.map((h: any) => (
              <tr key={h.id} className="border-t">
                <td className="px-4 py-3 font-medium">{h.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{h.description ?? '—'}</td>
                <td className="px-4 py-3 text-muted-foreground">{h.id}</td>
              </tr>
            )) : (
              !isLoading && (
                <tr>
                  <td className="px-4 py-6 text-sm text-muted-foreground" colSpan={3}>
                    No fee heads.
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

