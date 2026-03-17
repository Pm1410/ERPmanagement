"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  UserPlus,
  Users,
  UsersRound,
  Briefcase,
  BookOpen,
  DollarSign,
  Library,
  Building2,
  Bus,
  Package,
  MessageSquare,
  BarChart3,
  Settings,
  ClipboardList,
  X,
  ChevronDown,
  ChevronRight,
  BookOpenText,
  GraduationCap,
} from "lucide-react"

interface NavItem {
  name: string
  href?: string
  icon: React.ElementType
  children?: { name: string; href: string }[]
}

const sidebarItems: NavItem[] = [
  { name: "Dashboard", href: "/management/dashboard", icon: LayoutDashboard },
  {
    name: "Admissions",
    icon: UserPlus,
    children: [
      { name: "Enquiries", href: "/management/admissions/enquiries" },
      { name: "Applications", href: "/management/admissions/applications" },
      { name: "Enrollment", href: "/management/admissions/enrollment" },
      { name: "Documents", href: "/management/admissions/documents" },
    ],
  },
  {
    name: "Students",
    icon: GraduationCap,
    children: [
      { name: "All Students", href: "/management/students" },
      { name: "ID Cards", href: "/management/students/id-cards" },
      { name: "Transfer / TC", href: "/management/students/transfer" },
    ],
  },
  {
    name: "Faculty & Staff",
    icon: UsersRound,
    children: [
      { name: "All Staff", href: "/management/staff" },
      { name: "Recruitment", href: "/management/staff/recruitment" },
      { name: "Appraisals", href: "/management/staff/appraisals" },
    ],
  },
  {
    name: "HR & Payroll",
    icon: Briefcase,
    children: [
      { name: "Attendance", href: "/management/hr/attendance" },
      { name: "Leave Approvals", href: "/management/hr/leaves" },
      { name: "Payroll Run", href: "/management/hr/payroll" },
      { name: "Salary Slips", href: "/management/hr/salary-slips" },
    ],
  },
  {
    name: "Academics",
    icon: BookOpen,
    children: [
      { name: "Classes & Sections", href: "/management/academics/classes" },
      { name: "Subject Master", href: "/management/academics/subjects" },
      { name: "Timetable Builder", href: "/management/academics/timetable" },
      { name: "Exam Scheduling", href: "/management/academics/exams" },
      { name: "Report Card Config", href: "/management/academics/report-cards" },
    ],
  },
  {
    name: "Finance",
    icon: DollarSign,
    children: [
      { name: "Fee Structure", href: "/management/finance/fee-structure" },
      { name: "Fee Collection", href: "/management/finance/fee-collection" },
      { name: "Expenses", href: "/management/finance/expenses" },
      { name: "Budget", href: "/management/finance/budget" },
      { name: "Reports", href: "/management/finance/reports" },
    ],
  },
  { name: "Library", href: "/management/library", icon: Library },
  { name: "Hostel", href: "/management/hostel", icon: Building2 },
  { name: "Transport", href: "/management/transport", icon: Bus },
  { name: "Inventory & Assets", href: "/management/inventory", icon: Package },
  { name: "Communication", href: "/management/communication", icon: MessageSquare },
  { name: "Analytics & Reports", href: "/management/analytics", icon: BarChart3 },
  { name: "System Settings", href: "/management/settings", icon: Settings },
  { name: "Audit Logs", href: "/management/audit", icon: ClipboardList },
]

function SidebarNavItem({
  item,
  onClose,
}: {
  item: NavItem
  onClose: () => void
}) {
  const pathname = usePathname()
  const [open, setOpen] = React.useState(() => {
    if (item.children) {
      return item.children.some((c) => pathname.startsWith(c.href))
    }
    return false
  })

  if (item.children) {
    const isAnyChildActive = item.children.some((c) => pathname.startsWith(c.href))
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          className={cn(
            "w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            isAnyChildActive
              ? "bg-primary/10 text-primary dark:bg-primary/20"
              : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-50"
          )}
        >
          <item.icon className="h-4 w-4 shrink-0" />
          <span className="flex-1 text-left">{item.name}</span>
          {open ? (
            <ChevronDown className="h-4 w-4 shrink-0 opacity-60" />
          ) : (
            <ChevronRight className="h-4 w-4 shrink-0 opacity-60" />
          )}
        </button>
        {open && (
          <div className="ml-7 mt-1 space-y-0.5 border-l border-neutral-200 dark:border-neutral-700 pl-3">
            {item.children.map((child) => {
              const isActive = pathname.startsWith(child.href)
              return (
                <Link
                  key={child.href}
                  href={child.href}
                  onClick={onClose}
                  className={cn(
                    "block rounded-md px-2 py-1.5 text-sm transition-colors",
                    isActive
                      ? "text-primary font-semibold"
                      : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-50"
                  )}
                >
                  {child.name}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  const isActive = item.href ? pathname.startsWith(item.href) : false
  return (
    <Link
      href={item.href!}
      onClick={onClose}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground"
          : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-50"
      )}
    >
      <item.icon className="h-4 w-4 shrink-0" />
      {item.name}
    </Link>
  )
}

export function Sidebar({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean
  setIsOpen: (v: boolean) => void
}) {
  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 lg:hidden transition-opacity",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsOpen(false)}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-white dark:bg-neutral-900 transition-transform duration-300 lg:static lg:translate-x-0",
          !isOpen && "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center justify-between px-5 border-b border-neutral-200 dark:border-neutral-800">
          <Link href="/management/dashboard" className="flex items-center gap-2 font-bold text-lg text-primary">
            <BookOpenText className="h-6 w-6" />
            <span className="leading-tight">
              EduConnect
              <span className="block text-[10px] font-normal text-neutral-500 leading-none">Management Portal</span>
            </span>
          </Link>
          <button className="lg:hidden p-1 text-neutral-500 hover:text-neutral-700" onClick={() => setIsOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
          {sidebarItems.map((item) => (
            <SidebarNavItem key={item.name} item={item} onClose={() => setIsOpen(false)} />
          ))}
        </nav>

        {/* User */}
        <div className="shrink-0 p-4 border-t border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm shrink-0">
              PA
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-50 truncate">Principal Admin</p>
              <p className="text-xs text-neutral-500 truncate">PRINCIPAL</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
