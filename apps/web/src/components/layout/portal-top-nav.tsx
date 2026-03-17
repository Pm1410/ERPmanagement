'use client';

import { useEffect } from 'react';
import { Bell, Search, ChevronDown, User, Settings, LogOut, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { useNotificationStore } from '@/store/notification.store';
import { useAuthStore, type AuthUser } from '@/store/auth.store';
import { cn } from '@/lib/utils';

const ROLE_BADGE: Record<string, string> = {
  SUPER_ADMIN: 'bg-purple-100 text-purple-700',
  INSTITUTION_ADMIN: 'bg-blue-100 text-blue-700',
  PRINCIPAL: 'bg-blue-100 text-blue-700',
  HOD: 'bg-teal-100 text-teal-700',
  FACULTY: 'bg-teal-100 text-teal-700',
  STUDENT: 'bg-green-100 text-green-700',
  PARENT: 'bg-orange-100 text-orange-700',
  ACCOUNTANT: 'bg-amber-100 text-amber-700',
  LIBRARIAN: 'bg-pink-100 text-pink-700',
  HR_MANAGER: 'bg-indigo-100 text-indigo-700',
};

export function PortalTopNav({ user }: { user: AuthUser }) {
  const { theme, setTheme } = useTheme();
  const { unreadCount, notifications, isOpen, setOpen, markRead, markAllRead } =
    useNotificationStore();
  const { logout } = useAuthStore();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-card px-6">
      {/* Left: breadcrumb area (populated by each page via slot pattern) */}
      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Quick search…"
            className="h-9 w-64 rounded-lg border bg-muted/50 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="flex h-9 w-9 items-center justify-center rounded-lg border hover:bg-muted"
          title="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* Notification bell */}
        <div className="relative">
          <button
            onClick={() => setOpen(!isOpen)}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border hover:bg-muted"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification dropdown */}
          {isOpen && (
            <div className="absolute right-0 top-11 z-50 w-80 rounded-xl border bg-card shadow-lg">
              <div className="flex items-center justify-between border-b p-3">
                <span className="text-sm font-semibold">Notifications</span>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs text-primary hover:underline">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto scrollbar-thin">
                {notifications.length === 0 ? (
                  <p className="p-4 text-center text-sm text-muted-foreground">No notifications</p>
                ) : (
                  notifications.slice(0, 10).map((n) => (
                    <button
                      key={n.id}
                      onClick={() => markRead(n.id)}
                      className={cn(
                        'flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-muted',
                        !n.isRead && 'bg-primary/5',
                      )}
                    >
                      <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-primary opacity-0 data-[unread=true]:opacity-100"
                        data-unread={!n.isRead} />
                      <div className="min-w-0">
                        <p className={cn('truncate text-sm', !n.isRead && 'font-medium')}>{n.title}</p>
                        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{n.body}</p>
                        <p className="mt-1 text-[10px] text-muted-foreground">
                          {new Date(n.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
              <div className="border-t p-2">
                <Link
                  href="/student/notices"
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-3 py-1.5 text-center text-xs text-primary hover:bg-primary/5"
                >
                  View all notices
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User menu */}
        <div className="relative group">
          <button className="flex items-center gap-2 rounded-lg border px-3 py-1.5 hover:bg-muted">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="hidden text-left md:block">
              <p className="text-xs font-medium leading-tight">{user.name}</p>
              <span className={cn('rounded px-1 py-px text-[10px] font-medium', ROLE_BADGE[user.role] || 'bg-gray-100 text-gray-600')}>
                {user.role.replace(/_/g, ' ')}
              </span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>

          {/* Dropdown */}
          <div className="absolute right-0 top-11 z-50 hidden w-48 rounded-xl border bg-card p-1 shadow-lg group-focus-within:block group-hover:block">
            <Link href="/profile" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted">
              <User className="h-4 w-4" /> My Profile
            </Link>
            <Link href="/settings" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted">
              <Settings className="h-4 w-4" /> Settings
            </Link>
            <div className="my-1 border-t" />
            <button
              onClick={() => logout()}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
