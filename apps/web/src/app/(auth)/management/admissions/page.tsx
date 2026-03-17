'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  useAdmissionApplications,
  useAdmissionEnquiries,
  useCreateAdmissionApplication,
  useCreateAdmissionEnquiry,
  useUpdateAdmissionApplication,
  useUpdateAdmissionEnquiry,
} from '@/hooks/use-api';
import { formatDate } from '@/lib/utils';

export default function ManagementAdmissionsPage() {
  const [tab, setTab] = useState<'enquiries' | 'applications'>('enquiries');
  const [search, setSearch] = useState('');

  const enquiriesQ = useAdmissionEnquiries(search ? { search } : undefined);
  const applicationsQ = useAdmissionApplications(search ? { search } : undefined);

  const enquiries = useMemo(() => enquiriesQ.data ?? [], [enquiriesQ.data]);
  const applications = useMemo(() => applicationsQ.data ?? [], [applicationsQ.data]);

  const createEnquiry = useCreateAdmissionEnquiry();
  const createApplication = useCreateAdmissionApplication();

  const [enquiryForm, setEnquiryForm] = useState({
    parentName: '',
    parentPhone: '',
    childName: '',
    classInterested: '',
    source: 'WALK_IN',
    status: 'NEW',
  });
  const [appForm, setAppForm] = useState({
    applicationNo: '',
    studentName: '',
    dateOfBirth: '',
    classApplied: '',
    status: 'PENDING',
  });

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Admissions</h1>
          <p className="text-sm text-muted-foreground">Enquiries and applications</p>
        </div>
        <Link href="/management/dashboard" className="rounded-lg border px-3 py-2 text-sm hover:bg-muted">
          Back
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setTab('enquiries')}
          className={`rounded-lg border px-3 py-2 text-sm ${tab === 'enquiries' ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}`}
        >
          Enquiries
        </button>
        <button
          onClick={() => setTab('applications')}
          className={`rounded-lg border px-3 py-2 text-sm ${tab === 'applications' ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}`}
        >
          Applications
        </button>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search…"
          className="ml-auto h-10 w-full max-w-sm rounded-lg border bg-muted/30 px-3 text-sm"
        />
      </div>

      {tab === 'enquiries' ? (
        <>
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <p className="text-sm font-semibold">Create enquiry</p>
            <div className="mt-3 grid gap-2 md:grid-cols-6">
              <input value={enquiryForm.parentName} onChange={(e) => setEnquiryForm((f) => ({ ...f, parentName: e.target.value }))}
                placeholder="Parent name" className="h-10 rounded-lg border bg-muted/30 px-3 text-sm md:col-span-2" />
              <input value={enquiryForm.parentPhone} onChange={(e) => setEnquiryForm((f) => ({ ...f, parentPhone: e.target.value }))}
                placeholder="Parent phone" className="h-10 rounded-lg border bg-muted/30 px-3 text-sm" />
              <input value={enquiryForm.childName} onChange={(e) => setEnquiryForm((f) => ({ ...f, childName: e.target.value }))}
                placeholder="Child name" className="h-10 rounded-lg border bg-muted/30 px-3 text-sm" />
              <input value={enquiryForm.classInterested} onChange={(e) => setEnquiryForm((f) => ({ ...f, classInterested: e.target.value }))}
                placeholder="Class interested" className="h-10 rounded-lg border bg-muted/30 px-3 text-sm" />
              <button
                disabled={createEnquiry.isPending || !enquiryForm.parentName || !enquiryForm.parentPhone || !enquiryForm.childName}
                onClick={async () => {
                  await createEnquiry.mutateAsync(enquiryForm as any);
                  setEnquiryForm({ parentName: '', parentPhone: '', childName: '', classInterested: '', source: 'WALK_IN', status: 'NEW' });
                  enquiriesQ.refetch();
                }}
                className="h-10 rounded-lg bg-primary px-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {createEnquiry.isPending ? 'Saving…' : 'Create'}
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Parent</th>
                  <th className="px-4 py-3 text-left">Phone</th>
                  <th className="px-4 py-3 text-left">Child</th>
                  <th className="px-4 py-3 text-left">Class</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Created</th>
                </tr>
              </thead>
              <tbody>
                {enquiries.map((e: any) => (
                  <tr key={e.id} className="border-t">
                    <td className="px-4 py-3 font-medium">{e.parentName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{e.parentPhone}</td>
                    <td className="px-4 py-3">{e.childName}</td>
                    <td className="px-4 py-3">{e.classInterested}</td>
                    <td className="px-4 py-3">{e.status}</td>
                    <td className="px-4 py-3 text-muted-foreground">{e.createdAt ? formatDate(e.createdAt, 'short') : '—'}</td>
                  </tr>
                ))}
                {!enquiries.length && (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-sm text-muted-foreground">No enquiries.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <>
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <p className="text-sm font-semibold">Create application</p>
            <div className="mt-3 grid gap-2 md:grid-cols-6">
              <input value={appForm.applicationNo} onChange={(e) => setAppForm((f) => ({ ...f, applicationNo: e.target.value }))}
                placeholder="Application #" className="h-10 rounded-lg border bg-muted/30 px-3 text-sm" />
              <input value={appForm.studentName} onChange={(e) => setAppForm((f) => ({ ...f, studentName: e.target.value }))}
                placeholder="Student name" className="h-10 rounded-lg border bg-muted/30 px-3 text-sm md:col-span-2" />
              <input type="date" value={appForm.dateOfBirth} onChange={(e) => setAppForm((f) => ({ ...f, dateOfBirth: e.target.value }))}
                className="h-10 rounded-lg border bg-background px-3 text-sm" />
              <input value={appForm.classApplied} onChange={(e) => setAppForm((f) => ({ ...f, classApplied: e.target.value }))}
                placeholder="Class applied" className="h-10 rounded-lg border bg-muted/30 px-3 text-sm" />
              <button
                disabled={createApplication.isPending || !appForm.applicationNo || !appForm.studentName || !appForm.dateOfBirth}
                onClick={async () => {
                  await createApplication.mutateAsync(appForm as any);
                  setAppForm({ applicationNo: '', studentName: '', dateOfBirth: '', classApplied: '', status: 'PENDING' });
                  applicationsQ.refetch();
                }}
                className="h-10 rounded-lg bg-primary px-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {createApplication.isPending ? 'Saving…' : 'Create'}
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Application #</th>
                  <th className="px-4 py-3 text-left">Student</th>
                  <th className="px-4 py-3 text-left">DOB</th>
                  <th className="px-4 py-3 text-left">Class</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((a: any) => (
                  <tr key={a.id} className="border-t">
                    <td className="px-4 py-3 font-medium">{a.applicationNo}</td>
                    <td className="px-4 py-3">{a.studentName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{String(a.dateOfBirth).slice(0, 10)}</td>
                    <td className="px-4 py-3">{a.classApplied}</td>
                    <td className="px-4 py-3">{a.status}</td>
                  </tr>
                ))}
                {!applications.length && (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-sm text-muted-foreground">No applications.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

