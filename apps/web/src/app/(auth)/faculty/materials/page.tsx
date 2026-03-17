'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useDeleteMaterial, useMaterials, useMyFacultyProfile, useUploadMaterial } from '@/hooks/use-api';
import { cn, formatDate } from '@/lib/utils';

export default function FacultyMaterialsPage() {
  const { data: me, isLoading: loadingMe, error: meErr } = useMyFacultyProfile();
  const assignments = ((me as any)?.assignments ?? []) as any[];

  const options = useMemo(() => {
    const map = new Map<string, any>();
    for (const a of assignments) {
      const key = `${a.classId}:${a.sectionId}:${a.subjectId}`;
      if (!map.has(key)) map.set(key, a);
    }
    return Array.from(map.values());
  }, [assignments]);

  const [key, setKey] = useState<string>(() => {
    const a = options[0];
    return a ? `${a.classId}:${a.sectionId}:${a.subjectId}` : '';
  });
  const selected = useMemo(() => options.find((a) => `${a.classId}:${a.sectionId}:${a.subjectId}` === key), [options, key]);

  const classId = selected?.classId;
  const sectionId = selected?.sectionId;
  const subjectId = selected?.subjectId;

  const { data, isLoading, error, refetch } = useMaterials(classId ? { classId, sectionId, subjectId } : undefined);
  const upload = useUploadMaterial();
  const del = useDeleteMaterial();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const items = (data ?? []) as any[];

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Materials</h1>
      <p className="text-sm text-muted-foreground">Upload worksheets, notes and PDFs for your classes</p>

      <div className="flex justify-end">
        <button onClick={() => refetch()} className="rounded-lg border px-3 py-2 text-sm hover:bg-muted">
          Refresh
        </button>
      </div>

      {loadingMe && <div className="text-sm text-muted-foreground">Loading…</div>}
      {meErr && <div className="text-sm text-destructive">Failed to load faculty profile.</div>}

      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <p className="text-sm font-semibold">Upload material</p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <label className="space-y-1 md:col-span-2">
            <span className="text-xs text-muted-foreground">Class / Section / Subject</span>
            <select
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="w-full rounded-md border bg-background px-2 py-2 text-sm"
            >
              {options.map((a) => (
                <option key={`${a.classId}:${a.sectionId}:${a.subjectId}`} value={`${a.classId}:${a.sectionId}:${a.subjectId}`}>
                  {a.class?.name} · {a.section?.name} · {a.subject?.name}
                </option>
              ))}
            </select>
            {!options.length && !loadingMe && (
              <p className="mt-2 text-xs text-muted-foreground">No subject assignments yet. Ask admin to assign subjects.</p>
            )}
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className="text-xs text-muted-foreground">Title</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-md border bg-background px-2 py-2 text-sm"
              placeholder="e.g., Chapter 5 Notes (Photosynthesis)"
            />
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className="text-xs text-muted-foreground">Description (optional)</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-24 w-full rounded-md border bg-background px-2 py-2 text-sm"
              placeholder="Any instructions or context…"
            />
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className="text-xs text-muted-foreground">File</span>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="w-full rounded-md border bg-background px-2 py-2 text-sm"
            />
          </label>
        </div>
        <div className="mt-3 flex justify-end gap-2">
          <button
            onClick={() => { setTitle(''); setDescription(''); setFile(null); }}
            className="rounded-lg border px-3 py-2 text-sm hover:bg-muted"
          >
            Clear
          </button>
          <button
            disabled={!classId || !title || !file || upload.isPending}
            onClick={async () => {
              await upload.mutateAsync({
                title,
                description: description || undefined,
                classId: classId!,
                sectionId: sectionId || undefined,
                subjectId: subjectId || undefined,
                file: file!,
              });
              setTitle('');
              setDescription('');
              setFile(null);
              refetch();
            }}
            className={cn('rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white disabled:opacity-60')}
          >
            {upload.isPending ? 'Uploading…' : 'Upload'}
          </button>
        </div>
      </div>

      {isLoading && <div className="text-sm text-muted-foreground">Loading materials…</div>}
      {error && <div className="text-sm text-destructive">Failed to load materials.</div>}

      <div className="space-y-2">
        {items.length ? items.map((m: any) => (
          <div key={m.id} className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold">{m.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {m.class?.name} · {m.section?.name ?? 'All sections'} · {m.subject?.name ?? 'All subjects'}
                </p>
                {m.description ? <p className="mt-2 text-sm text-muted-foreground">{m.description}</p> : null}
                <a href={m.fileUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm font-medium text-primary hover:underline">
                  Download {m.fileName} →
                </a>
                <p className="mt-1 text-xs text-muted-foreground">Uploaded {formatDate(m.createdAt, 'short')}</p>
              </div>
              <button
                disabled={del.isPending}
                onClick={async () => { await del.mutateAsync(m.id); refetch(); }}
                className={cn('shrink-0 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive hover:bg-destructive/15 disabled:opacity-60')}
              >
                {del.isPending ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        )) : (
          !isLoading && <div className="text-sm text-muted-foreground">No materials uploaded yet.</div>
        )}
      </div>

      <Link href="/faculty/dashboard" className="text-sm font-medium text-primary hover:underline">
        Back to dashboard
      </Link>
    </div>
  );
}

