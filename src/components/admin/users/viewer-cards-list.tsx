"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { toast } from "sonner"
import { Search, Plus, Trash2 } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useTranslation } from "@/lib/i18n/context"
import { apiClient } from "@/lib/api-client"
import type { AdminCard } from "@/lib/admin/types"

interface ViewerCardsListProps {
  userId: number
}

interface ViewerCard {
  id: number
  card_id: number
  public_key: string
  card_name: string
}

export function ViewerCardsList({ userId }: ViewerCardsListProps) {
  const { t } = useTranslation()
  const [cards, setCards] = useState<ViewerCard[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCards = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiClient.get<{ data: ViewerCard[] }>(
        `/api/admin/users/${userId}/viewer-cards`
      )
      setCards(res.data || [])
    } catch {
      setCards([])
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchCards()
  }, [fetchCards])

  async function handleRemove(cardId: number) {
    try {
      await apiClient.del(`/api/admin/users/${userId}/viewer-cards/${cardId}`)
      toast.success(t("removeCardSuccess"))
      fetchCards()
    } catch {
      toast.error(t("errorOccurred"))
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{t("viewerCards")}</h3>
        <AssignCardDialog userId={userId} onAssigned={fetchCards} />
      </div>

      {cards.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground text-sm border rounded-md">
          {t("noViewerCards")}
        </div>
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
              {cards.map((card) => (
                <TableRow key={card.card_id}>
                  <TableCell className="font-medium">
                    {card.card_name || card.public_key}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs font-mono">
                    {card.public_key}
                  </TableCell>
                  <TableCell>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t("removeCard")}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {t("removeViewerCardConfirm")}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleRemove(card.card_id)}
                            className="bg-destructive text-white hover:bg-destructive/90"
                          >
                            {t("remove")}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

function AssignCardDialog({
  userId,
  onAssigned,
}: {
  userId: number
  onAssigned: () => void
}) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [results, setResults] = useState<AdminCard[]>([])
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const searchCards = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([])
      return
    }
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: "1", limit: "10", search: q })
      const res = await apiClient.get<{ data: AdminCard[] }>(
        `/api/admin/cards?${params}`
      )
      setResults(res.data || [])
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => searchCards(search), 400)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [search, searchCards])

  async function handleAssign(cardId: number) {
    try {
      await apiClient.post(`/api/admin/users/${userId}/viewer-cards`, {
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
