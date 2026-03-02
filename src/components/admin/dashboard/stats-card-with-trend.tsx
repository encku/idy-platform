"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"
import type { DashboardTrend } from "@/lib/admin/types"

interface StatsCardWithTrendProps {
  title: string
  value: number
  icon: React.ReactNode
  trend?: DashboardTrend
  vsLabel?: string
}

export function StatsCardWithTrend({
  title,
  value,
  icon,
  trend,
  vsLabel,
}: StatsCardWithTrendProps) {
  const TrendIcon =
    trend?.direction === "up"
      ? TrendingUp
      : trend?.direction === "down"
        ? TrendingDown
        : Minus

  const trendColor =
    trend?.direction === "up"
      ? "text-green-600"
      : trend?.direction === "down"
        ? "text-red-500"
        : "text-muted-foreground"

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">{value.toLocaleString()}</p>
        {trend && (
          <div className={cn("flex items-center gap-1 mt-1 text-xs", trendColor)}>
            <TrendIcon className="size-3" />
            <span>
              {trend.direction === "up" ? "+" : ""}
              {trend.value}%
            </span>
            {vsLabel && (
              <span className="text-muted-foreground ml-1">{vsLabel}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
