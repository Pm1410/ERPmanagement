'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { useNotificationStore } from '@/store/notification.store';
import { PortalSidebar } from '@/components/layout/portal-sidebar';
import { PortalTopNav } from '@/components/layout/portal-top-nav';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore();
  const { fetchNotifications, subscribeToSocket } = useNotificationStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      const unsub = subscribeToSocket();
      return unsub;
    }
  }, [isAuthenticated, fetchNotifications, subscribeToSocket]);

  if (!isAuthenticated || !user) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-muted/30">
      <PortalSidebar role={user.role} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <PortalTopNav user={user} />
        <main className="flex-1 overflow-y-auto scrollbar-thin p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
