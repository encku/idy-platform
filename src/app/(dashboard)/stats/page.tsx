"use client"

import { useState, useEffect, useCallback } from "react"
import {
  BarChart3,
  Eye,
  MousePointerClick,
  Share2,
  Download,
  Users,
} from "lucide-react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { AppHeader } from "@/components/dashboard/app-header"
import { Skeleton } from "@/components/ui/skeleton"
import { FEATURES } from "@/lib/features"
import { useFeatures } from "@/lib/features/context"
import { useTranslation } from "@/lib/i18n/context"
import { apiClient } from "@/lib/api-client"
import type { UserCard } from "@/lib/types"

interface AnalyticsSummary {
  total_profile_views: number
  total_field_clicks: number
  total_vcard_downloads: number
  total_profile_shares: number
  unique_visitors: number
}

interface AnalyticsByDate {
  date: string
  profile_views: number
  field_clicks: number
}

interface FieldClickStat {
  field_id: number
  field_name: string
  click_count: number
}

interface ShareMethodStat {
  share_method: string
  share_count: number
}

const PIE_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]

const DATE_RANGES = [
  { key: "7", days: 7 },
  { key: "30", days: 30 },
  { key: "90", days: 90 },
] as const

export default function StatsPage() {
  const { t } = useTranslation()
  const { hasFeature } = useFeatures()
  const hasAccess = hasFeature(FEATURES.ANALYTICS)

  // Card selection
  const [cards, setCards] = useState<UserCard[]>([])
  const [selectedCardId, setSelectedCardId] = useState<string>("")
  const [range, setRange] = useState<number>(30)

  // Analytics data
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)
  const [byDate, setByDate] = useState<AnalyticsByDate[]>([])
  const [fieldClicks, setFieldClicks] = useState<FieldClickStat[]>([])
  const [shareMethods, setShareMethods] = useState<ShareMethodStat[]>([])
  const [loading, setLoading] = useState(false)

  // Load user cards
  useEffect(() => {
    if (!hasAccess) return
    apiClient
      .get<{ data: UserCard[] }>("/api/user/cards")
      .then((res) => {
        const list = res.data || []
        setCards(list)
        if (list.length > 0) setSelectedCardId(String(list[0].id))
      })
      .catch(() => {})
  }, [hasAccess])

  const loadAnalytics = useCallback(async () => {
    if (!selectedCardId) return
    setLoading(true)

    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - range)
    const startDate = start.toISOString().split("T")[0]
    const endDate = end.toISOString().split("T")[0]
    const qs = `start_date=${startDate}&end_date=${endDate}`

    try {
      const [summaryRes, byDateRes, fieldRes, shareRes] = await Promise.all([
        apiClient.get<{ data: AnalyticsSummary }>(
          `/api/analytics/cards/${selectedCardId}/summary?${qs}`
        ),
        apiClient.get<{ data: AnalyticsByDate[] }>(
          `/api/analytics/cards/${selectedCardId}/by-date?${qs}`
        ),
        apiClient.get<{ data: FieldClickStat[] }>(
          `/api/analytics/cards/${selectedCardId}/field-clicks?${qs}`
        ),
        apiClient.get<{ data: ShareMethodStat[] }>(
          `/api/analytics/cards/${selectedCardId}/share-methods?${qs}`
        ),
      ])
      setSummary(summaryRes.data)
      setByDate(byDateRes.data || [])
      setFieldClicks(fieldRes.data || [])
      setShareMethods(shareRes.data || [])
    } catch {
      setSummary(null)
      setByDate([])
      setFieldClicks([])
      setShareMethods([])
    } finally {
      setLoading(false)
    }
  }, [selectedCardId, range])

  useEffect(() => {
    if (hasAccess && selectedCardId) loadAnalytics()
  }, [hasAccess, selectedCardId, loadAnalytics])

  // Not premium — empty state (navigation is blocked at BottomNav level)
  if (!hasAccess) {
    return (
      <>
        <AppHeader title={t("stats")} />
        <div className="flex flex-col items-center justify-center px-5 py-20 text-center">
          <BarChart3 className="size-16 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground text-sm">
            {t("analyticsPremiumMessage")}
          </p>
        </div>
      </>
    )
  }

  return (
    <>
      <AppHeader title={t("stats")} />
      <div className="px-5 pb-24 space-y-6">
        {/* Card Selector + Date Range */}
        <div className="flex flex-col gap-3">
          <select
            value={selectedCardId}
            onChange={(e) => setSelectedCardId(e.target.value)}
            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {cards.map((c) => (
              <option key={c.id} value={c.id}>
                {c.user_preferred_name || c.public_key}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            {DATE_RANGES.map((r) => (
              <button
                key={r.key}
                onClick={() => setRange(r.days)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  range === r.days
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {t(`last${r.days}Days`)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
            </div>
            <Skeleton className="h-48 rounded-xl" />
          </div>
        ) : (
          <>
            {/* Summary Stats */}
            {summary && (
              <div className="grid grid-cols-2 gap-3">
                <StatCard
                  icon={<Eye className="size-4" />}
                  label={t("views")}
                  value={summary.total_profile_views}
                />
                <StatCard
                  icon={<MousePointerClick className="size-4" />}
                  label={t("clicks")}
                  value={summary.total_field_clicks}
                />
                <StatCard
                  icon={<Share2 className="size-4" />}
                  label={t("shares")}
                  value={summary.total_profile_shares}
                />
                <StatCard
                  icon={<Users className="size-4" />}
                  label={t("uniqueVisitors")}
                  value={summary.unique_visitors}
                />
              </div>
            )}

            {/* Views Over Time */}
            {byDate.length > 0 && (
              <div className="rounded-xl border bg-background p-4">
                <h3 className="text-sm font-medium mb-3">{t("viewsOverTime")}</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={byDate}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(v: string) => v.slice(5)}
                      className="text-xs"
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip
                      labelFormatter={(v) => String(v)}
                      contentStyle={{ fontSize: 12, borderRadius: 8 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="profile_views"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={false}
                      name={t("views")}
                    />
                    <Line
                      type="monotone"
                      dataKey="field_clicks"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={false}
                      name={t("clicks")}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Field Clicks */}
            {fieldClicks.length > 0 && (
              <div className="rounded-xl border bg-background p-4">
                <h3 className="text-sm font-medium mb-3">{t("fieldClicks")}</h3>
                <ResponsiveContainer width="100%" height={Math.max(150, fieldClicks.length * 35)}>
                  <BarChart data={fieldClicks} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis
                      type="category"
                      dataKey="field_name"
                      width={100}
                      tick={{ fontSize: 10 }}
                    />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                    <Bar dataKey="click_count" fill="#3b82f6" radius={[0, 4, 4, 0]} name={t("clicks")} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Share Methods */}
            {shareMethods.length > 0 && (
              <div className="rounded-xl border bg-background p-4">
                <h3 className="text-sm font-medium mb-3">{t("shareMethods")}</h3>
                <div className="flex items-center gap-4">
                  <ResponsiveContainer width={120} height={120}>
                    <PieChart>
                      <Pie
                        data={shareMethods}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={55}
                        dataKey="share_count"
                        nameKey="share_method"
                      >
                        {shareMethods.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-1.5">
                    {shareMethods.map((m, i) => (
                      <div key={m.share_method} className="flex items-center gap-2 text-xs">
                        <div
                          className="size-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                        />
                        <span className="flex-1 capitalize">{m.share_method.replace("_", " ")}</span>
                        <span className="font-medium">{m.share_count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!summary && byDate.length === 0 && (
              <div className="flex flex-col items-center py-16 text-center">
                <BarChart3 className="size-12 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">{t("noAnalyticsData")}</p>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: number
}) {
  return (
    <div className="rounded-xl border bg-background p-3.5">
      <div className="flex items-center gap-2 text-muted-foreground mb-1">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-xl font-semibold">{value.toLocaleString()}</p>
    </div>
  )
}
