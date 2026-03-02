"use client"

import { QRCodeSVG } from "qrcode.react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useTranslation } from "@/lib/i18n/context"

interface QrDialogProps {
  open: boolean
  onClose: () => void
  url: string
  cardName?: string
}

export function QrDialog({ open, onClose, url, cardName }: QrDialogProps) {
  const { t } = useTranslation()

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xs p-6">
        <DialogHeader>
          <DialogTitle className="text-center">
            {cardName || t("qrCode")}
          </DialogTitle>
        </DialogHeader>
        <div className="flex justify-center py-4">
          <QRCodeSVG value={url} size={220} level="M" />
        </div>
        <p className="text-center text-xs text-muted-foreground break-all">
          {url}
        </p>
      </DialogContent>
    </Dialog>
  )
}
