"use client"

import { useState, useEffect, useCallback } from "react"
import { Crown, Users, TrendingDown, RefreshCw, Search } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { SubscriptionTable } from "@/components/admin/subscriptions/subscription-table"
import { GrantPremiumDialog } from "@/components/admin/subscriptions/grant-premium-dialog"
import { Pagination } from "@/components/admin/pagination"
import { useTranslation } from "@/lib/i18n/context"
import { usePaginatedQuery } from "@/lib/hooks/use-paginated-query"
import { apiClient } from "@/lib/api-client"
import type { AdminSubscription, SubscriptionStats } from "@/lib/admin/types"

export default function AdminSubscriptionsPage() {
  const { t } = useTranslation()
  const [stats, setStats] = useState<SubscriptionStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [syncing, setSyncing] = useState(false)
  const [grantOpen, setGrantOpen] = useState(false)

  const {
    data: subscriptions,
    total,
    page,
    totalPages,
    loading,
    search,
    setPage,
    setSearch,
    refetch,
  } = usePaginatedQuery<AdminSubscription>({
    url: "/api/admin/subscriptions",
    extraParams: statusFilter !== "all" ? { status: statusFilter } : undefined,
  })

  const loadStats = useCallback(async () => {
    setStatsLoading(true)
    try {
      const res = await apiClient.get<{ data: SubscriptionStats }>(
        "/api/admin/subscriptions/stats"
      )
      setStats(res.data)
    } catch {
      setStats(null)
    } finally {
      setStatsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  async function handleSyncAll() {
    setSyncing(true)
    try {
      const res = await apiClient.post<{
        data: { totalUsers: number; synced: number; failed: number }
      }>("/api/admin/subscriptions/sync-all", {})
      const r = res.data
      toast.success(
        `${t("syncCompleted")}: ${r?.synced ?? 0}/${r?.totalUsers ?? 0}`
      )
      refetch()
      loadStats()
    } catch {
      toast.error(t("errorOccurred"))
    } finally {
      setSyncing(false)
    }
  }

  function handleRefresh() {
    refetch()
    loadStats()
  }

  const STATUS_FILTERS = [
    { key: "all", label: t("all") },
    { key: "active", label: t("active") },
    { key: "expired", label: t("expired") },
  ]

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("adminSubscriptions")}
        subtitle={t("adminSubscriptionsDesc")}
      />

      {/* Stats Cards */}
      {statsLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      ) : stats ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            icon={<Crown className="size-4 text-yellow-500" />}
            label={t("totalPremium")}
            value={stats.totalPremium}
          />
          <StatsCard
            icon={<Users className="size-4 text-blue-500" />}
            label={t("activeMonthly")}
            value={stats.activeMonthly}
            sub={`${t("yearly")}: ${stats.activeYearly}`}
          />
          <StatsCard
            icon={<TrendingDown className="size-4 text-red-500" />}
            label={t("churnRate")}
            value={`${(stats.churnRate * 100).toFixed(1)}%`}
            sub={`${t("expired")}: ${stats.expiredCount}`}
          />
          <StatsCard
            icon={<Crown className="size-4 text-emerald-500" />}
            label="MRR"
            value={`$${stats.monthlyMRR.toFixed(0)}`}
            sub={`ARR: $${stats.yearlyARR.toFixed(0)}`}
          />
        </div>
      ) : null}

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchSubscriptions")}
            className="pl-9"
          />
        </div>

        <div className="flex gap-1">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                statusFilter === f.key
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 ml-auto">
          <Button variant="outline" size="sm" onClick={handleSyncAll} disabled={syncing}>
            <RefreshCw className={`size-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? t("syncing") : t("syncAll")}
          </Button>
          <Button size="sm" onClick={() => setGrantOpen(true)}>
            <Crown className="size-4 mr-2" />
            {t("grantPremium")}
          </Button>
        </div>
      </div>

      {/* Table */}
      <SubscriptionTable
        subscriptions={subscriptions}
        loading={loading}
        onUpdate={handleRefresh}
      />

      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={20}
        onPageChange={setPage}
      />

      {/* Grant dialog (for granting to any user by ID) */}
      <GrantPremiumDialog
        open={grantOpen}
        userId={null}
        onOpenChange={setGrantOpen}
        onSuccess={handleRefresh}
      />
    </div>
  )
}

function StatsCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  sub?: string
}) {
  return (
    <Card>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-center gap-2 text-muted-foreground mb-1">
          {icon}
          <span className="text-xs">{label}</span>
        </div>
        <p className="text-2xl font-semibold">
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
        {sub && (
          <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
        )}
      </CardContent>
    </Card>
  )
}
