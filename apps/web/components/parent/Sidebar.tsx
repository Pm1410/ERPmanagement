"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  TrendingUp,
  CreditCard,
  Calendar,
  Bell,
  MessageSquare,
  Bus,
  Settings,
  GraduationCap,
  X,
} from "lucide-react"

const sidebarItems = [
  { name: "Dashboard", href: "/parent/dashboard", icon: LayoutDashboard },
  { name: "My Children", href: "/parent/children", icon: Users },
  { name: "Attendance", href: "/parent/attendance", icon: CalendarCheck },
  { name: "Academic Progress", href: "/parent/progress", icon: TrendingUp },
  { name: "Fee Payment", href: "/parent/fees", icon: CreditCard },
  { name: "Timetable", href: "/parent/timetable", icon: Calendar },
  { name: "Notices & Circular", href: "/parent/notices", icon: Bell },
  { name: "Communicate", href: "/parent/messages", icon: MessageSquare },
  { name: "Transport Tracking", href: "/parent/transport", icon: Bus },
  { name: "Settings", href: "/parent/settings", icon: Settings },
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
      {/* Mobile overlay */}
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
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-neutral-200 dark:border-neutral-800">
          <Link href="/parent/dashboard" className="flex items-center gap-2 font-bold text-xl text-primary">
            <GraduationCap className="h-6 w-6" />
            <span>EduConnect</span>
          </Link>
          <button className="lg:hidden" onClick={() => setIsOpen(false)}>
            <X className="h-5 w-5 text-neutral-500" />
          </button>
        </div>

        {/* Role badge */}
        <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/10 px-2.5 py-1 text-xs font-semibold text-secondary">
            <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
            Parent Portal
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary/10 text-primary dark:bg-primary/20"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-50"
                )}
                onClick={() => setIsOpen(false)}
              >
                <Icon className={cn("h-5 w-5 shrink-0", isActive ? "text-primary" : "")} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center text-white font-bold text-sm shrink-0">
              PR
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">Parent</p>
              <p className="text-xs text-neutral-500 truncate">parent@school.edu</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
