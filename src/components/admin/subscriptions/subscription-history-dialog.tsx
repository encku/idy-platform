"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import { useTranslation } from "@/lib/i18n/context"
import { apiClient } from "@/lib/api-client"
import type { SubscriptionHistoryEvent } from "@/lib/admin/types"

interface SubscriptionHistoryDialogProps {
  open: boolean
  userId: number | null
  onOpenChange: (open: boolean) => void
}

const EVENT_COLORS: Record<string, string> = {
  InitialPurchase: "bg-emerald-500/10 text-emerald-600",
  Renewal: "bg-blue-500/10 text-blue-600",
  ProductChange: "bg-amber-500/10 text-amber-600",
  Cancellation: "bg-red-500/10 text-red-600",
  Uncancellation: "bg-purple-500/10 text-purple-600",
  Expiration: "bg-gray-500/10 text-gray-600",
}

export function SubscriptionHistoryDialog({
  open,
  userId,
  onOpenChange,
}: SubscriptionHistoryDialogProps) {
  const { t } = useTranslation()
  const [history, setHistory] = useState<SubscriptionHistoryEvent[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open || !userId) return
    setLoading(true)
    apiClient
      .get<{ data: { history: SubscriptionHistoryEvent[] } }>(
        `/api/admin/subscriptions/${userId}/history`
      )
      .then((res) => {
        const h = res.data?.history || res.data || []
        setHistory(Array.isArray(h) ? h : [])
      })
      .catch(() => setHistory([]))
      .finally(() => setLoading(false))
  }, [open, userId])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("subscriptionHistory")}</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="space-y-3 py-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            {t("noSubscriptionHistory")}
          </div>
        ) : (
          <div className="space-y-3 py-2">
            {history.map((event, i) => (
              <div
                key={event.id || i}
                className="flex items-center gap-3 rounded-lg border p-3"
              >
                <div className="flex-1 min-w-0">
                  <Badge
                    className={
                      EVENT_COLORS[event.event_type] ||
                      "bg-muted text-muted-foreground"
                    }
                  >
                    {event.event_type}
                  </Badge>
                  {event.plan_type && (
                    <span className="ml-2 text-xs text-muted-foreground capitalize">
                      {event.plan_type}
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground shrink-0">
                  {format(new Date(event.created_at), "dd.MM.yyyy")}
                </span>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
