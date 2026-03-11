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
import { AssignCardDialog } from "./assign-card-dialog"
import { apiClient } from "@/lib/api-client"
import { usePaginatedQuery } from "@/lib/hooks/use-paginated-query"
import { useTranslation } from "@/lib/i18n/context"
import { toast } from "sonner"
import { Plus, Trash2, Search } from "lucide-react"
import type { CompanyCardAssignment } from "@/lib/admin/types"

interface CompanyCardsTabProps {
  companyId: string
}

export function CompanyCardsTab({ companyId }: CompanyCardsTabProps) {
  const { t } = useTranslation()
  const [showAssign, setShowAssign] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<CompanyCardAssignment | null>(null)
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
  } = usePaginatedQuery<CompanyCardAssignment>({
    url: `/api/admin/companies/${companyId}/cards`,
  })

  async function handleRemove() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await apiClient.del(
        `/api/admin/companies/card-assignment/${deleteTarget.assignment_id}`
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
            placeholder={t("searchCards")}
            className="pl-9"
          />
        </div>
        <Button size="sm" className="shrink-0" onClick={() => setShowAssign(true)}>
          <Plus className="size-4 mr-2" />
          {t("assignCard")}
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
                <TableHead>{t("cardName")}</TableHead>
                <TableHead className="hidden sm:table-cell">{t("publicKey")}</TableHead>
                <TableHead>{t("owner")}</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((a) => (
                <TableRow key={a.assignment_id}>
                  <TableCell className="font-medium max-w-[200px] truncate">
                    {a.user_preferred_name || a.public_key}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-xs font-mono text-muted-foreground max-w-[180px] truncate">
                    {a.public_key}
                  </TableCell>
                  <TableCell className="text-sm max-w-[150px] truncate">
                    {a.user_name}
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

      <AssignCardDialog
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
