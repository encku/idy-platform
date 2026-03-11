"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Suspense } from "react"
import { useTranslation } from "@/lib/i18n/context"

function SSOCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useTranslation()
  const [error, setError] = useState("")

  useEffect(() => {
    const code = searchParams.get("code")
    const state = searchParams.get("state")

    if (!code || !state) {
      setError(t("ssoMissingParams"))
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
          throw new Error(data?.error || t("ssoAuthFailed"))
        }

        const data = await res.json()
        if (data.success) {
          // Redirect to the originally requested page or dashboard
          const redirectTo = searchParams.get("redirect_after") || "/"
          router.push(redirectTo)
        } else {
          throw new Error(t("ssoAuthFailed"))
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : t("ssoAuthFailed"))
      }
    }

    exchangeCode()
  }, [searchParams, router, t])

  if (error) {
    return (
      <div className="flex min-h-svh items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-6 text-center">
          <div className="flex size-12 items-center justify-center rounded-lg bg-foreground text-background font-bold text-lg mx-auto">
            id
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">{t("ssoLoginFailed")}</h2>
            <p className="text-muted-foreground text-sm">{error}</p>
          </div>
          <button
            onClick={() => router.push("/login")}
            className="text-sm text-foreground underline underline-offset-4 hover:text-foreground/80"
          >
            {t("backToLogin")}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh items-center justify-center">
      <div className="space-y-4 text-center">
        <Loader2 className="size-8 animate-spin mx-auto text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{t("ssoCompletingSignIn")}</p>
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
