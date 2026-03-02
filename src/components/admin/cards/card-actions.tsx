"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MoreHorizontal, Eye, Link2, ExternalLink, FileText, QrCode, Copy, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { QrCodeDialog } from "./qr-code-dialog"
import { CloneCardDialog } from "./clone-card-dialog"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { apiClient } from "@/lib/api-client"
import { useTranslation } from "@/lib/i18n/context"
import { toast } from "sonner"
import type { AdminCard } from "@/lib/admin/types"

interface CardActionsProps {
  card: AdminCard
  onPreview: () => void
  onUpdate?: () => void
}

export function CardActions({ card, onPreview, onUpdate }: CardActionsProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const cardUrl = `https://id.idycard.com/${card.card_public_key}`

  const [showQr, setShowQr] = useState(false)
  const [showClone, setShowClone] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  function handleCopyLink() {
    navigator.clipboard.writeText(cardUrl)
    toast.success(t("linkCopied"))
  }

  function handleOpenCard() {
    window.open(cardUrl, "_blank", "noopener,noreferrer")
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await apiClient.del(`/api/admin/cards/${card.card_id}`)
      toast.success(t("deleteCardSuccess"))
      onUpdate?.()
    } catch {
      toast.error(t("errorOccurred"))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => router.push(`/admin/cards/${card.card_id}`)}>
            <FileText className="size-4 mr-2" />
            {t("viewDetail")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onPreview}>
            <Eye className="size-4 mr-2" />
            {t("preview")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleCopyLink}>
            <Link2 className="size-4 mr-2" />
            {t("copyLink")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleOpenCard}>
            <ExternalLink className="size-4 mr-2" />
            {t("openInNewTab")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowQr(true)}>
            <QrCode className="size-4 mr-2" />
            {t("qrCode")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowClone(true)}>
            <Copy className="size-4 mr-2" />
            {t("cloneFields")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowDelete(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="size-4 mr-2" />
            {t("delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <QrCodeDialog
        open={showQr}
        onOpenChange={setShowQr}
        cardPublicKey={card.card_public_key}
        cardName={card.card_user_preferred_name}
      />
      <CloneCardDialog
        open={showClone}
        onOpenChange={setShowClone}
        sourceCardId={String(card.card_id)}
      />
      <ConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        onConfirm={handleDelete}
        title={t("deleteCardConfirmation")}
        description={t("deleteCardConfirmationMessage")}
        confirmLabel={t("delete")}
        loading={deleting}
      />
    </>
  )
}
