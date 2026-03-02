"use client"

import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useTranslation } from "@/lib/i18n/context"
import { PremiumBadge } from "./premium-badge"

interface UpgradeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  variant?: "dialog" | "blocking"
}

export function UpgradeDialog({
  open,
  onOpenChange,
  variant = "dialog",
}: UpgradeDialogProps) {
  const { t } = useTranslation()
  const router = useRouter()

  const isBlocking = variant === "blocking"

  function handleUpgrade() {
    if (!isBlocking) onOpenChange(false)
    router.push("/subscription")
  }

  function handleGoBack() {
    router.back()
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={isBlocking ? undefined : onOpenChange}
    >
      <AlertDialogContent
        onEscapeKeyDown={isBlocking ? (e) => e.preventDefault() : undefined}
      >
        <AlertDialogHeader>
          <div className="flex justify-center mb-2">
            <PremiumBadge size="md" />
          </div>
          <AlertDialogTitle className="text-center">
            {t("premiumFeatureTitle")}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            {t("premiumFeatureDescription")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {isBlocking ? (
            <AlertDialogCancel onClick={handleGoBack}>
              {t("goBack")}
            </AlertDialogCancel>
          ) : (
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
          )}
          <AlertDialogAction
            onClick={handleUpgrade}
            className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white hover:from-yellow-600 hover:to-amber-600"
          >
            {t("upgradeToPremium")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
