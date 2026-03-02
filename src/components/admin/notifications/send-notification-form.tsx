"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { apiClient } from "@/lib/api-client"
import { useTranslation } from "@/lib/i18n/context"
import { useDebouncedSearch } from "@/lib/hooks/use-debounced-search"
import { toast } from "sonner"
import { Send } from "lucide-react"
import type { AdminUser } from "@/lib/admin/types"

export function SendNotificationForm() {
  const { t } = useTranslation()
  const [userSearch, setUserSearch] = useState("")
  const [users, setUsers] = useState<AdminUser[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [sending, setSending] = useState(false)

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
    setSelectedUser(null)
    debouncedSearch(value)
  }

  function selectUser(user: AdminUser) {
    setSelectedUser(user)
    setUserSearch(user.name)
    setUsers([])
  }

  async function handleSend() {
    if (!selectedUser || !title.trim() || !body.trim()) return
    setSending(true)
    try {
      await apiClient.post("/api/admin/notifications/send", {
        user_id: selectedUser.id,
        title,
        body,
      })
      toast.success(t("notificationSent"))
      setTitle("")
      setBody("")
      setSelectedUser(null)
      setUserSearch("")
    } catch {
      toast.error(t("errorOccurred"))
    } finally {
      setSending(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("sendNotification")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1 relative">
          <Label>{t("selectUser")}</Label>
          <Input
            value={userSearch}
            onChange={(e) => handleUserSearch(e.target.value)}
            placeholder={t("searchUsers")}
          />
          {(searchLoading || users.length > 0) && !selectedUser && (
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
                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted/50 flex items-center justify-between"
                    onClick={() => selectUser(user)}
                  >
                    <span className="font-medium">{user.name}</span>
                    <span className="text-muted-foreground text-xs">{user.email}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
        <div className="space-y-1">
          <Label>{t("notificationTitle")}</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label>{t("notificationBody")}</Label>
          <Input
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </div>
        <div className="flex justify-end">
          <Button
            onClick={handleSend}
            disabled={!selectedUser || !title.trim() || !body.trim() || sending}
          >
            <Send className="size-4 mr-2" />
            {sending ? t("saving") : t("send")}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
