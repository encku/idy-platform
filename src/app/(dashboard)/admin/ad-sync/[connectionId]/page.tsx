"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { Pagination } from "@/components/admin/pagination"
import { apiClient } from "@/lib/api-client"
import { useTranslation } from "@/lib/i18n/context"
import { usePaginatedQuery } from "@/lib/hooks/use-paginated-query"
import { toast } from "sonner"
import { format } from "date-fns"
import {
  Pencil,
  Trash2,
  Play,
  Plug,
  Settings2,
  Users,
  ClipboardList,
  Shield,
  Network,
  KeyRound,
} from "lucide-react"
import { GroupMappingsTab } from "./components/group-mappings-tab"
import { SSOConfigTab } from "./components/sso-config-tab"
import { SCIMConfigTab } from "./components/scim-config-tab"
import { SyncPreviewDialog } from "@/components/admin/ad-sync/sync-preview-dialog"
import type { ADConnectionDetail, ADSyncLog, ADLinkedUser, ADSyncPreview } from "@/lib/admin/types"

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  never: "outline",
  success: "default",
  partial: "secondary",
  failed: "destructive",
  running: "secondary",
}

export default function ConnectionDetailPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const params = useParams<{ connectionId: string }>()
  const connectionId = params.connectionId

  const [connection, setConnection] = useState<ADConnectionDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDelete, setShowDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [testing, setTesting] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [preview, setPreview] = useState<ADSyncPreview | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)

  const {
    data: logs,
    total: logsTotal,
    page: logsPage,
    totalPages: logsTotalPages,
    loading: logsLoading,
    setPage: setLogsPage,
    refetch: refetchLogs,
  } = usePaginatedQuery<ADSyncLog>({
    url: `/api/admin/ad-sync/connections/${connectionId}/logs`,
  })

  const {
    data: linkedUsers,
    total: usersTotal,
    page: usersPage,
    totalPages: usersTotalPages,
    loading: usersLoading,
    setPage: setUsersPage,
    refetch: refetchUsers,
  } = usePaginatedQuery<ADLinkedUser>({
    url: `/api/admin/ad-sync/connections/${connectionId}/users`,
  })

  useEffect(() => {
    fetchConnection()
  }, [connectionId])

  async function fetchConnection() {
    try {
      const res = await apiClient.get<{ data: ADConnectionDetail }>(
        `/api/admin/ad-sync/connections/${connectionId}`
      )
      setConnection(res.data)
    } catch {
      toast.error(t("errorOccurred"))
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await apiClient.del(`/api/admin/ad-sync/connections/${connectionId}`)
      toast.success(t("deleteConnectionSuccess"))
      router.push("/admin/ad-sync")
    } catch {
      toast.error(t("errorOccurred"))
    } finally {
      setDeleting(false)
    }
  }

  async function handlePreviewSync() {
    setPreviewLoading(true)
    setPreview(null)
    setShowPreview(true)
    try {
      const res = await apiClient.post<{ data: ADSyncPreview }>(
        `/api/admin/ad-sync/connections/${connectionId}/sync/preview`,
        {}
      )
      setPreview(res.data)
    } catch {
      toast.error(t("errorOccurred"))
      setShowPreview(false)
    } finally {
      setPreviewLoading(false)
    }
  }

  async function handleConfirmSync() {
    setSyncing(true)
    setShowPreview(false)
    try {
      await apiClient.post(`/api/admin/ad-sync/connections/${connectionId}/sync`, {})
      toast.success(t("triggerSync"))
      refetchLogs()
      fetchConnection()
    } catch {
      toast.error(t("errorOccurred"))
    } finally {
      setSyncing(false)
    }
  }

  async function handleTestConnection() {
    setTesting(true)
    try {
      await apiClient.post(`/api/admin/ad-sync/connections/${connectionId}/test`, {})
      toast.success(t("testConnectionSuccess"))
    } catch {
      toast.error(t("testConnectionFailed"))
    } finally {
      setTesting(false)
    }
  }

  if (loading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-8 bg-muted rounded w-64" />
      <div className="h-48 bg-muted rounded" />
    </div>
  }

  if (!connection) {
    return <div className="text-center py-12 text-muted-foreground">{t("noResults")}</div>
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={connection.display_name}
        backHref="/admin/ad-sync"
        action={{
          label: t("editConnection"),
          icon: <Pencil className="size-4 mr-2" />,
          onClick: () => router.push(`/admin/ad-sync/${connectionId}/edit`),
        }}
      />

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">{t("connectionType")}</div>
            <div className="text-lg font-semibold mt-1">
              {connection.connection_type === "ldap" ? t("ldap") : t("azureAD")}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">{t("syncStatus")}</div>
            <Badge variant={statusVariant[connection.last_sync_status] || "outline"} className="mt-2">
              {t(`syncStatus${connection.last_sync_status.charAt(0).toUpperCase() + connection.last_sync_status.slice(1)}` as keyof typeof t)}
            </Badge>
            {connection.last_sync_at && (
              <div className="text-xs text-muted-foreground mt-1">
                {format(new Date(connection.last_sync_at), "dd.MM.yyyy HH:mm")}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">{t("linkedUsers")}</div>
            <div className="text-lg font-semibold mt-1">{connection.linked_user_count ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">{t("status")}</div>
            <Badge variant={connection.is_active ? "default" : "secondary"} className="mt-2">
              {connection.is_active ? t("connectionActive") : t("connectionInactive")}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 flex-wrap">
        <Button onClick={handlePreviewSync} disabled={syncing || previewLoading}>
          <Play className="size-4 mr-2" />
          {previewLoading ? t("loading") : syncing ? t("saving") : t("triggerSync")}
        </Button>
        <Button variant="outline" onClick={handleTestConnection} disabled={testing}>
          <Plug className="size-4 mr-2" />
          {testing ? t("saving") : t("testConnection")}
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push(`/admin/ad-sync/${connectionId}/mappings`)}
        >
          <Settings2 className="size-4 mr-2" />
          {t("attributeMappings")}
        </Button>
        <Button variant="destructive" size="icon" onClick={() => setShowDelete(true)}>
          <Trash2 className="size-4" />
        </Button>
      </div>

      {/* Tabs: Sync Logs & Linked Users */}
      <Tabs defaultValue="logs">
        <TabsList>
          <TabsTrigger value="logs">
            <ClipboardList className="size-4 mr-2" />
            {t("syncLogs")}
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="size-4 mr-2" />
            {t("linkedUsers")}
          </TabsTrigger>
          <TabsTrigger value="groups">
            <Network className="size-4 mr-2" />
            {t("groupRoleMappings")}
          </TabsTrigger>
          <TabsTrigger value="sso">
            <Shield className="size-4 mr-2" />
            {t("ssoConfiguration")}
          </TabsTrigger>
          <TabsTrigger value="scim">
            <KeyRound className="size-4 mr-2" />
            {t("scimConfiguration")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="mt-4 space-y-4">
          {logsLoading ? (
            <div className="animate-pulse space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-12 bg-muted rounded" />
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">{t("noResults")}</div>
          ) : (
            <div className="rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-medium">{t("syncType")}</th>
                    <th className="text-left p-3 font-medium">{t("status")}</th>
                    <th className="text-left p-3 font-medium">{t("usersCreated")}</th>
                    <th className="text-left p-3 font-medium">{t("usersUpdated")}</th>
                    <th className="text-left p-3 font-medium">{t("usersErrored")}</th>
                    <th className="text-left p-3 font-medium">{t("triggeredBy")}</th>
                    <th className="text-left p-3 font-medium">{t("createdAt")}</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr
                      key={log.id}
                      className="border-b cursor-pointer hover:bg-muted/30"
                      onClick={() => router.push(`/admin/ad-sync/${connectionId}/logs/${log.id}`)}
                    >
                      <td className="p-3">{log.sync_type}</td>
                      <td className="p-3">
                        <Badge variant={statusVariant[log.status] || "outline"}>
                          {log.status}
                        </Badge>
                      </td>
                      <td className="p-3">{log.users_created}</td>
                      <td className="p-3">{log.users_updated}</td>
                      <td className="p-3">{log.users_errored}</td>
                      <td className="p-3">{log.triggered_by}</td>
                      <td className="p-3 text-muted-foreground">
                        {format(new Date(log.started_at), "dd.MM.yyyy HH:mm")}
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
        </TabsContent>

        <TabsContent value="users" className="mt-4 space-y-4">
          {usersLoading ? (
            <div className="animate-pulse space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-12 bg-muted rounded" />
              ))}
            </div>
          ) : linkedUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">{t("noResults")}</div>
          ) : (
            <div className="rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-medium">AD Name</th>
                    <th className="text-left p-3 font-medium">AD Email</th>
                    <th className="text-left p-3 font-medium">{t("syncStatus")}</th>
                    <th className="text-left p-3 font-medium">idycard User</th>
                    <th className="text-left p-3 font-medium">{t("actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {linkedUsers.map((user) => (
                    <tr key={user.id} className="border-b">
                      <td className="p-3 font-medium">{user.ad_display_name || "-"}</td>
                      <td className="p-3">{user.ad_email || "-"}</td>
                      <td className="p-3">
                        <Badge
                          variant={
                            user.sync_status === "synced"
                              ? "default"
                              : user.sync_status === "error"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {user.sync_status}
                        </Badge>
                      </td>
                      <td className="p-3">{user.user_name || (user.user_id ? `#${user.user_id}` : "-")}</td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              apiClient
                                .post(`/api/admin/ad-sync/connections/${connectionId}/users/${user.id}/resync`, {})
                                .then(() => {
                                  toast.success(t("resyncUser"))
                                  refetchUsers()
                                })
                                .catch(() => toast.error(t("errorOccurred")))
                            }
                          >
                            {t("resyncUser")}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() =>
                              apiClient
                                .post(`/api/admin/ad-sync/connections/${connectionId}/users/${user.id}/unlink`, {})
                                .then(() => {
                                  toast.success(t("unlinkUser"))
                                  refetchUsers()
                                })
                                .catch(() => toast.error(t("errorOccurred")))
                            }
                          >
                            {t("unlinkUser")}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <Pagination
            page={usersPage}
            totalPages={usersTotalPages}
            total={usersTotal}
            pageSize={20}
            onPageChange={setUsersPage}
          />
        </TabsContent>
        <TabsContent value="groups" className="mt-4">
          <GroupMappingsTab connectionId={connectionId} />
        </TabsContent>

        <TabsContent value="sso" className="mt-4">
          <SSOConfigTab connectionId={connectionId} />
        </TabsContent>

        <TabsContent value="scim" className="mt-4">
          <SCIMConfigTab connectionId={connectionId} />
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        onConfirm={handleDelete}
        title={t("deleteConnectionConfirmation")}
        description={t("deleteConnectionConfirmationMessage")}
        confirmLabel={t("delete")}
        loading={deleting}
      />

      <SyncPreviewDialog
        open={showPreview}
        onOpenChange={setShowPreview}
        preview={preview}
        loading={previewLoading}
        onConfirmSync={handleConfirmSync}
        syncing={syncing}
      />
    </div>
  )
}
