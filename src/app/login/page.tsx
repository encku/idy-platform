"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTranslation } from "@/lib/i18n/context"

function LoginForm() {
  const { t } = useTranslation()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const router = useRouter()
  const searchParams = useSearchParams()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || t("invalidCredentials"))
      }

      const from = searchParams.get("from") || "/"
      router.push(from)
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errorOccurred"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Left - Spline 3D Card Animation */}
      <div className="relative hidden lg:flex flex-col bg-foreground text-background overflow-hidden">
        {/* Logo */}
        <div className="absolute top-12 left-12 z-10 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-background text-foreground font-bold text-lg">
            id
          </div>
          <span className="text-xl font-semibold tracking-tight">idycard</span>
        </div>

        {/* Spline Scene */}
        <iframe
          src="https://my.spline.design/holographiccreditcard-ZnFbSnzcS5WNPF1LZgjXmQL5/"
          className="absolute inset-0 w-full h-full origin-center"
          style={{ border: "none", transform: "scale(1.75)" }}
        />

        {/* Bottom text */}
        <div className="absolute bottom-12 left-12 z-10 space-y-3">
          <h1 className="text-3xl font-bold tracking-tight leading-tight">
            {t("adminPanel")}
          </h1>
          <p className="text-background/50 text-sm max-w-md leading-relaxed">
            {t("loginDescription")}
          </p>
        </div>
      </div>

      {/* Right - Login Form */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 lg:hidden">
            <div className="flex size-9 items-center justify-center rounded-lg bg-foreground text-background font-bold text-sm">
              id
            </div>
            <span className="text-lg font-semibold tracking-tight">
              idycard
            </span>
          </div>

          {/* Header */}
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">
              {t("welcomeBack")}
            </h2>
            <p className="text-muted-foreground text-sm">
              {t("loginSubtitle")}
            </p>
          </div>

          {/* Form */}
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

            <div className="space-y-2">
              <Label htmlFor="password">{t("password")}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t("enterPassword")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="current-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-10"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {t("loggingIn")}
                </>
              ) : (
                t("login")
              )}
            </Button>
          </form>

          {/* Links */}
          <div className="flex items-center justify-between text-sm">
            <Link
              href="/forgot-password"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {t("forgotPassword")}
            </Link>
            <Link
              href="/register"
              className="text-foreground underline underline-offset-4 hover:text-foreground/80"
            >
              {t("register")}
            </Link>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground">
            idycard &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
