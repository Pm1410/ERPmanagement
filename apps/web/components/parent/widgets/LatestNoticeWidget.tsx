"use client"

import * as React from "react"
import { Bell, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

const latestNotice = {
  id: 1,
  title: "Parent-Teacher Meeting – March 20",
  body: "Dear Parents, PTM for Classes 6–12 is scheduled on Friday, March 20, 2026 from 9:00 AM to 12:00 PM. Kindly ensure your presence to discuss your child's academic progress.",
  date: "Mar 14, 2026",
  type: "PTM",
}

export function LatestNoticeWidget() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-sm font-medium text-neutral-500">Latest Notice</CardTitle>
        <Bell className="h-4 w-4 text-neutral-400" />
      </CardHeader>
      <CardContent className="pb-4">
        {!latestNotice ? (
          <div className="py-6 text-center text-sm text-neutral-400">No notices</div>
        ) : (
          <div className="space-y-3">
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 leading-tight">
                  {latestNotice.title}
                </p>
                <Badge className="bg-primary/10 text-primary border-0 text-[10px] shrink-0">
                  {latestNotice.type}
                </Badge>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-3 leading-relaxed">
                {latestNotice.body}
              </p>
              <p className="text-[10px] text-neutral-400 mt-2">{latestNotice.date}</p>
            </div>
            <Link
              href="/parent/notices"
              className="flex items-center justify-end gap-1 text-xs font-medium text-primary hover:underline"
            >
              See all notices <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
