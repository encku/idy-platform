"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useTranslation } from "@/lib/i18n/context"
import type { AdminUser } from "@/lib/admin/types"

interface UserFormProps {
  mode: "create" | "edit"
  initialData?: AdminUser
  onSubmit: (data: Record<string, string | boolean>) => Promise<void>
  saving: boolean
}

export function UserForm({ mode, initialData, onSubmit, saving }: UserFormProps) {
  const { t } = useTranslation()

  const [name, setName] = useState(initialData?.name || "")
  const [email, setEmail] = useState(initialData?.email || "")
  const [phone, setPhone] = useState("")
  const [titleField, setTitleField] = useState(initialData?.title || "")
  const [description, setDescription] = useState(initialData?.description || "")
  const [isHidden, setIsHidden] = useState(initialData?.is_hidden || false)
  const [password, setPassword] = useState("")
  const [passwordConfirmation, setPasswordConfirmation] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const data: Record<string, string | boolean> = {
      name,
      email,
      phone,
      title: titleField,
      description,
      is_hidden: isHidden,
    }
    if (mode === "create") {
      data.password = password
      data.password_confirmation = passwordConfirmation
    }
    await onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {/* Personal Info */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          {t("personalInfo")}
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">{t("name")} *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{t("email")} *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="phone">{t("phone")}</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">{t("title")}</Label>
            <Input
              id="title"
              value={titleField}
              onChange={(e) => setTitleField(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">{t("description")}</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        <div className="flex items-center gap-3">
          <Switch
            id="is-hidden"
            checked={isHidden}
            onCheckedChange={setIsHidden}
          />
          <div>
            <Label htmlFor="is-hidden">{t("isHidden")}</Label>
            <p className="text-xs text-muted-foreground">{t("isHiddenHint")}</p>
          </div>
        </div>
      </div>

      {/* Password — create mode only */}
      {mode === "create" && (
        <>
          <Separator />
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              {t("password")}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="password">{t("password")} *</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-confirm">{t("passwordConfirmation")} *</Label>
                <Input
                  id="password-confirm"
                  type="password"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            </div>
          </div>
        </>
      )}

      <Separator />

      <div className="flex gap-3 justify-end">
        <Button type="submit" disabled={saving}>
          {saving
            ? t("saving")
            : mode === "create"
              ? t("create")
              : t("save")}
        </Button>
      </div>
    </form>
  )
}
