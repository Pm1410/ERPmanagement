'use client';

import { useAuthStore } from '@/store/auth.store';

export default function ProfilePage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">My Profile</h1>
        <p className="text-sm text-muted-foreground">Basic account details.</p>
      </div>

      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="grid gap-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Name</span>
            <span className="font-medium">{user?.name ?? '—'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Email</span>
            <span className="font-medium">{user?.email ?? '—'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Role</span>
            <span className="font-medium">{user?.role ?? '—'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Institution</span>
            <span className="font-medium">{user?.institutionId ?? '—'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

