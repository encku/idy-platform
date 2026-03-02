"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Pencil } from "lucide-react"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { UserDetailCard } from "@/components/admin/users/user-detail-card"
import { UserCardsList } from "@/components/admin/users/user-cards-list"
import { Skeleton } from "@/components/ui/skeleton"
import { apiClient } from "@/lib/api-client"
import { useTranslation } from "@/lib/i18n/context"
import type { AdminUser } from "@/lib/admin/types"

export default function UserDetailPage() {
  const { t } = useTranslation()
  const params = useParams<{ userId: string }>()
  const router = useRouter()
  const [user, setUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)

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

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full max-w-2xl rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
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
    <div className="space-y-8">
      <AdminPageHeader
        title={t("userDetail")}
        subtitle={user.name}
        backHref="/admin/users"
        action={{
          label: t("edit"),
          icon: <Pencil className="size-4 mr-2" />,
          onClick: () => router.push(`/admin/users/${params.userId}/edit`),
        }}
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_1.5fr]">
        <UserDetailCard user={user} />
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{t("userCards")}</h3>
          <UserCardsList userId={user.id} />
        </div>
      </div>
    </div>
  )
}
