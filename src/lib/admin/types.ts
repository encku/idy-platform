// ─── Admin User Types ───

export interface AdminUser {
  id: number
  name: string
  email: string
  title: string
  description: string
  picture_url: string
  is_hidden: boolean
  card_count: number
  role_name: string
}

// ─── Admin Card Types ───

export interface AdminCard {
  card_id: number
  user_id: number
  user_name: string
  user_email: string
  card_public_key: string
  card_user_preferred_name: string
  card_is_hidden: boolean
  merge_id: number | null
}

export interface AdminCardField {
  id: number
  name: string
  data: string
  is_active: boolean
  order: number
  field_type: {
    name: string
    icon_url: string
  }
}

export interface AdminCardWithFields extends AdminCard {
  fields: AdminCardField[]
}

// ─── Admin User Detail ───

export interface AdminUserDetail extends AdminUser {
  phone?: string
  location?: string
  inserted_at: string
  updated_at: string
}

export interface CreateUserPayload {
  name: string
  email: string
  password: string
  password_confirmation: string
  phone?: string
  title?: string
  location?: string
  description?: string
  is_hidden?: boolean
}

export interface UpdateUserPayload {
  name?: string
  email?: string
  phone?: string
  title?: string
  location?: string
  description?: string
  is_hidden?: boolean
}

// ─── Dashboard Types ───

export interface DashboardSummary {
  user_count: number
  active_tag_count: number
  order_count: number
  total_views: number
}

export interface DashboardTrend {
  direction: "up" | "down" | "stable"
  value: number
  chart_data: number[]
}

export interface DashboardTrends {
  user_count: DashboardTrend
  active_tag_count: DashboardTrend
  order_count: DashboardTrend
  total_views: DashboardTrend
}

export interface RecentActivity {
  type: string
  title: string
  description: string
  user?: string
  inserted_at: string
}

export interface WeeklyStat {
  week: string
  views: number
}

export interface CardPerformance {
  card_name: string
  views: number
  clicks: number
  shares: number
}

// ─── Card Detail Types ───

export interface AdminCardDetail extends AdminCard {
  total_views: number
  total_clicks: number
  total_shares: number
  fields: AdminCardField[]
  merged_cards: AdminCard[]
}

export interface BulkImportPayload {
  company_id?: number
  user_id?: number
  password?: string
  cards: Array<{
    public_key: string
    name: string
    email?: string
    fields: Array<{ field_type_id: number; value: string }>
  }>
}

export interface MergeCard {
  merge_id: number
  secondary_card: AdminCard
}

// ─── Company Types ───

export interface Company {
  id: number
  name: string
  country: string
  address?: string
  logo_url?: string
  inserted_at: string
}

export interface CompanyDetail extends Company {
  card_count: number
  user_count: number
}

export interface CompanyCardAssignment {
  id: number
  company_id: number
  card: AdminCard
}

export interface CompanyUserAssignment {
  id: number
  company_id: number
  user: AdminUser
}

export interface CreateCompanyPayload {
  name: string
  country: string
  address?: string
}

// ─── Analytics Types ───

export interface AnalyticsOverview {
  total_views: number
  total_clicks: number
  total_shares: number
  total_cards: number
  top_cards: Array<{
    card_id: number
    card_name: string
    views: number
    clicks: number
    shares: number
  }>
}

export interface CardAnalyticsSummary {
  total_views: number
  total_field_clicks: number
  total_shares: number
  top_field: {
    field_id: number
    name: string
    clicks: number
  } | null
}

export interface CardAnalyticsByDate {
  date: string
  views: number
  clicks: number
  shares: number
}

export interface FieldClickStat {
  field_id: number
  field_name: string
  field_type: string
  clicks: number
}

export interface ShareMethodStat {
  method: string
  count: number
  percentage: number
}

// ─── Notification Types ───

export interface NotificationPayload {
  user_id: number
  title: string
  body: string
  data?: Record<string, string>
}

export interface NotificationLog {
  id: number
  user_id: number
  user_name: string
  title: string
  body: string
  status: "sent" | "failed" | "pending"
  inserted_at: string
}

export interface UserDevice {
  id: number
  user_id: number
  platform: string
  token: string
  last_active: string
  inserted_at: string
}

// ─── Field Type Types ───

export interface FieldType {
  id: number
  name: string
  icon: string
  icon_url?: string
  group: string
}

export interface FieldTypeGroup {
  [groupName: string]: FieldType[]
}

// ─── Viewer Types ───

export interface Viewer {
  id: number
  name: string
  email: string
  company_id: number
}

export interface ViewerCard {
  id: number
  public_key: string
  user_preferred_name: string
  card_type_id: number
  color_id: number
}

export interface CreateViewerPayload {
  name: string
  email: string
  password: string
  company_id: number
}

// ─── Subscription Types ───

export interface AdminSubscription {
  id: number
  user_id: number
  user_name?: string
  user_email?: string
  revenue_cat_user_id: string
  is_premium: boolean
  plan_type: string
  product_identifier: string
  expires_at: string | null
  last_synced_at: string
  entitlements: string
  platform: string
  store: string
}

export interface SubscriptionStats {
  totalPremium: number
  activeMonthly: number
  activeYearly: number
  expiredCount: number
  upgradeCount: number
  downgradeCount: number
  churnRate: number
  monthlyMRR: number
  yearlyARR: number
}

export interface SubscriptionHistoryEvent {
  id: number
  event_type: string
  plan_type: string
  product_identifier: string
  created_at: string
}

export interface GrantPremiumPayload {
  planType: "monthly" | "yearly" | "lifetime"
  expiresAt?: string
  reason?: string
}

export interface RevokePremiumPayload {
  reason?: string
}

export interface SyncAllResult {
  totalUsers: number
  synced: number
  failed: number
}

// ─── Paginated Response ───

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}
