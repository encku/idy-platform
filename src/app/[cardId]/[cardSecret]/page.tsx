import { redirect } from "next/navigation"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default async function CardRegistrationPage({
  params,
}: {
  params: Promise<{ cardId: string; cardSecret: string }>
}) {
  const { cardId, cardSecret } = await params

  try {
    const res = await fetch(`${API_URL}/card/${cardId}`, {
      next: { revalidate: 0 },
    })

    if (!res.ok) {
      redirect(`/${cardId}`)
    }

    const json = await res.json()
    const card = json.data

    if (card.user_id === null) {
      // Card is unclaimed — redirect to register with card keys
      redirect(
        `/register?public_key=${encodeURIComponent(cardId)}&private_key=${encodeURIComponent(cardSecret)}`
      )
    }
  } catch (e) {
    // If it's a redirect, re-throw (Next.js uses errors for redirects)
    if (e && typeof e === "object" && "digest" in e) throw e
  }

  // Card is already claimed — show the public card view
  redirect(`/${cardId}`)
}
