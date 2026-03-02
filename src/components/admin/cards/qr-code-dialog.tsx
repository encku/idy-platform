"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { QRCodeSVG } from "qrcode.react"
import { Download } from "lucide-react"
import { useTranslation } from "@/lib/i18n/context"

interface QrCodeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cardPublicKey: string
  cardName?: string
}

export function QrCodeDialog({
  open,
  onOpenChange,
  cardPublicKey,
  cardName,
}: QrCodeDialogProps) {
  const { t } = useTranslation()
  const cardUrl = `https://id.idycard.com/${cardPublicKey}`

  function handleDownload() {
    const svg = document.querySelector("#qr-code-svg svg") as SVGElement
    if (!svg) return

    const serializer = new XMLSerializer()
    const svgStr = serializer.serializeToString(svg)
    const blob = new Blob([svgStr], { type: "image/svg+xml" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = `qr-${cardPublicKey}.svg`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{t("qrCode")}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          {cardName && (
            <p className="text-sm font-medium">{cardName}</p>
          )}
          <div id="qr-code-svg" className="rounded-lg bg-white p-4">
            <QRCodeSVG value={cardUrl} size={200} />
          </div>
          <p className="text-xs text-muted-foreground break-all text-center">
            {cardUrl}
          </p>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="size-4 mr-2" />
            {t("downloadQr")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
