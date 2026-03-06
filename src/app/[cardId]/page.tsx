import { notFound } from "next/navigation"
import type { Metadata } from "next"
import type { CardProfileResponse, LeadSettings } from "@/lib/types"
import { CardContent } from "./card-content"

const API_URL = process.env.NEXT_PUBLIC_API_URL

async function getCardProfile(
  cardId: string
): Promise<CardProfileResponse | null> {
  try {
    const res = await fetch(`${API_URL}/card/${cardId}/profile`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return null
    const json = await res.json()
    return json.data as CardProfileResponse
  } catch {
    return null
  }
}

async function getLeadSettings(
  cardId: string
): Promise<LeadSettings | null> {
  try {
    const res = await fetch(`${API_URL}/card/${cardId}/lead-form`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return null
    const json = await res.json()
    return json.data as LeadSettings
  } catch {
    return null
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ cardId: string }>
}): Promise<Metadata> {
  const { cardId } = await params
  const data = await getCardProfile(cardId)

  if (!data || data.user.is_hidden) {
    return { title: "Not Found | idycard" }
  }

  const { user } = data
  const title = `${user.name} | idycard`
  const description =
    user.description ||
    [user.title, user.company].filter(Boolean).join(" - ") ||
    "Digital Business Card"

  return {
    title,
    description,
    robots: {
      index: false,
      follow: false,
    },
    alternates: {
      canonical: `/${cardId}`,
    },
    openGraph: {
      title: user.name,
      description,
      type: "profile",
      url: `/${cardId}`,
      siteName: "idycard",
    },
    twitter: {
      card: "summary_large_image",
      title: user.name,
      description,
    },
  }
}

export default async function CardPage({
  params,
}: {
  params: Promise<{ cardId: string }>
}) {
  const { cardId } = await params
  const [data, leadSettings] = await Promise.all([
    getCardProfile(cardId),
    getLeadSettings(cardId),
  ])

  if (!data || data.user.is_hidden) {
    notFound()
  }

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            name: data.user.name,
            ...(data.user.title && { jobTitle: data.user.title }),
            ...(data.user.company && {
              worksFor: {
                "@type": "Organization",
                name: data.user.company,
              },
            }),
            ...(data.user.description && {
              description: data.user.description,
            }),
            ...(data.user.picture_url && { image: data.user.picture_url }),
          }).replace(/</g, "\\u003c"),
        }}
      />

      <CardContent
        profile={data.user}
        fields={data.card}
        leadSettings={leadSettings}
        cardId={cardId}
      />
    </>
  )
}
