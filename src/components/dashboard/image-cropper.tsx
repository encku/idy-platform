"use client"

import { useRef } from "react"
import { Cropper, CropperRef, CircleStencil } from "react-advanced-cropper"
import "react-advanced-cropper/dist/style.css"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/lib/i18n/context"

interface ImageCropperProps {
  open: boolean
  imageSrc: string
  rounded?: boolean
  aspectRatio?: number
  onCrop: (file: File, base64: string) => void
  onClose: () => void
}

function dataURLtoFile(dataurl: string, filename: string): File {
  const arr = dataurl.split(",")
  const mime = arr[0].match(/:(.*?);/)?.[1] || "image/png"
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) u8arr[n] = bstr.charCodeAt(n)
  return new File([u8arr], filename, { type: mime })
}

export function ImageCropper({
  open,
  imageSrc,
  rounded = false,
  aspectRatio = 1,
  onCrop,
  onClose,
}: ImageCropperProps) {
  const { t } = useTranslation()
  const cropperRef = useRef<CropperRef>(null)

  function handleCrop() {
    const canvas = cropperRef.current?.getCanvas()
    if (!canvas) return
    const base64 = canvas.toDataURL("image/jpeg", 0.9)
    const file = dataURLtoFile(base64, "cropped.jpg")
    onCrop(file, base64)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm p-4">
        <DialogHeader>
          <DialogTitle>{t("cropImage")}</DialogTitle>
        </DialogHeader>
        <div className="overflow-hidden rounded-lg bg-muted" style={{ maxHeight: "60vh" }}>
          <Cropper
            ref={cropperRef}
            src={imageSrc}
            stencilProps={{ aspectRatio }}
            stencilComponent={rounded ? CircleStencil : undefined}
            className="max-h-[60vh]"
          />
        </div>
        <div className="flex gap-2 mt-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button className="flex-1" onClick={handleCrop}>
            {t("crop")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
