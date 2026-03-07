"use client"

import { useEffect, useState, useCallback } from "react"
import Image from "next/image"
import { Pencil, Trash2, QrCode, Share2 } from "lucide-react"
import { AppHeader } from "@/components/dashboard/app-header"
import { QrDialog } from "@/components/dashboard/qr-dialog"
import { EditCardDialog } from "@/components/dashboard/edit-card-dialog"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import { PullToRefresh } from "@/components/shared/pull-to-refresh"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel"
import { apiClient } from "@/lib/api-client"
import { useTranslation } from "@/lib/i18n/context"
import { useAuth } from "@/lib/auth/context"
import { getCardImage } from "@/lib/card-images"
import { toast } from "sonner"

interface CardItem {
  id: number
  public_key: string
  user_preferred_name: string
  card_type_id: number
  color_id: number
}

export default function MyCardsPage() {
  const { t } = useTranslation()
  const { canEdit } = useAuth()
  const [loading, setLoading] = useState(true)
  const [cards, setCards] = useState<CardItem[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [carouselApi, setCarouselApi] = useState<CarouselApi>()

  const [qrOpen, setQrOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const loadCards = useCallback(async () => {
    try {
      const res = await apiClient.get<{ data: CardItem[] }>("/api/user/cards")
      setCards(res.data)
    } catch {
      // handled by apiClient
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCards()
  }, [loadCards])

  useEffect(() => {
    if (!carouselApi) return
    carouselApi.on("select", () => {
      setSelectedIndex(carouselApi.selectedScrollSnap())
    })
  }, [carouselApi])

  const selectedCard = cards[selectedIndex]
  const shareUrl = selectedCard
    ? `https://id.idycard.com/${selectedCard.public_key}`
    : undefined

  function handleShare() {
    if (!shareUrl) return
    if (navigator.share) {
      navigator.share({ url: shareUrl }).catch(() => {})
    } else {
      navigator.clipboard.writeText(shareUrl)
      toast.success("Link copied!")
    }
  }

  async function handleDelete() {
    if (!selectedCard) return
    setDeleting(true)
    try {
      await apiClient.del(`/api/cards/${selectedCard.public_key}`)
      toast.success(t("deleteCardSuccess"))
      setDeleteOpen(false)
      const newCards = cards.filter((_, i) => i !== selectedIndex)
      setCards(newCards)
      if (selectedIndex >= newCards.length && newCards.length > 0) {
        setSelectedIndex(newCards.length - 1)
      }
    } catch {
      toast.error(t("deleteCardError"))
    } finally {
      setDeleting(false)
    }
  }

  function handleEditSuccess(newName: string) {
    setCards((prev) =>
      prev.map((c, i) =>
        i === selectedIndex ? { ...c, user_preferred_name: newName } : c
      )
    )
  }

  if (loading) return <LoadingSpinner />

  return (
    <>
      <AppHeader title={t("myCards")} />

      <PullToRefresh onRefresh={loadCards}>
      <div className="px-5 pt-5 pb-8">
        {cards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
            <p className="text-sm">{t("addNewItemInfo")}</p>
          </div>
        ) : (
          <>
            {/* Card Carousel */}
            <Carousel
              setApi={setCarouselApi}
              opts={{ align: "center", loop: true }}
              className="w-full"
            >
              <CarouselContent>
                {cards.map((card) => (
                  <CarouselItem key={card.id}>
                    <div className="flex flex-col items-center py-4">
                      <Image
                        src={getCardImage(card.card_type_id, card.color_id)}
                        alt={card.user_preferred_name || card.public_key}
                        width={300}
                        height={192}
                        className="h-48 max-w-[300px] object-contain"
                      />
                      <p className="mt-3 text-sm font-medium truncate max-w-[200px]">
                        {card.user_preferred_name || card.public_key}
                      </p>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>

            {/* Dots indicator */}
            {cards.length > 1 && (
              <div className="flex justify-center gap-1.5 mt-2">
                {cards.map((_, i) => (
                  <div
                    key={i}
                    className={`size-2 rounded-full transition-colors ${
                      i === selectedIndex
                        ? "bg-foreground"
                        : "bg-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Card Actions - 2x2 grid */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              {canEdit && (
                <Button
                  variant="outline"
                  className="h-14 flex-col gap-1"
                  onClick={() => setEditOpen(true)}
                >
                  <Pencil className="size-4" />
                  <span className="text-xs">{t("editCard")}</span>
                </Button>
              )}

              {canEdit && (
                <Button
                  variant="outline"
                  className="h-14 flex-col gap-1"
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2 className="size-4" />
                  <span className="text-xs">{t("deleteCard")}</span>
                </Button>
              )}

              <Button
                variant="outline"
                className="h-14 flex-col gap-1"
                onClick={() => setQrOpen(true)}
              >
                <QrCode className="size-4" />
                <span className="text-xs">{t("qrCode")}</span>
              </Button>

              <Button
                variant="outline"
                className="h-14 flex-col gap-1"
                onClick={handleShare}
              >
                <Share2 className="size-4" />
                <span className="text-xs">{t("share")}</span>
              </Button>
            </div>
          </>
        )}
      </div>
      </PullToRefresh>

      {/* Dialogs */}
      {selectedCard && (
        <>
          <QrDialog
            open={qrOpen}
            onClose={() => setQrOpen(false)}
            url={shareUrl || ""}
            cardName={selectedCard.user_preferred_name}
          />

          {canEdit && (
            <EditCardDialog
              open={editOpen}
              onClose={() => setEditOpen(false)}
              cardId={selectedCard.public_key}
              currentName={selectedCard.user_preferred_name || ""}
              onSuccess={handleEditSuccess}
            />
          )}

          {canEdit && (
            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("deleteCardTitle")}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("deleteCardMessage")}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={deleting}
                    className="bg-destructive text-white hover:bg-destructive/90"
                  >
                    {t("delete")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </>
      )}
    </>
  )
}
