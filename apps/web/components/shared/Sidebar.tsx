'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  role: string;
  onClose?: () => void;
}

// Map roles to their specific navigation items
const NAVIGATION_CONFIG: Record<string, { label: string; href: string; icon?: React.ReactNode }[]> = {
  STUDENT: [
    { label: 'Dashboard', href: '/student' },
    { label: 'My Courses', href: '/student/courses' },
    { label: 'Grades & Reports', href: '/student/grades' },
    { label: 'Attendance', href: '/student/attendance' },
    { label: 'Schedule', href: '/student/schedule' },
    { label: 'Fees', href: '/student/fees' },
  ],
  FACULTY: [
    { label: 'Dashboard', href: '/faculty' },
    { label: 'My Classes', href: '/faculty/classes' },
    { label: 'Attendance Entry', href: '/faculty/attendance' },
    { label: 'Gradebook', href: '/faculty/grades' },
    { label: 'Assignments', href: '/faculty/assignments' },
  ],
  MANAGEMENT: [
    { label: 'Dashboard', href: '/management' },
    { label: 'Students', href: '/management/students' },
    { label: 'Staff', href: '/management/staff' },
    { label: 'Finances', href: '/management/finances' },
    { label: 'Reports', href: '/management/reports' },
    { label: 'Settings', href: '/management/settings' },
  ],
  PARENT: [
    { label: 'Dashboard', href: '/parent' },
    { label: 'Children', href: '/parent/children' },
    { label: 'Fee Payments', href: '/parent/fees' },
    { label: 'Messages', href: '/parent/messages' },
  ]
};

export function Sidebar({ role, onClose }: SidebarProps) {
  const pathname = usePathname();
  const navItems = NAVIGATION_CONFIG[role] || [];

  return (
    <aside className="flex h-full w-64 flex-col bg-white border-r border-neutral-200 shadow-sm">
      <div className="flex h-16 items-center justify-between px-6 border-b border-neutral-200">
        <span className="text-xl font-bold font-heading text-primary">ERP System</span>
        {onClose && (
          <button onClick={onClose} className="md:hidden text-neutral-500 hover:text-neutral-700">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
              }`}
              onClick={onClose}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-neutral-200">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-secondary text-white flex items-center justify-center font-bold text-sm">
            U
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-neutral-900 truncate">Current User</span>
            <span className="text-xs text-neutral-500 capitalize">{role.toLowerCase()}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
