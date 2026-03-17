"use client"

import * as React from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { CalendarCheck } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const data = [
  { name: "Present", value: 18, color: "#16A34A" },
  { name: "Absent", value: 3, color: "#DC2626" },
  { name: "Late", value: 2, color: "#D97706" },
  { name: "Leave", value: 1, color: "#1E40AF" },
]
const total = data.reduce((s, d) => s + d.value, 0)
const presentPct = Math.round(((data[0].value + data[2].value) / total) * 100)

export function AttendanceSummaryWidget() {
  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-neutral-500">Attendance — This Month</CardTitle>
        <CalendarCheck className="h-4 w-4 text-neutral-400" />
      </CardHeader>
      <CardContent className="flex-1 flex flex-col items-center pb-4">
        <div className="relative h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={72}
                paddingAngle={3}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} strokeWidth={0} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                itemStyle={{ color: "#0f172a", fontWeight: 500 }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">{presentPct}%</span>
            <span className="text-xs text-neutral-500">Attendance</span>
          </div>
        </div>

        {presentPct < 75 && (
          <div className="w-full mb-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-2 text-xs font-medium text-danger text-center">
            ⚠️ Attendance below 75% threshold
          </div>
        )}

        <div className="w-full grid grid-cols-4 gap-1 text-center mt-2">
          {data.map((d) => (
            <div key={d.name} className="flex flex-col items-center">
              <div className="h-2 w-2 rounded-full mb-1" style={{ backgroundColor: d.color }} />
              <span className="text-[10px] text-neutral-500">{d.name}</span>
              <span className="text-sm font-semibold">{d.value}d</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
