"use client"

import * as React from "react"
import { AlertTriangle, CreditCard } from "lucide-react"
import Link from "next/link"

const overdueAmount: number = 8500
const dueDate = "Mar 31, 2026"
const isOverdue = false // Set to true for red banner

export function FeeAlertWidget() {
  if (overdueAmount === 0) return null

  return (
    <div
      className={`rounded-xl border px-5 py-4 flex items-center justify-between gap-4 ${
        isOverdue
          ? "bg-red-50 dark:bg-red-900/10 border-red-300 dark:border-red-800"
          : "bg-accent/5 border-accent/30"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
          isOverdue ? "bg-danger/10" : "bg-accent/10"
        }`}>
          {isOverdue ? (
            <AlertTriangle className="h-5 w-5 text-danger" />
          ) : (
            <CreditCard className="h-5 w-5 text-accent" />
          )}
        </div>
        <div>
          <p className={`font-semibold text-sm ${isOverdue ? "text-danger" : "text-accent"}`}>
            {isOverdue ? "⚠️ Overdue Fee Alert" : "📅 Fee Due Soon"}
          </p>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
            ₹{overdueAmount.toLocaleString()} pending — Due {dueDate}
          </p>
        </div>
      </div>
      <Link
        href="/parent/fees"
        className={`shrink-0 text-sm font-semibold px-4 py-2 rounded-lg transition-colors ${
          isOverdue
            ? "bg-danger text-white hover:bg-red-700"
            : "bg-accent text-white hover:bg-amber-600"
        }`}
      >
        Pay Now
      </Link>
    </div>
  )
}
