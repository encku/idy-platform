"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTranslation } from "@/lib/i18n/context"
import type { CardAnalyticsByDate } from "@/lib/admin/types"

interface ViewsOverTimeChartProps {
  data: CardAnalyticsByDate[]
}

export function ViewsOverTimeChart({ data }: ViewsOverTimeChartProps) {
  const { t } = useTranslation()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("viewsOverTime")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="views"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                name={t("totalViews")}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="clicks"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                name={t("totalClicks")}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="shares"
                stroke="hsl(var(--chart-3))"
                strokeWidth={2}
                name={t("totalShares")}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
