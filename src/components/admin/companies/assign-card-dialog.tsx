"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { apiClient } from "@/lib/api-client"
import { useTranslation } from "@/lib/i18n/context"
import { useDebouncedSearch } from "@/lib/hooks/use-debounced-search"
import { toast } from "sonner"
import type { AdminCard } from "@/lib/admin/types"

interface AssignCardDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  companyId: string
  onAssigned: () => void
}

export function AssignCardDialog({
  open,
  onOpenChange,
  companyId,
  onAssigned,
}: AssignCardDialogProps) {
  const { t } = useTranslation()
  const [search, setSearch] = useState("")
  const [results, setResults] = useState<AdminCard[]>([])
  const [loading, setLoading] = useState(false)
  const [assigning, setAssigning] = useState(false)

  const debouncedSearch = useDebouncedSearch(async (value: string) => {
    if (!value.trim()) {
      setResults([])
      return
    }
    setLoading(true)
    try {
      const res = await apiClient.get<{ data: AdminCard[] }>(
        `/api/admin/cards?search=${encodeURIComponent(value)}&limit=10`
      )
      setResults(res.data || [])
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  })

  function handleSearchChange(value: string) {
    setSearch(value)
    debouncedSearch(value)
  }

  async function handleAssign(cardId: number) {
    setAssigning(true)
    try {
      await apiClient.post("/api/admin/companies/card-assignment", {
        company_id: Number(companyId),
        card_id: cardId,
      })
      toast.success(t("assignCardSuccess"))
      onAssigned()
      onOpenChange(false)
    } catch {
      toast.error(t("errorOccurred"))
    } finally {
      setAssigning(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("assignCard")}</DialogTitle>
          <DialogDescription>{t("searchAndAssign")}</DialogDescription>
        </DialogHeader>
        <Input
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder={t("searchCards")}
        />
        <div className="max-h-64 overflow-y-auto space-y-2 py-2">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))
          ) : results.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              {search ? t("noResults") : t("searchAndAssign")}
            </p>
          ) : (
            results.map((card) => (
              <div
                key={card.card_id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">
                    {card.card_user_preferred_name || card.card_public_key}
                  </p>
                  <p className="text-xs text-muted-foreground">{card.user_name}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAssign(card.card_id)}
                  disabled={assigning}
                >
                  {t("assign")}
                </Button>
              </div>
            ))
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
