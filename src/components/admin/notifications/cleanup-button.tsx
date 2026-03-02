"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { apiClient } from "@/lib/api-client"
import { useTranslation } from "@/lib/i18n/context"
import { toast } from "sonner"
import { Trash } from "lucide-react"

export function CleanupButton() {
  const { t } = useTranslation()
  const [showConfirm, setShowConfirm] = useState(false)
  const [cleaning, setCleaning] = useState(false)

  async function handleCleanup() {
    setCleaning(true)
    try {
      await apiClient.post("/api/admin/notifications/cleanup", {})
      toast.success(t("cleanupSuccess"))
      setShowConfirm(false)
    } catch {
      toast.error(t("errorOccurred"))
    } finally {
      setCleaning(false)
    }
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowConfirm(true)}
      >
        <Trash className="size-4 mr-2" />
        {t("cleanupInactiveTokens")}
      </Button>

      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        onConfirm={handleCleanup}
        title={t("cleanupInactiveTokens")}
        description={t("cleanupConfirmation")}
        confirmLabel={t("confirm")}
        variant="destructive"
        loading={cleaning}
      />
    </>
  )
}
