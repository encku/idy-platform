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
  user_id: number
  user_name: string
  user_email: string
  card_public_key?: string
  timestamp: string
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
  company_id?: number | null
  user_id?: number | null
  assign_to_individual_users?: boolean
  password?: string
  profile_picture_url?: string | null
  field_icons?: Record<number, string> | null
  card_type_id?: number | null
  color_id?: number | null
  cards: Array<{
    public_key: string
    name: string
    company?: string
    title?: string
    email?: string | null
    user_id?: number | null
    fields: Array<{ field_type_id: number; data: string; name?: string }>
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
  allow_email_2fa?: boolean
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

// ─── AD Sync Types ───

export interface ADConnection {
  id: number
  company_id: number
  company_name?: string
  connection_type: "ldap" | "azure_ad"
  display_name: string
  is_active: boolean
  sync_interval_minutes: number
  last_sync_at: string | null
  last_sync_status: "never" | "success" | "partial" | "failed"
  last_sync_error: string | null
  auto_create_cards: boolean
  auto_deactivate_cards: boolean
  conflict_strategy: "ad_wins" | "manual_wins" | "last_write_wins"
  default_card_type_id: number
  default_color_id: number
  linked_user_count?: number
  inserted_at: string
  updated_at?: string
}

export interface ADConnectionDetail extends ADConnection {
  // LDAP fields
  ldap_host?: string
  ldap_port?: number
  ldap_use_tls?: boolean
  ldap_bind_dn?: string
  ldap_bind_password_set?: boolean
  ldap_base_dn?: string
  ldap_user_filter?: string
  // Azure AD fields
  azure_tenant_id?: string
  azure_client_id?: string
  azure_client_secret_set?: boolean
  azure_scopes?: string
  // SSO fields
  sso_enabled?: boolean
  oidc_redirect_uri?: string
  oidc_scopes?: string
  sso_auto_create_users?: boolean
  sso_default_role?: string
  // SCIM
  scim_bearer_token_set?: boolean
}

export interface ADConnectionCreatePayload {
  company_id: number
  connection_type: "ldap" | "azure_ad"
  display_name: string
  // LDAP
  ldap_host?: string
  ldap_port?: number
  ldap_use_tls?: boolean
  ldap_bind_dn?: string
  ldap_bind_password?: string
  ldap_base_dn?: string
  ldap_user_filter?: string
  // Azure AD
  azure_tenant_id?: string
  azure_client_id?: string
  azure_client_secret?: string
  // Settings
  sync_interval_minutes?: number
  auto_create_cards?: boolean
  auto_deactivate_cards?: boolean
  conflict_strategy?: "ad_wins" | "manual_wins" | "last_write_wins"
  default_card_type_id?: number
  default_color_id?: number
  default_password?: string
}

export interface ADAttributeMapping {
  id: number
  ad_connection_id: number
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

export interface ADSyncLog {
  id: number
  ad_connection_id: number
  sync_type: "full" | "delta" | "manual"
  triggered_by: "scheduler" | "manual" | "webhook"
  triggered_by_user_id: number | null
  started_at: string
  completed_at: string | null
  duration_ms: number | null
  status: "running" | "success" | "partial" | "failed"
  total_ad_users: number
  users_created: number
  users_updated: number
  users_deactivated: number
  users_skipped: number
  users_errored: number
  cards_created: number
  cards_updated: number
  error_message: string | null
}

export interface ADLinkedUser {
  id: number
  ad_object_id: string
  ad_display_name: string | null
  ad_email: string | null
  ad_account_enabled: boolean
  user_id: number | null
  user_name?: string
  card_id: number | null
  sync_status: "pending" | "synced" | "error" | "conflict" | "deactivated"
  sync_error: string | null
  last_synced_at: string | null
}

export interface ADSyncPreview {
  total_ad_users: number
  to_create: number
  to_update: number
  to_deactivate: number
  to_skip: number
  preview_users: Array<{
    ad_display_name: string
    ad_email: string
    action: "create" | "update" | "deactivate" | "skip"
    changes?: string[]
  }>
}

// ─── AD Group Role Mapping Types ───

export interface ADGroupRoleMapping {
  id?: number
  ad_connection_id: number
  ad_group_id: string
  ad_group_name: string
  idycard_role: "admin" | "company_admin" | "read_only" | "viewer"
}

// ─── AD Email Domain Types ───

export interface ADEmailDomain {
  id: number
  ad_connection_id: number
  domain: string
  is_primary: boolean
  inserted_at?: string
}

// ─── SSO Config Types ───

export interface SSOConfig {
  sso_enabled: boolean
  oidc_redirect_uri: string | null
  oidc_scopes: string | null
  sso_auto_create_users: boolean
  sso_default_role: string
  email_domains: ADEmailDomain[]
}

export interface SSOLoginLog {
  id: number
  ad_connection_id: number
  user_id: number | null
  email: string
  status: string
  error_message: string | null
  ip_address: string
  ad_groups: string[] | null
  inserted_at: string
}

// ─── Company Feature Types ───

export interface CompanyFeature {
  id: number
  company_id: number
  feature_name: string
  is_enabled: boolean
  enabled_by_user_id: number | null
  inserted_at: string
}

export const COMPANY_FEATURES = {
  AD_SYNC: "ad_sync",
} as const

export type CompanyFeatureName =
  (typeof COMPANY_FEATURES)[keyof typeof COMPANY_FEATURES]

// ─── Sync Log Detail Types ───

export interface ADFieldChangeLog {
  id: number
  ad_sync_log_id: number
  ad_user_link_id: number
  field_name: string
  old_value: string | null
  new_value: string | null
  change_source: string
  applied: boolean
  inserted_at: string
}

export interface ADSyncLogDetail {
  log: ADSyncLog
  field_changes: ADFieldChangeLog[]
}

// ─── Paginated Response ───

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}
