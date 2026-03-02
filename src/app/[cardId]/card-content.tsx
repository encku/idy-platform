"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, X, Check, ExternalLink, UserPlus, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTranslation } from "@/lib/i18n/context"
import type { CardProfile, CardField, LeadSettings } from "@/lib/types"

const API_URL = process.env.NEXT_PUBLIC_API_URL

interface CardContentProps {
  profile: CardProfile
  fields: CardField[]
  leadSettings: LeadSettings | null
  cardId: string
}

export function CardContent({
  profile,
  fields,
  leadSettings,
  cardId,
}: CardContentProps) {
  const { t } = useTranslation()
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [showLeadModal, setShowLeadModal] = useState(
    () => leadSettings?.enabled && leadSettings?.show_before_content
  )
  const [leadSubmitted, setLeadSubmitted] = useState(false)
  const [leadLoading, setLeadLoading] = useState(false)
  const [leadData, setLeadData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: "",
  })

  function getFieldUrl(field: CardField) {
    return `${field.prefix || ""}${field.data}${field.postfix || ""}`
  }

  function isPdfUrl(url: string) {
    try {
      const pathname = new URL(url).pathname
      return pathname.toLowerCase().endsWith(".pdf")
    } catch {
      return url.toLowerCase().includes(".pdf")
    }
  }

  async function handleFieldClick(field: CardField) {
    const url = getFieldUrl(field)
    if (url) {
      if (isPdfUrl(url)) {
        setPdfUrl(url)
      } else {
        window.open(url, "_blank", "noopener,noreferrer")
      }
    }

    // Track click (fire-and-forget)
    fetch(`${API_URL}/card/${cardId}/field/${field.id}/click`, {
      method: "POST",
    }).catch(() => { })
  }

  async function submitLeadForm(e: React.FormEvent) {
    e.preventDefault()
    setLeadLoading(true)

    try {
      await fetch(`${API_URL}/card/${cardId}/lead`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...leadData, source: "web" }),
      })
      setLeadSubmitted(true)
      setShowLeadModal(false)
    } catch {
      // silently fail
    } finally {
      setLeadLoading(false)
    }
  }

  const hasBackground = !!profile.background_picture_url
  const isTile = profile.view_mode !== "list"

  return (
    <>
      {/* Lead Form Modal (Before Content) */}
      <AnimatePresence>
        {showLeadModal && leadSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm rounded-2xl bg-background p-6 shadow-2xl"
            >
              <button
                onClick={() => setShowLeadModal(false)}
                className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="size-4" />
              </button>

              <div className="text-center mb-6">
                <h2 className="text-lg font-semibold tracking-tight">
                  {leadSettings.form_title}
                </h2>
                {leadSettings.form_description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {leadSettings.form_description}
                  </p>
                )}
              </div>

              <LeadForm
                settings={leadSettings}
                data={leadData}
                onChange={setLeadData}
                onSubmit={submitLeadForm}
                loading={leadLoading}
                t={t}
              />

              <button
                onClick={() => setShowLeadModal(false)}
                className="w-full mt-3 text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {t("leadSkip")}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PDF Viewer Modal */}
      <AnimatePresence>
        {pdfUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col bg-black/80 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between px-4 py-3 bg-background/95 border-b">
              <span className="text-sm font-medium truncate max-w-[60%]">
                PDF
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.open(pdfUrl, "_blank", "noopener,noreferrer")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-muted hover:bg-muted/80 transition-colors"
                >
                  <Download className="size-3.5" />
                  {t("openInNewTab")}
                </button>
                <button
                  onClick={() => setPdfUrl(null)}
                  className="flex size-8 items-center justify-center rounded-md hover:bg-muted transition-colors"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 min-h-0">
              <iframe
                src={pdfUrl}
                className="w-full h-full border-0"
                title="PDF Viewer"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card Container */}
      <div className="mx-auto max-w-md pb-12">
        {/* Background Section */}
        <div className="relative">
          <div
            className="relative h-48 overflow-hidden rounded-b-3xl"
            style={
              hasBackground
                ? {
                  backgroundImage: `url(${profile.background_picture_url})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
                : undefined
            }
          >
            {!hasBackground && (
              <div
                className="absolute inset-0"
                style={{
                  background: profile.theme_color
                    ? `linear-gradient(135deg, ${profile.theme_color}, ${profile.theme_color}dd)`
                    : "linear-gradient(135deg, #1e1e2e, #2d2d3f)",
                }}
              />
            )}
            <div className="absolute inset-0 bg-black/20" />
          </div>

          {/* Save to Contacts - FAB */}
          <button
            onClick={() => {
              window.location.href = `${API_URL}/card/${cardId}/vcard`
            }}
            className="absolute -bottom-6 right-12 z-10 flex size-12 items-center justify-center rounded-full border-2 border-white/20 bg-black text-white shadow-lg transition-transform hover:scale-110 active:scale-95"
            title={t("addToContacts")}
          >
            <UserPlus className="size-5" />
          </button>
        </div>

        {/* Profile Section */}
        <div className="relative px-6 text-center -mt-[72px]">
          {/* Profile Photo */}
          <div className="relative inline-block">
            {profile.picture_url ? (
              <img
                src={profile.picture_url}
                alt={profile.name}
                className="size-36 rounded-full border-4 border-background object-cover shadow-lg"
              />
            ) : (
              <div className="size-36 rounded-full border-4 border-background bg-foreground text-background flex items-center justify-center text-3xl font-bold shadow-lg">
                {profile.name?.charAt(0) || "?"}
              </div>
            )}

            {/* Badge */}
            {profile.badge_picture_url && (
              <img
                src={profile.badge_picture_url}
                alt="Badge"
                className="absolute -bottom-1 -right-1 size-8 rounded-full border-2 border-background object-cover"
              />
            )}

          </div>

          {/* Info */}
          <div className="mt-4 space-y-1">
            <h1 className="text-xl font-semibold tracking-tight">
              {profile.name}
            </h1>
            {profile.title && (
              <p className="text-sm text-muted-foreground">{profile.title}</p>
            )}
            {profile.company && (
              <p className="text-xs text-muted-foreground/70">
                {profile.company}
              </p>
            )}
          </div>

          {profile.description && (
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
              {profile.description}
            </p>
          )}
        </div>

        {/* Lead Form Inline */}
        {leadSettings?.enabled &&
          !leadSettings.show_before_content &&
          !leadSubmitted && (
            <div className="mx-6 mt-6 rounded-2xl bg-muted/50 p-5">
              <h3 className="text-sm font-medium text-center">
                {leadSettings.form_title}
              </h3>
              {leadSettings.form_description && (
                <p className="text-xs text-muted-foreground text-center mt-1 mb-4">
                  {leadSettings.form_description}
                </p>
              )}
              <LeadForm
                settings={leadSettings}
                data={leadData}
                onChange={setLeadData}
                onSubmit={submitLeadForm}
                loading={leadLoading}
                inline
                t={t}
              />
            </div>
          )}

        {/* Thank You */}
        {leadSubmitted && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-6 mt-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 p-4 text-center"
          >
            <div className="mx-auto mb-2 flex size-8 items-center justify-center rounded-full bg-emerald-500 text-white">
              <Check className="size-4" />
            </div>
            <p className="text-sm text-emerald-700 dark:text-emerald-300">
              {t("leadThankYou")}
            </p>
          </motion.div>
        )}

        {/* Fields */}
        {fields.length > 0 && isTile && (
          <div className="mt-14 px-6 grid grid-cols-3 gap-2.5">
            {fields.map((field, i) => (
              <motion.button
                key={field.id ?? i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04, type: "spring", stiffness: 300, damping: 24 }}
                onClick={() => handleFieldClick(field)}
                className="group flex flex-col items-center gap-2.5 p-3 transition-all duration-200 active:scale-95"
              >
                <div className="relative flex size-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-b from-muted/80 to-muted shadow-sm ring-1 ring-black/[0.04] transition-transform duration-200 group-hover:scale-110">
                  {(field.icon_url || field.field_type?.icon_url) ? (
                    <img
                      src={field.icon_url || field.field_type?.icon_url}
                      alt={field.name}
                      className="size-full rounded-2xl object-contain drop-shadow-sm"
                    />
                  ) : (
                    <ExternalLink className="size-5 text-muted-foreground" />
                  )}
                </div>
                <span className="text-[10.5px] font-medium text-muted-foreground text-center leading-tight line-clamp-2 transition-colors group-hover:text-foreground">
                  {field.name}
                </span>
              </motion.button>
            ))}
          </div>
        )}

        {fields.length > 0 && !isTile && (
          <div className="mt-6 px-6 space-y-2.5">
            {fields.map((field, i) => (
              <motion.button
                key={field.id ?? i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => handleFieldClick(field)}
                className="group flex w-full items-center gap-3.5 rounded-xl border bg-background p-3.5 text-left transition-all hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                  {(field.icon_url || field.field_type?.icon_url) ? (
                    <img
                      src={field.icon_url || field.field_type?.icon_url}
                      alt={field.name}
                      className="size-6 object-contain"
                    />
                  ) : (
                    <ExternalLink className="size-4 text-muted-foreground" />
                  )}
                </div>
                <span className="flex-1 text-sm font-medium">{field.name}</span>
                <ExternalLink className="size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </motion.button>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-10 text-center">
          <a
            href="https://idycard.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
          >
            Powered by idycard
          </a>
        </div>
      </div>
    </>
  )
}

/* ─── Lead Form ─── */

function LeadForm({
  settings,
  data,
  onChange,
  onSubmit,
  loading,
  inline,
  t,
}: {
  settings: LeadSettings
  data: typeof defaultLeadData
  onChange: (d: typeof defaultLeadData) => void
  onSubmit: (e: React.FormEvent) => void
  loading: boolean
  inline?: boolean
  t: (key: string) => string
}) {
  const set = (key: string, val: string) =>
    onChange({ ...data, [key]: val })

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="lead-name" className="text-xs">
          {t("leadName")} {settings.require_name && "*"}
        </Label>
        <Input
          id="lead-name"
          placeholder={t("leadNamePlaceholder")}
          value={data.name}
          onChange={(e) => set("name", e.target.value)}
          required={settings.require_name}
          className={inline ? "h-9 text-sm" : undefined}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="lead-email" className="text-xs">
          {t("leadEmail")} {settings.require_email && "*"}
        </Label>
        <Input
          id="lead-email"
          type="email"
          placeholder="email@example.com"
          value={data.email}
          onChange={(e) => set("email", e.target.value)}
          required={settings.require_email}
          className={inline ? "h-9 text-sm" : undefined}
        />
      </div>

      {settings.require_phone && (
        <div className="space-y-2">
          <Label htmlFor="lead-phone" className="text-xs">
            {t("leadPhone")} *
          </Label>
          <Input
            id="lead-phone"
            type="tel"
            placeholder={t("leadPhonePlaceholder")}
            value={data.phone}
            onChange={(e) => set("phone", e.target.value)}
            required
            className={inline ? "h-9 text-sm" : undefined}
          />
        </div>
      )}

      {settings.require_company && (
        <div className="space-y-2">
          <Label htmlFor="lead-company" className="text-xs">
            {t("leadCompany")} *
          </Label>
          <Input
            id="lead-company"
            placeholder={t("leadCompanyPlaceholder")}
            value={data.company}
            onChange={(e) => set("company", e.target.value)}
            required
            className={inline ? "h-9 text-sm" : undefined}
          />
        </div>
      )}

      {settings.require_message && (
        <div className="space-y-2">
          <Label htmlFor="lead-message" className="text-xs">
            {t("leadMessage")} *
          </Label>
          <textarea
            id="lead-message"
            placeholder={t("leadMessagePlaceholder")}
            value={data.message}
            onChange={(e) => set("message", e.target.value)}
            required
            rows={3}
            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
          />
        </div>
      )}

      <Button
        type="submit"
        className={`w-full ${inline ? "h-9 text-sm" : ""}`}
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            {t("leadSubmitting")}
          </>
        ) : (
          settings.submit_button_text || t("leadSubmit")
        )}
      </Button>
    </form>
  )
}

const defaultLeadData = {
  name: "",
  email: "",
  phone: "",
  company: "",
  message: "",
}
