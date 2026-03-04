"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { usePaginatedQuery } from "@/lib/hooks/use-paginated-query"
import type { Company, ADConnectionCreatePayload, ADConnectionDetail } from "@/lib/admin/types"

interface ConnectionFormProps {
  mode: "create" | "edit"
  connection?: ADConnectionDetail
}

export function ConnectionForm({ mode, connection }: ConnectionFormProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  const { data: companies } = usePaginatedQuery<Company>({
    url: "/api/admin/companies",
    pageSize: 100,
  })

  const [connectionType, setConnectionType] = useState<"ldap" | "azure_ad">(
    connection?.connection_type || "azure_ad"
  )

  const [form, setForm] = useState({
    company_id: connection?.company_id || 0,
    display_name: connection?.display_name || "",
    // LDAP
    ldap_host: connection?.ldap_host || "",
    ldap_port: connection?.ldap_port || 389,
    ldap_use_tls: connection?.ldap_use_tls ?? true,
    ldap_bind_dn: connection?.ldap_bind_dn || "",
    ldap_bind_password: "",
    ldap_base_dn: connection?.ldap_base_dn || "",
    ldap_user_filter: connection?.ldap_user_filter || "(&(objectClass=user)(objectCategory=person))",
    // Azure AD
    azure_tenant_id: connection?.azure_tenant_id || "",
    azure_client_id: connection?.azure_client_id || "",
    azure_client_secret: "",
    // Settings
    sync_interval_minutes: connection?.sync_interval_minutes || 60,
    auto_create_cards: connection?.auto_create_cards ?? true,
    auto_deactivate_cards: connection?.auto_deactivate_cards ?? true,
    conflict_strategy: connection?.conflict_strategy || "ad_wins",
    default_password: "",
  })

  function update<K extends keyof typeof form>(field: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!form.display_name.trim()) return
    if (mode === "create" && !form.company_id) {
      toast.error(t("errorOccurred"))
      return
    }

    setSaving(true)
    try {
      const payload: ADConnectionCreatePayload = {
        company_id: form.company_id,
        connection_type: connectionType,
        display_name: form.display_name,
        sync_interval_minutes: form.sync_interval_minutes,
        auto_create_cards: form.auto_create_cards,
        auto_deactivate_cards: form.auto_deactivate_cards,
        conflict_strategy: form.conflict_strategy as ADConnectionCreatePayload["conflict_strategy"],
      }

      if (connectionType === "ldap") {
        payload.ldap_host = form.ldap_host
        payload.ldap_port = form.ldap_port
        payload.ldap_use_tls = form.ldap_use_tls
        payload.ldap_bind_dn = form.ldap_bind_dn
        if (form.ldap_bind_password) payload.ldap_bind_password = form.ldap_bind_password
        payload.ldap_base_dn = form.ldap_base_dn
        payload.ldap_user_filter = form.ldap_user_filter
      } else {
        payload.azure_tenant_id = form.azure_tenant_id
        payload.azure_client_id = form.azure_client_id
        if (form.azure_client_secret) payload.azure_client_secret = form.azure_client_secret
      }

      if (form.default_password) payload.default_password = form.default_password

      if (mode === "create") {
        await apiClient.post("/api/admin/ad-sync/connections", payload)
        toast.success(t("createConnectionSuccess"))
        router.push("/admin/ad-sync")
      } else {
        await apiClient.put(`/api/admin/ad-sync/connections/${connection!.id}`, payload)
        toast.success(t("updateConnectionSuccess"))
        router.push(`/admin/ad-sync/${connection!.id}`)
      }
    } catch {
      toast.error(t("errorOccurred"))
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {mode === "create" ? t("addConnection") : t("editConnection")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {mode === "create" && (
            <div className="space-y-1">
              <Label>{t("companyName")}</Label>
              <Select
                value={form.company_id ? String(form.company_id) : ""}
                onValueChange={(v) => update("company_id", Number(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("companyName")} />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1">
            <Label>{t("connectionName")}</Label>
            <Input
              value={form.display_name}
              onChange={(e) => update("display_name", e.target.value)}
              placeholder="e.g. Acme Corp LDAP"
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Connection Type Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("connectionType")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            value={connectionType}
            onValueChange={(v) => setConnectionType(v as "ldap" | "azure_ad")}
          >
            <TabsList className="mb-4">
              <TabsTrigger value="azure_ad">{t("azureAD")}</TabsTrigger>
              <TabsTrigger value="ldap">{t("ldap")}</TabsTrigger>
            </TabsList>

            <TabsContent value="azure_ad" className="space-y-4">
              <div className="space-y-1">
                <Label>{t("azureTenantId")}</Label>
                <Input
                  value={form.azure_tenant_id}
                  onChange={(e) => update("azure_tenant_id", e.target.value)}
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                />
              </div>
              <div className="space-y-1">
                <Label>{t("azureClientId")}</Label>
                <Input
                  value={form.azure_client_id}
                  onChange={(e) => update("azure_client_id", e.target.value)}
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                />
              </div>
              <div className="space-y-1">
                <Label>{t("azureClientSecret")}</Label>
                <Input
                  type="password"
                  value={form.azure_client_secret}
                  onChange={(e) => update("azure_client_secret", e.target.value)}
                  placeholder={mode === "edit" && connection?.azure_client_secret_set ? "••••••••" : ""}
                />
                {mode === "edit" && connection?.azure_client_secret_set && (
                  <p className="text-xs text-muted-foreground">
                    Leave empty to keep the existing secret
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="ldap" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>{t("ldapHost")}</Label>
                  <Input
                    value={form.ldap_host}
                    onChange={(e) => update("ldap_host", e.target.value)}
                    placeholder="ldap.company.com"
                  />
                </div>
                <div className="space-y-1">
                  <Label>{t("ldapPort")}</Label>
                  <Input
                    type="number"
                    value={form.ldap_port}
                    onChange={(e) => update("ldap_port", Number(e.target.value))}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.ldap_use_tls}
                  onCheckedChange={(v) => update("ldap_use_tls", v)}
                />
                <Label>{t("ldapUseTLS")}</Label>
              </div>
              <div className="space-y-1">
                <Label>{t("ldapBindDN")}</Label>
                <Input
                  value={form.ldap_bind_dn}
                  onChange={(e) => update("ldap_bind_dn", e.target.value)}
                  placeholder="CN=Service Account,OU=Users,DC=company,DC=com"
                />
              </div>
              <div className="space-y-1">
                <Label>{t("ldapBindPassword")}</Label>
                <Input
                  type="password"
                  value={form.ldap_bind_password}
                  onChange={(e) => update("ldap_bind_password", e.target.value)}
                  placeholder={mode === "edit" && connection?.ldap_bind_password_set ? "••••••••" : ""}
                />
                {mode === "edit" && connection?.ldap_bind_password_set && (
                  <p className="text-xs text-muted-foreground">
                    Leave empty to keep the existing password
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <Label>{t("ldapBaseDN")}</Label>
                <Input
                  value={form.ldap_base_dn}
                  onChange={(e) => update("ldap_base_dn", e.target.value)}
                  placeholder="DC=company,DC=com"
                />
              </div>
              <div className="space-y-1">
                <Label>{t("ldapUserFilter")}</Label>
                <Input
                  value={form.ldap_user_filter}
                  onChange={(e) => update("ldap_user_filter", e.target.value)}
                  placeholder="(&(objectClass=user)(objectCategory=person))"
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Sync Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("syncStatus")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label>{t("syncInterval")}</Label>
            <Input
              type="number"
              min={5}
              value={form.sync_interval_minutes}
              onChange={(e) => update("sync_interval_minutes", Number(e.target.value))}
            />
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={form.auto_create_cards}
              onCheckedChange={(v) => update("auto_create_cards", v)}
            />
            <Label>{t("autoCreateCards")}</Label>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={form.auto_deactivate_cards}
              onCheckedChange={(v) => update("auto_deactivate_cards", v)}
            />
            <Label>{t("autoDeactivateCards")}</Label>
          </div>

          <div className="space-y-1">
            <Label>{t("conflictStrategy")}</Label>
            <Select
              value={form.conflict_strategy}
              onValueChange={(v) => update("conflict_strategy", v as typeof form.conflict_strategy)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ad_wins">{t("conflictAdWins")}</SelectItem>
                <SelectItem value="manual_wins">{t("conflictManualWins")}</SelectItem>
                <SelectItem value="last_write_wins">{t("conflictLastWriteWins")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label>{t("defaultPassword")}</Label>
            <Input
              type="password"
              value={form.default_password}
              onChange={(e) => update("default_password", e.target.value)}
              placeholder={mode === "edit" ? "••••••••" : ""}
            />
            <p className="text-xs text-muted-foreground">{t("defaultPasswordHint")}</p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          {t("cancel")}
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? t("saving") : mode === "create" ? t("create") : t("save")}
        </Button>
      </div>
    </form>
  )
}
