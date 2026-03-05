"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { User, CreditCard, Bot, BarChart3, Settings, Lock } from "lucide-react"
import { FEATURES } from "@/lib/features"
import { useFeatures } from "@/lib/features/context"
import { useTranslation } from "@/lib/i18n/context"
import { UpgradeDialog } from "@/components/premium/upgrade-dialog"
import type { FeatureName } from "@/lib/features"

const tabs = [
  { href: "/", icon: User, labelKey: "profile" },
  { href: "/cards", icon: CreditCard, labelKey: "myCards" },
  { href: "/ai-assistant", icon: Bot, labelKey: "aiAssistant", feature: FEATURES.AI_ASSISTANT },
  { href: "/stats", icon: BarChart3, labelKey: "stats", feature: FEATURES.ANALYTICS },
  { href: "/settings", icon: Settings, labelKey: "settings" },
] as const

export function BottomNav() {
  const pathname = usePathname()
  const { t } = useTranslation()
  const { hasFeature } = useFeatures()
  const [upgradeOpen, setUpgradeOpen] = useState(false)

  return (
    <>
      <nav className="sticky bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-md items-center justify-around">
          {tabs.map((tab) => {
            const isActive =
              tab.href === "/"
                ? pathname === "/" || pathname.startsWith("/profile")
                : pathname.startsWith(tab.href)

            const isLocked =
              "feature" in tab &&
              tab.feature &&
              !hasFeature(tab.feature as FeatureName)

            if (isLocked) {
              return (
                <button
                  key={tab.href}
                  type="button"
                  onClick={() => setUpgradeOpen(true)}
                  className="flex flex-col items-center gap-1 px-2 py-2 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  <div className="relative">
                    <tab.icon className="size-5" />
                    <Lock className="absolute -top-1 -right-2 size-2.5 text-amber-500" />
                  </div>
                  <span>{t(tab.labelKey)}</span>
                </button>
              )
            }

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex flex-col items-center gap-1 px-2 py-2 text-[10px] transition-colors ${
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="relative">
                  <tab.icon className={`size-5 ${isActive ? "stroke-[2.5]" : ""}`} />
                </div>
                <span className={isActive ? "font-medium" : ""}>
                  {t(tab.labelKey)}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>

      <UpgradeDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} />
    </>
  )
}
