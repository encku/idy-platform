"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiClient } from "@/lib/api-client"
import { useTranslation } from "@/lib/i18n/context"
import { toast } from "sonner"
import type { Company } from "@/lib/admin/types"

interface CompanyFormProps {
  mode: "create" | "edit"
  company?: Company
}

export function CompanyForm({ mode, company }: CompanyFormProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: company?.name || "",
    country: company?.country || "",
    address: company?.address || "",
  })

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return

    setSaving(true)
    try {
      if (mode === "create") {
        await apiClient.post("/api/admin/companies", form)
        toast.success(t("createCompanySuccess"))
        router.push("/admin/companies")
      } else {
        await apiClient.put(`/api/admin/companies/${company!.id}`, form)
        toast.success(t("updateCompanySuccess"))
        router.push(`/admin/companies/${company!.id}`)
      }
    } catch {
      toast.error(t("errorOccurred"))
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {mode === "create" ? t("createCompany") : t("editCompany")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label>{t("companyName")}</Label>
            <Input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <Label>{t("country")}</Label>
            <Input
              value={form.country}
              onChange={(e) => update("country", e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label>{t("address")}</Label>
            <Input
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? t("saving") : mode === "create" ? t("create") : t("save")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
