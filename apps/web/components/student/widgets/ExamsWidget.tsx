import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays } from "lucide-react"

const exams = [
  { id: 1, subject: "Mathematics", date: "2026-03-20", time: "10:00 AM", type: "Mid-Term", daysLeft: 4 },
  { id: 2, subject: "Physics", date: "2026-03-22", time: "10:00 AM", type: "Mid-Term", daysLeft: 6 },
  { id: 3, subject: "Chemistry", date: "2026-03-24", time: "10:00 AM", type: "Mid-Term", daysLeft: 8 },
  { id: 4, subject: "English", date: "2026-03-26", time: "10:00 AM", type: "Mid-Term", daysLeft: 10 },
  { id: 5, subject: "Computer Science", date: "2026-03-28", time: "10:00 AM", type: "Mid-Term", daysLeft: 12 },
]

export function ExamsWidget() {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-neutral-500">Upcoming Exams</CardTitle>
        <CalendarDays className="h-4 w-4 text-neutral-500" />
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        <div className="space-y-4">
          {exams.map((exam) => (
            <div key={exam.id} className="flex items-center justify-between border-b last:border-0 pb-3 last:pb-0">
              <div>
                <h4 className="font-medium text-sm text-neutral-900 dark:text-neutral-50">{exam.subject}</h4>
                <div className="flex gap-2 text-xs text-neutral-500 mt-1">
                  <span>{new Date(exam.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                  <span>&bull;</span>
                  <span>{exam.time}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge variant={exam.daysLeft <= 5 ? "destructive" : "secondary"} className="text-[10px] px-1.5 py-0 h-4">
                  In {exam.daysLeft} days
                </Badge>
                <span className="text-[10px] text-neutral-500 uppercase">{exam.type}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
