"use client"

import { useRouter } from "next/navigation"
import { Search, Upload } from "lucide-react"
import { Input } from "@/components/ui/input"
import { CardTable } from "@/components/admin/cards/card-table"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { Pagination } from "@/components/admin/pagination"
import { useAdminContext } from "@/components/admin/admin-layout-shell"
import { useTranslation } from "@/lib/i18n/context"
import { usePaginatedQuery } from "@/lib/hooks/use-paginated-query"
import type { AdminCard } from "@/lib/admin/types"

export default function AdminCardsPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { setSelectedCardPublicKey } = useAdminContext()

  const {
    data: cards,
    total,
    page,
    totalPages,
    loading,
    search,
    setPage,
    setSearch,
    refetch,
  } = usePaginatedQuery<AdminCard>({ url: "/api/admin/cards" })

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("adminCards")}
        subtitle={`${total} ${t("totalCards")}`}
        action={{
          label: t("bulkImport"),
          icon: <Upload className="size-4 mr-2" />,
          onClick: () => router.push("/admin/cards/bulk-import"),
        }}
      />

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("searchCards")}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <CardTable
        cards={cards}
        loading={loading}
        onPreview={(publicKey) => setSelectedCardPublicKey(publicKey)}
        onUpdate={refetch}
      />

      {/* Pagination */}
      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={20}
        onPageChange={setPage}
      />
    </div>
  )
}
