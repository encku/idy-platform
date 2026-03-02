"use client"

import { useRouter } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useTranslation } from "@/lib/i18n/context"

interface TopCard {
  card_id: number
  card_name: string
  views: number
  clicks: number
  shares: number
}

interface AnalyticsCardTableProps {
  cards: TopCard[]
}

export function AnalyticsCardTable({ cards }: AnalyticsCardTableProps) {
  const { t } = useTranslation()
  const router = useRouter()

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
            <TableHead className="text-right">{t("totalViews")}</TableHead>
            <TableHead className="text-right">{t("totalClicks")}</TableHead>
            <TableHead className="text-right">{t("totalShares")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cards.map((card) => (
            <TableRow
              key={card.card_id}
              className="cursor-pointer"
              onClick={() => router.push(`/admin/analytics/cards/${card.card_id}`)}
            >
              <TableCell className="font-medium">{card.card_name}</TableCell>
              <TableCell className="text-right">
                {card.views.toLocaleString()}
              </TableCell>
              <TableCell className="text-right">
                {card.clicks.toLocaleString()}
              </TableCell>
              <TableCell className="text-right">
                {card.shares.toLocaleString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
