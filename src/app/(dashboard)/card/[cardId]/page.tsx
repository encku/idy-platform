"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { Plus } from "lucide-react"
import { AppHeader } from "@/components/dashboard/app-header"
import { FieldList, type FieldItem } from "@/components/dashboard/field-list"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/lib/api-client"
import { useTranslation } from "@/lib/i18n/context"
import { useAuth } from "@/lib/auth/context"

interface CardData {
  public_key: string
  direct_mode_field_id: number | null
  fields: Array<{
    id: number
    name: string
    is_active: boolean
    custom_icon_url: string | null
    formatted_data: Record<string, string> | null
    field_type: { icon_url: string }
  }>
}

export default function CardDetailPage() {
  const { t } = useTranslation()
  const { canEdit } = useAuth()
  const router = useRouter()
  const { cardId } = useParams<{ cardId: string }>()

  const [loading, setLoading] = useState(true)
  const [card, setCard] = useState<CardData | null>(null)
  const [fields, setFields] = useState<FieldItem[]>([])
  const [isDirect, setIsDirect] = useState(false)

  const loadCard = useCallback(async () => {
    try {
      const res = await apiClient.get<{ data: CardData }>(`/api/cards/${cardId}`)
      const cardData = res.data
      setCard(cardData)

      const direct = !!cardData.direct_mode_field_id
      setIsDirect(direct)

      setFields(
        (cardData.fields || []).map((f) => ({
          id: f.id,
          name: f.name,
          icon: f.custom_icon_url || f.field_type.icon_url,
          isActive: direct
            ? cardData.direct_mode_field_id === f.id
            : f.is_active,
          haveMultipleFields: !!(
            f.formatted_data && Object.keys(f.formatted_data).length > 0
          ),
        }))
      )
    } catch {
      setCard(null)
      setFields([])
    } finally {
      setLoading(false)
    }
  }, [cardId])

  useEffect(() => {
    loadCard()
  }, [loadCard])

  async function handleDirectToggle(checked: boolean) {
    if (!card) return
    setIsDirect(checked)

    if (!checked) {
      try {
        await apiClient.post(`/api/cards/${cardId}/direct-mode`, {
          card_field_id: null,
        })
        await loadCard()
      } catch {
        setIsDirect(true)
      }
    }
  }

  const shareUrl = card
    ? `https://id.idycard.com/${card.public_key}`
    : undefined

  if (loading) return <LoadingSpinner />

  return (
    <>
      <AppHeader
        title={t("myCards")}
        backButton
        shareUrl={shareUrl}
        previewUrl={shareUrl}
      />

      <div className="px-5 pt-5 pb-8">
        {card ? (
          <>
            {/* Direct Mode Toggle */}
            {canEdit && fields.length > 0 && (
              <div className="flex items-center justify-end gap-3 mb-2">
                <span className="text-sm font-medium">{t("direct")}</span>
                <Switch
                  checked={isDirect}
                  onCheckedChange={handleDirectToggle}
                />
              </div>
            )}

            {/* Field List */}
            <FieldList
              fields={fields}
              cardId={cardId}
              isDirect={isDirect}
              onFieldsChange={setFields}
              readOnly={!canEdit}
            />

            {/* Add Content */}
            {canEdit && (
              <div className="mt-4 rounded-2xl bg-foreground p-5 text-background">
                <p className="text-sm text-center mb-3 text-background/70">
                  {t("addNewItemInfo")}
                </p>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => router.push(`/card/${cardId}/add`)}
                >
                  <Plus className="size-4 mr-1" />
                  {t("addNewItem")}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <p className="text-sm">{t("pageNotFound")}</p>
          </div>
        )}
      </div>
    </>
  )
}
