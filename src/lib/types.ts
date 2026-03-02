// ─── Public Card View Types ───

export interface CardProfile {
  name: string
  title: string
  company: string
  description: string
  picture_url: string
  background_picture_url: string
  badge_picture_url: string
  is_hidden: boolean
  theme_color: string
  view_mode: string
  address: string
}

export interface CardField {
  id: number
  name: string
  data: string
  icon_url: string
  prefix: string
  postfix: string
  formatted_data: unknown
  field_type: {
    name: string
    icon_url: string
  }
}

export interface CardProfileResponse {
  user: CardProfile
  card: CardField[]
}

export interface LeadSettings {
  enabled: boolean
  require_name: boolean
  require_email: boolean
  require_phone: boolean
  require_company: boolean
  require_message: boolean
  show_before_content: boolean
  form_title: string
  form_description: string
  submit_button_text: string
}

// ─── User Types ───

export interface User {
  id: number
  name: string
  email: string
  description: string
  picture_url: string
  background_picture_url: string
  badge_picture_url: string
  title: string
  company: string
  address: string
  is_hidden: boolean
  email_verified: boolean
}

// ─── Card Management Types ───

export interface UserCard {
  id: number
  card_type_id: number
  color_id: number
  public_key: string
  user_preferred_name: string
  direct_mode_field_id: number | null
  fields: CardFieldManagement[]
}

export interface CardFieldManagement {
  id: number
  name: string
  data: string
  formatted_data: Record<string, string> | null
  is_active: boolean
  order: number
  custom_icon_url: string | null
  field_type: FieldType
}

// ─── Field Types ───

export interface FieldType {
  id: number
  name: string
  icon_url: string
  regex: string
  prefix: string
  postfix: string
  format: Record<string, string> | null
  input_type_id: number
}

export interface FieldTypeGroup {
  id: number
  name: string
  is_scrollable: boolean
  fields: FieldType[]
}

// ─── API Response Types ───

export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface ApiError {
  code: number | string
  error: string
}

// ─── Premium Feature Types ───

export interface UserFeatures {
  is_premium: boolean
  premium_expires_at: string | null
  trial_ends_at: string | null
  features: Record<string, { has_access: boolean }>
  limits: {
    max_cards: number
    max_fields_per_card: number
    max_single_file_size: number
    max_cloud_storage: number
  }
}
