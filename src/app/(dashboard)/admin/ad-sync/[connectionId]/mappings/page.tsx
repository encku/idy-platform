"use client"

import { useEffect, useState, useMemo, useCallback, useRef } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { apiClient } from "@/lib/api-client"
import { useTranslation } from "@/lib/i18n/context"
import { toast } from "sonner"
import {
  Plus,
  Trash2,
  Wand2,
  ArrowRight,
  User,
  CreditCard,
  UserCircle,
  Info,
} from "lucide-react"
import type { ADAttributeMapping, FieldType } from "@/lib/admin/types"

interface MappingRow {
  _key: string
  id?: number
  ad_attribute: string
  target_type: "user_field" | "card_field" | "profile_field"
  user_column?: string
  field_type_id?: number
  field_name?: string
  profile_column?: string
  transform_rule: string
  is_active: boolean
  sort_order: number
}

let rowKeyCounter = 0
function nextRowKey() {
  return `row-${++rowKeyCounter}`
}

// Common AD/LDAP attributes with descriptions
const adAttributes = [
  { value: "displayName", label: "displayName", desc: "Full name" },
  { value: "mail", label: "mail", desc: "Email address" },
  { value: "title", label: "title", desc: "Job title" },
  { value: "department", label: "department", desc: "Department" },
  { value: "telephoneNumber", label: "telephoneNumber", desc: "Office phone" },
  { value: "mobile", label: "mobile", desc: "Mobile phone" },
  { value: "company", label: "company", desc: "Company name" },
  { value: "streetAddress", label: "streetAddress", desc: "Street address" },
  { value: "city", label: "city", desc: "City" },
  { value: "country", label: "country", desc: "Country" },
  { value: "thumbnailPhoto", label: "thumbnailPhoto", desc: "Profile photo" },
  { value: "givenName", label: "givenName", desc: "First name" },
  { value: "sn", label: "sn", desc: "Last name (surname)" },
  { value: "userPrincipalName", label: "userPrincipalName", desc: "UPN (login)" },
  { value: "postalCode", label: "postalCode", desc: "Postal/ZIP code" },
  { value: "manager", label: "manager", desc: "Manager DN" },
  { value: "memberOf", label: "memberOf", desc: "Group membership" },
]

const userColumns = [
  { value: "name", label: "name" },
  { value: "email", label: "email" },
  { value: "title", label: "title" },
  { value: "company", label: "company" },
  { value: "address", label: "address" },
  { value: "description", label: "description" },
  { value: "picture_url", label: "picture_url" },
]

const profileColumns = [
  { value: "title", label: "title" },
  { value: "company", label: "company" },
  { value: "address", label: "address" },
  { value: "description", label: "description" },
  { value: "picture_url", label: "picture_url" },
]

const transformRules = [
  { value: "direct", desc: "mappingTransformDirect" },
  { value: "phone_parse", desc: "mappingTransformPhone" },
  { value: "photo_upload", desc: "mappingTransformPhoto" },
  { value: "lowercase", desc: "mappingTransformLowercase" },
]

const targetTypeConfig = {
  user_field: { icon: User, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950" },
  card_field: { icon: CreditCard, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950" },
  profile_field: { icon: UserCircle, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-950" },
} as const

function toMappingRows(data: ADAttributeMapping[]): MappingRow[] {
  return data.map((m) => ({
    _key: nextRowKey(),
    id: m.id,
    ad_attribute: m.ad_attribute,
    target_type: m.target_type,
    user_column: m.user_column,
    field_type_id: m.field_type_id,
    field_name: m.field_name,
    profile_column: m.profile_column,
    transform_rule: m.transform_rule,
    is_active: m.is_active,
    sort_order: m.sort_order,
  }))
}

function toPayload(mappings: MappingRow[]) {
  return mappings.map((m, i) => {
    const base = {
      ad_attribute: m.ad_attribute,
      target_type: m.target_type,
      transform_rule: m.transform_rule,
      is_active: m.is_active,
      sort_order: i + 1,
    }

    // Only include relevant target fields to avoid dirty data
    if (m.target_type === "user_field") {
      return { ...base, user_column: m.user_column }
    }
    if (m.target_type === "card_field") {
      return { ...base, field_type_id: m.field_type_id, field_name: m.field_name }
    }
    return { ...base, profile_column: m.profile_column }
  })
}

export default function MappingsPage() {
  const { t } = useTranslation()
  const params = useParams<{ connectionId: string }>()
  const connectionId = params.connectionId

  const [mappings, setMappings] = useState<MappingRow[]>([])
  const [fieldTypes, setFieldTypes] = useState<FieldType[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [applyingDefaults, setApplyingDefaults] = useState(false)
  const [showDefaultsConfirm, setShowDefaultsConfirm] = useState(false)

  // Abort controller to prevent race conditions
  const fetchRef = useRef(0)

  // Group field types by their group name
  const fieldTypeGroups = useMemo(() => {
    const groups: Record<string, FieldType[]> = {}
    for (const ft of fieldTypes) {
      const group = ft.group || "Other"
      if (!groups[group]) groups[group] = []
      groups[group].push(ft)
    }
    return groups
  }, [fieldTypes])

  // Memoized field type lookup
  const fieldTypeMap = useMemo(() => {
    const map = new Map<number, FieldType>()
    for (const ft of fieldTypes) map.set(ft.id, ft)
    return map
  }, [fieldTypes])

  const fetchMappings = useCallback(async () => {
    const fetchId = ++fetchRef.current
    try {
      const res = await apiClient.get<{ data: ADAttributeMapping[] }>(
        `/api/admin/ad-sync/connections/${connectionId}/mappings`
      )
      // Only update if this is still the latest fetch
      if (fetchId === fetchRef.current) {
        setMappings(toMappingRows(res.data || []))
      }
    } catch {
      if (fetchId === fetchRef.current) {
        toast.error(t("errorOccurred"))
      }
    }
  }, [connectionId, t])

  const fetchFieldTypes = useCallback(async () => {
    try {
      const res = await apiClient.get<{ data: FieldType[] }>("/api/admin/field-types")
      setFieldTypes(res.data || [])
    } catch {
      // Non-critical
    }
  }, [])

  useEffect(() => {
    Promise.all([fetchMappings(), fetchFieldTypes()]).finally(() => setLoading(false))
  }, [fetchMappings, fetchFieldTypes])

  function addRow() {
    setMappings((prev) => [
      ...prev,
      {
        _key: nextRowKey(),
        ad_attribute: "",
        target_type: "user_field",
        user_column: "name",
        transform_rule: "direct",
        is_active: true,
        sort_order: prev.length + 1,
      },
    ])
  }

  function removeRow(key: string) {
    setMappings((prev) => prev.filter((m) => m._key !== key))
  }

  function updateRow(key: string, updates: Partial<MappingRow>) {
    setMappings((prev) =>
      prev.map((row) => (row._key === key ? { ...row, ...updates } : row))
    )
  }

  function validateMappings(): boolean {
    for (const m of mappings) {
      if (!m.ad_attribute) {
        toast.error(t("mappingIncomplete"))
        return false
      }
      if (m.target_type === "user_field" && !m.user_column) {
        toast.error(t("mappingIncomplete"))
        return false
      }
      if (m.target_type === "card_field" && !m.field_type_id) {
        toast.error(t("mappingIncomplete"))
        return false
      }
      if (m.target_type === "profile_field" && !m.profile_column) {
        toast.error(t("mappingIncomplete"))
        return false
      }
    }
    return true
  }

  async function handleSave() {
    if (!validateMappings()) return

    setSaving(true)
    try {
      const res = await apiClient.put<{ data: ADAttributeMapping[] }>(
        `/api/admin/ad-sync/connections/${connectionId}/mappings`,
        { mappings: toPayload(mappings) }
      )
      // Use response data directly instead of re-fetching
      if (res.data) {
        setMappings(toMappingRows(res.data))
      }
      toast.success(t("mappingSaved"))
    } catch {
      toast.error(t("errorOccurred"))
    } finally {
      setSaving(false)
    }
  }

  async function handleApplyDefaults() {
    setApplyingDefaults(true)
    try {
      const res = await apiClient.post<{ data: ADAttributeMapping[] }>(
        `/api/admin/ad-sync/connections/${connectionId}/mappings/defaults`,
        {}
      )
      if (res.data) {
        setMappings(toMappingRows(res.data))
      } else {
        await fetchMappings()
      }
      toast.success(t("applyDefaults"))
    } catch {
      toast.error(t("errorOccurred"))
    } finally {
      setApplyingDefaults(false)
      setShowDefaultsConfirm(false)
    }
  }

  function getFieldTypeName(fieldTypeId?: number): string {
    if (!fieldTypeId) return ""
    const ft = fieldTypeMap.get(fieldTypeId)
    return ft ? ft.name : `#${fieldTypeId}`
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted rounded w-64 animate-pulse" />
        <div className="h-64 bg-muted rounded animate-pulse" />
      </div>
    )
  }

  const activeCount = mappings.filter((m) => m.is_active).length

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("attributeMappings")}
        backHref={`/admin/ad-sync/${connectionId}`}
      />

      {/* Info Banner */}
      <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/30">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start gap-3">
            <Info className="size-5 text-blue-600 mt-0.5 shrink-0" />
            <div className="text-sm text-blue-900 dark:text-blue-100">
              <p>{t("mappingDescription")}</p>
              <div className="flex gap-4 mt-2 text-xs text-blue-700 dark:text-blue-300">
                <span className="flex items-center gap-1">
                  <User className="size-3" /> {t("mappingTargetUser")}
                </span>
                <span className="flex items-center gap-1">
                  <CreditCard className="size-3" /> {t("mappingTargetCard")}
                </span>
                <span className="flex items-center gap-1">
                  <UserCircle className="size-3" /> {t("mappingTargetProfile")}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowDefaultsConfirm(true)}>
            <Wand2 className="size-4 mr-2" />
            {t("applyDefaults")}
          </Button>
          <Button variant="outline" onClick={addRow}>
            <Plus className="size-4 mr-2" />
            {t("addMapping")}
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          {activeCount} / {mappings.length} {t("mappingsActive")}
        </div>
      </div>

      {/* Mapping Rows */}
      {mappings.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-3">
              <p className="text-muted-foreground">{t("noMappings")}</p>
              <div className="flex justify-center gap-2">
                <Button variant="outline" onClick={() => setShowDefaultsConfirm(true)}>
                  <Wand2 className="size-4 mr-2" />
                  {t("applyDefaults")}
                </Button>
                <Button variant="outline" onClick={addRow}>
                  <Plus className="size-4 mr-2" />
                  {t("addMapping")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {mappings.map((mapping, index) => {
            const config = targetTypeConfig[mapping.target_type]
            const Icon = config.icon

            return (
              <Card
                key={mapping._key}
                className={`transition-opacity ${!mapping.is_active ? "opacity-50" : ""}`}
              >
                <CardContent className="py-4">
                  <div className="flex items-center gap-3 overflow-x-auto">
                    {/* Row number */}
                    <span className="text-xs text-muted-foreground font-mono w-5 shrink-0">
                      {index + 1}
                    </span>

                    {/* AD Attribute (Source) */}
                    <div className="w-52 shrink-0">
                      <Select
                        value={mapping.ad_attribute}
                        onValueChange={(v) => updateRow(mapping._key, { ad_attribute: v })}
                      >
                        <SelectTrigger className="font-mono text-sm">
                          <SelectValue placeholder={t("adAttribute")} />
                        </SelectTrigger>
                        <SelectContent>
                          {adAttributes.map((attr) => (
                            <SelectItem key={attr.value} value={attr.value}>
                              <div className="flex items-center gap-2">
                                <span className="font-mono">{attr.label}</span>
                                <span className="text-xs text-muted-foreground">
                                  {attr.desc}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Arrow */}
                    <ArrowRight className="size-4 text-muted-foreground shrink-0" />

                    {/* Target Type */}
                    <div className="w-44 shrink-0">
                      <Select
                        value={mapping.target_type}
                        onValueChange={(v) => {
                          const newType = v as MappingRow["target_type"]
                          const updates: Partial<MappingRow> = {
                            target_type: newType,
                            // Clear all target-specific fields
                            user_column: undefined,
                            field_type_id: undefined,
                            field_name: undefined,
                            profile_column: undefined,
                          }
                          // Set default for the new type
                          if (newType === "user_field") updates.user_column = "name"
                          if (newType === "profile_field") updates.profile_column = "title"
                          updateRow(mapping._key, updates)
                        }}
                      >
                        <SelectTrigger>
                          <div className="flex items-center gap-2">
                            <Icon className={`size-3.5 ${config.color}`} />
                            <SelectValue />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user_field">
                            <div className="flex items-center gap-2">
                              <User className="size-3.5 text-blue-600" />
                              {t("mappingUserField")}
                            </div>
                          </SelectItem>
                          <SelectItem value="card_field">
                            <div className="flex items-center gap-2">
                              <CreditCard className="size-3.5 text-emerald-600" />
                              {t("mappingCardField")}
                            </div>
                          </SelectItem>
                          <SelectItem value="profile_field">
                            <div className="flex items-center gap-2">
                              <UserCircle className="size-3.5 text-purple-600" />
                              {t("mappingProfileField")}
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Target Column/Field */}
                    <div className="w-48 shrink-0">
                      {mapping.target_type === "user_field" ? (
                        <Select
                          value={mapping.user_column || ""}
                          onValueChange={(v) => updateRow(mapping._key, { user_column: v })}
                        >
                          <SelectTrigger className="font-mono text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {userColumns.map((col) => (
                              <SelectItem key={col.value} value={col.value}>
                                <span className="font-mono">{col.label}</span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : mapping.target_type === "profile_field" ? (
                        <Select
                          value={mapping.profile_column || ""}
                          onValueChange={(v) => updateRow(mapping._key, { profile_column: v })}
                        >
                          <SelectTrigger className="font-mono text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {profileColumns.map((col) => (
                              <SelectItem key={col.value} value={col.value}>
                                <span className="font-mono">{col.label}</span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Select
                          value={mapping.field_type_id ? String(mapping.field_type_id) : ""}
                          onValueChange={(v) => {
                            const id = Number(v)
                            const ft = fieldTypeMap.get(id)
                            updateRow(mapping._key, {
                              field_type_id: id,
                              field_name: ft?.name || "",
                            })
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t("selectFieldType")} />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(fieldTypeGroups).map(([group, types]) => (
                              <SelectGroup key={group}>
                                <SelectLabel>{group}</SelectLabel>
                                {types.map((ft) => (
                                  <SelectItem key={ft.id} value={String(ft.id)}>
                                    <div className="flex items-center gap-2">
                                      {ft.icon_url && (
                                        <img
                                          src={ft.icon_url}
                                          alt=""
                                          className="size-4 dark:invert"
                                        />
                                      )}
                                      <span>{ft.name}</span>
                                      <span className="text-xs text-muted-foreground">
                                        #{ft.id}
                                      </span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>

                    {/* Transform */}
                    <div className="w-36 shrink-0">
                      <Select
                        value={mapping.transform_rule}
                        onValueChange={(v) => updateRow(mapping._key, { transform_rule: v })}
                      >
                        <SelectTrigger className="text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {transformRules.map((rule) => (
                            <SelectItem key={rule.value} value={rule.value}>
                              {t(rule.desc)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Active Toggle */}
                    <Switch
                      aria-label={t("connectionActive")}
                      checked={mapping.is_active}
                      onCheckedChange={(v) => updateRow(mapping._key, { is_active: v })}
                    />

                    {/* Delete */}
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={t("delete")}
                      className="text-destructive shrink-0"
                      onClick={() => removeRow(mapping._key)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>

                  {/* Summary line */}
                  <div className="ml-8 mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className={`${config.bg} ${config.color} text-[10px] px-1.5`}>
                      {mapping.target_type === "user_field"
                        ? t("mappingUserField")
                        : mapping.target_type === "card_field"
                          ? t("mappingCardField")
                          : t("mappingProfileField")}
                    </Badge>
                    {mapping.ad_attribute && (
                      <span>
                        <span className="font-mono">{mapping.ad_attribute}</span>
                        {" → "}
                        <span className="font-mono">
                          {mapping.target_type === "card_field"
                            ? getFieldTypeName(mapping.field_type_id) || mapping.field_name
                            : mapping.target_type === "user_field"
                              ? mapping.user_column
                              : mapping.profile_column}
                        </span>
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Save Button */}
      {mappings.length > 0 && (
        <div className="flex justify-end gap-2 sticky bottom-4 bg-background/80 backdrop-blur-sm py-3 -mx-1 px-1 rounded-lg">
          <Button size="lg" onClick={handleSave} disabled={saving}>
            {saving ? t("saving") : t("save")}
          </Button>
        </div>
      )}

      {/* Confirm dialog for applying defaults */}
      <ConfirmDialog
        open={showDefaultsConfirm}
        onOpenChange={setShowDefaultsConfirm}
        onConfirm={handleApplyDefaults}
        title={t("applyDefaults")}
        description={t("applyDefaultsConfirm")}
        confirmLabel={t("apply")}
        loading={applyingDefaults}
      />
    </div>
  )
}
