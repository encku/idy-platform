"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  UserPlus,
  CreditCard,
  Bell,
  Activity,
  Eye,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { tr, enUS } from "date-fns/locale"
import { useTranslation } from "@/lib/i18n/context"
import { cn } from "@/lib/utils"
import type { RecentActivity } from "@/lib/admin/types"

interface RecentActivityTimelineProps {
  activities: RecentActivity[]
  title: string
  loading?: boolean
}

const activityConfig: Record<string, { icon: typeof Activity; color: string }> = {
  user_created: { icon: UserPlus, color: "text-green-500 bg-green-500/10" },
  card_activated: { icon: CreditCard, color: "text-blue-500 bg-blue-500/10" },
  notification_sent: { icon: Bell, color: "text-orange-500 bg-orange-500/10" },
  card_viewed: { icon: Eye, color: "text-purple-500 bg-purple-500/10" },
}

const fallbackConfig = { icon: Activity, color: "text-muted-foreground bg-muted" }

export function RecentActivityTimeline({
  activities,
  title,
  loading,
}: RecentActivityTimelineProps) {
  const { t, locale } = useTranslation()
  const dateFnsLocale = locale === "tr" ? tr : enUS
  const items = Array.isArray(activities) ? activities : []

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="size-8 rounded-full shrink-0" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            {t("noRecentActivity")}
          </p>
        ) : (
          <div className="space-y-4">
            {items.map((activity, i) => {
              const config = activityConfig[activity.type] || fallbackConfig
              const Icon = config.icon
              return (
                <div key={i} className="flex items-start gap-3">
                  <div
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-full",
                      config.color
                    )}
                  >
                    <Icon className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {activity.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDistanceToNow(new Date(activity.inserted_at), {
                        addSuffix: true,
                        locale: dateFnsLocale,
                      })}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
