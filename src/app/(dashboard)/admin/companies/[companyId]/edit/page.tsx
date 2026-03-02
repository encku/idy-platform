"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { CompanyForm } from "@/components/admin/companies/company-form"
import { apiClient } from "@/lib/api-client"
import { useTranslation } from "@/lib/i18n/context"
import type { Company } from "@/lib/admin/types"

export default function EditCompanyPage() {
  const { t } = useTranslation()
  const params = useParams<{ companyId: string }>()
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchCompany = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiClient.get<{ data: Company }>(
        `/api/admin/companies/${params.companyId}`
      )
      setCompany(res.data)
    } catch {
      setCompany(null)
    } finally {
      setLoading(false)
    }
  }, [params.companyId])

  useEffect(() => {
    fetchCompany()
  }, [fetchCompany])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    )
  }

  if (!company) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {t("noResults")}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("editCompany")}
        backHref={`/admin/companies/${params.companyId}`}
      />
      <CompanyForm mode="edit" company={company} />
    </div>
  )
}
