"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { CalendarCheck } from "lucide-react"

const data = [
  { name: "Present", value: 72, color: "#16A34A" }, // success
  { name: "Absent", value: 15, color: "#DC2626" },   // danger
  { name: "Late", value: 8, color: "#D97706" },      // accent
  { name: "Leave", value: 5, color: "#1E40AF" },     // primary
]

export function AttendanceWidget() {
  const totalPercentage = 72 + 8 // Present + Late is usually counted towards attendance

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-neutral-500">Attendance Overview</CardTitle>
        <CalendarCheck className="h-4 w-4 text-neutral-500" />
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center pb-2">
        <div className="h-[200px] w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                itemStyle={{ color: '#171717', fontWeight: 500 }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-3xl font-bold">{totalPercentage}%</span>
            <span className="text-xs text-neutral-500">Avg</span>
          </div>
        </div>
        
        {totalPercentage < 75 && (
          <div className="mt-2 bg-red-50 dark:bg-red-900/10 text-danger border border-red-200 dark:border-red-800 rounded-md p-2 text-xs font-medium text-center">
            Warning: Attendance is below 75%
          </div>
        )}

        <div className="mt-4 grid grid-cols-4 text-center text-xs">
          {data.map((item) => (
            <div key={item.name} className="flex flex-col items-center">
              <div className="w-2 h-2 rounded-full mb-1" style={{ backgroundColor: item.color }} />
              <span className="text-neutral-500">{item.name}</span>
              <span className="font-semibold">{item.value}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
