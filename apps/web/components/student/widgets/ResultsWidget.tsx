"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Award } from "lucide-react"

const results = [
  { subject: "Math", score: 88, average: 72, grade: "A2" },
  { subject: "Physics", score: 92, average: 68, grade: "A1" },
  { subject: "Chemistry", score: 78, average: 65, grade: "B1" },
]

export function ResultsWidget() {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-neutral-500">Recent Results (Unit Test 2)</CardTitle>
        <Award className="h-4 w-4 text-neutral-500" />
      </CardHeader>
      <CardContent className="flex-1 pt-4">
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={results} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
              <XAxis dataKey="subject" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="score" name="Your Score" fill="#1E40AF" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Bar dataKey="average" name="Class Avg" fill="#94A3B8" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {results.map((r, i) => (
            <div key={i} className="text-center rounded-md bg-neutral-50 dark:bg-neutral-800/50 p-2">
              <span className="block text-[10px] text-neutral-500 uppercase">{r.subject}</span>
              <span className="block text-lg font-bold text-neutral-900 dark:text-neutral-50">{r.score}<span className="text-xs text-neutral-500 font-normal">/100</span></span>
              <span className="block text-xs font-medium text-primary mt-0.5">Grade {r.grade}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
