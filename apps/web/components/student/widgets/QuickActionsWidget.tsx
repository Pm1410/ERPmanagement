import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { CalendarOff, FileBadge, FileSignature, MessageSquareWarning } from "lucide-react"
import Link from "next/link"

const actions = [
  { label: "Apply Leave", icon: CalendarOff, href: "/student/attendance", color: "text-blue-500 bg-blue-50 dark:bg-blue-900/20" },
  { label: "Download ID", icon: FileBadge, href: "#", color: "text-green-500 bg-green-50 dark:bg-green-900/20" },
  { label: "Certificate", icon: FileSignature, href: "#", color: "text-purple-500 bg-purple-50 dark:bg-purple-900/20" },
  { label: "Grievance", icon: MessageSquareWarning, href: "/student/grievance", color: "text-orange-500 bg-orange-50 dark:bg-orange-900/20" },
]

export function QuickActionsWidget() {
  return (
    <Card className="bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-900 overflow-hidden border-none shadow-sm">
      <CardContent className="p-4 sm:p-6">
        <h3 className="text-sm font-medium text-neutral-500 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-4 gap-2 sm:gap-4">
          {actions.map((action) => {
            const Icon = action.icon
            return (
              <Link key={action.label} href={action.href} className="group flex flex-col items-center gap-2 text-center">
                <div className={`p-3 rounded-xl transition-transform group-hover:scale-110 ${action.color}`}>
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <span className="text-[10px] sm:text-xs font-medium text-neutral-700 dark:text-neutral-300">{action.label}</span>
              </Link>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
