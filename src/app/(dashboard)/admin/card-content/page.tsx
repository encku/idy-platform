"use client"

import { useEffect, useState, useCallback } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SpreadsheetView } from "@/components/admin/card-content/spreadsheet-view"
import { useAdminContext } from "@/components/admin/admin-layout-shell"
import { apiClient } from "@/lib/api-client"
import { useTranslation } from "@/lib/i18n/context"
import { useDebouncedSearch } from "@/lib/hooks/use-debounced-search"
import type { AdminCardWithFields } from "@/lib/admin/types"

const PAGE_SIZE = 30

export default function AdminCardContentPage() {
  const { t } = useTranslation()
  const { setSelectedCardPublicKey } = useAdminContext()
  const [cards, setCards] = useState<AdminCardWithFields[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const fetchCards = useCallback(
    async (p: number, s: string) => {
      setLoading(true)
      try {
        const params = new URLSearchParams({
          page: String(p),
          limit: String(PAGE_SIZE),
          search: s,
        })
        const res = await apiClient.get<{
          data: AdminCardWithFields[]
          total: number
        }>(`/api/admin/cards/content?${params}`)
        setCards(res.data || [])
        setTotal(res.total || 0)
      } catch {
        setCards([])
        setTotal(0)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const debouncedFetch = useDebouncedSearch((value: string) => {
    setPage(1)
    fetchCards(1, value)
  })

  useEffect(() => {
    fetchCards(1, "")
  }, [fetchCards])

  function handleSearchChange(value: string) {
    setSearch(value)
    debouncedFetch(value)
  }

  function handlePageChange(newPage: number) {
    setPage(newPage)
    fetchCards(newPage, search)
  }

  function handleCardClick(publicKey: string) {
    setSelectedCardPublicKey(publicKey)
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {t("adminCardContent")}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t("adminCardContentSubtitle")}
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder={t("searchCards")}
          className="pl-9"
        />
      </div>

      {/* Spreadsheet */}
      <SpreadsheetView
        cards={cards}
        loading={loading}
        onCardClick={handleCardClick}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {t("page")} {page} / {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => handlePageChange(page - 1)}
            >
              {t("previous")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => handlePageChange(page + 1)}
            >
              {t("next")}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
