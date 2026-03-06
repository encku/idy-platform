"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { AppHeader } from "@/components/dashboard/app-header"
import { FieldForm } from "@/components/dashboard/field-form"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { apiClient } from "@/lib/api-client"
import { useTranslation } from "@/lib/i18n/context"
import { useAuth } from "@/lib/auth/context"
import type { FieldType, CardFieldManagement } from "@/lib/types"

export default function EditFieldPage() {
  const { t } = useTranslation()
  const { canEdit } = useAuth()
  const router = useRouter()
  const { cardId, fieldId } = useParams<{
    cardId: string
    fieldId: string
  }>()

  useEffect(() => {
    if (!canEdit) router.replace("/")
  }, [canEdit, router])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState("")
  const [deleteOpen, setDeleteOpen] = useState(false)

  const [fieldType, setFieldType] = useState<FieldType | null>(null)
  const [name, setName] = useState("")
  const [data, setData] = useState("")
  const [formattedData, setFormattedData] = useState<Record<string, string>>({})
  const [file, setFile] = useState<File | null>(null)
  const [customIcon, setCustomIcon] = useState<File | null>(null)
  const [customIconUrl, setCustomIconUrl] = useState("")
  const [clearCustomIcon, setClearCustomIcon] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const res = await apiClient.get<{
          data: { fields: CardFieldManagement[] }
        }>(`/api/cards/${cardId}`)

        const field = res.data.fields.find(
          (f) => f.id === Number(fieldId)
        )
        if (!field) {
          router.back()
          return
        }

        setFieldType(field.field_type)
        setName(field.name)
        setData(field.data || "")
        setFormattedData(field.formatted_data || {})
        setCustomIconUrl(field.custom_icon_url || "")
      } catch {
        router.back()
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [cardId, fieldId, router])

  async function handleSubmit() {
    if (!fieldType || !name.trim()) return
    setError("")
    setSaving(true)

    try {
      const isFile = fieldType.regex === "file"
      const isFormatted =
        fieldType.format && Object.keys(fieldType.format).length > 0

      if (!isFile && !isFormatted && fieldType.regex) {
        const regex = new RegExp(fieldType.regex)
        if (!regex.test(data)) {
          setError(t("formErrors.error"))
          setSaving(false)
          return
        }
      }

      const formData = new FormData()
      formData.append("name", name.trim())

      if (isFormatted) {
        formData.append("formatted_data", JSON.stringify(formattedData))
      } else if (isFile && file) {
        formData.append("file", file)
      } else {
        formData.append("data", data)
      }

      if (clearCustomIcon && !customIcon) {
        formData.append("clear_custom_icon", "true")
      }

      if (customIcon) {
        const imageCompression = (
          await import("browser-image-compression")
        ).default
        const compressed = await imageCompression(customIcon, {
          maxWidthOrHeight: 720,
          initialQuality: 0.8,
          useWebWorker: true,
        })
        formData.append("custom_icon", compressed)
      }

      await apiClient.put(
        `/api/cards/${cardId}/fields/${fieldId}`,
        formData
      )
      router.push(`/card/${cardId}`)
      router.refresh()
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code
      setError(code ? t(`errorCodes.${code}`) : t("errorCodes.1"))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await apiClient.del(`/api/cards/${cardId}/fields/${fieldId}`)
      router.push(`/card/${cardId}`)
      router.refresh()
    } catch {
      setError(t("errorCodes.1"))
    } finally {
      setDeleting(false)
      setDeleteOpen(false)
    }
  }

  if (!canEdit) return null
  if (loading) return <LoadingSpinner />
  if (!fieldType) return null

  const isFile = fieldType.regex === "file"

  return (
    <>
      <AppHeader title={t(fieldType.name)} backButton />

      <div className="px-5 pt-5 pb-8">
        <FieldForm
          fieldType={fieldType}
          name={name}
          data={data}
          formattedData={formattedData}
          customIconUrl={customIconUrl}
          onNameChange={setName}
          onDataChange={setData}
          onFormattedDataChange={setFormattedData}
          onFileChange={setFile}
          onCustomIconChange={(file) => {
            setCustomIcon(file)
            if (file) setClearCustomIcon(false)
          }}
          onCustomIconRemove={() => {
            setCustomIcon(null)
            setCustomIconUrl("")
            setClearCustomIcon(true)
          }}
          onSubmit={handleSubmit}
          saving={saving}
          error={error}
          submitLabel={t("update")}
          disableNameEdit={isFile}
        />

        {/* Delete Button */}
        {!isFile && (
          <Button
            variant="destructive"
            className="w-full h-12 mt-3"
            onClick={() => setDeleteOpen(true)}
            disabled={deleting}
          >
            {deleting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              t("delete")
            )}
          </Button>
        )}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("delete")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteCardMessage")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
