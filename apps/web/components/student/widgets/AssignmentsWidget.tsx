import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookMarked } from "lucide-react"

const assignments = [
  { id: 1, title: "Algebra Ex 4.2", subject: "Mathematics", due: "Today", status: "pending" },
  { id: 2, title: "Newton's Laws Quiz", subject: "Physics", due: "Tomorrow", status: "pending" },
  { id: 3, title: "Organic Chemistry Essay", subject: "Chemistry", due: "In 3 Days", status: "pending" },
]

export function AssignmentsWidget() {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-neutral-500">Assignments Due</CardTitle>
        <BookMarked className="h-4 w-4 text-neutral-500" />
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        <div className="space-y-4">
          {assignments.map((assignment) => (
            <div key={assignment.id} className="flex items-center justify-between border-b last:border-0 pb-3 last:pb-0">
              <div>
                <h4 className="font-medium text-sm text-neutral-900 dark:text-neutral-50">{assignment.title}</h4>
                <p className="text-xs text-neutral-500 mt-1">{assignment.subject}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge variant="outline" className="text-[10px] text-accent border-accent/20 bg-accent/5">Due: {assignment.due}</Badge>
                <button className="text-[10px] font-medium text-primary hover:underline">Submit Now &rarr;</button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
