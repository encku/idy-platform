"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ConnectionTable } from "@/components/admin/ad-sync/connection-table"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { Pagination } from "@/components/admin/pagination"
import { useTranslation } from "@/lib/i18n/context"
import { usePaginatedQuery } from "@/lib/hooks/use-paginated-query"
import { useCompanyFeatures } from "@/lib/admin/company-features-context"
import type { ADConnection } from "@/lib/admin/types"

export default function ADSyncPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { hasCompanyFeature, loading: featuresLoading } = useCompanyFeatures()

  useEffect(() => {
    if (!featuresLoading && !hasCompanyFeature("ad_sync")) {
      router.replace("/admin")
    }
  }, [featuresLoading, hasCompanyFeature, router])

  const {
    data: connections,
    total,
    page,
    totalPages,
    loading,
    search,
    setPage,
    setSearch,
  } = usePaginatedQuery<ADConnection>({ url: "/api/admin/ad-sync/connections" })

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("adminADSync")}
        subtitle={`${total} ${t("totalConnections")}`}
        action={{
          label: t("addConnection"),
          icon: <Plus className="size-4 mr-2" />,
          onClick: () => router.push("/admin/ad-sync/new"),
        }}
      />

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("searchCompanies")}
          className="pl-9"
        />
      </div>

      <ConnectionTable connections={connections} loading={loading} />

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
