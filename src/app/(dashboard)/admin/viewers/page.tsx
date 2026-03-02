"use client"

import { useRouter } from "next/navigation"
import { UserPlus, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { ViewerTable } from "@/components/admin/viewers/viewer-table"
import { Pagination } from "@/components/admin/pagination"
import { useTranslation } from "@/lib/i18n/context"
import { usePaginatedQuery } from "@/lib/hooks/use-paginated-query"
import type { Viewer } from "@/lib/admin/types"

export default function AdminViewersPage() {
  const { t } = useTranslation()
  const router = useRouter()

  const {
    data: viewers,
    total,
    page,
    totalPages,
    loading,
    search,
    setPage,
    setSearch,
    refetch,
  } = usePaginatedQuery<Viewer>({ url: "/api/admin/viewers" })

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("adminViewers")}
        subtitle={`${total} ${t("totalViewers")}`}
        action={{
          label: t("createViewer"),
          icon: <UserPlus className="size-4 mr-2" />,
          onClick: () => router.push("/admin/viewers/new"),
        }}
      />

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("searchViewers")}
          className="pl-9"
        />
      </div>

      <ViewerTable viewers={viewers} loading={loading} onUpdate={refetch} />

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
