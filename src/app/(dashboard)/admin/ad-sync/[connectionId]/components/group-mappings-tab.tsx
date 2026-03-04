"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { apiClient } from "@/lib/api-client"
import { useTranslation } from "@/lib/i18n/context"
import { toast } from "sonner"
import { Plus, Trash2, Save, Loader2 } from "lucide-react"
import type { ADGroupRoleMapping } from "@/lib/admin/types"

const ROLES = ["admin", "company_admin", "read_only", "viewer"] as const

interface Props {
  connectionId: string
}

export function GroupMappingsTab({ connectionId }: Props) {
  const { t } = useTranslation()
  const [mappings, setMappings] = useState<ADGroupRoleMapping[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchMappings()
  }, [connectionId])

  async function fetchMappings() {
    try {
      const res = await apiClient.get<{ data: ADGroupRoleMapping[] }>(
        `/api/admin/ad-sync/connections/${connectionId}/group-mappings`
      )
      setMappings(res.data || [])
    } catch {
      toast.error(t("errorOccurred"))
    } finally {
      setLoading(false)
    }
  }

  function addMapping() {
    setMappings((prev) => [
      ...prev,
      {
        ad_connection_id: parseInt(connectionId),
        ad_group_id: "",
        ad_group_name: "",
        idycard_role: "read_only",
      },
    ])
  }

  function removeMapping(index: number) {
    setMappings((prev) => prev.filter((_, i) => i !== index))
  }

  function updateMapping(index: number, field: keyof ADGroupRoleMapping, value: string) {
    setMappings((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [field]: value } : m))
    )
  }

  async function handleSave() {
    setSaving(true)
    try {
      await apiClient.put(
        `/api/admin/ad-sync/connections/${connectionId}/group-mappings`,
        { mappings }
      )
      toast.success(t("groupMappingsSaved"))
      fetchMappings()
    } catch {
      toast.error(t("errorOccurred"))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-12 bg-muted rounded" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{t("groupRoleMappingsDesc")}</p>

      {mappings.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">{t("noGroupMappings")}</div>
      ) : (
        <div className="space-y-3">
          {mappings.map((mapping, i) => (
            <div key={i} className="flex gap-3 items-center">
              <Input
                placeholder={t("adGroupId")}
                value={mapping.ad_group_id}
                onChange={(e) => updateMapping(i, "ad_group_id", e.target.value)}
                className="flex-1"
              />
              <Input
                placeholder={t("adGroupName")}
                value={mapping.ad_group_name}
                onChange={(e) => updateMapping(i, "ad_group_name", e.target.value)}
                className="flex-1"
              />
              <Select
                value={mapping.idycard_role}
                onValueChange={(v) => updateMapping(i, "idycard_role", v)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="ghost" size="icon" onClick={() => removeMapping(i)}>
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <Button variant="outline" onClick={addMapping}>
          <Plus className="size-4 mr-2" />
          {t("addGroupMapping")}
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Save className="size-4 mr-2" />}
          {t("save")}
        </Button>
      </div>
    </div>
  )
}
