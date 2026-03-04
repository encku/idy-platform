"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Pagination } from "@/components/admin/pagination"
import { apiClient } from "@/lib/api-client"
import { useTranslation } from "@/lib/i18n/context"
import { usePaginatedQuery } from "@/lib/hooks/use-paginated-query"
import { toast } from "sonner"
import { format } from "date-fns"
import { Save, Plus, Trash2, Loader2 } from "lucide-react"
import type { SSOConfig, ADEmailDomain, SSOLoginLog } from "@/lib/admin/types"

const ROLES = ["admin", "company_admin", "read_only", "viewer"]

interface Props {
  connectionId: string
}

export function SSOConfigTab({ connectionId }: Props) {
  const { t } = useTranslation()
  const [config, setConfig] = useState<SSOConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newDomain, setNewDomain] = useState("")
  const [addingDomain, setAddingDomain] = useState(false)

  const {
    data: ssoLogs,
    total: logsTotal,
    page: logsPage,
    totalPages: logsTotalPages,
    loading: logsLoading,
    setPage: setLogsPage,
    refetch: refetchLogs,
  } = usePaginatedQuery<SSOLoginLog>({
    url: `/api/admin/ad-sync/connections/${connectionId}/sso/logs`,
  })

  useEffect(() => {
    fetchConfig()
  }, [connectionId])

  async function fetchConfig() {
    try {
      const res = await apiClient.get<{ data: SSOConfig }>(
        `/api/admin/ad-sync/connections/${connectionId}/sso`
      )
      setConfig(res.data)
    } catch {
      toast.error(t("errorOccurred"))
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!config) return
    setSaving(true)
    try {
      await apiClient.put(`/api/admin/ad-sync/connections/${connectionId}/sso`, {
        sso_enabled: config.sso_enabled,
        oidc_redirect_uri: config.oidc_redirect_uri,
        oidc_scopes: config.oidc_scopes,
        sso_auto_create_users: config.sso_auto_create_users,
        sso_default_role: config.sso_default_role,
      })
      toast.success(t("ssoConfigSaved"))
    } catch {
      toast.error(t("errorOccurred"))
    } finally {
      setSaving(false)
    }
  }

  async function handleAddDomain() {
    if (!newDomain.trim()) {
      toast.error(t("domainRequired"))
      return
    }
    setAddingDomain(true)
    try {
      await apiClient.post(`/api/admin/ad-sync/connections/${connectionId}/domains`, {
        domain: newDomain.trim(),
      })
      toast.success(t("domainAdded"))
      setNewDomain("")
      fetchConfig()
    } catch {
      toast.error(t("errorOccurred"))
    } finally {
      setAddingDomain(false)
    }
  }

  async function handleRemoveDomain(domainId: number) {
    try {
      await apiClient.del(
        `/api/admin/ad-sync/connections/${connectionId}/domains/${domainId}`
      )
      toast.success(t("domainRemoved"))
      fetchConfig()
    } catch {
      toast.error(t("errorOccurred"))
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-48 bg-muted rounded" />
        <div className="h-32 bg-muted rounded" />
      </div>
    )
  }

  if (!config) return null

  return (
    <div className="space-y-6">
      {/* SSO Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("ssoConfiguration")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{t("ssoEnabledDesc")}</p>

          <div className="flex items-center justify-between">
            <Label>{t("ssoEnabled")}</Label>
            <Switch
              checked={config.sso_enabled}
              onCheckedChange={(v) => setConfig({ ...config, sso_enabled: v })}
            />
          </div>

          <div className="space-y-2">
            <Label>{t("oidcRedirectUri")}</Label>
            <Input
              value={config.oidc_redirect_uri || ""}
              onChange={(e) => setConfig({ ...config, oidc_redirect_uri: e.target.value })}
              placeholder="https://yourapp.com/auth/sso/callback"
            />
          </div>

          <div className="space-y-2">
            <Label>{t("oidcScopes")}</Label>
            <Input
              value={config.oidc_scopes || ""}
              onChange={(e) => setConfig({ ...config, oidc_scopes: e.target.value })}
              placeholder="openid profile email"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>{t("ssoAutoCreateUsers")}</Label>
            <Switch
              checked={config.sso_auto_create_users}
              onCheckedChange={(v) => setConfig({ ...config, sso_auto_create_users: v })}
            />
          </div>

          <div className="space-y-2">
            <Label>{t("ssoDefaultRole")}</Label>
            <Select
              value={config.sso_default_role}
              onValueChange={(v) => setConfig({ ...config, sso_default_role: v })}
            >
              <SelectTrigger>
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
          </div>

          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Save className="size-4 mr-2" />}
            {t("save")}
          </Button>
        </CardContent>
      </Card>

      {/* Email Domains */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("emailDomains")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{t("emailDomainsDesc")}</p>

          {config.email_domains?.length > 0 && (
            <div className="space-y-2">
              {config.email_domains.map((domain: ADEmailDomain) => (
                <div key={domain.id} className="flex items-center justify-between border rounded-md px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">{domain.domain}</span>
                    {domain.is_primary && (
                      <Badge variant="secondary">{t("isPrimary")}</Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveDomain(domain.id)}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Input
              placeholder="example.com"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => e.key === "Enter" && handleAddDomain()}
            />
            <Button variant="outline" onClick={handleAddDomain} disabled={addingDomain}>
              {addingDomain ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Plus className="size-4 mr-2" />
              )}
              {t("addDomain")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* SSO Login Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("ssoLoginLogs")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {logsLoading ? (
            <div className="animate-pulse space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-10 bg-muted rounded" />
              ))}
            </div>
          ) : ssoLogs.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">{t("noResults")}</div>
          ) : (
            <div className="rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-medium">{t("ssoLogEmail")}</th>
                    <th className="text-left p-3 font-medium">{t("ssoLogStatus")}</th>
                    <th className="text-left p-3 font-medium">{t("ssoLogIp")}</th>
                    <th className="text-left p-3 font-medium">{t("ssoLogDate")}</th>
                  </tr>
                </thead>
                <tbody>
                  {ssoLogs.map((log) => (
                    <tr key={log.id} className="border-b">
                      <td className="p-3">{log.email}</td>
                      <td className="p-3">
                        <Badge
                          variant={log.status === "success" ? "default" : "destructive"}
                        >
                          {log.status}
                        </Badge>
                      </td>
                      <td className="p-3 font-mono text-xs">{log.ip_address}</td>
                      <td className="p-3 text-muted-foreground">
                        {format(new Date(log.inserted_at), "dd.MM.yyyy HH:mm")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <Pagination
            page={logsPage}
            totalPages={logsTotalPages}
            total={logsTotal}
            pageSize={10}
            onPageChange={setLogsPage}
          />
        </CardContent>
      </Card>
    </div>
  )
}
