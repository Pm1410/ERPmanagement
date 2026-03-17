'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, BookOpen, ClipboardList, Calendar,
  DollarSign, Library, Bell, BarChart3, Settings, ChevronLeft,
  ChevronRight, GraduationCap, UserCog, FileText, MessageSquare,
  Truck, Home, HelpCircle, LogOut, Building2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore, type UserRole } from '@/store/auth.store';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  children?: { label: string; href: string }[];
}

function getNavItems(role: UserRole): NavItem[] {
  const student: NavItem[] = [
    { label: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
    { label: 'Attendance', href: '/student/attendance', icon: ClipboardList },
    { label: 'Assignments', href: '/student/assignments', icon: FileText },
    { label: 'Examinations', href: '/student/exams', icon: GraduationCap },
    { label: 'Fees', href: '/student/fees', icon: DollarSign },
    { label: 'Materials', href: '/student/materials', icon: BookOpen },
    { label: 'Library', href: '/student/library', icon: Library },
    { label: 'Timetable', href: '/student/timetable', icon: Calendar },
    { label: 'Notices', href: '/student/notices', icon: Bell },
    { label: 'Grievances', href: '/student/grievances', icon: HelpCircle },
    { label: 'Settings', href: '/student/settings', icon: Settings },
  ];

  const faculty: NavItem[] = [
    { label: 'Dashboard', href: '/faculty/dashboard', icon: LayoutDashboard },
    { label: 'Attendance', href: '/faculty/attendance', icon: ClipboardList },
    { label: 'My Classes', href: '/faculty/classes', icon: Users },
    { label: 'Assignments', href: '/faculty/assignments', icon: FileText },
    { label: 'Exam Marks', href: '/faculty/exams', icon: GraduationCap },
    { label: 'Materials', href: '/faculty/materials', icon: BookOpen },
    { label: 'Timetable', href: '/faculty/timetable', icon: Calendar },
    { label: 'Leaves', href: '/faculty/leaves', icon: ClipboardList },
    { label: 'Notices', href: '/faculty/notices', icon: Bell },
    { label: 'Reports', href: '/faculty/reports', icon: BarChart3 },
    { label: 'Settings', href: '/faculty/settings', icon: Settings },
  ];

  const management: NavItem[] = [
    { label: 'Dashboard', href: '/management/dashboard', icon: LayoutDashboard },
    {
      label: 'Students', href: '/management/students', icon: Users,
      children: [
        { label: 'All Students', href: '/management/students' },
        { label: 'Admissions', href: '/management/admissions' },
        { label: 'Parents', href: '/management/parents' },
        { label: 'ID Cards', href: '/management/students/id-cards' },
      ],
    },
    {
      label: 'Faculty & Staff', href: '/management/staff', icon: UserCog,
      children: [
        { label: 'All Staff', href: '/management/staff' },
        { label: 'Leave Approvals', href: '/management/staff/leaves' },
        { label: 'Payroll', href: '/management/payroll' },
      ],
    },
    {
      label: 'Academics', href: '/management/academics', icon: GraduationCap,
      children: [
        { label: 'Classes & Sections', href: '/management/academics/classes' },
        { label: 'Subjects', href: '/management/academics/subjects' },
        { label: 'Timetable Builder', href: '/management/academics/timetable' },
        { label: 'Exam Schedule', href: '/management/academics/exams' },
      ],
    },
    {
      label: 'Finance', href: '/management/finance', icon: DollarSign,
      children: [
        { label: 'Fee Collection', href: '/management/finance/collection' },
        { label: 'Fee Structures', href: '/management/finance/structures' },
        { label: 'Defaulters', href: '/management/finance/defaulters' },
        { label: 'Reports', href: '/management/finance/reports' },
      ],
    },
    { label: 'Library', href: '/management/library', icon: Library },
    { label: 'Hostel', href: '/management/hostel', icon: Building2 },
    { label: 'Transport', href: '/management/transport', icon: Truck },
    {
      label: 'Analytics', href: '/management/analytics', icon: BarChart3,
      children: [
        { label: 'Academic', href: '/management/analytics/academic' },
        { label: 'Financial', href: '/management/analytics/financial' },
        { label: 'Operational', href: '/management/analytics/operational' },
        { label: 'Custom Reports', href: '/management/analytics/reports' },
      ],
    },
    { label: 'Notices', href: '/management/notices', icon: Bell },
    { label: 'Grievances', href: '/management/grievances', icon: MessageSquare },
    { label: 'Settings', href: '/management/settings', icon: Settings },
  ];

  const parent: NavItem[] = [
    { label: 'Dashboard', href: '/parent/dashboard', icon: LayoutDashboard },
    { label: 'Attendance', href: '/parent/attendance', icon: ClipboardList },
    { label: 'Progress', href: '/parent/progress', icon: BarChart3 },
    { label: 'Fee Payment', href: '/parent/fees', icon: DollarSign },
    { label: 'Materials', href: '/parent/materials', icon: BookOpen },
    { label: 'Notices', href: '/parent/notices', icon: Bell },
    { label: 'Transport', href: '/parent/transport', icon: Truck },
    { label: 'Messages', href: '/parent/messages', icon: MessageSquare },
    { label: 'Settings', href: '/parent/settings', icon: Settings },
  ];

  if (role === 'STUDENT') return student;
  if (role === 'FACULTY' || role === 'HOD') return faculty;
  if (role === 'PARENT') return parent;
  return management;
}

export function PortalSidebar({ role }: { role: UserRole }) {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const pathname = usePathname();
  const { logout, user } = useAuthStore();
  const navItems = getNavItems(role);

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label],
    );
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <aside
      className={cn(
        'relative flex flex-col border-r bg-card transition-all duration-300 ease-in-out',
        collapsed ? 'w-16' : 'w-64',
      )}
    >
      {/* Logo */}
      <div className={cn('flex h-16 items-center border-b px-4', collapsed ? 'justify-center' : 'gap-3')}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <GraduationCap className="h-5 w-5" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">School ERP</p>
            <p className="truncate text-xs text-muted-foreground">{user?.name}</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin p-2 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            const expanded = expandedItems.includes(item.label);
            const hasChildren = !!item.children?.length;

            return (
              <li key={item.label}>
                {hasChildren ? (
                  <>
                    <button
                      onClick={() => toggleExpand(item.label)}
                      className={cn(
                        'flex w-full items-center rounded-md px-3 py-2 text-sm transition-colors',
                        active
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                        collapsed && 'justify-center px-2',
                      )}
                    >
                      <Icon className={cn('h-4 w-4 shrink-0', !collapsed && 'mr-3')} />
                      {!collapsed && (
                        <>
                          <span className="flex-1 text-left">{item.label}</span>
                          <ChevronRight
                            className={cn('h-3.5 w-3.5 transition-transform', expanded && 'rotate-90')}
                          />
                        </>
                      )}
                    </button>
                    {!collapsed && expanded && (
                      <ul className="ml-7 mt-1 space-y-1 border-l pl-3">
                        {item.children?.map((child) => (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              className={cn(
                                'block rounded-md px-2 py-1.5 text-xs transition-colors',
                                isActive(child.href)
                                  ? 'text-primary font-medium'
                                  : 'text-muted-foreground hover:text-foreground',
                              )}
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center rounded-md px-3 py-2 text-sm transition-colors',
                      active
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                      collapsed && 'justify-center px-2',
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className={cn('h-4 w-4 shrink-0', !collapsed && 'mr-3')} />
                    {!collapsed && item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="border-t p-2">
          <button
            onClick={() => logout()}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      )}

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border bg-card shadow-sm hover:bg-muted"
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>
    </aside>
  );
}
