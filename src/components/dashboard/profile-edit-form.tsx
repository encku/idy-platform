"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Upload, Loader2, Camera, Crown } from "lucide-react"
import { AppHeader } from "@/components/dashboard/app-header"
import { ImageCropper } from "@/components/dashboard/image-cropper"
import { PremiumBadge } from "@/components/premium/premium-badge"
import { UpgradeDialog } from "@/components/premium/upgrade-dialog"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { apiClient } from "@/lib/api-client"
import { FEATURES } from "@/lib/features"
import { useFeatures } from "@/lib/features/context"
import { useTranslation } from "@/lib/i18n/context"

interface ProfileData {
  name: string
  title: string
  company: string
  address: string
  description: string
  picture_url: string
  background_picture_url: string
  badge_picture_url: string
  is_hidden: boolean
}

type CropTarget = "profile" | "background" | "badge"

const inputBase =
  "w-full bg-transparent border-0 border-b border-dashed border-muted-foreground/20 text-center focus:border-foreground focus:outline-none transition-colors py-1.5"

interface ProfileEditFormProps {
  cardId?: string
}

export function ProfileEditForm({ cardId }: ProfileEditFormProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const { hasFeature } = useFeatures()

  const profileRef = useRef<HTMLInputElement>(null)
  const backgroundRef = useRef<HTMLInputElement>(null)
  const badgeRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [data, setData] = useState<ProfileData | null>(null)

  const [cropperOpen, setCropperOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState("")
  const [activeCropTarget, setActiveCropTarget] = useState<CropTarget>("profile")

  const [croppedProfile, setCroppedProfile] = useState<File | null>(null)
  const [profilePreview, setProfilePreview] = useState("")
  const [croppedBackground, setCroppedBackground] = useState<File | null>(null)
  const [backgroundPreview, setBackgroundPreview] = useState("")
  const [croppedBadge, setCroppedBadge] = useState<File | null>(null)
  const [badgePreview, setBadgePreview] = useState("")
  const [upgradeOpen, setUpgradeOpen] = useState(false)

  const apiEndpoint = cardId ? `/api/user/card-profile/${cardId}` : "/api/user"

  useEffect(() => {
    async function load() {
      try {
        const res = await apiClient.get<{ data: ProfileData }>(apiEndpoint)
        setData(res.data)
      } catch {
        if (cardId) {
          setData({
            name: "",
            title: "",
            company: "",
            address: "",
            description: "",
            picture_url: "",
            background_picture_url: "",
            badge_picture_url: "",
            is_hidden: false,
          })
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [apiEndpoint, cardId])

  async function handleFileSelect(
    e: React.ChangeEvent<HTMLInputElement>,
    target: CropTarget
  ) {
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

    setActiveCropTarget(target)
    setSelectedImage(URL.createObjectURL(file))
    setCropperOpen(true)
  }

  function handleCrop(file: File, base64: string) {
    if (activeCropTarget === "profile") {
      setCroppedProfile(file)
      setProfilePreview(base64)
    } else if (activeCropTarget === "background") {
      setCroppedBackground(file)
      setBackgroundPreview(base64)
    } else {
      setCroppedBadge(file)
      setBadgePreview(base64)
    }
    setCropperOpen(false)
    setSelectedImage("")
    const ref =
      activeCropTarget === "profile"
        ? profileRef
        : activeCropTarget === "background"
          ? backgroundRef
          : badgeRef
    if (ref.current) ref.current.value = ""
  }

  function handleCropperClose() {
    setCropperOpen(false)
    setSelectedImage("")
    profileRef.current && (profileRef.current.value = "")
    backgroundRef.current && (backgroundRef.current.value = "")
    badgeRef.current && (badgeRef.current.value = "")
  }

  async function compressImage(file: File, maxSize: number) {
    const imageCompression = (
      await import("browser-image-compression")
    ).default
    return imageCompression(file, {
      maxWidthOrHeight: maxSize,
      initialQuality: 0.8,
      useWebWorker: true,
    })
  }

  function updateField(key: keyof ProfileData, value: string | boolean) {
    setData((d) => (d ? { ...d, [key]: value } : d))
  }

  async function handleSave() {
    if (!data) return
    setError("")
    setSaving(true)

    try {
      const formData = new FormData()
      formData.append("name", data.name || "")
      formData.append("title", data.title || "")
      formData.append("company", data.company || "")
      formData.append("address", data.address || "")
      formData.append("description", data.description || "")

      if (cardId) {
        formData.append("is_hidden", data.is_hidden ? "1" : "0")
      }

      if (croppedProfile) {
        formData.append("profile_picture", await compressImage(croppedProfile, 720))
      }
      if (croppedBackground) {
        formData.append("background_picture", await compressImage(croppedBackground, 1080))
      }
      if (croppedBadge) {
        formData.append("badge_picture", await compressImage(croppedBadge, 200))
      }

      await apiClient.put(apiEndpoint, formData)
      router.push("/")
      router.refresh()
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code
      setError(code ? t(`errorCodes.${code}`) : t("errorCodes.1"))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingSpinner />

  const avatarSrc = profilePreview || data?.picture_url
  const bgSrc = backgroundPreview || data?.background_picture_url
  const badgeSrc = badgePreview || data?.badge_picture_url

  const cropperRounded = activeCropTarget !== "background"
  const cropperAspectRatio = activeCropTarget === "background" ? 3 / 2 : 1

  return (
    <>
      <AppHeader title={t("editProfile")} backButton />

      <div className="pb-8">
        {/* Background + Avatar + Badge */}
        <div className="relative">
          {/* Background */}
          <button
            onClick={() => {
              if (!hasFeature(FEATURES.BACKGROUND_PICTURE)) {
                setUpgradeOpen(true)
                return
              }
              backgroundRef.current?.click()
            }}
            className="group relative w-full h-48 overflow-hidden rounded-b-3xl bg-muted"
          >
            {bgSrc ? (
              <img
                src={bgSrc}
                alt="Background"
                className="size-full object-cover"
              />
            ) : (
              <div className="size-full bg-gradient-to-br from-muted to-muted-foreground/20" />
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="size-6 text-white" />
            </div>
            {!hasFeature(FEATURES.BACKGROUND_PICTURE) && (
              <div className="absolute top-3 right-3">
                <PremiumBadge size="sm" />
              </div>
            )}
          </button>
          <input
            ref={backgroundRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileSelect(e, "background")}
          />

          {/* Avatar - overlaps background */}
          <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
            <button
              onClick={() => profileRef.current?.click()}
              className="group relative size-40 overflow-hidden rounded-full bg-muted border-4 border-background shadow-lg"
            >
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt="Profile"
                  className="size-full object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center bg-foreground text-background text-3xl font-bold">
                  {data?.name?.charAt(0) || "?"}
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                <Upload className="size-5 text-white" />
              </div>
            </button>
            <input
              ref={profileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileSelect(e, "profile")}
            />

            {/* Badge - bottom-right of avatar */}
            <button
              onClick={() => {
                if (!hasFeature(FEATURES.BADGE_PICTURE)) {
                  setUpgradeOpen(true)
                  return
                }
                badgeRef.current?.click()
              }}
              className="group absolute -bottom-1 -right-1 size-10 overflow-hidden rounded-full bg-muted border-2 border-background"
            >
              {badgeSrc ? (
                <img
                  src={badgeSrc}
                  alt="Badge"
                  className="size-full object-cover"
                />
              ) : !hasFeature(FEATURES.BADGE_PICTURE) ? (
                <div className="flex size-full items-center justify-center bg-gradient-to-r from-yellow-500 to-amber-500">
                  <Crown className="size-3 text-white" />
                </div>
              ) : (
                <div className="flex size-full items-center justify-center bg-foreground/10">
                  <Upload className="size-3 text-muted-foreground" />
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                <Upload className="size-3 text-white" />
              </div>
            </button>
            <input
              ref={badgeRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileSelect(e, "badge")}
            />
          </div>
        </div>

        {/* Inline Editable Fields — card preview style */}
        <div className="px-6 text-center mt-20 space-y-1">
          <input
            value={data?.name || ""}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder={t("profileName")}
            className={`${inputBase} text-xl font-semibold tracking-tight`}
          />
          <input
            value={data?.title || ""}
            onChange={(e) => updateField("title", e.target.value)}
            placeholder={t("location_or_title")}
            className={`${inputBase} text-sm text-muted-foreground`}
          />
          <input
            value={data?.company || ""}
            onChange={(e) => updateField("company", e.target.value)}
            placeholder={t("company")}
            className={`${inputBase} text-xs text-muted-foreground/70`}
          />

          <div className="pt-2">
            <textarea
              value={data?.description || ""}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder={t("description")}
              rows={2}
              className={`${inputBase} text-sm text-muted-foreground leading-relaxed resize-none max-w-xs mx-auto`}
            />
          </div>

          <input
            value={data?.address || ""}
            onChange={(e) => updateField("address", e.target.value)}
            placeholder={t("address")}
            className={`${inputBase} text-xs text-muted-foreground/70`}
          />

          {/* is_hidden toggle — only for card profiles */}
          {cardId && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <span className="text-sm font-medium">{t("hideMyProfile")}</span>
              <Switch
                checked={data?.is_hidden || false}
                onCheckedChange={(checked) => updateField("is_hidden", checked)}
              />
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive text-left">
              {error}
            </div>
          )}

          <div className="pt-4">
            <Button
              className="w-full h-12"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {t("save")}
                </>
              ) : (
                t("save")
              )}
            </Button>
          </div>
        </div>
      </div>

      <ImageCropper
        open={cropperOpen}
        imageSrc={selectedImage}
        rounded={cropperRounded}
        aspectRatio={cropperAspectRatio}
        onCrop={handleCrop}
        onClose={handleCropperClose}
      />

      <UpgradeDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} />
    </>
  )
}
