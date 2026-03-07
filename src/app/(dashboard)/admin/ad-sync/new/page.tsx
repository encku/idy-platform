"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { ConnectionForm } from "@/components/admin/ad-sync/connection-form"
import { useTranslation } from "@/lib/i18n/context"
import { useCompanyFeatures } from "@/lib/admin/company-features-context"

export default function NewConnectionPage() {
  const { t } = useTranslation()
  const { hasCompanyFeature, loading: featuresLoading } = useCompanyFeatures()
  const router = useRouter()

  useEffect(() => {
    if (!featuresLoading && !hasCompanyFeature("ad_sync")) {
      router.replace("/admin")
    }
  }, [featuresLoading, hasCompanyFeature, router])

  if (featuresLoading) return null

  return (
    <div className="space-y-6">
      <AdminPageHeader title={t("addConnection")} backHref="/admin/ad-sync" />
      <ConnectionForm mode="create" />
    </div>
  )
}
