'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useBooks, useCreateBook, useDeleteBook, useUpdateBook } from '@/hooks/use-api';
import { cn, formatDate } from '@/lib/utils';

export default function ManagementLibraryPage() {
  const [search, setSearch] = useState('');
  const { data, isLoading, error, refetch } = useBooks(search ? { search } : undefined);
  const rows = useMemo(() => (data as any)?.data ?? (data as any)?.items ?? (Array.isArray(data) ? data : []), [data]);

  const create = useCreateBook();
  const [form, setForm] = useState({
    title: '',
    author: '',
    category: '',
    totalCopies: 1,
    isbn: '',
    publishYear: undefined as number | undefined,
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const update = useUpdateBook(editingId ?? '');
  const del = useDeleteBook(editingId ?? '');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Library</h1>
          <p className="text-sm text-muted-foreground">Books catalog</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => refetch()} className="rounded-lg border px-3 py-2 text-sm hover:bg-muted">
            Refresh
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search title/author/category…"
          className="h-10 w-full max-w-md rounded-lg border bg-muted/30 px-3 text-sm"
        />
        <button onClick={() => refetch()} className="h-10 rounded-lg border px-3 text-sm hover:bg-muted">
          Search
        </button>
      </div>

      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <p className="text-sm font-semibold">Add book</p>
        <div className="mt-3 grid gap-2 md:grid-cols-6">
          <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Title" className="h-10 rounded-lg border bg-muted/30 px-3 text-sm md:col-span-2" />
          <input value={form.author} onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
            placeholder="Author" className="h-10 rounded-lg border bg-muted/30 px-3 text-sm" />
          <input value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            placeholder="Category" className="h-10 rounded-lg border bg-muted/30 px-3 text-sm" />
          <input type="number" min={1} value={form.totalCopies} onChange={(e) => setForm((f) => ({ ...f, totalCopies: Number(e.target.value) }))}
            className="h-10 rounded-lg border bg-muted/30 px-3 text-sm" />
          <button
            disabled={!form.title || !form.author || create.isPending}
            onClick={async () => {
              await create.mutateAsync({
                title: form.title,
                author: form.author,
                category: form.category || undefined,
                totalCopies: form.totalCopies,
                isbn: form.isbn || undefined,
                publishYear: form.publishYear,
              } as any);
              setForm({ title: '', author: '', category: '', totalCopies: 1, isbn: '', publishYear: undefined });
              refetch();
            }}
            className="h-10 rounded-lg bg-primary px-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {create.isPending ? 'Saving…' : 'Add'}
          </button>
        </div>
      </div>

      {isLoading && <div className="text-sm text-muted-foreground">Loading…</div>}
      {error && <div className="text-sm text-destructive">Failed to load books.</div>}

      <div className="overflow-hidden rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Title</th>
              <th className="px-4 py-3 text-left">Author</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-right">Available</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows?.length ? rows.map((b: any) => (
              <tr key={b.id} className="border-t">
                <td className="px-4 py-3 font-medium">{b.title}</td>
                <td className="px-4 py-3 text-muted-foreground">{b.author ?? '—'}</td>
                <td className="px-4 py-3">{b.category ?? '—'}</td>
                <td className="px-4 py-3 text-right">{b.availableCopies ?? '—'}</td>
                <td className="px-4 py-3 text-right">{b.totalCopies ?? '—'}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => setEditingId(b.id)}
                    className="rounded-lg border px-2 py-1 text-xs hover:bg-muted"
                  >
                    Edit/Delete
                  </button>
                </td>
              </tr>
            )) : (
              !isLoading && (
                <tr>
                  <td className="px-4 py-6 text-sm text-muted-foreground" colSpan={6}>
                    No books found.
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      {/* simple modal */}
      {editingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-lg rounded-xl border bg-card p-5 shadow-lg">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Edit book</p>
              <button onClick={() => setEditingId(null)} className="text-sm text-muted-foreground hover:text-foreground">
                Close
              </button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Quick actions for this book.</p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                disabled={del.isPending}
                onClick={async () => { await del.mutateAsync(undefined); setEditingId(null); refetch(); }}
                className={cn('rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive', del.isPending && 'opacity-60')}
              >
                {del.isPending ? 'Deleting…' : 'Delete'}
              </button>
              <button
                disabled={update.isPending}
                onClick={async () => { await update.mutateAsync({} as any); setEditingId(null); refetch(); }}
                className="rounded-lg border px-3 py-2 text-sm hover:bg-muted disabled:opacity-60"
                title="Wire full edit form next"
              >
                {update.isPending ? 'Saving…' : 'Save (noop)'}
              </button>
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Last updated: {formatDate(new Date(), 'short')}
      </p>

      <Link href="/management/dashboard" className="text-sm font-medium text-primary hover:underline">
        Back to dashboard
      </Link>
    </div>
  );
}

