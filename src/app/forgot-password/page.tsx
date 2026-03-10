"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTranslation } from "@/lib/i18n/context"

export default function ForgotPasswordPage() {
  const { t } = useTranslation()
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        const code = data?.code
        throw new Error(
          code ? t(`errorCodes.${code}`) : data?.error || t("errorCodes.1")
        )
      }

      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errorCodes.1"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          {t("backToLogin")}
        </button>

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
            {t("forgotPassword")}
          </h2>
        </div>

        {success ? (
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/30 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
            {t("successEmailSent")}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">{t("email")}</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus
              />
            </div>

            <Button
              type="submit"
              className="w-full h-10"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {t("sendingEmail")}
                </>
              ) : (
                t("sendRecoveryEmail")
              )}
            </Button>
          </form>
        )}

        <p className="text-center text-sm text-muted-foreground">
          <Link
            href="/login"
            className="text-foreground underline underline-offset-4 hover:text-foreground/80"
          >
            {t("login")}
          </Link>
        </p>
      </div>
    </div>
  )
}
