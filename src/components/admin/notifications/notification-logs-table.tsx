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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { Pagination } from "@/components/admin/pagination"
import { apiClient } from "@/lib/api-client"
import { format } from "date-fns"
import { useTranslation } from "@/lib/i18n/context"
import { usePaginatedQuery } from "@/lib/hooks/use-paginated-query"
import { toast } from "sonner"
import { Trash2 } from "lucide-react"
import type { NotificationLog } from "@/lib/admin/types"

export function NotificationLogsTable() {
  const { t } = useTranslation()
  const [deleteTarget, setDeleteTarget] = useState<NotificationLog | null>(null)
  const [deleting, setDeleting] = useState(false)

  const {
    data: logs,
    total,
    page,
    totalPages,
    loading,
    setPage,
    refetch,
  } = usePaginatedQuery<NotificationLog>({ url: "/api/admin/notifications/logs" })

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await apiClient.del(`/api/admin/notifications/${deleteTarget.id}`)
      toast.success(t("deleteSuccess"))
      setDeleteTarget(null)
      refetch()
    } catch {
      toast.error(t("errorOccurred"))
    } finally {
      setDeleting(false)
    }
  }

  const statusVariant = (status: string) => {
    switch (status) {
      case "sent":
        return "outline" as const
      case "failed":
        return "destructive" as const
      default:
        return "secondary" as const
    }
  }

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {logs.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          {t("noResults")}
        </p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("user")}</TableHead>
                <TableHead>{t("notificationTitle")}</TableHead>
                <TableHead>{t("status")}</TableHead>
                <TableHead>{t("createdAt")}</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.user_name}</TableCell>
                  <TableCell>{log.title}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(log.status)}>
                      {log.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(log.inserted_at), "dd.MM.yyyy")}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-destructive"
                      onClick={() => setDeleteTarget(log)}
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

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={t("delete")}
        description={t("deleteCardConfirmationMessage")}
        confirmLabel={t("delete")}
        loading={deleting}
      />
    </div>
  )
}
