"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { AppHeader } from "@/components/dashboard/app-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiClient } from "@/lib/api-client"
import { useTranslation } from "@/lib/i18n/context"
import { toast } from "sonner"

export default function ChangePasswordPage() {
  const { t } = useTranslation()
  const router = useRouter()

  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    reNewPassword: "",
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  function set(key: string, val: string) {
    setForm((prev) => ({ ...prev, [key]: val }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (form.newPassword !== form.reNewPassword) {
      setError(t("newPasswordNotMatch"))
      return
    }

    setSaving(true)

    try {
      await apiClient.post("/api/user/change-password", {
        old_password: form.oldPassword,
        password: form.newPassword,
      })
      toast.success(t("save"))
      router.push("/")
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code
      setError(code ? t(`errorCodes.${code}`) : t("errorCodes.1"))
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <AppHeader title={t("changePassword")} backButton />

      <div className="px-5 pt-5 pb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>{t("oldPassword")}</Label>
            <Input
              type="password"
              value={form.oldPassword}
              onChange={(e) => set("oldPassword", e.target.value)}
              required
              minLength={6}
              autoComplete="current-password"
            />
          </div>

          <div className="space-y-2">
            <Label>{t("newPassword")}</Label>
            <Input
              type="password"
              value={form.newPassword}
              onChange={(e) => set("newPassword", e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          <div className="space-y-2">
            <Label>{t("newPasswordConfirm")}</Label>
            <Input
              type="password"
              value={form.reNewPassword}
              onChange={(e) => set("reNewPassword", e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-12"
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                {t("save")}
              </>
            ) : (
              t("save")
            )}
          </Button>
        </form>
      </div>
    </>
  )
}
