"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { AssignViewerCardDialog } from "@/components/admin/viewers/assign-card-dialog"
import { useTranslation } from "@/lib/i18n/context"
import { apiClient } from "@/lib/api-client"
import type { Viewer, ViewerCard } from "@/lib/admin/types"

export default function ViewerDetailPage() {
  const { t } = useTranslation()
  const params = useParams<{ viewerId: string }>()
  const viewerId = Number(params.viewerId)

  const [viewer, setViewer] = useState<Viewer | null>(null)
  const [cards, setCards] = useState<ViewerCard[]>([])
  const [loading, setLoading] = useState(true)
  const [removeCardId, setRemoveCardId] = useState<number | null>(null)
  const [removing, setRemoving] = useState(false)

  const loadCards = useCallback(async () => {
    try {
      const res = await apiClient.get<{ data: ViewerCard[] }>(
        `/api/admin/viewers/${viewerId}/cards`
      )
      setCards(res.data || [])
    } catch {
      setCards([])
    }
  }, [viewerId])

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        // Get viewer info from the list (we fetch all and find)
        const viewersRes = await apiClient.get<{ data: Viewer[] }>(
          `/api/admin/viewers?page=1&limit=100&search=`
        )
        const found = (viewersRes.data || []).find((v) => v.id === viewerId)
        setViewer(found || null)

        await loadCards()
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [viewerId, loadCards])

  async function handleRemoveCard() {
    if (!removeCardId) return
    setRemoving(true)
    try {
      await apiClient.del(
        `/api/admin/viewers/${viewerId}/cards/${removeCardId}`
      )
      toast.success(t("removeAssignmentSuccess"))
      loadCards()
    } catch {
      toast.error(t("errorOccurred"))
    } finally {
      setRemoving(false)
      setRemoveCardId(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={viewer?.name || t("viewerDetail")}
        subtitle={viewer?.email}
        backHref="/admin/viewers"
      />

      {/* Assigned Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{t("viewerCards")}</h3>
          <AssignViewerCardDialog
            viewerId={viewerId}
            onAssigned={loadCards}
          />
        </div>

        {cards.length === 0 ? (
          <div className="rounded-lg border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
            {t("noCards")}
          </div>
        ) : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("cardName")}</TableHead>
                  <TableHead>{t("publicKey")}</TableHead>
                  <TableHead className="w-[80px]">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cards.map((card) => (
                  <TableRow key={card.id}>
                    <TableCell className="font-medium">
                      {card.user_preferred_name || "-"}
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">
                      {card.public_key}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setRemoveCardId(card.id)}
                      >
                        <Trash2 className="size-4 text-destructive" />
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
        open={removeCardId !== null}
        onOpenChange={() => setRemoveCardId(null)}
        onConfirm={handleRemoveCard}
        title={t("removeAssignment")}
        description={t("removeAssignmentMessage")}
        loading={removing}
      />
    </div>
  )
}
