"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Suspense } from "react"

function SSOCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState("")

  useEffect(() => {
    const code = searchParams.get("code")
    const state = searchParams.get("state")

    if (!code || !state) {
      setError("Missing authorization code or state parameter")
      return
    }

    async function exchangeCode() {
      try {
        const res = await fetch("/api/auth/sso/callback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, state }),
        })

        if (!res.ok) {
          const data = await res.json().catch(() => null)
          throw new Error(data?.error || "SSO authentication failed")
        }

        const data = await res.json()
        if (data.success) {
          // Redirect to the originally requested page or dashboard
          const redirectTo = searchParams.get("redirect_after") || "/"
          router.push(redirectTo)
        } else {
          throw new Error("SSO authentication failed")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "SSO authentication failed")
      }
    }

    exchangeCode()
  }, [searchParams, router])

  if (error) {
    return (
      <div className="flex min-h-svh items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-6 text-center">
          <div className="flex size-12 items-center justify-center rounded-lg bg-foreground text-background font-bold text-lg mx-auto">
            id
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">SSO Login Failed</h2>
            <p className="text-muted-foreground text-sm">{error}</p>
          </div>
          <button
            onClick={() => router.push("/login")}
            className="text-sm text-foreground underline underline-offset-4 hover:text-foreground/80"
          >
            Back to login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh items-center justify-center">
      <div className="space-y-4 text-center">
        <Loader2 className="size-8 animate-spin mx-auto text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Completing SSO sign-in...</p>
      </div>
    </div>
  )
}

export default function SSOCallbackPage() {
  return (
    <Suspense>
      <SSOCallbackContent />
    </Suspense>
  )
}
