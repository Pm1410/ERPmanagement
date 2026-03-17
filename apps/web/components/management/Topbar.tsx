"use client"

import * as React from "react"
import { Bell, Menu, User, LogOut, Settings as SettingsIcon, Search } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

function getBreadcrumb(pathname: string): string {
  const parts = pathname.split("/").filter(Boolean)
  if (parts.length <= 1) return "Dashboard"
  const last = parts[parts.length - 1]
  return last
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}

const alerts = [
  { id: 1, text: "New admission application received", time: "2m ago", type: "info" },
  { id: 2, text: "Fee payment verified for Riya Shah", time: "15m ago", type: "success" },
  { id: 3, text: "Leave request pending approval", time: "1h ago", type: "warning" },
  { id: 4, text: "Payroll run due for March 2026", time: "2h ago", type: "warning" },
]

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname()
  const [profileOpen, setProfileOpen] = React.useState(false)
  const [alertsOpen, setAlertsOpen] = React.useState(false)
  const breadcrumb = getBreadcrumb(pathname)

  React.useEffect(() => {
    function handleClick() {
      setProfileOpen(false)
      setAlertsOpen(false)
    }
    document.addEventListener("click", handleClick)
    return () => document.removeEventListener("click", handleClick)
  }, [])

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-white dark:bg-neutral-900 px-4 shadow-sm md:px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-50"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="hidden md:flex items-center gap-2 text-sm text-neutral-500">
          <span>Management</span>
          <span>/</span>
          <span className="font-semibold text-neutral-900 dark:text-neutral-50">{breadcrumb}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden sm:flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg px-3 py-1.5 text-sm text-neutral-400 w-48 cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors">
          <Search className="h-4 w-4" />
          <span>Quick search...</span>
        </div>

        {/* Academic Year */}
        <select className="hidden md:block text-sm border border-neutral-200 dark:border-neutral-700 rounded-md bg-neutral-50 dark:bg-neutral-800 px-2 py-1.5 text-neutral-700 dark:text-neutral-300 focus:ring-primary focus:border-primary">
          <option>2025-2026</option>
          <option>2024-2025</option>
        </select>

        {/* Notifications */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            className="relative p-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-50 transition-colors rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
            onClick={() => { setAlertsOpen(!alertsOpen); setProfileOpen(false) }}
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] text-white font-bold">
              {alerts.length}
            </span>
          </button>

          {alertsOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border bg-white dark:bg-neutral-900 shadow-elevated z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                <h3 className="font-semibold text-sm">Notifications</h3>
                <button className="text-xs text-primary hover:underline">Mark all read</button>
              </div>
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800 max-h-72 overflow-y-auto">
                {alerts.map((a) => (
                  <div key={a.id} className="px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer">
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">{a.text}</p>
                    <p className="text-xs text-neutral-400 mt-0.5">{a.time}</p>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2 border-t border-neutral-100 dark:border-neutral-800">
                <button className="w-full text-xs text-center text-primary hover:underline">View all notifications</button>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            className="flex items-center gap-2 focus:outline-none"
            onClick={() => { setProfileOpen(!profileOpen); setAlertsOpen(false) }}
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-xs">
              PA
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium leading-none text-neutral-900 dark:text-neutral-50">Principal Admin</p>
              <p className="text-xs text-neutral-500 mt-0.5">PRINCIPAL</p>
            </div>
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl border bg-white dark:bg-neutral-900 shadow-elevated z-50 py-1">
              <Link
                href="/management/settings/profile"
                className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                onClick={() => setProfileOpen(false)}
              >
                <User className="h-4 w-4" /> My Profile
              </Link>
              <Link
                href="/management/settings"
                className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                onClick={() => setProfileOpen(false)}
              >
                <SettingsIcon className="h-4 w-4" /> Settings
              </Link>
              <hr className="my-1 border-neutral-100 dark:border-neutral-800" />
              <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-danger hover:bg-red-50 dark:hover:bg-red-900/10">
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
