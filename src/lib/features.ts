export const FEATURES = {
  AI_SCAN: "ai_scan",
  AI_ASSISTANT: "ai_assistant",
  ANALYTICS: "analytics",
  CUSTOM_THEMES: "custom_themes",
  LEAD_CAPTURE: "lead_capture",
  BACKGROUND_PICTURE: "background_picture",
  BADGE_PICTURE: "badge_picture",
  LARGE_FILE_UPLOAD: "large_file_upload",
  ADD_CARD: "add_card",
} as const

export type FeatureName = (typeof FEATURES)[keyof typeof FEATURES]
