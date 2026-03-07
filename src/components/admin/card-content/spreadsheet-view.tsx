"use client"

import { useMemo } from "react"
import Image from "next/image"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { SpreadsheetCell } from "./spreadsheet-cell"
import { useTranslation } from "@/lib/i18n/context"
import { apiClient } from "@/lib/api-client"
import { toast } from "sonner"
import type { AdminCardWithFields } from "@/lib/admin/types"

interface SpreadsheetViewProps {
  cards: AdminCardWithFields[]
  loading: boolean
  onCardClick?: (publicKey: string) => void
}

export function SpreadsheetView({
  cards,
  loading,
  onCardClick,
}: SpreadsheetViewProps) {
  const { t } = useTranslation()

  // Extract unique field type names across all cards
  const fieldColumns = useMemo(() => {
    const columnsMap = new Map<string, string>()
    for (const card of cards) {
      for (const field of card.fields || []) {
        const key = field.field_type?.name || field.name
        if (key && !columnsMap.has(key)) {
          columnsMap.set(key, field.field_type?.icon_url || "")
        }
      }
    }
    return Array.from(columnsMap.entries()).map(([name, iconUrl]) => ({
      name,
      iconUrl,
    }))
  }, [cards])

  // Get field data for a card and field type
  function getFieldForCard(
    card: AdminCardWithFields,
    fieldTypeName: string
  ): { id: number; data: string } | null {
    const field = (card.fields || []).find(
      (f) => (f.field_type?.name || f.name) === fieldTypeName
    )
    if (!field) return null
    return { id: field.id, data: field.data || "" }
  }

  // Save handler for inline editing
  async function handleSave(
    cardPublicKey: string,
    fieldId: number,
    newValue: string
  ): Promise<boolean> {
    try {
      await apiClient.put(`/api/admin/cards/${cardPublicKey}/fields/${fieldId}`, {
        data: newValue,
      })
      toast.success(t("saved"))
      return true
    } catch {
      toast.error(t("errorOccurred"))
      return false
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
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
    <ScrollArea className="w-full">
      <div className="min-w-max">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="sticky left-0 z-10 bg-background min-w-[140px]">
                {t("cardName")}
              </TableHead>
              <TableHead className="sticky left-[140px] z-10 bg-background min-w-[120px]">
                {t("owner")}
              </TableHead>
              {fieldColumns.map((col) => (
                <TableHead key={col.name} className="min-w-[150px]">
                  <div className="flex items-center gap-2">
                    {col.iconUrl && (
                      <Image
                        src={col.iconUrl}
                        alt={col.name}
                        width={16}
                        height={16}
                        className="size-4 object-contain"
                      />
                    )}
                    <span className="truncate">{col.name}</span>
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {cards.map((card) => (
              <TableRow key={card.card_id}>
                <TableCell
                  className="sticky left-0 z-10 bg-background font-medium cursor-pointer hover:text-primary"
                  onClick={() => onCardClick?.(card.card_public_key)}
                >
                  <div className="truncate max-w-[140px]">
                    {card.card_user_preferred_name || card.card_public_key}
                  </div>
                </TableCell>
                <TableCell className="sticky left-[140px] z-10 bg-background">
                  <div className="truncate max-w-[120px] text-muted-foreground text-xs">
                    {card.user_name}
                  </div>
                </TableCell>
                {fieldColumns.map((col) => {
                  const fieldData = getFieldForCard(card, col.name)
                  return (
                    <TableCell key={col.name} className="p-1">
                      <SpreadsheetCell
                        value={fieldData?.data || ""}
                        fieldId={fieldData?.id || null}
                        cardPublicKey={card.card_public_key}
                        fieldTypeName={col.name}
                        isEmpty={!fieldData}
                        onSave={handleSave}
                      />
                    </TableCell>
                  )
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
