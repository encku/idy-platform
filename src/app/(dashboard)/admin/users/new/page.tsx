"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { UserForm } from "@/components/admin/users/user-form"
import { apiClient } from "@/lib/api-client"
import { useTranslation } from "@/lib/i18n/context"
import { toast } from "sonner"

export default function CreateUserPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  async function handleSubmit(data: Record<string, string | boolean>) {
    setSaving(true)
    try {
      await apiClient.post("/api/admin/users", data)
      toast.success(t("createUserSuccess"))
      router.push("/admin/users")
    } catch {
      toast.error(t("errorOccurred"))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("createUser")}
        backHref="/admin/users"
      />
      <UserForm mode="create" onSubmit={handleSubmit} saving={saving} />
    </div>
  )
}
