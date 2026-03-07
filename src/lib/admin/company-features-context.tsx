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
import { useAuth } from "@/lib/auth/context"

interface CompanyFeaturesContextValue {
  hasCompanyFeature: (feature: string) => boolean
  loading: boolean
  refetch: () => Promise<void>
}

const CompanyFeaturesContext =
  createContext<CompanyFeaturesContextValue | null>(null)

export function CompanyFeaturesProvider({
  children,
}: {
  children: ReactNode
}) {
  const { role } = useAuth()
  const [features, setFeatures] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const fetchFeatures = useCallback(async () => {
    // Only admin and company_admin need this
    if (role !== "admin" && role !== "company_admin") {
      setFeatures([])
      setLoading(false)
      return
    }

    try {
      const res = await apiClient.get<{ data: { features: string[] } }>(
        "/api/admin/companies/my-features"
      )
      setFeatures(res.data?.features || [])
    } catch {
      setFeatures([])
    } finally {
      setLoading(false)
    }
  }, [role])

  useEffect(() => {
    fetchFeatures()
  }, [fetchFeatures])

  const hasCompanyFeature = useCallback(
    (feature: string) => {
      // Super admin always has access
      if (role === "admin") return true
      return features.includes(feature)
    },
    [features, role]
  )

  return (
    <CompanyFeaturesContext.Provider
      value={{ hasCompanyFeature, loading, refetch: fetchFeatures }}
    >
      {children}
    </CompanyFeaturesContext.Provider>
  )
}

export function useCompanyFeatures() {
  const ctx = useContext(CompanyFeaturesContext)
  if (!ctx) {
    throw new Error(
      "useCompanyFeatures must be used within CompanyFeaturesProvider"
    )
  }
  return ctx
}
