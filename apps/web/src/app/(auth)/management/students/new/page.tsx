'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAcademicYears, useClasses, useCreateStudent, useSections } from '@/hooks/use-api';

export default function NewStudentPage() {
  const router = useRouter();
  const create = useCreateStudent();

  const { data: years } = useAcademicYears();
  const academicYearId = years?.find((y: any) => y.isCurrent)?.id ?? years?.[0]?.id ?? '';
  const { data: classes } = useClasses(academicYearId);

  const [classId, setClassId] = useState<string>(classes?.[0]?.id ?? '');
  const { data: sections } = useSections(classId);

  const [sectionId, setSectionId] = useState<string>('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    gender: 'MALE',
    dateOfBirth: '',
    admissionNumber: '',
    rollNumber: '',
    fatherName: '',
    fatherPhone: '',
    parentEmail: '',
  });

  const sectionOptions = useMemo(() => sections ?? [], [sections]);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Add student</h1>
          <p className="text-sm text-muted-foreground">Create a new student profile</p>
        </div>
        <Link href="/management/students" className="text-sm font-medium text-primary hover:underline">
          Back to students
        </Link>
      </div>

      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span className="text-xs text-muted-foreground">Full name</span>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="h-10 w-full rounded-lg border bg-muted/30 px-3"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-xs text-muted-foreground">Email</span>
            <input
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="h-10 w-full rounded-lg border bg-muted/30 px-3"
            />
          </label>

          <label className="space-y-1 text-sm">
            <span className="text-xs text-muted-foreground">Phone</span>
            <input
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className="h-10 w-full rounded-lg border bg-muted/30 px-3"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-xs text-muted-foreground">Gender</span>
            <select
              value={form.gender}
              onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
              className="h-10 w-full rounded-lg border bg-background px-3"
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </label>

          <label className="space-y-1 text-sm">
            <span className="text-xs text-muted-foreground">Date of birth</span>
            <input
              type="date"
              value={form.dateOfBirth}
              onChange={(e) => setForm((f) => ({ ...f, dateOfBirth: e.target.value }))}
              className="h-10 w-full rounded-lg border bg-background px-3"
            />
          </label>
          <div />

          <label className="space-y-1 text-sm">
            <span className="text-xs text-muted-foreground">Class</span>
            <select
              value={classId}
              onChange={(e) => { setClassId(e.target.value); setSectionId(''); }}
              className="h-10 w-full rounded-lg border bg-background px-3"
            >
              {(classes ?? []).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-xs text-muted-foreground">Section</span>
            <select
              value={sectionId}
              onChange={(e) => setSectionId(e.target.value)}
              className="h-10 w-full rounded-lg border bg-background px-3"
            >
              <option value="">—</option>
              {sectionOptions.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </label>

          <label className="space-y-1 text-sm">
            <span className="text-xs text-muted-foreground">Admission no.</span>
            <input
              value={form.admissionNumber}
              onChange={(e) => setForm((f) => ({ ...f, admissionNumber: e.target.value }))}
              className="h-10 w-full rounded-lg border bg-muted/30 px-3"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-xs text-muted-foreground">Roll no.</span>
            <input
              value={form.rollNumber}
              onChange={(e) => setForm((f) => ({ ...f, rollNumber: e.target.value }))}
              className="h-10 w-full rounded-lg border bg-muted/30 px-3"
            />
          </label>

          <label className="space-y-1 text-sm">
            <span className="text-xs text-muted-foreground">Father name</span>
            <input
              value={form.fatherName}
              onChange={(e) => setForm((f) => ({ ...f, fatherName: e.target.value }))}
              className="h-10 w-full rounded-lg border bg-muted/30 px-3"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-xs text-muted-foreground">Father phone</span>
            <input
              value={form.fatherPhone}
              onChange={(e) => setForm((f) => ({ ...f, fatherPhone: e.target.value }))}
              className="h-10 w-full rounded-lg border bg-muted/30 px-3"
            />
          </label>

          <label className="space-y-1 text-sm md:col-span-2">
            <span className="text-xs text-muted-foreground">Parent email</span>
            <input
              value={form.parentEmail}
              onChange={(e) => setForm((f) => ({ ...f, parentEmail: e.target.value }))}
              className="h-10 w-full rounded-lg border bg-muted/30 px-3"
            />
          </label>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <Link href="/management/students" className="rounded-lg border px-3 py-2 text-sm hover:bg-muted">
            Cancel
          </Link>
          <button
            disabled={create.isPending}
            onClick={async () => {
              const created = await create.mutateAsync({
                ...form,
                classId,
                sectionId,
              } as any);
              const id = (created as any)?.id ?? (created as any)?.student?.id;
              if (id) router.replace(`/management/students/${id}`);
              else router.replace('/management/students');
            }}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {create.isPending ? 'Saving…' : 'Create student'}
          </button>
        </div>
      </div>
    </div>
  );
}

