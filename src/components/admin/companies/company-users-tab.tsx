"use client"

import { useEffect, useState, useCallback } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { AssignUserDialog } from "./assign-user-dialog"
import { apiClient } from "@/lib/api-client"
import { useTranslation } from "@/lib/i18n/context"
import { toast } from "sonner"
import { Plus, Trash2 } from "lucide-react"
import type { CompanyUserAssignment } from "@/lib/admin/types"

interface CompanyUsersTabProps {
  companyId: string
}

export function CompanyUsersTab({ companyId }: CompanyUsersTabProps) {
  const { t } = useTranslation()
  const [assignments, setAssignments] = useState<CompanyUserAssignment[]>([])
  const [loading, setLoading] = useState(true)
  const [showAssign, setShowAssign] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<CompanyUserAssignment | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiClient.get<{ data: CompanyUserAssignment[] }>(
        `/api/admin/companies/${companyId}/users`
      )
      setAssignments((res.data || []).filter((a) => a.user))
    } catch {
      setAssignments([])
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  async function handleRemove() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await apiClient.del(
        `/api/admin/companies/user-assignment/${deleteTarget.id}`
      )
      toast.success(t("removeAssignmentSuccess"))
      setDeleteTarget(null)
      fetchUsers()
    } catch {
      toast.error(t("errorOccurred"))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setShowAssign(true)}>
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
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("name")}</TableHead>
                <TableHead>{t("email")}</TableHead>
                <TableHead>{t("role")}</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">
                    {a.user.name}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {a.user.email}
                  </TableCell>
                  <TableCell className="text-sm">
                    {a.user.role_name}
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

      <AssignUserDialog
        open={showAssign}
        onOpenChange={setShowAssign}
        companyId={companyId}
        onAssigned={fetchUsers}
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
