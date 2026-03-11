"use client"

import { useState } from "react"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTranslation } from "@/lib/i18n/context"
import { toast } from "sonner"

interface ExportButtonProps {
  cardId: string
}

export function ExportButton({ cardId }: ExportButtonProps) {
  const { t } = useTranslation()
  const [exporting, setExporting] = useState(false)

  async function handleExport(format: "pdf" | "xlsx") {
    setExporting(true)
    try {
      const res = await fetch(
        `/api/admin/analytics/cards/${cardId}/export?format=${format}`
      )
      if (!res.ok) throw new Error("Export failed")
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `analytics-${cardId}.${format}`
      a.click()
      URL.revokeObjectURL(url)
      toast.success(t("exportSuccess"))
    } catch {
      toast.error(t("exportFailed"))
    } finally {
      setExporting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={exporting}>
          <Download className="size-4 mr-2" />
          {exporting ? t("saving") : t("export")}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => handleExport("pdf")}>
          {t("exportPdf")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("xlsx")}>
          {t("exportExcel")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
