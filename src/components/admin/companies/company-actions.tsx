"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MoreHorizontal, FileText, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { apiClient } from "@/lib/api-client"
import { useTranslation } from "@/lib/i18n/context"
import { toast } from "sonner"
import type { Company } from "@/lib/admin/types"

interface CompanyActionsProps {
  company: Company
  onUpdate: () => void
}

export function CompanyActions({ company, onUpdate }: CompanyActionsProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const [showDelete, setShowDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    try {
      await apiClient.del(`/api/admin/companies/${company.id}`)
      toast.success(t("deleteCompanySuccess"))
      onUpdate()
    } catch {
      toast.error(t("errorOccurred"))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => router.push(`/admin/companies/${company.id}`)}>
            <FileText className="size-4 mr-2" />
            {t("viewDetail")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push(`/admin/companies/${company.id}/edit`)}>
            <Pencil className="size-4 mr-2" />
            {t("edit")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowDelete(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="size-4 mr-2" />
            {t("delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        onConfirm={handleDelete}
        title={t("deleteCompanyConfirmation")}
        description={t("deleteCompanyConfirmationMessage")}
        confirmLabel={t("delete")}
        loading={deleting}
      />
    </>
  )
}
