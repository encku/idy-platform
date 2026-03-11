"use client"

import { useState, useRef } from "react"
import { Upload, Loader2, ExternalLink, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ImageCropper } from "./image-cropper"
import { PhoneInput } from "./phone-input"
import { useTranslation } from "@/lib/i18n/context"
import type { FieldType } from "@/lib/types"

interface FieldFormProps {
  fieldType: FieldType
  name: string
  data: string
  formattedData: Record<string, string>
  customIconUrl?: string
  onCustomIconRemove?: () => void
  onNameChange: (name: string) => void
  onDataChange: (data: string) => void
  onFormattedDataChange: (data: Record<string, string>) => void
  onFileChange: (file: File | null) => void
  onCustomIconChange: (file: File | null) => void
  onSubmit: () => void
  saving: boolean
  error: string
  submitLabel: string
  disableNameEdit?: boolean
}

export function FieldForm({
  fieldType,
  name,
  data,
  formattedData,
  customIconUrl,
  onCustomIconRemove,
  onNameChange,
  onDataChange,
  onFormattedDataChange,
  onFileChange,
  onCustomIconChange,
  onSubmit,
  saving,
  error,
  submitLabel,
  disableNameEdit,
}: FieldFormProps) {
  const { t } = useTranslation()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const iconInputRef = useRef<HTMLInputElement>(null)

  const [iconCropperOpen, setIconCropperOpen] = useState(false)
  const [selectedIconImage, setSelectedIconImage] = useState("")
  const [iconPreview, setIconPreview] = useState("")

  const isFile = fieldType.regex === "file"
  const isPhone = fieldType.input_type_id === 5
  const isFormatted =
    fieldType.format && Object.keys(fieldType.format).length > 0

  const primitiveTypes = ["string", "number", "boolean", "integer", "float", "text"]

  function formatLabel(key: string, label: string): string {
    if (primitiveTypes.includes(label.toLowerCase())) {
      return t(key)
    }
    return label
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const maxSize = 20 * 1000000 // 20MB
    if (file.size > maxSize) {
      alert(t("formErrors.fileSizeError"))
      return
    }
    onFileChange(file)
    onDataChange(file.name)
  }

  async function handleIconSelect(e: React.ChangeEvent<HTMLInputElement>) {
    let file = e.target.files?.[0]
    if (!file) return

    if (
      file.type === "image/heic" ||
      file.name.toLowerCase().endsWith(".heic")
    ) {
      const heic2any = (await import("heic2any")).default
      const blob = await heic2any({ blob: file, toType: "image/jpeg" })
      file = new File(
        [blob as Blob],
        file.name.replace(/\.heic$/i, ".jpg"),
        { type: "image/jpeg" }
      )
    }

    setSelectedIconImage(URL.createObjectURL(file))
    setIconCropperOpen(true)
  }

  function handleIconCrop(file: File, base64: string) {
    onCustomIconChange(file)
    setIconPreview(base64)
    setIconCropperOpen(false)
    setSelectedIconImage("")
    if (iconInputRef.current) iconInputRef.current.value = ""
  }

  const previewUrl =
    !isFile && !isFormatted && fieldType.prefix
      ? `${fieldType.prefix}${data}${fieldType.postfix || ""}`
      : null

  const hasCustomIcon = !!(iconPreview || customIconUrl)
  const currentIcon = iconPreview || customIconUrl || fieldType.icon_url

  return (
    <div className="space-y-4">
      {/* Custom Icon */}
      {(
        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              onClick={() => iconInputRef.current?.click()}
              className="group relative size-14 shrink-0 overflow-hidden rounded-xl bg-muted"
            >
              <img
                src={currentIcon}
                alt={t(fieldType.name)}
                className="size-full object-contain p-1"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                <Upload className="size-4 text-white" />
              </div>
            </button>
            {hasCustomIcon && onCustomIconRemove && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setIconPreview("")
                  if (iconInputRef.current) iconInputRef.current.value = ""
                  onCustomIconRemove()
                }}
                className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-destructive text-white shadow-sm hover:bg-destructive/90 transition-colors"
              >
                <X className="size-3" />
              </button>
            )}
          </div>
          <input
            ref={iconInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleIconSelect}
          />
          <p className="text-xs text-muted-foreground">{t(fieldType.name)}</p>
        </div>
      )}

      {/* Field Name */}
      {!disableNameEdit && (
        <div className="space-y-2">
          <Label>{isFormatted ? t(fieldType.name) : t("fieldName")}</Label>
          <Input
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder={t(fieldType.name)}
            required
          />
        </div>
      )}

      {/* Data Input - depends on type */}
      {isFile ? (
        <div className="space-y-2">
          <Label>{t("fileInput")}</Label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 p-8 cursor-pointer hover:border-muted-foreground/50 transition-colors"
          >
            <div className="text-center">
              <Upload className="size-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {data || t("fileInput")}
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                {t("maxFileSize20MB")}
              </p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>
      ) : isPhone ? (
        <div className="space-y-2">
          <Label>{t("phoneNumber")}</Label>
          <PhoneInput value={data} onChange={onDataChange} />
        </div>
      ) : isFormatted ? (
        <div className="space-y-3">
          {Object.entries(fieldType.format!).map(([key, label]) => (
            <div key={key} className="space-y-2">
              <Label>{formatLabel(key, label)}</Label>
              <Input
                value={formattedData[key] || ""}
                onChange={(e) =>
                  onFormattedDataChange({
                    ...formattedData,
                    [key]: e.target.value,
                  })
                }
                required
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          <Label>{t(fieldType.name)}</Label>
          <Input
            value={data}
            onChange={(e) => onDataChange(e.target.value)}
            required
          />
          {previewUrl && data && (
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-blue-500 hover:underline"
            >
              <ExternalLink className="size-3" />
              {previewUrl}
            </a>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Submit */}
      <Button
        className="w-full h-12"
        onClick={onSubmit}
        disabled={saving}
      >
        {saving ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            {submitLabel}
          </>
        ) : (
          submitLabel
        )}
      </Button>

      {/* Icon Cropper */}
      <ImageCropper
        open={iconCropperOpen}
        imageSrc={selectedIconImage}
        onCrop={handleIconCrop}
        onClose={() => {
          setIconCropperOpen(false)
          setSelectedIconImage("")
          if (iconInputRef.current) iconInputRef.current.value = ""
        }}
      />
    </div>
  )
}
