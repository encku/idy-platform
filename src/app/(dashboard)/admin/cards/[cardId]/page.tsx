"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Copy, QrCode, Trash2, GitMerge } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { CardDetailStats } from "@/components/admin/cards/card-detail-stats"
import { CardFieldsList } from "@/components/admin/cards/card-fields-list"
import { QrCodeDialog } from "@/components/admin/cards/qr-code-dialog"
import { CloneCardDialog } from "@/components/admin/cards/clone-card-dialog"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { apiClient } from "@/lib/api-client"
import { useTranslation } from "@/lib/i18n/context"
import { toast } from "sonner"
import type { AdminCardDetail } from "@/lib/admin/types"

export default function CardDetailPage() {
  const { t } = useTranslation()
  const params = useParams<{ cardId: string }>()
  const router = useRouter()
  const [card, setCard] = useState<AdminCardDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [showQr, setShowQr] = useState(false)
  const [showClone, setShowClone] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const fetchCard = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiClient.get<{ data: AdminCardDetail }>(
        `/api/admin/cards/${params.cardId}`
      )
      setCard(res.data)
    } catch {
      setCard(null)
    } finally {
      setLoading(false)
    }
  }, [params.cardId])

  useEffect(() => {
    fetchCard()
  }, [fetchCard])

  async function handleDelete() {
    setDeleting(true)
    try {
      await apiClient.del(`/api/admin/cards/${params.cardId}`)
      toast.success(t("deleteCardSuccess"))
      router.push("/admin/cards")
    } catch {
      toast.error(t("errorOccurred"))
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-lg" />
      </div>
    )
  }

  if (!card) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {t("noResults")}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={card.card_user_preferred_name || card.card_public_key}
        subtitle={`${t("owner")}: ${card.user_name} (${card.user_email})`}
        backHref="/admin/cards"
      />

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => setShowQr(true)}>
          <QrCode className="size-4 mr-2" />
          {t("qrCode")}
        </Button>
        <Button variant="outline" size="sm" onClick={() => setShowClone(true)}>
          <Copy className="size-4 mr-2" />
          {t("cloneFields")}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/admin/cards/${params.cardId}/redirects`)}
        >
          <GitMerge className="size-4 mr-2" />
          {t("manageRedirects")}
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setShowDelete(true)}
        >
          <Trash2 className="size-4 mr-2" />
          {t("delete")}
        </Button>
      </div>

      <CardDetailStats
        views={card.total_views || 0}
        clicks={card.total_clicks || 0}
        shares={card.total_shares || 0}
      />

      <Separator />

      <div>
        <h3 className="text-lg font-semibold mb-4">{t("cardFields")}</h3>
        <CardFieldsList fields={card.fields || []} />
      </div>

      <QrCodeDialog
        open={showQr}
        onOpenChange={setShowQr}
        cardPublicKey={card.card_public_key}
        cardName={card.card_user_preferred_name}
      />
      <CloneCardDialog
        open={showClone}
        onOpenChange={setShowClone}
        sourceCardId={params.cardId}
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
    </div>
  )
}
