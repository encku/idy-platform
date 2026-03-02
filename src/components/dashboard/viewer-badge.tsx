"use client"

import { Eye } from "lucide-react"
import { useTranslation } from "@/lib/i18n/context"

export function ViewerBadge() {
  const { t } = useTranslation()
  return (
    <div className="mx-5 mt-3 flex items-center gap-2 rounded-xl bg-blue-50 border border-blue-200 px-4 py-2.5 dark:bg-blue-950/30 dark:border-blue-800">
      <Eye className="size-4 text-blue-600 dark:text-blue-400 shrink-0" />
      <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">
        {t("viewerMode")}
      </span>
    </div>
  )
}
