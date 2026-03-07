"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Plus, Search } from "lucide-react"
import { AppHeader } from "@/components/dashboard/app-header"
import { FieldList, type FieldItem } from "@/components/dashboard/field-list"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { PullToRefresh } from "@/components/shared/pull-to-refresh"
import { ViewerBadge } from "@/components/dashboard/viewer-badge"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/lib/auth/context"
import { useTranslation } from "@/lib/i18n/context"
import type { User } from "@/lib/types"
import { getCardImage } from "@/lib/card-images"

interface CardListItem {
  id: number
  public_key: string
  user_preferred_name: string
  card_type_id: number
  color_id: number
}

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

interface CardProfile {
  name: string
  title: string
  description: string
  picture_url: string
}

export default function ProfilePage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { canEdit, isViewer } = useAuth()

  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [cardProfile, setCardProfile] = useState<CardProfile | null>(null)
  const [cardList, setCardList] = useState<CardListItem[]>([])
  const [selectedCardIndex, setSelectedCardIndex] = useState(0)
  const [card, setCard] = useState<CardData | null>(null)
  const [fields, setFields] = useState<FieldItem[]>([])
  const [isDirect, setIsDirect] = useState(false)
  const [cardLoading, setCardLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const loadCard = useCallback(async (cardId: string) => {
    setCardLoading(true)
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

      // Load card profile
      try {
        const profileRes = await apiClient.get<{ data: CardProfile }>(
          `/api/user/card-profile/${cardId}`
        )
        setCardProfile(profileRes.data)
      } catch {
        setCardProfile(null)
      }
    } catch {
      setCard(null)
      setFields([])
    } finally {
      setCardLoading(false)
    }
  }, [])

  const refreshAll = useCallback(async () => {
    try {
      const [userRes, cardsRes] = await Promise.all([
        apiClient.get<{ data: User }>("/api/user"),
        apiClient.get<{ data: CardListItem[] }>("/api/user/cards"),
      ])

      setUser(userRes.data)
      setCardList(cardsRes.data)

      if (cardsRes.data.length >= 1) {
        const idx = Math.min(selectedCardIndex, cardsRes.data.length - 1)
        await loadCard(cardsRes.data[idx].public_key)
      }
    } catch {
      // handled by apiClient
    }
  }, [loadCard, selectedCardIndex])

  useEffect(() => {
    async function init() {
      setLoading(true)
      try {
        const [userRes, cardsRes] = await Promise.all([
          apiClient.get<{ data: User }>("/api/user"),
          apiClient.get<{ data: CardListItem[] }>("/api/user/cards"),
        ])

        setUser(userRes.data)
        setCardList(cardsRes.data)

        if (cardsRes.data.length >= 1) {
          await loadCard(cardsRes.data[0].public_key)
        }
      } catch {
        // handled by apiClient (redirect to login on 401)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [loadCard])

  async function handleDirectToggle(checked: boolean) {
    if (!card) return
    setIsDirect(checked)

    if (checked) {
      // Turn all fields off, wait for user to pick one
      setFields((prev) => prev.map((f) => ({ ...f, isActive: false })))
    } else {
      // Disable direct mode and silently restore field states
      try {
        await apiClient.post(`/api/cards/${card.public_key}/direct-mode`, {
          card_field_id: null,
        })
        const res = await apiClient.get<{ data: CardData }>(`/api/cards/${card.public_key}`)
        const cardData = res.data
        setCard(cardData)
        setFields(
          (cardData.fields || []).map((f) => ({
            id: f.id,
            name: f.name,
            icon: f.custom_icon_url || f.field_type.icon_url,
            isActive: f.is_active,
            haveMultipleFields: !!(
              f.formatted_data && Object.keys(f.formatted_data).length > 0
            ),
          }))
        )
      } catch {
        setIsDirect(true)
      }
    }
  }

  function handleCardSelect(index: number) {
    setSelectedCardIndex(index)
    loadCard(cardList[index].public_key)
  }

  const filteredCardList = useMemo(() => {
    if (!searchQuery.trim()) return cardList
    const q = searchQuery.toLowerCase().trim()
    return cardList.filter((c) => {
      const pk = c.public_key?.toLowerCase() || ""
      const pn = c.user_preferred_name?.toLowerCase() || ""
      return pk.includes(q) || pn.includes(q)
    })
  }, [cardList, searchQuery])

  const profile = cardProfile || user
  const shareUrl = card
    ? `https://id.idycard.com/${card.public_key}`
    : undefined
  const editProfileUrl = cardProfile
    ? `/profile/edit/${card?.public_key}`
    : "/profile/edit"

  if (loading)
    return (
      <>
        <AppHeader />
        <div className="px-5 pt-4">
          {/* Profile Card Skeleton */}
          <div className="rounded-2xl bg-card p-5 shadow-md">
            <div className="flex items-center gap-4">
              <Skeleton className="size-16 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/5" />
                <Skeleton className="h-3.5 w-2/5" />
                <Skeleton className="h-3 w-4/5" />
              </div>
            </div>
            <Skeleton className="mt-5 h-10 w-full rounded-xl" />
          </div>
          {/* Field Items Skeleton */}
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-2 rounded-2xl bg-card p-3 my-2 shadow-sm"
            >
              <Skeleton className="size-8 rounded" />
              <Skeleton className="size-11 rounded-lg" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-5 w-10 rounded-full" />
            </div>
          ))}
          {/* Add Button Skeleton */}
          <Skeleton className="mt-4 h-[140px] w-full rounded-2xl" />
        </div>
      </>
    )

  return (
    <>
      <AppHeader shareUrl={shareUrl} previewUrl={shareUrl} />
      {isViewer && <ViewerBadge />}

      <PullToRefresh onRefresh={refreshAll}>
      <div className="px-5 pt-4">
        {/* Search */}
        {cardList.length > 1 && (
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("searchCards")}
              className="pl-9"
            />
          </div>
        )}

        {/* Profile Card */}
        {profile && (
          <div className="rounded-2xl bg-card p-5 shadow-md">
            <div className="flex items-center gap-4">
              <div className="size-16 shrink-0 overflow-hidden rounded-full bg-muted">
                {(profile as User).picture_url ? (
                  <Image
                    src={(profile as User).picture_url}
                    alt={profile.name}
                    width={64}
                    height={64}
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center bg-foreground text-background text-xl font-bold">
                    {profile.name?.charAt(0) || "?"}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                {profile.name && (
                  <h2 className="text-lg font-semibold tracking-tight truncate">
                    {profile.name}
                  </h2>
                )}
                {profile.title && (
                  <p className="text-sm text-muted-foreground truncate">
                    {profile.title}
                  </p>
                )}
                {profile.description && (
                  <p className="text-xs text-muted-foreground/70 truncate">
                    {profile.description}
                  </p>
                )}
              </div>
            </div>

            {canEdit && (
              <div className="flex items-center gap-3 mt-5">
                <button
                  onClick={() => router.push(editProfileUrl)}
                  className="flex-1 rounded-xl border-2 border-muted-foreground/20 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
                >
                  {t("editProfile")}
                </button>
                {card && fields.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{t("direct")}</span>
                    <Switch
                      checked={isDirect}
                      onCheckedChange={handleDirectToggle}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Card Selector (multi-card) */}
        {cardList.length > 1 && (
          <div className="mt-4 flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
            {filteredCardList.map((c) => {
              const idx = cardList.findIndex((cl) => cl.id === c.id)
              return (
                <button
                  key={c.id}
                  onClick={() => handleCardSelect(idx)}
                  className={`flex shrink-0 flex-col items-center gap-1 rounded-xl px-4 py-3 text-xs transition-colors ${
                    idx === selectedCardIndex
                      ? "bg-muted font-medium"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <Image
                    src={getCardImage(c.card_type_id, c.color_id)}
                    alt={c.user_preferred_name || c.public_key}
                    width={80}
                    height={48}
                    className="h-12 w-auto rounded-lg object-contain"
                  />
                  <span className="max-w-[80px] truncate">
                    {c.user_preferred_name || c.public_key}
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {/* Fields Section */}
        {cardLoading ? (
          <div className="mt-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-2 rounded-2xl bg-card p-3 my-2 shadow-sm"
              >
                <Skeleton className="size-8 rounded" />
                <Skeleton className="size-11 rounded-lg" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-5 w-10 rounded-full" />
              </div>
            ))}
            <Skeleton className="mt-4 h-[140px] w-full rounded-2xl" />
          </div>
        ) : card ? (
          <div className="mt-4">
            {/* Field List */}
            <FieldList
              fields={fields}
              cardId={card.public_key}
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
                  onClick={() =>
                    router.push(`/card/${card.public_key}/add`)
                  }
                >
                  <Plus className="size-4 mr-1" />
                  {t("addNewItem")}
                </Button>
              </div>
            )}
          </div>
        ) : null}
      </div>
      </PullToRefresh>

      <p className="text-center text-[10px] text-muted-foreground/40 pb-2">
        v{process.env.NEXT_PUBLIC_APP_VERSION}
      </p>
    </>
  )
}
