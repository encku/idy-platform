"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Crown, ShieldOff, History } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { GrantPremiumDialog } from "./grant-premium-dialog"
import { SubscriptionHistoryDialog } from "./subscription-history-dialog"
import { useTranslation } from "@/lib/i18n/context"
import { apiClient } from "@/lib/api-client"
import type { AdminSubscription } from "@/lib/admin/types"

interface SubscriptionTableProps {
  subscriptions: AdminSubscription[]
  loading: boolean
  onUpdate: () => void
}

export function SubscriptionTable({
  subscriptions,
  loading,
  onUpdate,
}: SubscriptionTableProps) {
  const { t } = useTranslation()
  const [revokeUserId, setRevokeUserId] = useState<number | null>(null)
  const [revoking, setRevoking] = useState(false)
  const [grantUserId, setGrantUserId] = useState<number | null>(null)
  const [historyUserId, setHistoryUserId] = useState<number | null>(null)

  async function handleRevoke() {
    if (!revokeUserId) return
    setRevoking(true)
    try {
      await apiClient.post(`/api/admin/subscriptions/${revokeUserId}/revoke`, {
        reason: "Revoked by admin",
      })
      toast.success(t("premiumRevoked"))
      onUpdate()
    } catch {
      toast.error(t("errorOccurred"))
    } finally {
      setRevoking(false)
      setRevokeUserId(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (subscriptions.length === 0) {
    return (
      <div className="rounded-lg border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
        {t("noResults")}
      </div>
    )
  }

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("name")}</TableHead>
              <TableHead>{t("email")}</TableHead>
              <TableHead>{t("planType")}</TableHead>
              <TableHead>{t("platform")}</TableHead>
              <TableHead>{t("status")}</TableHead>
              <TableHead>{t("expiresOn2")}</TableHead>
              <TableHead className="w-[120px]">{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscriptions.map((sub) => {
              const isExpired =
                sub.expires_at && new Date(sub.expires_at) < new Date()
              return (
                <TableRow key={sub.id}>
                  <TableCell className="font-medium">
                    {sub.user_name || `User #${sub.user_id}`}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {sub.user_email || "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {sub.plan_type || "-"}
                    </Badge>
                  </TableCell>
                  <TableCell className="capitalize text-muted-foreground">
                    {sub.platform || "-"}
                  </TableCell>
                  <TableCell>
                    {sub.is_premium && !isExpired ? (
                      <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                        {t("active")}
                      </Badge>
                    ) : (
                      <Badge variant="secondary">{t("expired")}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {sub.expires_at
                      ? new Date(sub.expires_at).toLocaleDateString()
                      : sub.plan_type === "lifetime"
                        ? t("unlimited")
                        : "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        title={t("subscriptionHistory")}
                        onClick={() => setHistoryUserId(sub.user_id)}
                      >
                        <History className="size-4" />
                      </Button>
                      {sub.is_premium && !isExpired ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          title={t("revokePremium")}
                          onClick={() => setRevokeUserId(sub.user_id)}
                        >
                          <ShieldOff className="size-4 text-destructive" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          title={t("grantPremium")}
                          onClick={() => setGrantUserId(sub.user_id)}
                        >
                          <Crown className="size-4 text-yellow-500" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <ConfirmDialog
        open={revokeUserId !== null}
        onOpenChange={() => setRevokeUserId(null)}
        onConfirm={handleRevoke}
        title={t("revokePremium")}
        description={t("revokePremiumMessage")}
        loading={revoking}
      />

      <GrantPremiumDialog
        open={grantUserId !== null}
        userId={grantUserId}
        onOpenChange={() => setGrantUserId(null)}
        onSuccess={onUpdate}
      />

      <SubscriptionHistoryDialog
        open={historyUserId !== null}
        userId={historyUserId}
        onOpenChange={() => setHistoryUserId(null)}
      />
    </>
  )
}
