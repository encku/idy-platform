"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import Image from "next/image"
import { Users, CreditCard } from "lucide-react"
import { CompanyActions } from "./company-actions"
import { useTranslation } from "@/lib/i18n/context"
import type { Company } from "@/lib/admin/types"

interface CompanyTableProps {
  companies: Company[]
  loading: boolean
  onUpdate: () => void
}

export function CompanyTable({ companies, loading, onUpdate }: CompanyTableProps) {
  const { t } = useTranslation()

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24 flex-1" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-5 w-8" />
          </div>
        ))}
      </div>
    )
  }

  if (companies.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {t("noResults")}
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("companyName")}</TableHead>
            <TableHead>{t("country")}</TableHead>
            <TableHead>{t("totalUsers")}</TableHead>
            <TableHead>{t("totalCards")}</TableHead>
            <TableHead>{t("createdAt")}</TableHead>
            <TableHead className="w-12">{t("actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.map((company) => (
            <TableRow key={company.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-3">
                  {company.logo_url ? (
                    <Image
                      src={company.logo_url}
                      alt=""
                      width={32}
                      height={32}
                      className="size-8 rounded object-cover"
                    />
                  ) : (
                    <div className="size-8 rounded bg-muted flex items-center justify-center text-xs font-bold">
                      {company.name.charAt(0)}
                    </div>
                  )}
                  {company.name}
                </div>
              </TableCell>
              <TableCell>{company.country}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5 text-sm">
                  <Users className="size-3.5 text-muted-foreground" />
                  {company.user_count ?? 0}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5 text-sm">
                  <CreditCard className="size-3.5 text-muted-foreground" />
                  {company.card_count ?? 0}
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {format(new Date(company.inserted_at), "dd.MM.yyyy")}
              </TableCell>
              <TableCell>
                <CompanyActions company={company} onUpdate={onUpdate} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
