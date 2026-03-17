'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useAcademicYears, useClasses, useCreateClass, useCreateSection, useSections } from '@/hooks/use-api';

export default function ManagementClassesPage() {
  const { data: years } = useAcademicYears();
  const current = years?.find((y: any) => y.isCurrent)?.id ?? years?.[0]?.id;
  const [yearId, setYearId] = useState<string | undefined>(current);

  const { data: classes, isLoading, error, refetch } = useClasses(yearId);
  const createClass = useCreateClass();
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const { data: sections } = useSections(selectedClassId);
  const createSection = useCreateSection();

  const yearOptions = useMemo(() => years ?? [], [years]);
  const [newClassName, setNewClassName] = useState('');
  const [newSectionName, setNewSectionName] = useState('');
  const [maxStrength, setMaxStrength] = useState<number>(40);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Classes & Sections</h1>
          <p className="text-sm text-muted-foreground">Academic structure</p>
        </div>
        <button onClick={() => refetch()} className="rounded-lg border px-3 py-2 text-sm hover:bg-muted">
          Refresh
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <label className="rounded-xl border bg-card p-4">
          <span className="text-xs text-muted-foreground">Academic year</span>
          <select
            value={yearId}
            onChange={(e) => { setYearId(e.target.value); setSelectedClassId(''); }}
            className="mt-1 w-full rounded-md border bg-background px-2 py-2 text-sm"
          >
            {yearOptions.map((y: any) => <option key={y.id} value={y.id}>{y.name}{y.isCurrent ? ' (current)' : ''}</option>)}
          </select>
        </label>
        <label className="rounded-xl border bg-card p-4 md:col-span-2">
          <span className="text-xs text-muted-foreground">Select class (to view sections)</span>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="mt-1 w-full rounded-md border bg-background px-2 py-2 text-sm"
          >
            <option value="">—</option>
            {(classes ?? []).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
      </div>

      {isLoading && <div className="text-sm text-muted-foreground">Loading…</div>}
      {error && <div className="text-sm text-destructive">Failed to load classes.</div>}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-sm font-semibold">Create class</p>
          <div className="mt-2 flex gap-2">
            <input
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              placeholder="Class name"
              className="h-10 flex-1 rounded-lg border bg-muted/30 px-3 text-sm"
            />
            <button
              disabled={!yearId || !newClassName || createClass.isPending}
              onClick={async () => {
                await createClass.mutateAsync({ name: newClassName, academicYearId: String(yearId) });
                setNewClassName('');
                refetch();
              }}
              className="h-10 rounded-lg bg-primary px-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {createClass.isPending ? 'Creating…' : 'Create'}
            </button>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-sm font-semibold">Create section</p>
          <p className="text-xs text-muted-foreground">Requires selecting a class</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            <input
              value={newSectionName}
              onChange={(e) => setNewSectionName(e.target.value)}
              placeholder="Section name"
              className="h-10 rounded-lg border bg-muted/30 px-3 text-sm sm:col-span-2"
            />
            <input
              type="number"
              value={maxStrength}
              onChange={(e) => setMaxStrength(Number(e.target.value))}
              className="h-10 rounded-lg border bg-muted/30 px-3 text-sm"
            />
          </div>
          <div className="mt-2 flex justify-end">
            <button
              disabled={!selectedClassId || !newSectionName || createSection.isPending}
              onClick={async () => {
                await createSection.mutateAsync({ name: newSectionName, classId: selectedClassId, maxStrength });
                setNewSectionName('');
                refetch();
              }}
              className="h-10 rounded-lg bg-primary px-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {createSection.isPending ? 'Creating…' : 'Create'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="overflow-hidden rounded-xl border bg-card">
          <div className="border-b px-4 py-3 text-sm font-semibold">Classes</div>
          <div className="divide-y">
            {(classes ?? []).map((c: any) => (
              <button
                key={c.id}
                onClick={() => setSelectedClassId(c.id)}
                className="flex w-full items-center justify-between px-4 py-3 text-left text-sm hover:bg-muted/40"
              >
                <span className="font-medium">{c.name}</span>
                <span className="text-xs text-muted-foreground">{c.id}</span>
              </button>
            ))}
            {!isLoading && !(classes ?? []).length && (
              <div className="px-4 py-6 text-sm text-muted-foreground">No classes found.</div>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border bg-card">
          <div className="border-b px-4 py-3 text-sm font-semibold">Sections</div>
          <div className="divide-y">
            {(sections ?? []).map((s: any) => (
              <div key={s.id} className="px-4 py-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{s.name}</span>
                  <span className="text-xs text-muted-foreground">max {s.maxStrength ?? '—'}</span>
                </div>
              </div>
            ))}
            {!selectedClassId && (
              <div className="px-4 py-6 text-sm text-muted-foreground">Select a class to view sections.</div>
            )}
            {!!selectedClassId && !(sections ?? []).length && (
              <div className="px-4 py-6 text-sm text-muted-foreground">No sections found.</div>
            )}
          </div>
        </div>
      </div>

      <Link href="/management/dashboard" className="text-sm font-medium text-primary hover:underline">
        Back to dashboard
      </Link>
    </div>
  );
}

