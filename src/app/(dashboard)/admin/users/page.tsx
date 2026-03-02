"use client"

import { useRouter } from "next/navigation"
import { UserPlus, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { UserTable } from "@/components/admin/users/user-table"
import { Pagination } from "@/components/admin/pagination"
import { useTranslation } from "@/lib/i18n/context"
import { usePaginatedQuery } from "@/lib/hooks/use-paginated-query"
import type { AdminUser } from "@/lib/admin/types"

export default function AdminUsersPage() {
  const { t } = useTranslation()
  const router = useRouter()

  const {
    data: users,
    total,
    page,
    totalPages,
    loading,
    search,
    setPage,
    setSearch,
    refetch,
  } = usePaginatedQuery<AdminUser>({ url: "/api/admin/users" })

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("adminUsers")}
        subtitle={`${total} ${t("totalUsers")}`}
        action={{
          label: t("createUser"),
          icon: <UserPlus className="size-4 mr-2" />,
          onClick: () => router.push("/admin/users/new"),
        }}
      />

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("searchUsers")}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <UserTable users={users} loading={loading} onUpdate={refetch} />

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
