"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { apiClient } from "@/lib/api-client"
import { useTranslation } from "@/lib/i18n/context"
import { toast } from "sonner"
import { Trash2, Plus } from "lucide-react"
import type { MergeCard, AdminCard } from "@/lib/admin/types"

export default function CardRedirectsPage() {
  const { t } = useTranslation()
  const params = useParams<{ cardId: string }>()
  const [mergedCards, setMergedCards] = useState<MergeCard[]>([])
  const [availableCards, setAvailableCards] = useState<AdminCard[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<MergeCard | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [cardRes, availableRes] = await Promise.all([
        apiClient.get<{ data: { merged_cards: MergeCard[] } }>(
          `/api/admin/cards/${params.cardId}`
        ),
        apiClient.get<{ data: AdminCard[] }>(
          `/api/admin/cards/${params.cardId}/merge/available`
        ),
      ])
      setMergedCards(cardRes.data?.merged_cards || [])
      setAvailableCards(availableRes.data || [])
    } catch {
      setMergedCards([])
      setAvailableCards([])
    } finally {
      setLoading(false)
    }
  }, [params.cardId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  async function handleAddRedirect(targetCardId: number) {
    try {
      await apiClient.post(`/api/admin/cards/${params.cardId}/merge`, {
        secondary_card_id: targetCardId,
      })
      toast.success(t("redirectSuccess"))
      fetchData()
    } catch {
      toast.error(t("errorOccurred"))
    }
  }

  async function handleRemoveRedirect() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await apiClient.del(
        `/api/admin/cards/${params.cardId}/merge/${deleteTarget.merge_id}`
      )
      toast.success(t("removeRedirectSuccess"))
      setDeleteTarget(null)
      fetchData()
    } catch {
      toast.error(t("errorOccurred"))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("manageRedirects")}
        backHref={`/admin/cards/${params.cardId}`}
      />

      <div>
        <h3 className="text-sm font-semibold mb-3">{t("mergedCards")}</h3>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : mergedCards.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">{t("noResults")}</p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("cardName")}</TableHead>
                  <TableHead>{t("publicKey")}</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {mergedCards.map((mc) => (
                  <TableRow key={mc.merge_id}>
                    <TableCell className="font-medium">
                      {mc.secondary_card.card_user_preferred_name ||
                        mc.secondary_card.card_public_key}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">
                      {mc.secondary_card.card_public_key}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-destructive"
                        onClick={() => setDeleteTarget(mc)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-3">{t("availableCards")}</h3>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : availableCards.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">{t("noResults")}</p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("cardName")}</TableHead>
                  <TableHead>{t("owner")}</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {availableCards.map((card) => (
                  <TableRow key={card.card_id}>
                    <TableCell className="font-medium">
                      {card.card_user_preferred_name || card.card_public_key}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {card.user_name}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => handleAddRedirect(card.card_id)}
                      >
                        <Plus className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleRemoveRedirect}
        title={t("removeRedirect")}
        description={t("deleteCardConfirmationMessage")}
        confirmLabel={t("delete")}
        loading={deleting}
      />
    </div>
  )
}
