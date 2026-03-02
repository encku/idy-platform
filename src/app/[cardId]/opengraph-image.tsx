import { ImageResponse } from "next/og"
import {
  getCardProfile,
  fetchImageAsBase64,
  loadLogo,
  ProfileTemplate,
  FallbackTemplate,
} from "@/lib/og-template"

export const alt = "idycard Profile"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"
export const revalidate = 3600

export default async function Image({
  params,
}: {
  params: Promise<{ cardId: string }>
}) {
  const { cardId } = await params
  const [data, logoSrc] = await Promise.all([
    getCardProfile(cardId),
    loadLogo(),
  ])

  if (!data?.user) {
    return new ImageResponse(<FallbackTemplate logoSrc={logoSrc} />, {
      ...size,
    })
  }

  const avatarSrc = data.user.picture_url
    ? await fetchImageAsBase64(data.user.picture_url)
    : null

  return new ImageResponse(
    <ProfileTemplate
      user={data.user}
      avatarSrc={avatarSrc}
      logoSrc={logoSrc}
    />,
    { ...size }
  )
}
