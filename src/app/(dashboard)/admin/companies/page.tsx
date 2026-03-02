"use client"

import { useRouter } from "next/navigation"
import { Search, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { CompanyTable } from "@/components/admin/companies/company-table"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { Pagination } from "@/components/admin/pagination"
import { useTranslation } from "@/lib/i18n/context"
import { usePaginatedQuery } from "@/lib/hooks/use-paginated-query"
import type { Company } from "@/lib/admin/types"

export default function AdminCompaniesPage() {
  const { t } = useTranslation()
  const router = useRouter()

  const {
    data: companies,
    total,
    page,
    totalPages,
    loading,
    search,
    setPage,
    setSearch,
    refetch,
  } = usePaginatedQuery<Company>({ url: "/api/admin/companies" })

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("adminCompanies")}
        subtitle={`${total} ${t("totalCompanies")}`}
        action={{
          label: t("createCompany"),
          icon: <Plus className="size-4 mr-2" />,
          onClick: () => router.push("/admin/companies/new"),
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

      <CompanyTable
        companies={companies}
        loading={loading}
        onUpdate={refetch}
      />

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
