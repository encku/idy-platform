"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Eye, EyeOff, Loader2, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTranslation } from "@/lib/i18n/context"

function RegisterForm() {
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()

  const publicKey = searchParams.get("public_key")
  const privateKey = searchParams.get("private_key")
  const isCardClaim = !!(publicKey && privateKey)

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    rePassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [clarification, setClarification] = useState(false)
  const [consent, setConsent] = useState(false)
  const [showClarification, setShowClarification] = useState(false)
  const [showConsent, setShowConsent] = useState(false)

  function set(key: string, val: string) {
    setForm((prev) => ({ ...prev, [key]: val }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (form.password !== form.rePassword) {
      setError(t("formErrors.rePassword"))
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          ...(publicKey && { public_key: publicKey }),
          ...(privateKey && { private_key: privateKey }),
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        const code = data?.code
        throw new Error(
          code ? t(`errorCodes.${code}`) : data?.error || t("errorCodes.1")
        )
      }

      router.push("/")
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errorCodes.1"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="flex min-h-svh items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="idycard" width={36} height={36} className="size-9" />
            <span className="text-lg font-semibold tracking-tight">
              idycard
            </span>
          </div>

          {/* Card Claim Banner */}
          {isCardClaim && (
            <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
              <CreditCard className="size-5 text-primary shrink-0" />
              <p className="text-sm text-foreground">
                {t("cardClaimMessage")}
              </p>
            </div>
          )}

          {/* Header */}
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">
              {isCardClaim ? t("cardClaimTitle") : t("register")}
            </h2>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">{t("profileName")}</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t("email")}</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t("password")}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
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

            <div className="space-y-2">
              <Label htmlFor="rePassword">{t("rePassword")}</Label>
              <Input
                id="rePassword"
                type="password"
                value={form.rePassword}
                onChange={(e) => set("rePassword", e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>

            {/* Clarification Text */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={clarification}
                onChange={(e) => setClarification(e.target.checked)}
                className="mt-1 size-4 rounded border-input accent-foreground"
              />
              <span className="text-sm text-muted-foreground">
                <button
                  type="button"
                  onClick={() => setShowClarification(true)}
                  className="text-foreground underline underline-offset-2"
                >
                  {t("clarificationText")}
                </button>
                {t("clarificationTextConsent")}
              </span>
            </label>

            {/* Clear Consent */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 size-4 rounded border-input accent-foreground"
              />
              <span className="text-sm text-muted-foreground">
                <button
                  type="button"
                  onClick={() => setShowConsent(true)}
                  className="text-foreground underline underline-offset-2"
                >
                  {t("clearConsent")}
                </button>
                {t("clarificationTextConsent")}
              </span>
            </label>

            <Button
              type="submit"
              className="w-full h-10"
              disabled={isLoading || !clarification}
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {t("registering")}
                </>
              ) : (
                t("register")
              )}
            </Button>
          </form>

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

      {/* Clarification Text Modal */}
      {showClarification && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowClarification(false)}
        >
          <div
            className="relative w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl bg-background p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-center font-semibold mb-4">
              Kullanıcılara İlişkin Kişisel Verilerin Korunması Aydınlatma
              Metni
            </h3>
            <div className="text-sm text-muted-foreground space-y-3 leading-relaxed">
              <p>
                IDY Teknoloji Bilişim Limited Şirket (&quot;Şirket&quot;), 6698
                sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;)
                uyarınca, veri sorumlusu sıfatı ile kişisel verilerinizi
                kaydedecek, saklayacak, güncelleyecek, mevzuatın izin verdiği
                durumlarda üçüncü kişilere açıklayabilecek ve
                sınıflandırılabilecektir.
              </p>
              <p>
                Konuya ilişkin ayrıntılar ve haklarınız, bilgilendirme amaçlı
                olarak aşağıda özetlenmiştir.
              </p>
              <p>
                6698 sayılı KVKK&apos;nun 11. maddesi kapsamındaki talepleriniz
                için, kimliğinizi ve talebinizi içeren dilekçenizi Şirketimize
                elden teslim edebilir, noter kanalı ile ya da{" "}
                <strong>destek@idycard.com</strong> e-posta adresine
                iletebilirsiniz.
              </p>
            </div>
            <Button
              className="w-full mt-4"
              onClick={() => setShowClarification(false)}
            >
              {t("close")}
            </Button>
          </div>
        </div>
      )}

      {/* Clear Consent Modal */}
      {showConsent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowConsent(false)}
        >
          <div
            className="relative w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl bg-background p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-center font-semibold mb-4">
              Kişisel Verilerin İşlenmesine İlişkin Açık Rıza
            </h3>
            <div className="text-sm text-muted-foreground space-y-3 leading-relaxed">
              <p>
                IDY Teknoloji Bilişim Limited Şirketi (&quot;Şirket&quot;)
                nezdinde işlenen kişisel verilerinizin, 6698 sayılı Kişisel
                Verilerin Korunması Kanununda işleme şartı olarak belirtilen
                hallerin varlığı haricinde, aşağıda belirtilen şekillerde
                işlenebilmesi için açık rızanız gerekmektedir.
              </p>
              <p>
                Ad, soyad, doğum tarihi, cinsiyet, T.C. kimlik numarası gibi
                kimlik verilerim ile, e-posta adresi, adres, konum, telefon
                numarası, cihaz bilgileri, internet sitesi kullanım verileri ve
                Şirketinizle paylaştığım diğer kişisel verilerimin; kampanya,
                analitik çalışma, reklam, tanıtım, promosyon amaçlarıyla
                işlenmesine ve gerek yurt içinde gerek de yurt dışında bulunan
                üçüncü kişiler ile paylaşılmasını onaylıyorum.
              </p>
            </div>
            <Button
              className="w-full mt-4"
              onClick={() => setShowConsent(false)}
            >
              {t("close")}
            </Button>
          </div>
        </div>
      )}
    </>
  )
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  )
}
