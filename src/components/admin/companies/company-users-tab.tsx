"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { Pagination } from "@/components/admin/pagination"
import { AssignUserDialog } from "./assign-user-dialog"
import { apiClient } from "@/lib/api-client"
import { usePaginatedQuery } from "@/lib/hooks/use-paginated-query"
import { useTranslation } from "@/lib/i18n/context"
import { toast } from "sonner"
import { Plus, Trash2, Search } from "lucide-react"
import type { CompanyUserAssignment } from "@/lib/admin/types"

interface CompanyUsersTabProps {
  companyId: string
}

export function CompanyUsersTab({ companyId }: CompanyUsersTabProps) {
  const { t } = useTranslation()
  const [showAssign, setShowAssign] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<CompanyUserAssignment | null>(null)
  const [deleting, setDeleting] = useState(false)

  const {
    data: assignments,
    total,
    page,
    totalPages,
    loading,
    search,
    setPage,
    setSearch,
    refetch,
  } = usePaginatedQuery<CompanyUserAssignment>({
    url: `/api/admin/companies/${companyId}/users`,
  })

  async function handleRemove() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await apiClient.del(
        `/api/admin/companies/user-assignment/${deleteTarget.id}`
      )
      toast.success(t("removeAssignmentSuccess"))
      setDeleteTarget(null)
      refetch()
    } catch {
      toast.error(t("errorOccurred"))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchUsers")}
            className="pl-9"
          />
        </div>
        <Button size="sm" className="shrink-0" onClick={() => setShowAssign(true)}>
          <Plus className="size-4 mr-2" />
          {t("assignUser")}
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : assignments.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          {t("noResults")}
        </p>
      ) : (
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("name")}</TableHead>
                <TableHead className="hidden sm:table-cell">{t("email")}</TableHead>
                <TableHead>{t("role")}</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium max-w-[200px]">
                    <div className="truncate">{a.user_name}</div>
                    <div className="sm:hidden text-xs text-muted-foreground truncate">
                      {a.user_email}
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-muted-foreground max-w-[200px] truncate">
                    {a.user_email}
                  </TableCell>
                  <TableCell className="text-sm">
                    {a.role_name}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-destructive"
                      onClick={() => setDeleteTarget(a)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={20}
        onPageChange={setPage}
      />

      <AssignUserDialog
        open={showAssign}
        onOpenChange={setShowAssign}
        companyId={companyId}
        onAssigned={refetch}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleRemove}
        title={t("removeAssignment")}
        description={t("removeAssignmentMessage")}
        confirmLabel={t("delete")}
        loading={deleting}
      />
    </div>
  )
}
