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
import { AssignCardDialog } from "./assign-card-dialog"
import { apiClient } from "@/lib/api-client"
import { useTranslation } from "@/lib/i18n/context"
import { toast } from "sonner"
import { Plus, Trash2 } from "lucide-react"
import type { CompanyCardAssignment } from "@/lib/admin/types"

interface CompanyCardsTabProps {
  companyId: string
}

export function CompanyCardsTab({ companyId }: CompanyCardsTabProps) {
  const { t } = useTranslation()
  const [assignments, setAssignments] = useState<CompanyCardAssignment[]>([])
  const [loading, setLoading] = useState(true)
  const [showAssign, setShowAssign] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<CompanyCardAssignment | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchCards = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiClient.get<{ data: CompanyCardAssignment[] }>(
        `/api/admin/companies/${companyId}/cards`
      )
      setAssignments(res.data || [])
    } catch {
      setAssignments([])
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => {
    fetchCards()
  }, [fetchCards])

  async function handleRemove() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await apiClient.del(
        `/api/admin/companies/card-assignment/${deleteTarget.assignment_id}`
      )
      toast.success(t("removeAssignmentSuccess"))
      setDeleteTarget(null)
      fetchCards()
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
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("cardName")}</TableHead>
                <TableHead>{t("publicKey")}</TableHead>
                <TableHead>{t("owner")}</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((a) => (
                <TableRow key={a.assignment_id}>
                  <TableCell className="font-medium">
                    {a.user_preferred_name || a.public_key}
                  </TableCell>
                  <TableCell className="text-xs font-mono text-muted-foreground">
                    {a.public_key}
                  </TableCell>
                  <TableCell className="text-sm">
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

      <AssignCardDialog
        open={showAssign}
        onOpenChange={setShowAssign}
        companyId={companyId}
        onAssigned={fetchCards}
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
