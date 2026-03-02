"use client"

import { useEffect, useState, useCallback } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { FieldTypeGroup } from "@/components/admin/field-types/field-type-group"
import { apiClient } from "@/lib/api-client"
import { useTranslation } from "@/lib/i18n/context"
import type { FieldType } from "@/lib/admin/types"

export default function AdminFieldTypesPage() {
  const { t } = useTranslation()
  const [groups, setGroups] = useState<Record<string, FieldType[]>>({})
  const [loading, setLoading] = useState(true)

  const fetchFieldTypes = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiClient.get<{ data: FieldType[] }>(
        "/api/admin/field-types"
      )
      const fieldTypes = res.data || []
      const grouped: Record<string, FieldType[]> = {}
      for (const ft of fieldTypes) {
        const group = ft.group || "Other"
        if (!grouped[group]) grouped[group] = []
        grouped[group].push(ft)
      }
      setGroups(grouped)
    } catch {
      setGroups({})
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFieldTypes()
  }, [fetchFieldTypes])

  const groupNames = Object.keys(groups).sort()

  return (
    <div className="space-y-6">
      <AdminPageHeader title={t("adminFieldTypes")} />

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      ) : groupNames.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {t("noResults")}
        </div>
      ) : (
        <div className="space-y-4">
          {groupNames.map((name) => (
            <FieldTypeGroup
              key={name}
              groupName={name}
              fieldTypes={groups[name]}
            />
          ))}
        </div>
      )}
    </div>
  )
}
