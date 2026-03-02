"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { toast } from "sonner"
import { Search, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useTranslation } from "@/lib/i18n/context"
import { apiClient } from "@/lib/api-client"
import type { AdminCard } from "@/lib/admin/types"

interface AssignViewerCardDialogProps {
  viewerId: number
  onAssigned: () => void
}

export function AssignViewerCardDialog({
  viewerId,
  onAssigned,
}: AssignViewerCardDialogProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [results, setResults] = useState<AdminCard[]>([])
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const searchCards = useCallback(
    async (q: string) => {
      if (q.length < 2) {
        setResults([])
        return
      }
      setLoading(true)
      try {
        const params = new URLSearchParams({
          page: "1",
          limit: "10",
          search: q,
        })
        const res = await apiClient.get<{ data: AdminCard[] }>(
          `/api/admin/cards?${params}`
        )
        setResults(res.data || [])
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    },
    []
  )

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => searchCards(search), 400)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [search, searchCards])

  async function handleAssign(cardId: number) {
    try {
      await apiClient.post(`/api/admin/viewers/${viewerId}/cards`, {
        card_id: cardId,
      })
      toast.success(t("assignCardSuccess"))
      onAssigned()
      setOpen(false)
      setSearch("")
      setResults([])
    } catch {
      toast.error(t("errorOccurred"))
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="size-4 mr-2" />
          {t("assignCard")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("assignCard")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="pl-9"
              autoFocus
            />
          </div>
          <div className="max-h-[300px] overflow-y-auto space-y-1">
            {loading && (
              <p className="text-sm text-muted-foreground text-center py-4">
                {t("searching")}...
              </p>
            )}
            {!loading && results.length === 0 && search.length >= 2 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                {t("noResults")}
              </p>
            )}
            {results.map((card) => (
              <button
                key={card.card_id}
                onClick={() => handleAssign(card.card_id)}
                className="flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left text-sm hover:bg-muted/50 transition-colors"
              >
                <div>
                  <p className="font-medium">
                    {card.card_user_preferred_name || card.card_public_key}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {card.user_name} &middot; {card.card_public_key}
                  </p>
                </div>
                <Plus className="size-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
