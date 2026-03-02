"use client"

import { useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ProfileEditForm } from "@/components/dashboard/profile-edit-form"
import { useAuth } from "@/lib/auth/context"

export default function EditCardProfilePage() {
  const { canEdit } = useAuth()
  const router = useRouter()
  const { cardId } = useParams<{ cardId: string }>()

  useEffect(() => {
    if (!canEdit) router.replace("/")
  }, [canEdit, router])

  if (!canEdit) return null

  return <ProfileEditForm cardId={cardId} />
}
