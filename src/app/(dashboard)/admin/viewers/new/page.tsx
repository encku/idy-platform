"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { useTranslation } from "@/lib/i18n/context"
import { apiClient } from "@/lib/api-client"
import type { CompanyDetail } from "@/lib/admin/types"

export default function CreateViewerPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [companies, setCompanies] = useState<CompanyDetail[]>([])
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    company_id: "",
  })

  useEffect(() => {
    apiClient
      .get<{ data: CompanyDetail[] }>("/api/admin/companies?page=1&limit=100&search=")
      .then((res) => setCompanies(res.data || []))
      .catch(() => {})
  }, [])

  function set(key: string, val: string) {
    setForm((prev) => ({ ...prev, [key]: val }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await apiClient.post("/api/admin/viewers", {
        name: form.name,
        email: form.email,
        password: form.password,
        company_id: Number(form.company_id),
      })
      toast.success(t("createViewerSuccess"))
      router.push("/admin/viewers")
    } catch {
      toast.error(t("errorOccurred"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("createViewer")}
        backHref="/admin/viewers"
      />

      <form
        onSubmit={handleSubmit}
        className="max-w-md space-y-4"
      >
        <div className="space-y-2">
          <Label htmlFor="name">{t("name")}</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            required
            autoFocus
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">{t("email")}</Label>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">{t("password")}</Label>
          <Input
            id="password"
            type="password"
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
            required
            minLength={6}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="company">{t("company")}</Label>
          <select
            id="company"
            value={form.company_id}
            onChange={(e) => set("company_id", e.target.value)}
            required
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">{t("selectCompany")}</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin mr-2" />
              {t("saving")}
            </>
          ) : (
            t("create")
          )}
        </Button>
      </form>
    </div>
  )
}
