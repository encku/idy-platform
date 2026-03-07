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

type UserRole = "admin" | "company_admin" | "read_only" | "viewer" | null

interface AuthUser {
  id: number
  name: string
  email: string
  email_verified: boolean
}

interface AuthContextValue {
  user: AuthUser | null
  role: UserRole
  isAdmin: boolean
  isViewer: boolean
  canEdit: boolean
  loading: boolean
  refetch: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function readUserCookie(): AuthUser | null {
  if (typeof document === "undefined") return null
  try {
    const match = document.cookie.split("; ").find((c) => c.startsWith("idy_user="))
    if (!match) return null
    return JSON.parse(atob(match.split("=")[1]))
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => readUserCookie())
  const [role, setRole] = useState<UserRole>(null)
  const [loading, setLoading] = useState(() => readUserCookie() === null)

  const fetchAuth = useCallback(async () => {
    try {
      const res = await apiClient.get<{
        authenticated: boolean
        user: AuthUser
        role: string
      }>("/api/auth/me")
      if (res.authenticated) {
        setUser(res.user)
        setRole(res.role as UserRole)
      }
    } catch {
      setUser(null)
      setRole(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAuth()
  }, [fetchAuth])

  const isAdmin = role === "admin" || role === "company_admin"
  const isViewer = role === "viewer"
  const canEdit = role !== "viewer" && role !== "read_only"

  return (
    <AuthContext.Provider
      value={{ user, role, isAdmin, isViewer, canEdit, loading, refetch: fetchAuth }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
