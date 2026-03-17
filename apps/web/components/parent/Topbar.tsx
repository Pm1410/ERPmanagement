"use client"

import * as React from "react"
import { Bell, Menu, LogOut, Settings as SettingsIcon, User, ChevronDown } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Mock children data for the selector
const mockChildren = [
  { id: "1", name: "Aanya Sharma", class: "Class 9-A", roll: "09A-14" },
  { id: "2", name: "Rohan Sharma", class: "Class 6-B", roll: "06B-22" },
]

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const [profileOpen, setProfileOpen] = React.useState(false)
  const [selectedChild, setSelectedChild] = React.useState(mockChildren[0])
  const [childDropOpen, setChildDropOpen] = React.useState(false)
  const profileRef = React.useRef<HTMLDivElement>(null)
  const childRef = React.useRef<HTMLDivElement>(null)

  // Close dropdowns on outside click
  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
      if (childRef.current && !childRef.current.contains(e.target as Node)) {
        setChildDropOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 px-4 md:px-6 shadow-sm">
      {/* Left: hamburger + breadcrumb */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-50 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="hidden md:flex items-center gap-2 text-sm text-neutral-500">
          <span>Parent Portal</span>
        </div>
      </div>

      {/* Right: child selector, notifications, profile */}
      <div className="flex items-center gap-3">
        {/* Child Selector */}
        <div className="relative" ref={childRef}>
          <button
            onClick={() => setChildDropOpen((v) => !v)}
            className="hidden sm:flex items-center gap-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-3 py-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
          >
            <span className="h-2 w-2 rounded-full bg-success" />
            {selectedChild.name}
            <ChevronDown className="h-3.5 w-3.5 text-neutral-400" />
          </button>
          {childDropOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-lg border bg-white dark:bg-neutral-900 shadow-elevated z-50 py-1 overflow-hidden">
              <p className="px-3 py-1.5 text-xs font-semibold text-neutral-400 uppercase tracking-wider">Select Child</p>
              {mockChildren.map((child) => (
                <button
                  key={child.id}
                  className={`w-full text-left flex items-center gap-3 px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${
                    selectedChild.id === child.id ? "text-primary font-medium" : "text-neutral-700 dark:text-neutral-200"
                  }`}
                  onClick={() => { setSelectedChild(child); setChildDropOpen(false) }}
                >
                  <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                    {child.name.charAt(0)}
                  </div>
                  <div>
                    <p className="leading-none">{child.name}</p>
                    <p className="text-xs text-neutral-400 mt-0.5">{child.class}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-50 transition-colors rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] text-white font-bold">
            2
          </span>
        </button>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            className="flex items-center gap-2 focus:outline-none rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 p-1 pr-2 transition-colors"
            onClick={() => setProfileOpen((v) => !v)}
          >
            <Avatar className="h-8 w-8 border border-neutral-200 dark:border-neutral-700">
              <AvatarImage src="" alt="Parent" />
              <AvatarFallback className="bg-secondary/10 text-secondary text-xs font-bold">PR</AvatarFallback>
            </Avatar>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium leading-none">Suresh Sharma</p>
              <p className="text-xs text-neutral-500 mt-0.5">Parent</p>
            </div>
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-lg border bg-white dark:bg-neutral-900 shadow-elevated z-50 py-1">
              <Link
                href="/parent/settings"
                className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                onClick={() => setProfileOpen(false)}
              >
                <User className="h-4 w-4" /> My Profile
              </Link>
              <Link
                href="/parent/settings"
                className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                onClick={() => setProfileOpen(false)}
              >
                <SettingsIcon className="h-4 w-4" /> Settings
              </Link>
              <hr className="my-1 border-neutral-200 dark:border-neutral-800" />
              <button
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-danger hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
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
