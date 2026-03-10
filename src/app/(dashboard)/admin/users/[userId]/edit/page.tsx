"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { UserForm } from "@/components/admin/users/user-form"
import { Skeleton } from "@/components/ui/skeleton"
import { apiClient } from "@/lib/api-client"
import { useTranslation } from "@/lib/i18n/context"
import { toast } from "sonner"
import type { AdminUser } from "@/lib/admin/types"

export default function EditUserPage() {
  const { t } = useTranslation()
  const params = useParams<{ userId: string }>()
  const router = useRouter()
  const [user, setUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchUser = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiClient.get<{ data: AdminUser }>(
        `/api/admin/users/${params.userId}`
      )
      setUser(res.data)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [params.userId])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  async function handleSubmit(data: Record<string, string | boolean | number>) {
    setSaving(true)
    try {
      await apiClient.put(`/api/admin/users/${params.userId}`, data)
      toast.success(t("updateUserSuccess"))
      router.push(`/admin/users/${params.userId}`)
    } catch {
      toast.error(t("errorOccurred"))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-4 max-w-2xl">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {t("noResults")}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("editUser")}
        subtitle={user.name}
        backHref={`/admin/users/${params.userId}`}
      />
      <UserForm
        mode="edit"
        initialData={user}
        onSubmit={handleSubmit}
        saving={saving}
      />
    </div>
  )
}
