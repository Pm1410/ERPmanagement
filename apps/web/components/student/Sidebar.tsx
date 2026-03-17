"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  User,
  CalendarCheck,
  BookOpen,
  FileText,
  FileBarChart,
  CreditCard,
  Library,
  Calendar,
  Bus,
  Bell,
  MessageSquareWarning,
  Settings,
  Menu,
  X
} from "lucide-react"

const sidebarItems = [
  { name: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
  { name: "My Profile", href: "/student/profile", icon: User },
  { name: "Attendance", href: "/student/attendance", icon: CalendarCheck },
  { name: "Academics", href: "/student/courses", icon: BookOpen },
  { name: "Assignments", href: "/student/assignments", icon: FileText },
  { name: "Examinations", href: "/student/exams", icon: FileBarChart },
  { name: "Fee Management", href: "/student/fees", icon: CreditCard },
  { name: "Library", href: "/student/library", icon: Library },
  { name: "Timetable", href: "/student/timetable", icon: Calendar },
  { name: "Transport", href: "/student/transport", icon: Bus },
  { name: "Notices", href: "/student/notices", icon: Bell },
  { name: "Grievance Portal", href: "/student/grievance", icon: MessageSquareWarning },
  { name: "Settings", href: "/student/settings", icon: Settings },
]

export function Sidebar({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}) {
  const pathname = usePathname()

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
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-white dark:bg-neutral-900 transition-transform duration-300 lg:static lg:translate-x-0 text-neutral-900 dark:text-neutral-50",
          !isOpen && "-translate-x-full"
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b">
          <Link href="/student/dashboard" className="flex items-center gap-2 font-bold text-xl text-primary">
            <BookOpen className="h-6 w-6" />
            <span>EduConnect</span>
          </Link>
          <button className="lg:hidden" onClick={() => setIsOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-50"
                )}
                onClick={() => setIsOpen(false)}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
