"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"

const timetable = [
  { time: "08:30 AM - 09:15 AM", subject: "Mathematics", teacher: "Mr. Sharma", room: "Room 101", isCurrent: false },
  { time: "09:15 AM - 10:00 AM", subject: "Physics", teacher: "Ms. Gupta", room: "Lab 2", isCurrent: false },
  { time: "10:00 AM - 10:15 AM", subject: "Break", teacher: "", room: "", isCurrent: false, isBreak: true },
  { time: "10:15 AM - 11:00 AM", subject: "Computer Science", teacher: "Mr. Patel", room: "Lab 4", isCurrent: true },
  { time: "11:00 AM - 11:45 AM", subject: "English", teacher: "Mrs. Davis", room: "Room 102", isCurrent: false },
]

export function TimetableWidget() {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-neutral-500">Today's Timetable</CardTitle>
        <Clock className="h-4 w-4 text-neutral-500" />
      </CardHeader>
      <CardContent className="flex-1 overflow-auto pr-2">
        <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-neutral-200 dark:before:via-neutral-700 before:to-transparent">
          {timetable.map((slot, i) => (
            <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              {/* Timeline dot */}
              <div 
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full border-4 bg-white dark:bg-neutral-900 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10",
                  slot.isCurrent ? "border-primary text-primary" : "border-neutral-200 dark:border-neutral-700 text-neutral-400"
                )}
              >
                {slot.isBreak ? <div className="h-2 w-2 rounded-full bg-neutral-400" /> : <div className={cn("h-3 w-3 rounded-full", slot.isCurrent ? "bg-primary" : "bg-neutral-300 dark:bg-neutral-600")} />}
              </div>
              
              {/* Box */}
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] md:px-4">
                <div 
                  className={cn(
                    "p-3 rounded-lg border",
                    slot.isCurrent 
                      ? "bg-primary/5 border-primary/20 shadow-sm" 
                      : slot.isBreak ? "bg-neutral-50 dark:bg-neutral-800/50 border-transparent border-dashed text-center" : "bg-white dark:bg-neutral-900 shadow-sm"
                  )}
                >
                  <p className="text-xs text-neutral-500 mb-1">{slot.time}</p>
                  <h4 className={cn("text-sm font-semibold", slot.isCurrent ? "text-primary dark:text-primary-foreground" : "")}>{slot.subject}</h4>
                  {!slot.isBreak && (
                    <div className="mt-1 flex items-center justify-between text-xs text-neutral-500">
                      <span>{slot.teacher}</span>
                      <span>{slot.room}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
