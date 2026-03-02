"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Search } from "lucide-react"
import { AppHeader } from "@/components/dashboard/app-header"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import { Input } from "@/components/ui/input"
import { apiClient } from "@/lib/api-client"
import { useTranslation } from "@/lib/i18n/context"
import { useAuth } from "@/lib/auth/context"
import type { FieldTypeGroup } from "@/lib/types"

export default function AddFieldListPage() {
  const { t } = useTranslation()
  const { canEdit } = useAuth()
  const router = useRouter()
  const { cardId } = useParams<{ cardId: string }>()

  useEffect(() => {
    if (!canEdit) router.replace("/")
  }, [canEdit, router])

  const [loading, setLoading] = useState(true)
  const [groups, setGroups] = useState<FieldTypeGroup[]>([])
  const [search, setSearch] = useState("")

  useEffect(() => {
    async function load() {
      try {
        const res = await apiClient.get<{ data: FieldTypeGroup[] }>(
          "/api/field-types"
        )
        setGroups(res.data)
      } catch {
        // handled
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = search.trim()
    ? groups
        .map((g) => ({
          ...g,
          fields: g.fields.filter((f) =>
            t(f.name).toLowerCase().includes(search.toLowerCase())
          ),
        }))
        .filter((g) => g.fields.length > 0)
    : groups

  if (!canEdit) return null
  if (loading) return <LoadingSpinner />

  return (
    <>
      <AppHeader title={t("addNewItem")} backButton />

      <div className="px-5 pt-4 pb-8">
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("addNewItem") + "..."}
            className="pl-9"
          />
        </div>

        {/* Groups */}
        <div className="space-y-6">
          {filtered.map((group) => (
            <div key={group.id}>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {t(group.name)}
              </h3>

              {group.is_scrollable ? (
                <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
                  {group.fields.map((field) => (
                    <button
                      key={field.id}
                      onClick={() =>
                        router.push(`/card/${cardId}/add/${field.id}`)
                      }
                      className="flex shrink-0 flex-col items-center gap-2 rounded-xl bg-muted/50 p-3 w-20 transition-colors hover:bg-muted"
                    >
                      <img
                        src={field.icon_url}
                        alt={t(field.name)}
                        className="size-10 rounded-lg object-contain"
                      />
                      <span className="text-[10px] font-medium text-center leading-tight line-clamp-2">
                        {t(field.name)}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {group.fields.map((field) => (
                    <button
                      key={field.id}
                      onClick={() =>
                        router.push(`/card/${cardId}/add/${field.id}`)
                      }
                      className="flex w-full items-center gap-3 rounded-xl bg-muted/50 p-3 transition-colors hover:bg-muted"
                    >
                      <img
                        src={field.icon_url}
                        alt={t(field.name)}
                        className="size-11 shrink-0 rounded-lg object-contain"
                      />
                      <span className="flex-1 text-sm font-medium text-left">
                        {t(field.name)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {t("add")}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
