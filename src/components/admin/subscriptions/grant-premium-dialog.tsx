"use client"

import { useState } from "react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTranslation } from "@/lib/i18n/context"
import { apiClient } from "@/lib/api-client"

interface GrantPremiumDialogProps {
  open: boolean
  userId: number | null
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

const PLAN_TYPES = ["monthly", "yearly", "lifetime"] as const

export function GrantPremiumDialog({
  open,
  userId,
  onOpenChange,
  onSuccess,
}: GrantPremiumDialogProps) {
  const { t } = useTranslation()
  const [userIdInput, setUserIdInput] = useState("")
  const [planType, setPlanType] = useState<string>("monthly")
  const [expiresAt, setExpiresAt] = useState("")
  const [reason, setReason] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const resolvedUserId = userId ?? (userIdInput ? Number(userIdInput) : null)

  async function handleSubmit() {
    if (!resolvedUserId) return
    setSubmitting(true)
    try {
      await apiClient.post(`/api/admin/subscriptions/${resolvedUserId}/grant`, {
        planType,
        ...(planType !== "lifetime" && expiresAt ? { expiresAt: new Date(expiresAt).toISOString() } : {}),
        ...(reason ? { reason } : {}),
      })
      toast.success(t("premiumGranted"))
      onOpenChange(false)
      setUserIdInput("")
      setPlanType("monthly")
      setExpiresAt("")
      setReason("")
      onSuccess()
    } catch {
      toast.error(t("errorOccurred"))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("grantPremium")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {!userId && (
            <div className="space-y-2">
              <Label>{t("userId")}</Label>
              <Input
                type="number"
                value={userIdInput}
                onChange={(e) => setUserIdInput(e.target.value)}
                placeholder={t("enterUserId")}
              />
            </div>
          )}
          <div className="space-y-2">
            <Label>{t("planType")}</Label>
            <div className="flex gap-2">
              {PLAN_TYPES.map((pt) => (
                <button
                  key={pt}
                  onClick={() => setPlanType(pt)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize ${
                    planType === pt
                      ? "bg-foreground text-background"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {t(pt)}
                </button>
              ))}
            </div>
          </div>

          {planType !== "lifetime" && (
            <div className="space-y-2">
              <Label>{t("expiresOn2")}</Label>
              <Input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>{t("reason")}</Label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t("reasonPlaceholder")}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || !resolvedUserId}>
            {submitting ? t("saving") : t("grantPremium")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
