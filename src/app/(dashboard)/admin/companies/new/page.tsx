"use client"

import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { CompanyForm } from "@/components/admin/companies/company-form"
import { useTranslation } from "@/lib/i18n/context"

export default function NewCompanyPage() {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <AdminPageHeader title={t("createCompany")} backHref="/admin/companies" />
      <CompanyForm mode="create" />
    </div>
  )
}
