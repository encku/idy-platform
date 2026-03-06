"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  User,
  Lock,
  EyeOff,
  Globe,
  Trash2,
  LogOut,
  ChevronRight,
  Crown,
  MailWarning,
  Loader2,
  ShieldCheck,
} from "lucide-react"
import { AppHeader } from "@/components/dashboard/app-header"
import { PremiumBadge } from "@/components/premium/premium-badge"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import { Switch } from "@/components/ui/switch"
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
import { apiClient } from "@/lib/api-client"
import { useFeatures } from "@/lib/features/context"
import { useTranslation } from "@/lib/i18n/context"
import { useAuth } from "@/lib/auth/context"
import { toast } from "sonner"

export default function SettingsPage() {
  const { t, locale, setLocale } = useTranslation()
  const { canEdit } = useAuth()
  const router = useRouter()
  const { isPremium } = useFeatures()
  const [loading, setLoading] = useState(true)
  const [isHidden, setIsHidden] = useState(false)
  const [emailVerified, setEmailVerified] = useState<boolean | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [sendingVerification, setSendingVerification] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const res = await apiClient.get<{
          data: { is_hidden: boolean; email_verified: boolean; auth_provider?: string }
        }>("/api/user")
        setIsHidden(res.data.is_hidden)
        setEmailVerified(res.data.email_verified)

        // Fetch 2FA status (skip for SSO users)
        if (!res.data.auth_provider || res.data.auth_provider === "local") {
          try {
            const tfRes = await apiClient.get<{ data: { is_enabled: boolean } }>("/api/user/2fa/status")
            setTwoFactorEnabled(tfRes.data.is_enabled)
          } catch {
            // 2FA status fetch failed, ignore
          }
        }
      } catch {
        // handled
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function handleHideToggle(checked: boolean) {
    setIsHidden(checked)
    try {
      await apiClient.put("/api/user", { is_hidden: checked })
    } catch {
      setIsHidden(!checked)
    }
  }

  async function handleDeleteAccount() {
    setDeleting(true)
    try {
      await apiClient.del("/api/user")
      toast.success(t("deleteAccountSuccess"))
      window.location.href = "/login"
    } catch {
      toast.error(t("deleteAccountError"))
    } finally {
      setDeleting(false)
      setDeleteOpen(false)
    }
  }

  async function handleResendVerification() {
    setSendingVerification(true)
    try {
      await apiClient.post("/api/send-verification-email", {})
      toast.success(t("verificationEmailSent"))
    } catch {
      toast.error(t("verificationEmailError"))
    } finally {
      setSendingVerification(false)
    }
  }

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } finally {
      window.location.href = "/login"
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <>
      <AppHeader title={t("settings")} />

      <div className="px-5 pt-5 pb-8">
        {/* Subscription Status */}
        <button
          onClick={() => router.push("/subscription")}
          className="flex w-full items-center gap-3 rounded-xl bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-amber-500/20 p-4 transition-colors hover:from-yellow-500/20 hover:to-amber-500/20 mb-4"
        >
          <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-r from-yellow-500 to-amber-500">
            <Crown className="size-5 text-white" />
          </div>
          <div className="flex-1 text-left">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-sm font-semibold">
                {isPremium ? t("premiumSubscription") : t("freeAccount")}
              </span>
              {isPremium && <PremiumBadge size="sm" />}
            </div>
            <span className="text-xs text-muted-foreground">
              {isPremium ? t("manageSubscription") : t("upgradeForPremiumFeatures")}
            </span>
          </div>
          <ChevronRight className="size-4 text-muted-foreground" />
        </button>

        {/* Email Verification Banner */}
        {emailVerified === false && (
          <div className="flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-50 dark:bg-amber-950/20 p-4 mb-4">
            <MailWarning className="size-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-amber-700 dark:text-amber-300">
                {t("emailNotVerified")}
              </p>
            </div>
            <button
              onClick={handleResendVerification}
              disabled={sendingVerification}
              className="shrink-0 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-amber-700 disabled:opacity-50"
            >
              {sendingVerification ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                t("resendVerificationEmail")
              )}
            </button>
          </div>
        )}

        <div className="space-y-2">
          {/* Edit Profile */}
          {canEdit && (
            <button
              onClick={() => router.push("/profile/edit")}
              className="flex w-full items-center gap-3 rounded-xl bg-muted/50 p-4 transition-colors hover:bg-muted"
            >
              <User className="size-5 text-muted-foreground" />
              <span className="flex-1 text-sm font-medium text-left">
                {t("editProfile")}
              </span>
              <ChevronRight className="size-4 text-muted-foreground" />
            </button>
          )}

          {/* Change Password */}
          {canEdit && (
            <button
              onClick={() => router.push("/profile/change-password")}
              className="flex w-full items-center gap-3 rounded-xl bg-muted/50 p-4 transition-colors hover:bg-muted"
            >
              <Lock className="size-5 text-muted-foreground" />
              <span className="flex-1 text-sm font-medium text-left">
                {t("changePassword")}
              </span>
              <ChevronRight className="size-4 text-muted-foreground" />
            </button>
          )}

          {/* Two-Factor Authentication */}
          {canEdit && (
            <button
              onClick={() => router.push("/settings/two-factor")}
              className="flex w-full items-center gap-3 rounded-xl bg-muted/50 p-4 transition-colors hover:bg-muted"
            >
              <ShieldCheck className="size-5 text-muted-foreground" />
              <span className="flex-1 text-sm font-medium text-left">
                {t("twoFactorAuth")}
              </span>
              <div className="flex items-center gap-2">
                {twoFactorEnabled && (
                  <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-600">
                    {t("enabled")}
                  </span>
                )}
                <ChevronRight className="size-4 text-muted-foreground" />
              </div>
            </button>
          )}

          {/* Change Language */}
          <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-4">
            <Globe className="size-5 text-muted-foreground" />
            <span className="flex-1 text-sm font-medium">
              {t("changeLanguage")}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setLocale("tr")}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  locale === "tr"
                    ? "bg-foreground text-background"
                    : "bg-muted hover:bg-muted-foreground/10"
                }`}
              >
                {t("languageTr")}
              </button>
              <button
                onClick={() => setLocale("en")}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  locale === "en"
                    ? "bg-foreground text-background"
                    : "bg-muted hover:bg-muted-foreground/10"
                }`}
              >
                {t("languageEn")}
              </button>
            </div>
          </div>

          {/* Hide My Profile */}
          {canEdit && (
            <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-4">
              <EyeOff className="size-5 text-muted-foreground" />
              <span className="flex-1 text-sm font-medium">
                {t("hideMyProfile")}
              </span>
              <Switch
                checked={isHidden}
                onCheckedChange={handleHideToggle}
              />
            </div>
          )}

          {/* Delete Account */}
          {canEdit && (
            <button
              onClick={() => setDeleteOpen(true)}
              className="flex w-full items-center gap-3 rounded-xl bg-destructive/5 p-4 transition-colors hover:bg-destructive/10"
            >
              <Trash2 className="size-5 text-destructive" />
              <span className="flex-1 text-sm font-medium text-left text-destructive">
                {t("deleteAccount")}
              </span>
            </button>
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl bg-muted/50 p-4 transition-colors hover:bg-muted"
          >
            <LogOut className="size-5 text-muted-foreground" />
            <span className="flex-1 text-sm font-medium text-left">
              {t("logout")}
            </span>
          </button>
        </div>
      </div>

      {/* Delete Account Confirmation */}
      {canEdit && (
        <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("deleteAccountTitle")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("deleteAccountMessage")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("no")}</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="bg-destructive text-white hover:bg-destructive/90"
              >
                {t("yes")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  )
}
