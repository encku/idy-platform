"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react"
import { apiClient } from "@/lib/api-client"
import type { FeatureName } from "@/lib/features"
import type { UserFeatures } from "@/lib/types"

interface FeaturesContextValue {
  isPremium: boolean
  isInTrial: boolean
  hasFeature: (feature: FeatureName) => boolean
  features: UserFeatures | null
  loading: boolean
  refetch: () => Promise<void>
}

const FeaturesContext = createContext<FeaturesContextValue | null>(null)

export function FeaturesProvider({ children }: { children: ReactNode }) {
  const [features, setFeatures] = useState<UserFeatures | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchFeatures = useCallback(async () => {
    try {
      const res = await apiClient.get<{ data: UserFeatures }>(
        "/api/user/features"
      )
      setFeatures(res.data)
    } catch {
      setFeatures(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFeatures()
  }, [fetchFeatures])

  const hasFeature = useCallback(
    (feature: FeatureName): boolean => {
      if (!features) return false
      return features.features[feature]?.has_access === true
    },
    [features]
  )

  const isPremium = features?.is_premium ?? false
  const isInTrial = features?.trial_ends_at
    ? new Date(features.trial_ends_at) > new Date()
    : false

  return (
    <FeaturesContext.Provider
      value={{ isPremium, isInTrial, hasFeature, features, loading, refetch: fetchFeatures }}
    >
      {children}
    </FeaturesContext.Provider>
  )
}

export function useFeatures() {
  const ctx = useContext(FeaturesContext)
  if (!ctx) throw new Error("useFeatures must be used within FeaturesProvider")
  return ctx
}
