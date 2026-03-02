"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { ProfileEditForm } from "@/components/dashboard/profile-edit-form"
import { useAuth } from "@/lib/auth/context"

export default function EditProfilePage() {
  const { canEdit } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!canEdit) router.replace("/")
  }, [canEdit, router])

  if (!canEdit) return null

  return <ProfileEditForm />
}
