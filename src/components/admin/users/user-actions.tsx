"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  MoreHorizontal,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  Pencil,
  User,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { apiClient } from "@/lib/api-client"
import { useTranslation } from "@/lib/i18n/context"
import { toast } from "sonner"
import type { AdminUser } from "@/lib/admin/types"

interface UserActionsProps {
  user: AdminUser
  onUpdate?: () => void
}

export function UserActions({ user, onUpdate }: UserActionsProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [saving, setSaving] = useState(false)

  async function handleSendResetEmail() {
    try {
      await apiClient.post("/api/admin/reset-password", { email: user.email })
      toast.success(t("resetPasswordSent"))
    } catch {
      toast.error(t("errorOccurred"))
    }
  }

  async function handleSetPassword() {
    if (newPassword.length < 6) {
      toast.error(t("passwordMinLength"))
      return
    }

    setSaving(true)
    try {
      await apiClient.post(`/api/admin/users/${user.id}/set-password`, {
        password: newPassword,
      })
      toast.success(t("passwordUpdated"))
      setShowPasswordDialog(false)
      setNewPassword("")
    } catch {
      toast.error(t("errorOccurred"))
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleVisibility() {
    try {
      await apiClient.put(`/api/admin/users/${user.id}/visibility`, {
        is_hidden: !user.is_hidden,
      })
      toast.success(t("visibilityUpdated"))
      onUpdate?.()
    } catch {
      toast.error(t("errorOccurred"))
    }
  }

  async function handleDelete() {
    setSaving(true)
    try {
      await apiClient.del(`/api/admin/users/${user.id}`)
      toast.success(t("deleteUserSuccess"))
      setShowDeleteDialog(false)
      onUpdate?.()
    } catch {
      toast.error(t("errorOccurred"))
    } finally {
      setSaving(false)
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
          <DropdownMenuItem
            onClick={() => router.push(`/admin/users/${user.id}`)}
          >
            <User className="size-4 mr-2" />
            {t("viewUser")}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push(`/admin/users/${user.id}/edit`)}
          >
            <Pencil className="size-4 mr-2" />
            {t("editUser")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleToggleVisibility}>
            {user.is_hidden ? (
              <Eye className="size-4 mr-2" />
            ) : (
              <EyeOff className="size-4 mr-2" />
            )}
            {t("toggleVisibility")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSendResetEmail}>
            <Mail className="size-4 mr-2" />
            {t("sendResetEmail")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowPasswordDialog(true)}>
            <KeyRound className="size-4 mr-2" />
            {t("setNewPassword")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="size-4 mr-2" />
            {t("deleteUser")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("setNewPassword")}</DialogTitle>
            <DialogDescription>
              {user.name} ({user.email})
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="new-password">{t("newPassword")}</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-2"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSetPassword()
              }}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPasswordDialog(false)}
            >
              {t("cancel")}
            </Button>
            <Button onClick={handleSetPassword} disabled={saving}>
              {saving ? t("saving") : t("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        title={t("deleteUserConfirmation")}
        description={t("deleteUserConfirmationMessage")}
        confirmLabel={t("delete")}
        loading={saving}
      />
    </>
  )
}
