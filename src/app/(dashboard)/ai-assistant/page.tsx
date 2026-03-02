"use client"

import { Bot } from "lucide-react"
import { AppHeader } from "@/components/dashboard/app-header"
import { useTranslation } from "@/lib/i18n/context"

export default function AIAssistantPage() {
  const { t } = useTranslation()

  return (
    <>
      <AppHeader title={t("aiAssistant")} />
      <div className="flex flex-col items-center justify-center px-5 py-20 text-center">
        <Bot className="size-16 text-muted-foreground/30 mb-4" />
        <p className="text-muted-foreground text-sm">{t("comingSoon")}</p>
      </div>
    </>
  )
}
