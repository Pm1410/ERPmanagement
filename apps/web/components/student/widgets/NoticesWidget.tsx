import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BellRing, ChevronRight } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

const notices = [
  { id: 1, title: "Summer Vacation Announcement", date: "2 days ago", isRead: false },
  { id: 2, title: "Science Fair 2026 Registration Open", date: "4 days ago", isRead: false },
  { id: 3, title: "Revised Timetable for Unit Tests", date: "1 week ago", isRead: true },
  { id: 4, title: "Fee Payment Deadline Reminder", date: "2 weeks ago", isRead: true },
]

export function NoticesWidget() {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-neutral-500">Recent Notices</CardTitle>
        <BellRing className="h-4 w-4 text-neutral-500" />
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        <div className="space-y-4">
          {notices.map((notice) => (
            <Link key={notice.id} href={`/student/notices?id=${notice.id}`}>
              <div className="group flex items-start gap-3 border-b last:border-0 pb-3 last:pb-0 cursor-pointer">
                <div className={cn("mt-1 shrink-0 h-2 w-2 rounded-full", notice.isRead ? "bg-transparent" : "bg-primary")} />
                <div className="flex-1">
                  <h4 className={cn("text-sm transition-colors group-hover:text-primary", notice.isRead ? "font-normal text-neutral-600 dark:text-neutral-400" : "font-semibold text-neutral-900 dark:text-neutral-50")}>
                    {notice.title}
                  </h4>
                  <p className="text-xs text-neutral-500 mt-0.5">{notice.date}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-neutral-400 opacity-0 transition-opacity group-hover:opacity-100 mt-1" />
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-4 text-center">
          <Link href="/student/notices" className="text-xs font-medium text-primary hover:underline">
            View All Notices
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
