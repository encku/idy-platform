"use client"

import { useEffect, useState, useCallback } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { apiClient } from "@/lib/api-client"
import { useTranslation } from "@/lib/i18n/context"
import type { AdminCard } from "@/lib/admin/types"

interface UserCardsListProps {
  userId: number
}

export function UserCardsList({ userId }: UserCardsListProps) {
  const { t } = useTranslation()
  const [cards, setCards] = useState<AdminCard[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCards = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiClient.get<{ data: AdminCard[] }>(
        `/api/admin/users/${userId}/cards`
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

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    )
  }

  if (cards.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        {t("noCards")}
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("cardName")}</TableHead>
            <TableHead>{t("publicKey")}</TableHead>
            <TableHead>{t("status")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cards.map((card) => (
            <TableRow key={card.card_id}>
              <TableCell className="font-medium">
                {card.card_user_preferred_name || card.card_public_key}
              </TableCell>
              <TableCell className="text-muted-foreground text-xs font-mono">
                {card.card_public_key}
              </TableCell>
              <TableCell>
                <Badge variant={card.card_is_hidden ? "outline" : "default"}>
                  {card.card_is_hidden ? t("hidden") : t("active")}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
