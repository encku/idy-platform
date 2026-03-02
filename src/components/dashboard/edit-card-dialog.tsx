"use client"

import { useEffect, useState } from "react"
import { Check, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTranslation } from "@/lib/i18n/context"
import { apiClient } from "@/lib/api-client"
import { toast } from "sonner"
import { FEATURES } from "@/lib/features"
import { useFeatures } from "@/lib/features/context"
import { UpgradeDialog } from "@/components/premium/upgrade-dialog"
import { PremiumBadge } from "@/components/premium/premium-badge"

const THEME_COLORS = [
  { key: "colorBlue", value: "#0077CC" },
  { key: "colorGreen", value: "#2E7D32" },
  { key: "colorRed", value: "#C62828" },
  { key: "colorPurple", value: "#7B1FA2" },
  { key: "colorOrange", value: "#EF6C00" },
  { key: "colorPink", value: "#AD1457" },
  { key: "colorTeal", value: "#00838F" },
  { key: "colorNavy", value: "#1A237E" },
  { key: "colorBrown", value: "#4E342E" },
  { key: "colorGray", value: "#455A64" },
  { key: "colorGold", value: "#FF8F00" },
  { key: "colorCyan", value: "#0097A7" },
]

interface EditCardDialogProps {
  open: boolean
  onClose: () => void
  cardId: string
  currentName: string
  onSuccess: (newName: string) => void
}

export function EditCardDialog({
  open,
  onClose,
  cardId,
  currentName,
  onSuccess,
}: EditCardDialogProps) {
  const { t } = useTranslation()
  const { hasFeature } = useFeatures()
  const [name, setName] = useState(currentName)
  const [themeColor, setThemeColor] = useState("#0077CC")
  const [viewMode, setViewMode] = useState("standard")
  const [saving, setSaving] = useState(false)
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const hasThemeAccess = hasFeature(FEATURES.CUSTOM_THEMES)

  useEffect(() => {
    if (!open) return
    setName(currentName)
    apiClient
      .get<{ data: { theme_color: string; view_mode: string } }>(
        `/api/user/card-profile/${cardId}`
      )
      .then((res) => {
        if (res.data.theme_color) setThemeColor(res.data.theme_color)
        if (res.data.view_mode) setViewMode(res.data.view_mode)
      })
      .catch(() => {})
  }, [open, cardId, currentName])

  async function handleSave() {
    if (!name.trim()) return
    setSaving(true)
    try {
      await Promise.all([
        apiClient.put(`/api/cards/${cardId}/name`, {
          user_preferred_name: name.trim(),
        }),
        apiClient.put(`/api/user/card-profile/${cardId}`, {
          theme_color: themeColor,
          view_mode: viewMode,
        }),
      ])
      toast.success(t("editCardSuccess"))
      onSuccess(name.trim())
      onClose()
    } catch {
      toast.error(t("editCardError"))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose()
      }}
    >
      <DialogContent className="max-w-sm p-5">
        <DialogHeader>
          <DialogTitle>{t("editCardTitle")}</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">{t("editCardMessage")}</p>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("editCardInputPlaceholder")}
        />

        {/* Theme Color */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Label>{t("themeColor")}</Label>
            {!hasThemeAccess && <PremiumBadge size="sm" />}
          </div>
          <div className="grid grid-cols-4 gap-3">
            {THEME_COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => {
                  if (!hasThemeAccess) {
                    setUpgradeOpen(true)
                    return
                  }
                  setThemeColor(color.value)
                }}
                title={t(color.key)}
                className={`group flex flex-col items-center gap-1.5 ${!hasThemeAccess ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <span
                  className={`relative size-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                    themeColor === color.value
                      ? "ring-2 ring-offset-2 ring-offset-background scale-110"
                      : "hover:scale-110 hover:shadow-md"
                  }`}
                  style={{
                    backgroundColor: color.value,
                    ...(themeColor === color.value
                      ? { ["--tw-ring-color" as string]: color.value }
                      : {}),
                  }}
                >
                  {themeColor === color.value && (
                    <Check className="size-4 text-white drop-shadow-sm" strokeWidth={3} />
                  )}
                </span>
                <span
                  className={`text-[10px] leading-none ${
                    themeColor === color.value
                      ? "text-foreground font-medium"
                      : "text-muted-foreground"
                  }`}
                >
                  {t(color.key)}
                </span>
              </button>
            ))}
          </div>
          <div
            className="h-8 rounded-lg transition-all duration-300"
            style={{
              background: `linear-gradient(135deg, ${themeColor}, ${themeColor}bb)`,
            }}
          />
        </div>

        {/* View Mode */}
        <div className="space-y-2">
          <Label>{t("viewMode")}</Label>
          <div className="flex gap-3">
            {/* Standard — list layout in phone */}
            <button
              onClick={() => setViewMode("standard")}
              className={`flex-1 flex flex-col items-center gap-2 rounded-xl border-2 p-3 transition-all ${
                viewMode === "standard"
                  ? "border-foreground bg-accent"
                  : "border-muted-foreground/20 hover:border-muted-foreground/40"
              }`}
            >
              <div className="w-14 rounded-lg border border-muted-foreground/20 bg-background p-1.5 aspect-[9/16] flex flex-col items-center">
                {/* Header area */}
                <div className="w-4 h-4 rounded-full bg-muted-foreground/15 mb-1" />
                <div className="w-6 h-0.5 rounded-full bg-muted-foreground/15 mb-1.5" />
                {/* List items */}
                <div className="w-full flex flex-col gap-0.5">
                  <div className="h-1.5 w-full rounded-[1px] bg-muted-foreground/20" />
                  <div className="h-1.5 w-full rounded-[1px] bg-muted-foreground/15" />
                  <div className="h-1.5 w-full rounded-[1px] bg-muted-foreground/10" />
                  <div className="h-1.5 w-3/4 rounded-[1px] bg-muted-foreground/10" />
                </div>
              </div>
              <span
                className={`text-xs font-medium ${
                  viewMode === "standard"
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {t("standard")}
              </span>
            </button>
            {/* Modern — grid/tile layout in phone */}
            <button
              onClick={() => setViewMode("modern")}
              className={`flex-1 flex flex-col items-center gap-2 rounded-xl border-2 p-3 transition-all ${
                viewMode === "modern"
                  ? "border-foreground bg-accent"
                  : "border-muted-foreground/20 hover:border-muted-foreground/40"
              }`}
            >
              <div className="w-14 rounded-lg border border-muted-foreground/20 bg-background p-1.5 aspect-[9/16] flex flex-col items-center">
                {/* Header area */}
                <div className="w-4 h-4 rounded-full bg-muted-foreground/15 mb-1" />
                <div className="w-6 h-0.5 rounded-full bg-muted-foreground/15 mb-1.5" />
                {/* Grid tiles */}
                <div className="w-full flex flex-col gap-[3px]">
                  <div className="w-full flex justify-between">
                    <div className="rounded-[2px] bg-muted-foreground/40" style={{ width: 11, height: 11 }} />
                    <div className="rounded-[2px] bg-muted-foreground/40" style={{ width: 11, height: 11 }} />
                    <div className="rounded-[2px] bg-muted-foreground/40" style={{ width: 11, height: 11 }} />
                  </div>
                  <div className="w-full flex justify-between">
                    <div className="rounded-[2px] bg-muted-foreground/25" style={{ width: 11, height: 11 }} />
                    <div className="rounded-[2px] bg-muted-foreground/25" style={{ width: 11, height: 11 }} />
                    <div className="rounded-[2px] bg-muted-foreground/25" style={{ width: 11, height: 11 }} />
                  </div>
                </div>
              </div>
              <span
                className={`text-xs font-medium ${
                  viewMode === "modern"
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {t("modern")}
              </span>
            </button>
          </div>
        </div>

        <div className="flex gap-2 mt-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button
            className="flex-1"
            onClick={handleSave}
            disabled={saving || !name.trim()}
          >
            {saving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              t("save")
            )}
          </Button>
        </div>
      </DialogContent>

      <UpgradeDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} />
    </Dialog>
  )
}
