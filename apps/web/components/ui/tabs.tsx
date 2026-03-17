"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const TabsContext = React.createContext<{
  value: string
  onValueChange: (value: string) => void
} | null>(null)

export function Tabs({ defaultValue, value, onValueChange, className, children }: {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  className?: string
  children: React.ReactNode
}) {
  const [tab, setTab] = React.useState(value || defaultValue || "")
  
  const handleTabChange = (val: string) => {
    setTab(val)
    onValueChange?.(val)
  }

  return (
    <TabsContext.Provider value={{ value: value !== undefined ? value : tab, onValueChange: handleTabChange }}>
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  )
}

export function TabsList({ className, children }: { className?: string, children: React.ReactNode }) {
  return (
    <div className={cn("inline-flex h-10 items-center justify-center rounded-md bg-neutral-100 dark:bg-neutral-800 p-1 text-neutral-500", className)}>
      {children}
    </div>
  )
}

export function TabsTrigger({ value, className, children }: { value: string, className?: string, children: React.ReactNode }) {
  const context = React.useContext(TabsContext)
  if (!context) throw new Error("TabsTrigger must be used within Tabs")

  const isActive = context.value === value

  return (
    <button
      onClick={() => context.onValueChange(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isActive ? "bg-white dark:bg-neutral-950 text-neutral-950 dark:text-neutral-50 shadow-sm" : "hover:text-neutral-900 dark:hover:text-neutral-50",
        className
      )}
    >
      {children}
    </button>
  )
}

export function TabsContent({ value, className, children }: { value: string, className?: string, children: React.ReactNode }) {
  const context = React.useContext(TabsContext)
  if (!context) throw new Error("TabsContent must be used within Tabs")

  if (context.value !== value) return null

  return (
    <div className={cn("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 animate-in fade-in zoom-in-95 duration-200", className)}>
      {children}
    </div>
  )
}
