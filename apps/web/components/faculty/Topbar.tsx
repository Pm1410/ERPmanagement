"use client"

import * as React from "react"
import { Bell, Menu, User, LogOut, Settings as SettingsIcon } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"

export function Topbar({
  onMenuClick,
}: {
  onMenuClick: () => void
}) {
  const [profileOpen, setProfileOpen] = React.useState(false)

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
          <span>Faculty Portal</span>
          <span>/</span>
          <span className="font-medium text-neutral-900 dark:text-neutral-50 text-capitalize">
            Dashboard
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Academic Year Selector */}
        <select className="hidden sm:block text-sm border-neutral-200 rounded-md bg-neutral-50 dark:bg-neutral-800 dark:border-neutral-700 px-2 py-1 focus:ring-primary focus:border-primary">
          <option>2026-2027</option>
          <option>2025-2026</option>
        </select>

        {/* Notifications */}
        <button className="relative p-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-50 transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] text-white">
            5
          </span>
        </button>

        {/* Profile Dropdown */}
        <div className="relative">
          <button 
            className="flex items-center gap-2 focus:outline-none"
            onClick={() => setProfileOpen(!profileOpen)}
          >
            <Avatar className="h-8 w-8 border border-neutral-200 dark:border-neutral-700">
              <AvatarImage src="" alt="Faculty" />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">AK</AvatarFallback>
            </Avatar>
            <div className="hidden md:block text-left relative top-[-2px]">
              <p className="text-sm font-medium leading-none">Anita Kumar</p>
              <p className="text-xs text-neutral-500 mt-1">Science Dept</p>
            </div>
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-md border bg-white dark:bg-neutral-900 shadow-elevated z-50 py-1">
              <Link
                href="/faculty/profile"
                className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                onClick={() => setProfileOpen(false)}
              >
                <User className="h-4 w-4" /> View Profile
              </Link>
              <Link
                href="/faculty/settings"
                className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                onClick={() => setProfileOpen(false)}
              >
                <SettingsIcon className="h-4 w-4" /> Settings
              </Link>
              <hr className="my-1 border-neutral-200 dark:border-neutral-800" />
              <button
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-danger hover:bg-red-50 dark:hover:bg-red-900/10"
                onClick={() => setProfileOpen(false)}
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
