"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { useTranslation } from "@/lib/i18n/context"
import type { ADConnection } from "@/lib/admin/types"

interface ConnectionTableProps {
  connections: ADConnection[]
  loading: boolean
}

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  never: "outline",
  success: "default",
  partial: "secondary",
  failed: "destructive",
  running: "secondary",
}

export function ConnectionTable({ connections, loading }: ConnectionTableProps) {
  const { t } = useTranslation()
  const router = useRouter()

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-3">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    )
  }

  if (connections.length === 0) {
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
            <TableHead>{t("connectionName")}</TableHead>
            <TableHead>{t("connectionType")}</TableHead>
            <TableHead>{t("companyName")}</TableHead>
            <TableHead>{t("syncStatus")}</TableHead>
            <TableHead>{t("linkedUsers")}</TableHead>
            <TableHead>{t("status")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {connections.map((conn) => (
            <TableRow
              key={conn.id}
              className="cursor-pointer"
              onClick={() => router.push(`/admin/ad-sync/${conn.id}`)}
            >
              <TableCell className="font-medium">{conn.display_name}</TableCell>
              <TableCell>
                <Badge variant="outline">
                  {conn.connection_type === "ldap" ? t("ldap") : t("azureAD")}
                </Badge>
              </TableCell>
              <TableCell>{conn.company_name || "-"}</TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <Badge variant={statusVariant[conn.last_sync_status] || "outline"}>
                    {t(`syncStatus${conn.last_sync_status.charAt(0).toUpperCase() + conn.last_sync_status.slice(1)}` as keyof typeof t)}
                  </Badge>
                  {conn.last_sync_at && (
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(conn.last_sync_at), "dd.MM.yyyy HH:mm")}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>{conn.linked_user_count ?? 0}</TableCell>
              <TableCell>
                <Badge variant={conn.is_active ? "default" : "secondary"}>
                  {conn.is_active ? t("connectionActive") : t("connectionInactive")}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
