'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  useStudent,
  useUpdateStudent,
  useStudentDocuments,
  useUploadStudentDocument,
  useDeactivateStudent,
} from '@/hooks/use-api';
import { formatDate } from '@/lib/utils';

export default function StudentDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const { data, isLoading, error, refetch } = useStudent(id);
  const update = useUpdateStudent(id);
  const deactivate = useDeactivateStudent(id);
  const { data: docs, refetch: refetchDocs } = useStudentDocuments(id);
  const upload = useUploadStudentDocument(id);

  const [edit, setEdit] = useState(false);
  const [docType, setDocType] = useState('OTHER');
  const [file, setFile] = useState<File | null>(null);

  const form = useMemo(() => ({
    name: data?.name ?? '',
    email: data?.email ?? '',
    phone: (data as any)?.phone ?? '',
    rollNumber: (data as any)?.rollNumber ?? '',
    admissionNumber: (data as any)?.admissionNumber ?? '',
    fatherName: (data as any)?.fatherName ?? '',
    fatherPhone: (data as any)?.fatherPhone ?? '',
    parentEmail: (data as any)?.parentEmail ?? '',
    gender: (data as any)?.gender ?? 'MALE',
    dateOfBirth: (data as any)?.dateOfBirth?.slice?.(0, 10) ?? '',
  }), [data]);

  const [draft, setDraft] = useState(form);

  // Keep draft in sync when student loads
  if (!edit && JSON.stringify(draft) !== JSON.stringify(form) && data) {
    // eslint-disable-next-line react/no-this-in-sfc
    setDraft(form);
  }

  const docRows = (docs as any)?.items ?? (docs as any)?.data ?? (Array.isArray(docs) ? docs : []);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Student</h1>
          <p className="text-sm text-muted-foreground">{id}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/management/students" className="rounded-lg border px-3 py-2 text-sm hover:bg-muted">
            Back
          </Link>
          <button onClick={() => refetch()} className="rounded-lg border px-3 py-2 text-sm hover:bg-muted">
            Refresh
          </button>
        </div>
      </div>

      {isLoading && <div className="text-sm text-muted-foreground">Loading…</div>}
      {error && <div className="text-sm text-destructive">Failed to load student.</div>}

      {data && (
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">{data.name}</p>
              <p className="text-xs text-muted-foreground">
                {data.class?.name ?? '—'} · {data.section?.name ?? '—'} · Active: {(data as any).isActive ? 'Yes' : 'No'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {!edit ? (
                <button onClick={() => setEdit(true)} className="rounded-lg border px-3 py-2 text-sm hover:bg-muted">
                  Edit
                </button>
              ) : (
                <>
                  <button
                    onClick={() => { setEdit(false); setDraft(form); }}
                    className="rounded-lg border px-3 py-2 text-sm hover:bg-muted"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={update.isPending}
                    onClick={async () => {
                      await update.mutateAsync(draft as any);
                      setEdit(false);
                    }}
                    className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    {update.isPending ? 'Saving…' : 'Save'}
                  </button>
                </>
              )}
              <button
                disabled={deactivate.isPending}
                onClick={async () => {
                  if (!confirm('Deactivate this student?')) return;
                  await deactivate.mutateAsync(undefined);
                  refetch();
                }}
                className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive hover:bg-destructive/15 disabled:opacity-60"
              >
                {deactivate.isPending ? 'Working…' : 'Deactivate'}
              </button>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {([
              ['Name', 'name'],
              ['Email', 'email'],
              ['Phone', 'phone'],
              ['Admission No.', 'admissionNumber'],
              ['Roll No.', 'rollNumber'],
              ['Gender', 'gender'],
              ['DOB', 'dateOfBirth'],
              ['Father Name', 'fatherName'],
              ['Father Phone', 'fatherPhone'],
              ['Parent Email', 'parentEmail'],
            ] as const).map(([label, key]) => (
              <label key={key} className="space-y-1 text-sm">
                <span className="text-xs text-muted-foreground">{label}</span>
                <input
                  disabled={!edit}
                  value={(draft as any)[key] ?? ''}
                  onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))}
                  className="h-10 w-full rounded-lg border bg-muted/30 px-3 disabled:opacity-70"
                />
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Documents */}
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">Documents</p>
            <p className="text-xs text-muted-foreground">Upload and view student documents</p>
          </div>
          <button onClick={() => refetchDocs()} className="rounded-lg border px-3 py-2 text-sm hover:bg-muted">
            Refresh
          </button>
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <label className="space-y-1 text-sm">
            <span className="text-xs text-muted-foreground">Type</span>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="h-10 w-full rounded-lg border bg-background px-3"
            >
              <option value="AADHAR">AADHAR</option>
              <option value="BIRTH_CERTIFICATE">BIRTH_CERTIFICATE</option>
              <option value="TRANSFER_CERTIFICATE">TRANSFER_CERTIFICATE</option>
              <option value="OTHER">OTHER</option>
            </select>
          </label>
          <label className="space-y-1 text-sm md:col-span-2">
            <span className="text-xs text-muted-foreground">File</span>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="h-10 w-full rounded-lg border bg-background px-3 py-1.5 text-sm"
            />
          </label>
        </div>
        <div className="mt-3 flex justify-end">
          <button
            disabled={!file || upload.isPending}
            onClick={async () => {
              if (!file) return;
              await upload.mutateAsync({ file, docType });
              setFile(null);
              refetchDocs();
            }}
            className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {upload.isPending ? 'Uploading…' : 'Upload'}
          </button>
        </div>

        <div className="mt-4 space-y-2">
          {Array.isArray(docRows) && docRows.length ? docRows.map((d: any) => (
            <div key={d.id ?? d.key ?? d.url} className="flex items-center justify-between rounded-lg border bg-muted/20 px-3 py-2 text-sm">
              <div className="min-w-0">
                <p className="truncate font-medium">{d.docType ?? d.type ?? 'Document'}</p>
                <p className="text-xs text-muted-foreground">
                  {d.createdAt ? formatDate(d.createdAt, 'short') : ''}
                </p>
              </div>
              {d.url ? (
                <a href={d.url} target="_blank" className="text-sm font-medium text-primary hover:underline" rel="noreferrer">
                  Open
                </a>
              ) : (
                <span className="text-xs text-muted-foreground">No URL</span>
              )}
            </div>
          )) : (
            <p className="text-sm text-muted-foreground">No documents uploaded.</p>
          )}
        </div>
      </div>
    </div>
  );
}

