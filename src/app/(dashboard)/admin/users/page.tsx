"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { UserPlus, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { UserTable } from "@/components/admin/users/user-table"
import { Pagination } from "@/components/admin/pagination"
import { useTranslation } from "@/lib/i18n/context"
import { usePaginatedQuery } from "@/lib/hooks/use-paginated-query"
import type { AdminUser } from "@/lib/admin/types"

const ROLE_OPTIONS = [
  { value: "", labelKey: "allRoles" },
  { value: "admin", labelKey: "roleAdmin" },
  { value: "company_admin", labelKey: "roleCompanyAdmin" },
  { value: "read_only", labelKey: "roleReadOnly" },
  { value: "viewer", labelKey: "roleViewer" },
]

export default function AdminUsersPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [roleFilter, setRoleFilter] = useState("")

  const extraParams = useMemo(() => {
    const params: Record<string, string> = {}
    if (roleFilter) params.role = roleFilter
    return params
  }, [roleFilter])

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
  } = usePaginatedQuery<AdminUser>({ url: "/api/admin/users", extraParams })

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

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchUsers")}
            className="pl-9"
          />
        </div>
        <Select
          value={roleFilter || "__all__"}
          onValueChange={(v) => setRoleFilter(v === "__all__" ? "" : v)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t("allRoles")} />
          </SelectTrigger>
          <SelectContent>
            {ROLE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value || "__all__"} value={opt.value || "__all__"}>
                {t(opt.labelKey)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
