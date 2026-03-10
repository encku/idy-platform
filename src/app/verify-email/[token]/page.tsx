"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { CheckCircle2, Loader2, XCircle } from "lucide-react"
import { useTranslation } from "@/lib/i18n/context"

function hasUserCookie() {
  if (typeof document === "undefined") return false
  return document.cookie.split("; ").some((c) => c.startsWith("idy_user="))
}

export default function VerifyEmailPage() {
  const { t } = useTranslation()
  const params = useParams()
  const token = params.token as string
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    async function verify() {
      if (!token) {
        setError(t("errorCodes.1"))
        setIsLoading(false)
        return
      }

      try {
        const res = await fetch("/api/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        })

        if (!res.ok) {
          const data = await res.json().catch(() => null)
          const code = data?.code
          const translationKey = code ? `errorCodes.${code}` : ""
          const translated = translationKey ? t(translationKey) : ""
          throw new Error(
            (translated && translated !== translationKey) ? translated : data?.error || t("errorCodes.1")
          )
        }

        setSuccess(true)
        setIsLoggedIn(hasUserCookie())
      } catch (err) {
        setError(err instanceof Error ? err.message : t("errorCodes.1"))
      } finally {
        setIsLoading(false)
      }
    }

    verify()
  }, [token, t])

  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="idycard" width={36} height={36} className="size-9" />
          <span className="text-lg font-semibold tracking-tight">
            idycard
          </span>
        </div>

        {/* Header */}
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">
            {t("verifyEmail")}
          </h2>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-3 rounded-lg border px-4 py-6 text-sm text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
            {t("verifyingEmail")}
          </div>
        ) : success ? (
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/30 px-4 py-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <p className="text-sm text-emerald-700 dark:text-emerald-300">
                {t("emailVerifiedSuccess")}
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-6">
            <div className="flex items-center gap-3">
              <XCircle className="size-5 text-destructive shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          </div>
        )}

        <p className="text-center text-sm text-muted-foreground">
          <Link
            href={isLoggedIn ? "/" : "/login"}
            className="text-foreground underline underline-offset-4 hover:text-foreground/80"
          >
            {isLoggedIn ? t("backToDashboard") : t("login")}
          </Link>
        </p>
      </div>
    </div>
  )
}
