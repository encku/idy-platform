"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, MapPin, Globe } from "lucide-react"
import { useTranslation } from "@/lib/i18n/context"
import type { CompanyDetail } from "@/lib/admin/types"

interface CompanyDetailCardProps {
  company: CompanyDetail
}

export function CompanyDetailCard({ company }: CompanyDetailCardProps) {
  const { t } = useTranslation()

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          {company.logo_url ? (
            <img
              src={company.logo_url}
              alt=""
              className="size-12 rounded-lg object-cover"
            />
          ) : (
            <div className="size-12 rounded-lg bg-muted flex items-center justify-center">
              <Building2 className="size-6 text-muted-foreground" />
            </div>
          )}
          <div>
            <CardTitle>{company.name}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {t("createdAt")}: {new Date(company.inserted_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {company.country && (
          <div className="flex items-center gap-2 text-sm">
            <Globe className="size-4 text-muted-foreground" />
            <span>{company.country}</span>
          </div>
        )}
        {company.address && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="size-4 text-muted-foreground" />
            <span>{company.address}</span>
          </div>
        )}
        <div className="flex gap-6 pt-2">
          <div>
            <p className="text-2xl font-bold">{company.card_count ?? 0}</p>
            <p className="text-xs text-muted-foreground">{t("totalCards")}</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{company.user_count ?? 0}</p>
            <p className="text-xs text-muted-foreground">{t("totalUsers")}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
