"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { AppHeader } from "@/components/dashboard/app-header"
import { FieldForm } from "@/components/dashboard/field-form"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import { apiClient } from "@/lib/api-client"
import { useTranslation } from "@/lib/i18n/context"
import { useAuth } from "@/lib/auth/context"
import type { FieldType } from "@/lib/types"

export default function AddFieldPage() {
  const { t } = useTranslation()
  const { canEdit } = useAuth()
  const router = useRouter()
  const { cardId, fieldTypeId } = useParams<{
    cardId: string
    fieldTypeId: string
  }>()

  useEffect(() => {
    if (!canEdit) router.replace("/")
  }, [canEdit, router])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [fieldType, setFieldType] = useState<FieldType | null>(null)

  const [name, setName] = useState("")
  const [data, setData] = useState("")
  const [formattedData, setFormattedData] = useState<Record<string, string>>({})
  const [file, setFile] = useState<File | null>(null)
  const [customIcon, setCustomIcon] = useState<File | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await apiClient.get<{ data: FieldType }>(
          `/api/field-types/${fieldTypeId}`
        )
        setFieldType(res.data)
        setName(t(res.data.name))
      } catch {
        // handled
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [fieldTypeId, t])

  async function handleSubmit() {
    if (!fieldType || !name.trim()) return
    setError("")
    setSaving(true)

    try {
      const isFile = fieldType.regex === "file"
      const isFormatted =
        fieldType.format && Object.keys(fieldType.format).length > 0

      // Validate
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
      formData.append("field_type_id", fieldTypeId)

      if (isFormatted) {
        formData.append("formatted_data", JSON.stringify(formattedData))
      } else if (isFile && file) {
        formData.append("file", file)
      } else {
        formData.append("data", data)
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

      await apiClient.post(`/api/cards/${cardId}/fields`, formData)
      router.push(`/card/${cardId}`)
      router.refresh()
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code
      setError(code ? t(`errorCodes.${code}`) : t("errorCodes.1"))
    } finally {
      setSaving(false)
    }
  }

  if (!canEdit) return null
  if (loading) return <LoadingSpinner />
  if (!fieldType) return null

  return (
    <>
      <AppHeader title={t("addNewItem")} backButton />

      <div className="px-5 pt-5 pb-8">
        <FieldForm
          fieldType={fieldType}
          name={name}
          data={data}
          formattedData={formattedData}
          onNameChange={setName}
          onDataChange={setData}
          onFormattedDataChange={setFormattedData}
          onFileChange={setFile}
          onCustomIconChange={setCustomIcon}
          onSubmit={handleSubmit}
          saving={saving}
          error={error}
          submitLabel={t("add")}
        />
      </div>
    </>
  )
}
