'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useAllocateHostel, useCreateHostelRoom, useHostelAllocations, useHostelRooms, useStudents, useVacateHostel } from '@/hooks/use-api';
import { cn, formatDate } from '@/lib/utils';

export default function ManagementHostelPage() {
  const { data: rooms, isLoading: roomsLoading, error: roomsError, refetch: refetchRooms } = useHostelRooms();
  const { data: activeAllocations, refetch: refetchAlloc } = useHostelAllocations('ACTIVE');

  const createRoom = useCreateHostelRoom();
  const allocate = useAllocateHostel();
  const vacate = useVacateHostel();

  const [roomForm, setRoomForm] = useState({ hostelName: 'Main Hostel', name: '', floor: 1, roomType: 'SHARED', capacity: 4 });

  const [studentSearch, setStudentSearch] = useState('');
  const { data: studentsRes } = useStudents(studentSearch ? { q: studentSearch } : undefined);
  const students = (studentsRes as any)?.data ?? (studentsRes as any)?.items ?? (Array.isArray(studentsRes) ? studentsRes : []);

  const [allocationForm, setAllocationForm] = useState({ studentId: '', roomId: '', bedNo: '', notes: '' });

  const roomRows = useMemo(() => rooms ?? [], [rooms]);
  const allocRows = useMemo(() => activeAllocations ?? [], [activeAllocations]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Hostel</h1>
          <p className="text-sm text-muted-foreground">Rooms and allocations</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { refetchRooms(); refetchAlloc(); }} className="rounded-lg border px-3 py-2 text-sm hover:bg-muted">
            Refresh
          </button>
          <Link href="/management/dashboard" className="rounded-lg border px-3 py-2 text-sm hover:bg-muted">
            Back
          </Link>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Create room */}
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <p className="text-sm font-semibold">Create room</p>
          <div className="mt-3 grid gap-2 md:grid-cols-5">
            <input
              value={roomForm.hostelName}
              onChange={(e) => setRoomForm((f) => ({ ...f, hostelName: e.target.value }))}
              placeholder="Hostel name"
              className="h-10 rounded-lg border bg-muted/30 px-3 text-sm md:col-span-2"
            />
            <input
              value={roomForm.name}
              onChange={(e) => setRoomForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Room (e.g. A-101)"
              className="h-10 rounded-lg border bg-muted/30 px-3 text-sm"
            />
            <input
              type="number"
              value={roomForm.floor}
              onChange={(e) => setRoomForm((f) => ({ ...f, floor: Number(e.target.value) }))}
              className="h-10 rounded-lg border bg-muted/30 px-3 text-sm"
            />
            <input
              type="number"
              min={1}
              value={roomForm.capacity}
              onChange={(e) => setRoomForm((f) => ({ ...f, capacity: Number(e.target.value) }))}
              className="h-10 rounded-lg border bg-muted/30 px-3 text-sm"
            />
          </div>
          <div className="mt-2 flex justify-end">
            <button
              disabled={!roomForm.name || createRoom.isPending}
              onClick={async () => {
                await createRoom.mutateAsync(roomForm as any);
                setRoomForm({ hostelName: roomForm.hostelName, name: '', floor: 1, roomType: 'SHARED', capacity: 4 });
                refetchRooms();
              }}
              className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {createRoom.isPending ? 'Creating…' : 'Create'}
            </button>
          </div>
        </div>

        {/* Allocate */}
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <p className="text-sm font-semibold">Allocate student</p>
          <div className="mt-3 space-y-2">
            <input
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              placeholder="Search student…"
              className="h-10 w-full rounded-lg border bg-muted/30 px-3 text-sm"
            />
            <select
              value={allocationForm.studentId}
              onChange={(e) => setAllocationForm((f) => ({ ...f, studentId: e.target.value }))}
              className="h-10 w-full rounded-lg border bg-background px-3 text-sm"
            >
              <option value="">Student</option>
              {students.map((s: any) => (
                <option key={s.id} value={s.id}>
                  {s.name} · {s.admissionNumber ?? '—'} · {s.class?.name ?? ''}
                </option>
              ))}
            </select>
            <select
              value={allocationForm.roomId}
              onChange={(e) => setAllocationForm((f) => ({ ...f, roomId: e.target.value }))}
              className="h-10 w-full rounded-lg border bg-background px-3 text-sm"
            >
              <option value="">Room</option>
              {roomRows.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.hostelName} · {r.name}
                </option>
              ))}
            </select>
            <div className="grid gap-2 md:grid-cols-2">
              <input
                value={allocationForm.bedNo}
                onChange={(e) => setAllocationForm((f) => ({ ...f, bedNo: e.target.value }))}
                placeholder="Bed (optional)"
                className="h-10 rounded-lg border bg-muted/30 px-3 text-sm"
              />
              <input
                value={allocationForm.notes}
                onChange={(e) => setAllocationForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Notes (optional)"
                className="h-10 rounded-lg border bg-muted/30 px-3 text-sm"
              />
            </div>
            <div className="flex justify-end">
              <button
                disabled={!allocationForm.studentId || !allocationForm.roomId || allocate.isPending}
                onClick={async () => {
                  await allocate.mutateAsync({
                    studentId: allocationForm.studentId,
                    roomId: allocationForm.roomId,
                    bedNo: allocationForm.bedNo || undefined,
                    notes: allocationForm.notes || undefined,
                  });
                  setAllocationForm({ studentId: '', roomId: '', bedNo: '', notes: '' });
                  refetchRooms();
                  refetchAlloc();
                }}
                className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {allocate.isPending ? 'Allocating…' : 'Allocate'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Rooms */}
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">Rooms</p>
          {roomsLoading ? <span className="text-xs text-muted-foreground">Loading…</span> : null}
        </div>
        {roomsError && <p className="mt-2 text-sm text-destructive">Failed to load rooms.</p>}
        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {roomRows.map((r: any) => {
            const active = (r.allocations ?? []).length;
            const full = active >= r.capacity;
            return (
              <div key={r.id} className="rounded-xl border bg-muted/10 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{r.hostelName} · {r.name}</p>
                    <p className="text-xs text-muted-foreground">Floor {r.floor ?? '—'} · {r.roomType} · cap {r.capacity}</p>
                  </div>
                  <span className={cn('rounded px-2 py-0.5 text-xs font-semibold',
                    full ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700')}>
                    {active}/{r.capacity}
                  </span>
                </div>
                <div className="mt-3 space-y-1">
                  {(r.allocations ?? []).slice(0, 4).map((a: any) => (
                    <div key={a.id} className="flex items-center justify-between rounded-lg bg-card px-3 py-2 text-xs">
                      <span className="truncate font-medium">{a.student?.name ?? 'Student'}</span>
                      <span className="text-muted-foreground">{a.bedNo ? `Bed ${a.bedNo}` : ''}</span>
                    </div>
                  ))}
                  {!active && <p className="text-xs text-muted-foreground">No active allocations</p>}
                </div>
              </div>
            );
          })}
          {!roomRows.length && <p className="text-sm text-muted-foreground">No rooms yet.</p>}
        </div>
      </div>

      {/* Active allocations */}
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <p className="text-sm font-semibold">Active allocations</p>
        <div className="mt-3 space-y-2">
          {allocRows.length ? allocRows.map((a: any) => (
            <div key={a.id} className="flex items-center justify-between rounded-xl border bg-muted/10 px-4 py-3 text-sm">
              <div className="min-w-0">
                <p className="truncate font-semibold">{a.student?.name ?? 'Student'}</p>
                <p className="text-xs text-muted-foreground">
                  {a.room?.hostelName ?? 'Hostel'} · {a.room?.name ?? 'Room'} {a.bedNo ? `· Bed ${a.bedNo}` : ''} · since {a.startDate ? formatDate(a.startDate, 'short') : '—'}
                </p>
              </div>
              <button
                disabled={vacate.isPending}
                onClick={async () => {
                  await vacate.mutateAsync({ allocationId: a.id });
                  refetchRooms();
                  refetchAlloc();
                }}
                className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive hover:bg-destructive/15 disabled:opacity-60"
              >
                {vacate.isPending ? 'Working…' : 'Vacate'}
              </button>
            </div>
          )) : (
            <p className="text-sm text-muted-foreground">No active allocations.</p>
          )}
        </div>
      </div>
    </div>
  );
}

