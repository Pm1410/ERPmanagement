"use client"

import * as React from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const results = [
  { subject: "Math", marks: 87, max: 100, grade: "A" },
  { subject: "Science", marks: 74, max: 100, grade: "B+" },
  { subject: "English", marks: 91, max: 100, grade: "A+" },
  { subject: "History", marks: 66, max: 100, grade: "B" },
  { subject: "Hindi", marks: 79, max: 100, grade: "A-" },
]

const getColor = (marks: number) => {
  if (marks >= 85) return "#16A34A"
  if (marks >= 70) return "#1E40AF"
  if (marks >= 60) return "#D97706"
  return "#DC2626"
}

export function RecentResultsWidget() {
  const avg = Math.round(results.reduce((s, r) => s + r.marks, 0) / results.length)

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-neutral-500">Recent Exam Results</CardTitle>
        <div className="flex items-center gap-2">
          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-0 text-xs">Avg: {avg}%</Badge>
          <TrendingUp className="h-4 w-4 text-neutral-400" />
        </div>
      </CardHeader>
      <CardContent className="flex-1 pb-4">
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={results} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <XAxis dataKey="subject" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                formatter={(v: number) => [`${v}/100`, "Marks"]}
              />
              <Bar dataKey="marks" radius={[4, 4, 0, 0]}>
                {results.map((r, i) => (
                  <Cell key={i} fill={getColor(r.marks)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {results.map((r) => (
            <div key={r.subject} className="flex items-center gap-1.5">
              <span className="text-xs text-neutral-500">{r.subject}:</span>
              <span className="text-xs font-semibold">{r.marks}</span>
              <span
                className="text-[10px] font-bold px-1 rounded"
                style={{ color: getColor(r.marks), backgroundColor: `${getColor(r.marks)}18` }}
              >
                {r.grade}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
