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
import { apiClient } from "@/lib/api-client"
import { format } from "date-fns"
import { useTranslation } from "@/lib/i18n/context"
import { useDebouncedSearch } from "@/lib/hooks/use-debounced-search"
import { toast } from "sonner"
import { Search, Trash2 } from "lucide-react"
import type { UserDevice, AdminUser } from "@/lib/admin/types"

export function DeviceManagementTable() {
  const { t } = useTranslation()
  const [userSearch, setUserSearch] = useState("")
  const [users, setUsers] = useState<AdminUser[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [devices, setDevices] = useState<UserDevice[]>([])
  const [devicesLoading, setDevicesLoading] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<UserDevice | null>(null)
  const [deleting, setDeleting] = useState(false)

  const debouncedSearch = useDebouncedSearch(async (value: string) => {
    if (!value.trim()) {
      setUsers([])
      return
    }
    setSearchLoading(true)
    try {
      const res = await apiClient.get<{ data: AdminUser[] }>(
        `/api/admin/users?search=${encodeURIComponent(value)}&limit=5`
      )
      setUsers(res.data || [])
    } catch {
      setUsers([])
    } finally {
      setSearchLoading(false)
    }
  })

  function handleUserSearch(value: string) {
    setUserSearch(value)
    debouncedSearch(value)
  }

  async function selectUser(user: AdminUser) {
    setSelectedUserId(user.id)
    setUserSearch(user.name)
    setUsers([])
    setDevicesLoading(true)
    try {
      const res = await apiClient.get<{ data: UserDevice[] }>(
        `/api/admin/notifications/user/${user.id}/devices`
      )
      setDevices(res.data || [])
    } catch {
      setDevices([])
    } finally {
      setDevicesLoading(false)
    }
  }

  async function handleDeleteDevice() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await apiClient.del(
        `/api/admin/notifications/device/${deleteTarget.id}`
      )
      toast.success(t("deleteSuccess"))
      setDeleteTarget(null)
      setDevices((prev) => prev.filter((d) => d.id !== deleteTarget.id))
    } catch {
      toast.error(t("errorOccurred"))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          value={userSearch}
          onChange={(e) => handleUserSearch(e.target.value)}
          placeholder={t("searchUsers")}
          className="pl-9"
        />
        {(searchLoading || users.length > 0) && (
          <div className="absolute z-10 top-full left-0 right-0 mt-1 rounded-md border bg-popover shadow-md">
            {searchLoading ? (
              <div className="p-2 space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : (
              users.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm hover:bg-muted/50"
                  onClick={() => selectUser(user)}
                >
                  <span className="font-medium">{user.name}</span>
                  <span className="text-muted-foreground ml-2">{user.email}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {selectedUserId && (
        devicesLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : devices.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            {t("noResults")}
          </p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("platform")}</TableHead>
                  <TableHead>{t("deviceToken")}</TableHead>
                  <TableHead>{t("lastActive")}</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {devices.map((device) => (
                  <TableRow key={device.id}>
                    <TableCell className="font-medium">{device.platform}</TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground max-w-xs truncate">
                      {device.token}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(device.last_active), "dd.MM.yyyy")}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-destructive"
                        onClick={() => setDeleteTarget(device)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleDeleteDevice}
        title={t("delete")}
        description={t("deleteCardConfirmationMessage")}
        confirmLabel={t("delete")}
        loading={deleting}
      />
    </div>
  )
}
