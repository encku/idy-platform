"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Pencil, Settings } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { CompanyDetailCard } from "@/components/admin/companies/company-detail-card"
import { CompanyCardsTab } from "@/components/admin/companies/company-cards-tab"
import { CompanyUsersTab } from "@/components/admin/companies/company-users-tab"
import { CompanyFeaturesTab } from "@/components/admin/companies/company-features-tab"
import { apiClient } from "@/lib/api-client"
import { useTranslation } from "@/lib/i18n/context"
import { useAuth } from "@/lib/auth/context"
import type { CompanyDetail } from "@/lib/admin/types"

export default function CompanyDetailPage() {
  const { t } = useTranslation()
  const { role } = useAuth()
  const params = useParams<{ companyId: string }>()
  const router = useRouter()
  const [company, setCompany] = useState<CompanyDetail | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchCompany = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiClient.get<{ data: CompanyDetail }>(
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
        <Skeleton className="h-40 rounded-lg" />
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
    <div className="space-y-6 min-w-0">
      <AdminPageHeader
        title={company.name}
        backHref="/admin/companies"
        action={{
          label: t("edit"),
          icon: <Pencil className="size-4 mr-2" />,
          onClick: () => router.push(`/admin/companies/${params.companyId}/edit`),
        }}
      />

      <CompanyDetailCard company={company} />

      <Tabs defaultValue="cards">
        <TabsList className="w-full sm:w-fit">
          <TabsTrigger value="cards">{t("assignedCards")}</TabsTrigger>
          <TabsTrigger value="users">{t("assignedUsers")}</TabsTrigger>
          {role === "admin" && (
            <TabsTrigger value="features">
              <Settings className="size-4 mr-2" />
              {t("companyFeatures")}
            </TabsTrigger>
          )}
        </TabsList>
        <TabsContent value="cards" className="mt-4">
          <CompanyCardsTab companyId={params.companyId} />
        </TabsContent>
        <TabsContent value="users" className="mt-4">
          <CompanyUsersTab companyId={params.companyId} />
        </TabsContent>
        {role === "admin" && (
          <TabsContent value="features" className="mt-4">
            <CompanyFeaturesTab companyId={params.companyId} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
