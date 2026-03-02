"use client"

import { useRouter } from "next/navigation"
import { Trash2, Eye } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { useTranslation } from "@/lib/i18n/context"
import { apiClient } from "@/lib/api-client"
import type { Viewer } from "@/lib/admin/types"
import { Skeleton } from "@/components/ui/skeleton"

interface ViewerTableProps {
  viewers: Viewer[]
  loading: boolean
  onUpdate: () => void
}

export function ViewerTable({ viewers, loading, onUpdate }: ViewerTableProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)
    try {
      await apiClient.del(`/api/admin/viewers/${deleteId}`)
      toast.success(t("deleteViewerSuccess"))
      onUpdate()
    } catch {
      toast.error(t("errorOccurred"))
    } finally {
      setDeleting(false)
      setDeleteId(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (viewers.length === 0) {
    return (
      <div className="rounded-lg border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
        {t("noResults")}
      </div>
    )
  }

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("name")}</TableHead>
              <TableHead>{t("email")}</TableHead>
              <TableHead className="w-[100px]">{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {viewers.map((viewer) => (
              <TableRow key={viewer.id}>
                <TableCell className="font-medium">{viewer.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {viewer.email}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        router.push(`/admin/viewers/${viewer.id}`)
                      }
                    >
                      <Eye className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(viewer.id)}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title={t("deleteViewerConfirmation")}
        description={t("deleteViewerConfirmationMessage")}
        loading={deleting}
      />
    </>
  )
}
