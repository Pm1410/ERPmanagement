import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Library } from "lucide-react"

const books = [
  { id: 1, title: "Introduction to Algorithms", due: "2026-03-18", status: "warning" },
  { id: 2, title: "Concepts of Physics Vol 1", due: "2026-03-22", status: "ok" },
]

export function LibraryWidget() {
  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-neutral-500">Library Books Issued</CardTitle>
        <Library className="h-4 w-4 text-neutral-500" />
      </CardHeader>
      <CardContent>
        {books.length > 0 ? (
          <div className="space-y-3">
            {books.map((book) => {
              const overdue = new Date(book.due) < new Date()
              return (
                <div key={book.id} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 truncate w-[60%]">{book.title}</span>
                  <Badge variant={overdue ? "destructive" : book.status === "warning" ? "secondary" : "default"} className="text-[10px]">
                    {overdue ? "Overdue" : `Due: ${new Date(book.due).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
                  </Badge>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-4 text-neutral-500">
            <span className="text-sm">No books issued</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
