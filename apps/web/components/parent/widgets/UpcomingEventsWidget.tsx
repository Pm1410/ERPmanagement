"use client"

import * as React from "react"
import { CalendarDays } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const events = [
  { id: 1, title: "Parent-Teacher Meeting", date: "Mar 20, 2026", type: "PTM", color: "bg-primary/10 text-primary" },
  { id: 2, title: "Annual Sports Day", date: "Mar 25, 2026", type: "Event", color: "bg-success/10 text-success" },
  { id: 3, title: "Unit Test – Term 2", date: "Mar 28, 2026", type: "Exam", color: "bg-danger/10 text-danger" },
  { id: 4, title: "School Closed – Holi", date: "Mar 30, 2026", type: "Holiday", color: "bg-accent/10 text-accent" },
]

export function UpcomingEventsWidget() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-sm font-medium text-neutral-500">Upcoming Events</CardTitle>
        <CalendarDays className="h-4 w-4 text-neutral-400" />
      </CardHeader>
      <CardContent className="space-y-2 pb-4">
        {events.length === 0 ? (
          <div className="py-6 text-center text-sm text-neutral-400">No upcoming events</div>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className="flex items-center gap-3 rounded-lg p-2.5 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            >
              <div className="h-10 w-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex flex-col items-center justify-center shrink-0">
                <span className="text-[10px] font-bold text-neutral-500 uppercase leading-none">
                  {event.date.split(" ")[0]}
                </span>
                <span className="text-base font-bold leading-tight">
                  {event.date.split(" ")[1].replace(",", "")}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{event.title}</p>
                <p className="text-xs text-neutral-400">{event.date}</p>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${event.color}`}>
                {event.type}
              </span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
