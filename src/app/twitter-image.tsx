import { ImageResponse } from "next/og"
import { loadLogo, BrandedTemplate } from "@/lib/og-template"

export const alt = "idycard - Digital Business Card Platform"
export const size = { width: 1200, height: 675 }
export const contentType = "image/png"

export default async function Image() {
  const logoSrc = await loadLogo()

  return new ImageResponse(<BrandedTemplate logoSrc={logoSrc} />, { ...size })
}
