"use client"

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
import { CardActions } from "./card-actions"
import { useTranslation } from "@/lib/i18n/context"
import type { AdminCard } from "@/lib/admin/types"

interface CardTableProps {
  cards: AdminCard[]
  loading: boolean
  onPreview: (publicKey: string) => void
  onUpdate?: () => void
}

export function CardTable({ cards, loading, onPreview, onUpdate }: CardTableProps) {
  const { t } = useTranslation()

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32 flex-1" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-8" />
          </div>
        ))}
      </div>
    )
  }

  if (cards.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {t("noResults")}
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
            <TableHead>{t("owner")}</TableHead>
            <TableHead>{t("ownerEmail")}</TableHead>
            <TableHead>{t("status")}</TableHead>
            <TableHead className="w-12">{t("actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cards.map((card) => (
            <TableRow
              key={card.card_id}
              className="cursor-pointer"
              onClick={() => onPreview(card.card_public_key)}
            >
              <TableCell className="font-medium">
                {card.card_user_preferred_name || "-"}
              </TableCell>
              <TableCell>
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                  {card.card_public_key}
                </code>
              </TableCell>
              <TableCell>{card.user_name}</TableCell>
              <TableCell className="text-muted-foreground">
                {card.user_email}
              </TableCell>
              <TableCell>
                {card.card_is_hidden ? (
                  <Badge variant="secondary">{t("hidden")}</Badge>
                ) : (
                  <Badge variant="outline">{t("active")}</Badge>
                )}
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <CardActions
                  card={card}
                  onPreview={() => onPreview(card.card_public_key)}
                  onUpdate={onUpdate}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
