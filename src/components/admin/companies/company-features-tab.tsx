"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { apiClient } from "@/lib/api-client"
import { useTranslation } from "@/lib/i18n/context"
import { toast } from "sonner"
import { Loader2, Save } from "lucide-react"
import type { CompanyFeature } from "@/lib/admin/types"

const FEATURE_META: Record<string, { labelKey: string; descKey: string }> = {
  ad_sync: { labelKey: "featureADSync", descKey: "featureADSyncDesc" },
}

interface CompanyFeaturesTabProps {
  companyId: string
}

export function CompanyFeaturesTab({ companyId }: CompanyFeaturesTabProps) {
  const { t } = useTranslation()
  const [features, setFeatures] = useState<CompanyFeature[]>([])
  const [availableFeatures, setAvailableFeatures] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [localState, setLocalState] = useState<Record<string, boolean>>({})

  const fetchFeatures = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiClient.get<{
        data: { features: CompanyFeature[]; available_features: string[] }
      }>(`/api/admin/companies/${companyId}/features`)
      const data = res.data
      setFeatures(data.features || [])
      setAvailableFeatures(data.available_features || [])

      // Build local state from existing features
      const state: Record<string, boolean> = {}
      for (const f of data.available_features || []) {
        const existing = (data.features || []).find(
          (cf) => cf.feature_name === f
        )
        state[f] = existing ? existing.is_enabled : false
      }
      setLocalState(state)
    } catch {
      toast.error(t("errorOccurred"))
    } finally {
      setLoading(false)
    }
  }, [companyId, t])

  useEffect(() => {
    fetchFeatures()
  }, [fetchFeatures])

  async function handleSave() {
    setSaving(true)
    try {
      const payload = {
        features: Object.entries(localState).map(([name, enabled]) => ({
          feature_name: name,
          is_enabled: enabled,
        })),
      }
      await apiClient.put(
        `/api/admin/companies/${companyId}/features`,
        payload
      )
      toast.success(t("featureUpdateSuccess"))
      fetchFeatures()
    } catch {
      toast.error(t("errorOccurred"))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-20 rounded-lg" />
        <Skeleton className="h-20 rounded-lg" />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("companyFeatures")}</CardTitle>
        <CardDescription>{t("companyFeaturesDesc")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {availableFeatures.map((featureName) => {
          const meta = FEATURE_META[featureName]
          return (
            <div
              key={featureName}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">
                  {meta ? t(meta.labelKey) : featureName}
                </Label>
                {meta && (
                  <p className="text-xs text-muted-foreground">
                    {t(meta.descKey)}
                  </p>
                )}
              </div>
              <Switch
                checked={localState[featureName] ?? false}
                onCheckedChange={(checked) =>
                  setLocalState((prev) => ({
                    ...prev,
                    [featureName]: checked,
                  }))
                }
              />
            </div>
          )
        })}

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? (
            <Loader2 className="size-4 mr-2 animate-spin" />
          ) : (
            <Save className="size-4 mr-2" />
          )}
          {t("save")}
        </Button>
      </CardContent>
    </Card>
  )
}
