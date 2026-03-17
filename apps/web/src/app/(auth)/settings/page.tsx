'use client';

import Link from 'next/link';
import { useAuthStore, getPortalPath } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const backHref = user ? getPortalPath(user.role) : '/login';
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    if (user.role === 'STUDENT') router.replace('/student/settings');
    else if (user.role === 'PARENT') router.replace('/parent/settings');
    else if (user.role === 'FACULTY' || user.role === 'HOD') router.replace('/faculty/settings');
    else router.replace('/management/settings');
  }, [router, user]);

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">Settings</h1>
      <p className="text-sm text-muted-foreground">Redirecting to your portal settings…</p>
      <Link href={backHref} className="text-sm font-medium text-primary hover:underline">
        Back
      </Link>
    </div>
  );
}

