"use client"

import { useState, useEffect } from "react"
import { Smartphone } from "lucide-react"
import { CardContent } from "@/app/[cardId]/card-content"
import { useTranslation } from "@/lib/i18n/context"
import { Skeleton } from "@/components/ui/skeleton"
import type { CardProfile, CardField, LeadSettings } from "@/lib/types"

interface PhonePreviewProps {
  selectedCardPublicKey: string | null
}

interface CardData {
  profile: CardProfile
  fields: CardField[]
  leadSettings: LeadSettings | null
}

export function PhonePreview({ selectedCardPublicKey }: PhonePreviewProps) {
  const { t } = useTranslation()
  const [cardData, setCardData] = useState<CardData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!selectedCardPublicKey) {
      setCardData(null)
      return
    }

    async function fetchCard() {
      setLoading(true)
      try {
        const res = await fetch(
          `/api/cards/${selectedCardPublicKey}/profile`
        )
        if (!res.ok) throw new Error("Failed to fetch")
        const data = await res.json()

        const profile: CardProfile = data.data.user
        const fields: CardField[] = data.data.card || []

        // Try to fetch lead settings
        let leadSettings: LeadSettings | null = null
        try {
          const leadRes = await fetch(
            `/api/cards/${selectedCardPublicKey}/lead-form`,
            { method: "POST" }
          )
          if (leadRes.ok) {
            const leadData = await leadRes.json()
            leadSettings = leadData.data
          }
        } catch {
          // no lead settings
        }

        setCardData({ profile, fields, leadSettings })
      } catch {
        setCardData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchCard()
  }, [selectedCardPublicKey])

  return (
    <div className="hidden xl:flex w-[420px] flex-col items-center border-l bg-muted/30 p-6 shrink-0">
      <p className="mb-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {t("mobilePreview")}
      </p>

      {/* Phone frame */}
      <div className="relative w-[320px] h-[640px] rounded-[2.5rem] border-[6px] border-foreground/80 bg-background overflow-hidden shadow-2xl">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100px] h-[24px] bg-foreground/80 rounded-b-xl z-10" />

        {/* Content - scaled to simulate real mobile viewport */}
        <div className="h-full overflow-hidden">
          <div
            className="origin-top-left overflow-y-auto pt-[30px]"
            style={{
              width: 375,
              height: 'calc(100% / 0.821)',
              transform: 'scale(0.821)',
            }}
          >
            {loading ? (
              <div className="p-6 space-y-4">
                <Skeleton className="h-40 w-full rounded-b-3xl" />
                <div className="flex flex-col items-center gap-2">
                  <Skeleton className="size-20 rounded-full" />
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <div className="grid grid-cols-3 gap-2 mt-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 rounded-2xl" />
                  ))}
                </div>
              </div>
            ) : cardData ? (
              <CardContent
                profile={cardData.profile}
                fields={cardData.fields}
                leadSettings={cardData.leadSettings}
                cardId={selectedCardPublicKey!}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
                <Smartphone className="size-10 opacity-30" />
                <p className="text-xs text-center px-6">
                  {t("selectCardForPreview")}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
