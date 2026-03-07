"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useTranslation } from "@/lib/i18n/context"
import type { ADSyncPreview } from "@/lib/admin/types"
import {
  UserPlus,
  RefreshCw,
  UserX,
  SkipForward,
  Loader2,
  Play,
} from "lucide-react"

const actionVariant: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  create: "default",
  update: "secondary",
  deactivate: "destructive",
  skip: "outline",
}

interface SyncPreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  preview: ADSyncPreview | null
  loading: boolean
  onConfirmSync: () => void
  syncing: boolean
}

export function SyncPreviewDialog({
  open,
  onOpenChange,
  preview,
  loading,
  onConfirmSync,
  syncing,
}: SyncPreviewDialogProps) {
  const { t } = useTranslation()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("syncPreviewTitle")}</DialogTitle>
          <DialogDescription>{t("syncPreviewDesc")}</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {t("syncPreviewLoading")}
            </p>
          </div>
        ) : preview ? (
          <div className="space-y-4">
            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="rounded-lg border p-3 text-center">
                <UserPlus className="size-5 mx-auto text-green-600" />
                <div className="text-2xl font-bold mt-1">
                  {preview.to_create}
                </div>
                <div className="text-xs text-muted-foreground">
                  {t("syncPreviewCreate")}
                </div>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <RefreshCw className="size-5 mx-auto text-blue-600" />
                <div className="text-2xl font-bold mt-1">
                  {preview.to_update}
                </div>
                <div className="text-xs text-muted-foreground">
                  {t("syncPreviewUpdate")}
                </div>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <UserX className="size-5 mx-auto text-red-600" />
                <div className="text-2xl font-bold mt-1">
                  {preview.to_deactivate}
                </div>
                <div className="text-xs text-muted-foreground">
                  {t("syncPreviewDeactivate")}
                </div>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <SkipForward className="size-5 mx-auto text-muted-foreground" />
                <div className="text-2xl font-bold mt-1">
                  {preview.to_skip}
                </div>
                <div className="text-xs text-muted-foreground">
                  {t("syncPreviewSkip")}
                </div>
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              {t("syncPreviewTotalUsers")}: {preview.total_ad_users}
            </div>

            {/* User list */}
            {preview.preview_users && preview.preview_users.length > 0 ? (
              <ScrollArea className="h-[280px] rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50 sticky top-0">
                      <th className="text-left p-2.5 font-medium">
                        AD Name
                      </th>
                      <th className="text-left p-2.5 font-medium">
                        AD Email
                      </th>
                      <th className="text-left p-2.5 font-medium">
                        {t("syncPreviewAction")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.preview_users.map((user, i) => (
                      <tr key={`${user.ad_email}-${user.action}-${i}`} className="border-b">
                        <td className="p-2.5">{user.ad_display_name}</td>
                        <td className="p-2.5 text-muted-foreground">
                          {user.ad_email}
                        </td>
                        <td className="p-2.5">
                          <Badge
                            variant={actionVariant[user.action] || "outline"}
                          >
                            {user.action}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                {t("syncPreviewNoChanges")}
              </div>
            )}
          </div>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
          <Button
            onClick={onConfirmSync}
            disabled={loading || syncing || !preview}
          >
            {syncing ? (
              <Loader2 className="size-4 mr-2 animate-spin" />
            ) : (
              <Play className="size-4 mr-2" />
            )}
            {t("syncPreviewConfirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
