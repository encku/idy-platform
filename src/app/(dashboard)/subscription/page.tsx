"use client"

import {
  Crown,
  Check,
  X,
  Sparkles,
  BarChart3,
  Image,
  Palette,
  CreditCard,
  FileUp,
  Smartphone,
  Clock,
} from "lucide-react"
import { AppHeader } from "@/components/dashboard/app-header"

const APP_STORE_URL = "https://apps.apple.com/tr/app/idycard/id6446066914"
const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.idycard.android"
import { format } from "date-fns"
import { PremiumBadge } from "@/components/premium/premium-badge"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import { useFeatures } from "@/lib/features/context"
import { useTranslation } from "@/lib/i18n/context"

const PREMIUM_FEATURES = [
  { icon: Sparkles, labelKey: "featureAiAssistant" },
  { icon: Sparkles, labelKey: "featureAiScan" },
  { icon: BarChart3, labelKey: "featureAnalytics" },
  { icon: Image, labelKey: "featureBackgroundPicture" },
  { icon: Image, labelKey: "featureBadgePicture" },
  { icon: Palette, labelKey: "featureCustomThemes" },
  { icon: FileUp, labelKey: "featureLargeFileUpload" },
  { icon: CreditCard, labelKey: "featureAddCard" },
]

export default function SubscriptionPage() {
  const { t } = useTranslation()
  const { isPremium, isInTrial, features, loading } = useFeatures()

  if (loading) return <LoadingSpinner />

  const expiresAt = features?.premium_expires_at
  const expiryDate = expiresAt
    ? format(new Date(expiresAt), "dd.MM.yyyy")
    : null
  const trialEndsAt = features?.trial_ends_at
  const trialEndDate = trialEndsAt
    ? format(new Date(trialEndsAt), "dd.MM.yyyy")
    : null
  const trialDaysRemaining = trialEndsAt
    ? Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null

  return (
    <>
      <AppHeader title={t("subscription")} backButton />

      <div className="px-5 pt-5 pb-8">
        {/* Trial Banner */}
        {isInTrial && trialDaysRemaining !== null && (
          <div className="rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 p-4 mb-4 text-white">
            <div className="flex items-center gap-3">
              <Clock className="size-5 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-bold">{t("trialBannerTitle")}</p>
                <p className="text-xs text-white/90">
                  {t("trialDaysRemaining").replace("{days}", String(trialDaysRemaining))}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Status Card */}
        <div
          className={`rounded-2xl p-6 mb-6 ${
            isPremium
              ? isInTrial
                ? "bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-orange-500/30"
                : "bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border border-amber-500/30"
              : "bg-muted/50"
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className={`flex size-14 items-center justify-center rounded-full ${
                isPremium
                  ? isInTrial
                    ? "bg-gradient-to-r from-amber-500 to-orange-500"
                    : "bg-gradient-to-r from-yellow-500 to-amber-500"
                  : "bg-muted-foreground/20"
              }`}
            >
              <Crown
                className={`size-7 ${
                  isPremium ? "text-white" : "text-muted-foreground"
                }`}
              />
            </div>
            <div>
              <h2 className="text-xl font-bold">
                {isPremium
                  ? isInTrial
                    ? t("trialActive")
                    : t("premiumActive")
                  : t("freeAccount")}
              </h2>
              {isPremium && !isInTrial && expiryDate && (
                <p className="text-sm text-muted-foreground">
                  {t("expiresOn").replace("{date}", expiryDate)}
                </p>
              )}
              {isInTrial && trialEndDate && (
                <p className="text-sm text-muted-foreground">
                  {t("trialEndsOn").replace("{date}", trialEndDate)}
                </p>
              )}
            </div>
          </div>
          {isPremium && !isInTrial && <PremiumBadge size="md" />}
        </div>

        {/* Feature List */}
        <h3 className="text-lg font-semibold mb-4">
          {t("premiumFeatures")}
        </h3>
        <div className="space-y-2 mb-6">
          {PREMIUM_FEATURES.map((feature, idx) => {
            const Icon = feature.icon
            return (
              <div
                key={idx}
                className={`flex items-center gap-3 rounded-xl p-3.5 ${
                  isPremium
                    ? "bg-emerald-500/10 border border-emerald-500/20"
                    : "bg-muted/30"
                }`}
              >
                <div
                  className={`flex size-9 items-center justify-center rounded-lg ${
                    isPremium ? "bg-emerald-500/20" : "bg-muted"
                  }`}
                >
                  <Icon
                    className={`size-4.5 ${
                      isPremium
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-muted-foreground"
                    }`}
                  />
                </div>
                <span className="flex-1 text-sm font-medium">
                  {t(feature.labelKey)}
                </span>
                {isPremium ? (
                  <Check className="size-4.5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <X className="size-4.5 text-muted-foreground/40" />
                )}
              </div>
            )
          })}
        </div>

        {/* Upgrade CTA */}
        {!isPremium && (
          <div className="rounded-2xl bg-gradient-to-r from-yellow-500 to-amber-500 p-6 text-white mb-6">
            <h3 className="text-lg font-bold mb-2">{t("unlockPremium")}</h3>
            <p className="text-sm text-white/90 mb-4">
              {t("premiumSubscriptionMessage")}
            </p>
            <div className="flex items-center justify-center gap-2 mb-3">
              <Smartphone className="size-4" />
              <p className="text-sm font-medium">
                {t("premiumMobileNote")}
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <a
                href={APP_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-white/20 hover:bg-white/30 transition-colors px-4 py-2 text-sm font-medium"
              >
                {t("downloadOnAppStore")}
              </a>
              <a
                href={PLAY_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-white/20 hover:bg-white/30 transition-colors px-4 py-2 text-sm font-medium"
              >
                {t("getItOnGooglePlay")}
              </a>
            </div>
          </div>
        )}

        {/* Limits */}
        {features?.limits && (
          <div className="p-4 rounded-xl bg-muted/50">
            <h4 className="text-sm font-semibold mb-3">{t("accountLimits")}</h4>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("maxFileSize")}</span>
                <span className="font-medium">
                  {(features.limits.max_single_file_size / (1024 * 1024)).toFixed(0)} MB
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("maxCards")}</span>
                <span className="font-medium">
                  {features.limits.max_cards === -1
                    ? t("unlimited")
                    : features.limits.max_cards}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("maxFieldsPerCard")}
                </span>
                <span className="font-medium">
                  {features.limits.max_fields_per_card === -1
                    ? t("unlimited")
                    : features.limits.max_fields_per_card}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
