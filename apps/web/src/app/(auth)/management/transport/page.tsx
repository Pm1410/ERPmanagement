'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  useAddTransportStop,
  useAssignTransport,
  useCreateTransportRoute,
  useCreateTransportVehicle,
  useStudents,
  useTransportAssignments,
  useTransportRoutes,
  useTransportVehicles,
  useUnassignTransport,
} from '@/hooks/use-api';
import { cn, formatDate } from '@/lib/utils';

export default function ManagementTransportPage() {
  const vehiclesQ = useTransportVehicles();
  const routesQ = useTransportRoutes();
  const assignmentsQ = useTransportAssignments('ACTIVE');

  const vehicles = useMemo(() => vehiclesQ.data ?? [], [vehiclesQ.data]);
  const routes = useMemo(() => routesQ.data ?? [], [routesQ.data]);
  const assignments = useMemo(() => assignmentsQ.data ?? [], [assignmentsQ.data]);

  const createVehicle = useCreateTransportVehicle();
  const createRoute = useCreateTransportRoute();
  const addStop = useAddTransportStop();
  const assign = useAssignTransport();
  const unassign = useUnassignTransport();

  const [vehicleForm, setVehicleForm] = useState({ vehicleNo: '', type: 'BUS', capacity: 40, driverName: '', driverPhone: '' });
  const [routeForm, setRouteForm] = useState({ name: '', vehicleId: '' });
  const [stopForm, setStopForm] = useState({ routeId: '', name: '', order: 0, pickupTime: '', dropTime: '' });

  const [studentSearch, setStudentSearch] = useState('');
  const studentsRes = useStudents(studentSearch ? { q: studentSearch } : undefined);
  const students = (studentsRes.data as any)?.data ?? (studentsRes.data as any)?.items ?? (Array.isArray(studentsRes.data) ? studentsRes.data : []);
  const [assignForm, setAssignForm] = useState({ studentId: '', routeId: '', stopId: '' });

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Transport</h1>
          <p className="text-sm text-muted-foreground">Vehicles, routes, stops, and student assignments</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { vehiclesQ.refetch(); routesQ.refetch(); assignmentsQ.refetch(); }}
            className="rounded-lg border px-3 py-2 text-sm hover:bg-muted"
          >
            Refresh
          </button>
          <Link href="/management/dashboard" className="rounded-lg border px-3 py-2 text-sm hover:bg-muted">
            Back
          </Link>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <p className="text-sm font-semibold">Create vehicle</p>
          <div className="mt-3 grid gap-2 md:grid-cols-5">
            <input value={vehicleForm.vehicleNo} onChange={(e) => setVehicleForm((f) => ({ ...f, vehicleNo: e.target.value }))}
              placeholder="Vehicle no" className="h-10 rounded-lg border bg-muted/30 px-3 text-sm" />
            <input value={vehicleForm.driverName} onChange={(e) => setVehicleForm((f) => ({ ...f, driverName: e.target.value }))}
              placeholder="Driver" className="h-10 rounded-lg border bg-muted/30 px-3 text-sm" />
            <input value={vehicleForm.driverPhone} onChange={(e) => setVehicleForm((f) => ({ ...f, driverPhone: e.target.value }))}
              placeholder="Driver phone" className="h-10 rounded-lg border bg-muted/30 px-3 text-sm" />
            <input type="number" min={1} value={vehicleForm.capacity} onChange={(e) => setVehicleForm((f) => ({ ...f, capacity: Number(e.target.value) }))}
              className="h-10 rounded-lg border bg-muted/30 px-3 text-sm" />
            <button
              disabled={!vehicleForm.vehicleNo || createVehicle.isPending}
              onClick={async () => {
                await createVehicle.mutateAsync(vehicleForm as any);
                setVehicleForm({ vehicleNo: '', type: 'BUS', capacity: 40, driverName: '', driverPhone: '' });
                vehiclesQ.refetch();
              }}
              className="h-10 rounded-lg bg-primary px-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {createVehicle.isPending ? 'Saving…' : 'Create'}
            </button>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <p className="text-sm font-semibold">Create route</p>
          <div className="mt-3 grid gap-2 md:grid-cols-4">
            <input value={routeForm.name} onChange={(e) => setRouteForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Route name" className="h-10 rounded-lg border bg-muted/30 px-3 text-sm md:col-span-2" />
            <select value={routeForm.vehicleId} onChange={(e) => setRouteForm((f) => ({ ...f, vehicleId: e.target.value }))}
              className="h-10 rounded-lg border bg-background px-3 text-sm">
              <option value="">No vehicle</option>
              {vehicles.map((v: any) => <option key={v.id} value={v.id}>{v.vehicleNo}</option>)}
            </select>
            <button
              disabled={!routeForm.name || createRoute.isPending}
              onClick={async () => {
                await createRoute.mutateAsync({ name: routeForm.name, vehicleId: routeForm.vehicleId || undefined } as any);
                setRouteForm({ name: '', vehicleId: '' });
                routesQ.refetch();
              }}
              className="h-10 rounded-lg bg-primary px-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {createRoute.isPending ? 'Saving…' : 'Create'}
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <p className="text-sm font-semibold">Add stop</p>
        <div className="mt-3 grid gap-2 md:grid-cols-6">
          <select value={stopForm.routeId} onChange={(e) => setStopForm((f) => ({ ...f, routeId: e.target.value }))}
            className="h-10 rounded-lg border bg-background px-3 text-sm md:col-span-2">
            <option value="">Route</option>
            {routes.map((r: any) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
          <input value={stopForm.name} onChange={(e) => setStopForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Stop name" className="h-10 rounded-lg border bg-muted/30 px-3 text-sm md:col-span-2" />
          <input type="number" min={0} value={stopForm.order} onChange={(e) => setStopForm((f) => ({ ...f, order: Number(e.target.value) }))}
            className="h-10 rounded-lg border bg-muted/30 px-3 text-sm" />
          <button
            disabled={!stopForm.routeId || !stopForm.name || addStop.isPending}
            onClick={async () => {
              await addStop.mutateAsync({ ...stopForm, pickupTime: stopForm.pickupTime || undefined, dropTime: stopForm.dropTime || undefined } as any);
              setStopForm({ routeId: '', name: '', order: 0, pickupTime: '', dropTime: '' });
              routesQ.refetch();
            }}
            className="h-10 rounded-lg bg-primary px-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {addStop.isPending ? 'Saving…' : 'Add'}
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <p className="text-sm font-semibold">Assign student</p>
          <div className="mt-3 space-y-2">
            <input value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)}
              placeholder="Search student…" className="h-10 w-full rounded-lg border bg-muted/30 px-3 text-sm" />
            <select value={assignForm.studentId} onChange={(e) => setAssignForm((f) => ({ ...f, studentId: e.target.value }))}
              className="h-10 w-full rounded-lg border bg-background px-3 text-sm">
              <option value="">Student</option>
              {students.map((s: any) => <option key={s.id} value={s.id}>{s.name} · {s.admissionNumber ?? '—'}</option>)}
            </select>
            <select value={assignForm.routeId} onChange={(e) => setAssignForm((f) => ({ ...f, routeId: e.target.value, stopId: '' }))}
              className="h-10 w-full rounded-lg border bg-background px-3 text-sm">
              <option value="">Route</option>
              {routes.map((r: any) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
            <select value={assignForm.stopId} onChange={(e) => setAssignForm((f) => ({ ...f, stopId: e.target.value }))}
              className="h-10 w-full rounded-lg border bg-background px-3 text-sm">
              <option value="">Stop (optional)</option>
              {(routes.find((r: any) => r.id === assignForm.routeId)?.stops ?? []).map((s: any) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <div className="flex justify-end">
              <button
                disabled={!assignForm.studentId || !assignForm.routeId || assign.isPending}
                onClick={async () => {
                  await assign.mutateAsync({ ...assignForm, stopId: assignForm.stopId || undefined } as any);
                  setAssignForm({ studentId: '', routeId: '', stopId: '' });
                  assignmentsQ.refetch();
                }}
                className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {assign.isPending ? 'Assigning…' : 'Assign'}
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <p className="text-sm font-semibold">Active assignments</p>
          <div className="mt-3 space-y-2">
            {assignments.length ? assignments.map((a: any) => (
              <div key={a.id} className="flex items-center justify-between rounded-xl border bg-muted/10 px-4 py-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{a.student?.name ?? 'Student'}</p>
                  <p className="text-xs text-muted-foreground">
                    {a.route?.name ?? 'Route'}{a.stop?.name ? ` · ${a.stop.name}` : ''} · since {a.startDate ? formatDate(a.startDate, 'short') : '—'}
                  </p>
                </div>
                <button
                  disabled={unassign.isPending}
                  onClick={async () => { await unassign.mutateAsync({ assignmentId: a.id }); assignmentsQ.refetch(); }}
                  className={cn('rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive hover:bg-destructive/15', unassign.isPending && 'opacity-60')}
                >
                  {unassign.isPending ? 'Working…' : 'Unassign'}
                </button>
              </div>
            )) : (
              <p className="text-sm text-muted-foreground">No active assignments.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

