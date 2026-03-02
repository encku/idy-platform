"use client"

import { useEffect, useState, useCallback } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { apiClient } from "@/lib/api-client"
import { useTranslation } from "@/lib/i18n/context"
import { toast } from "sonner"
import type { AdminCard } from "@/lib/admin/types"

interface CloneCardDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sourceCardId: string
}

export function CloneCardDialog({
  open,
  onOpenChange,
  sourceCardId,
}: CloneCardDialogProps) {
  const { t } = useTranslation()
  const [available, setAvailable] = useState<AdminCard[]>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [cloning, setCloning] = useState(false)

  const fetchAvailable = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiClient.get<{ data: AdminCard[] }>(
        `/api/admin/cards/${sourceCardId}/merge/available`
      )
      setAvailable(res.data || [])
    } catch {
      setAvailable([])
    } finally {
      setLoading(false)
    }
  }, [sourceCardId])

  useEffect(() => {
    if (open) {
      setSelected(new Set())
      fetchAvailable()
    }
  }, [open, fetchAvailable])

  function toggleCard(cardId: number) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(cardId)) next.delete(cardId)
      else next.add(cardId)
      return next
    })
  }

  async function handleClone() {
    setCloning(true)
    try {
      await apiClient.post(`/api/admin/cards/${sourceCardId}/clone`, {
        target_card_ids: Array.from(selected),
      })
      toast.success(t("cloneSuccess"))
      onOpenChange(false)
    } catch {
      toast.error(t("errorOccurred"))
    } finally {
      setCloning(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("cloneFields")}</DialogTitle>
          <DialogDescription>{t("selectTarget")}</DialogDescription>
        </DialogHeader>
        <div className="max-h-64 overflow-y-auto space-y-2 py-2">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))
          ) : available.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              {t("noResults")}
            </p>
          ) : (
            available.map((card) => (
              <label
                key={card.card_id}
                className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/50"
              >
                <Checkbox
                  checked={selected.has(card.card_id)}
                  onCheckedChange={() => toggleCard(card.card_id)}
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">
                    {card.card_user_preferred_name || card.card_public_key}
                  </p>
                  <p className="text-xs text-muted-foreground">{card.user_name}</p>
                </div>
              </label>
            ))
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
          <Button
            onClick={handleClone}
            disabled={selected.size === 0 || cloning}
          >
            {cloning ? t("saving") : `${t("cloneFields")} (${selected.size})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
