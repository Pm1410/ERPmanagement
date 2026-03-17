"use client"

import * as React from "react"
import { CalendarCheck, BookOpen, CreditCard, Bell, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

const glanceItems = [
  {
    label: "Today's Attendance",
    value: "Present ✓",
    subtext: "Marked at 8:02 AM",
    icon: CalendarCheck,
    color: "text-success",
    bg: "bg-success/10",
    href: "/parent/attendance",
  },
  {
    label: "Next Exam",
    value: "Mathematics",
    subtext: "In 3 days — Mar 19",
    icon: BookOpen,
    color: "text-primary",
    bg: "bg-primary/10",
    href: "/parent/progress",
  },
  {
    label: "Pending Fees",
    value: "₹8,500",
    subtext: "Due: Mar 31, 2026",
    icon: CreditCard,
    color: "text-accent",
    bg: "bg-accent/10",
    href: "/parent/fees",
  },
  {
    label: "Latest Notice",
    value: "PTM on Mar 20",
    subtext: "View notice →",
    icon: Bell,
    color: "text-secondary",
    bg: "bg-secondary/10",
    href: "/parent/notices",
  },
]

export function GlanceWidget() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {glanceItems.map((item) => {
        const Icon = item.icon
        return (
          <Link key={item.label} href={item.href}>
            <Card className="h-full hover:shadow-elevated transition-shadow cursor-pointer group">
              <CardContent className="p-4 flex flex-col gap-3">
                <div className={`h-10 w-10 rounded-lg ${item.bg} flex items-center justify-center`}>
                  <Icon className={`h-5 w-5 ${item.color}`} />
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-0.5">{item.label}</p>
                  <p className={`text-sm font-semibold ${item.color}`}>{item.value}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">{item.subtext}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-neutral-300 group-hover:text-neutral-500 transition-colors self-end mt-auto" />
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
