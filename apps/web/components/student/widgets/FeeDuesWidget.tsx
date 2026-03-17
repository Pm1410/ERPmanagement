import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Receipt } from "lucide-react"

export function FeeDuesWidget() {
  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-neutral-500">Fee Dues</CardTitle>
        <Receipt className="h-4 w-4 text-neutral-500" />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center p-4 bg-danger/5 border border-danger/10 rounded-lg dark:bg-danger/10 mb-4">
          <span className="text-sm font-medium text-danger mb-1">Outstanding Balance</span>
          <span className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">₹ 15,400</span>
          <span className="text-xs text-neutral-500 mt-2">Due Date: 10th April 2026</span>
        </div>
        
        <div className="space-y-3 mb-4">
          <div className="flex justify-between text-sm border-b pb-2">
            <span className="text-neutral-600 dark:text-neutral-400">Tuition Fee (Q1)</span>
            <span className="font-medium">₹ 12,000</span>
          </div>
          <div className="flex justify-between text-sm border-b pb-2">
            <span className="text-neutral-600 dark:text-neutral-400">Transport Fee</span>
            <span className="font-medium">₹ 2,400</span>
          </div>
          <div className="flex justify-between text-sm border-b pb-2">
            <span className="text-neutral-600 dark:text-neutral-400">Lab Fee</span>
            <span className="font-medium">₹ 1,000</span>
          </div>
        </div>

        <Button className="w-full bg-primary hover:bg-primary/90 text-white">Pay Now</Button>
      </CardContent>
    </Card>
  )
}
