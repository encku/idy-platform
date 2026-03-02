"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useTranslation } from "@/lib/i18n/context"
import { Mail, Phone, MapPin, CreditCard, Eye, EyeOff } from "lucide-react"
import type { AdminUser } from "@/lib/admin/types"

interface UserDetailCardProps {
  user: AdminUser & { phone?: string; location?: string }
}

export function UserDetailCard({ user }: UserDetailCardProps) {
  const { t } = useTranslation()

  return (
    <div className="rounded-lg border p-6 space-y-4">
      <div className="flex items-start gap-4">
        <Avatar className="size-16">
          <AvatarImage src={user.picture_url} alt={user.name} />
          <AvatarFallback className="text-lg">
            {user.name?.charAt(0) || "?"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-semibold truncate">{user.name}</h2>
          {user.title && (
            <p className="text-sm text-muted-foreground">{user.title}</p>
          )}
          <div className="flex items-center gap-2 mt-2">
            <Badge variant={user.role_name === "admin" ? "default" : "secondary"}>
              {user.role_name}
            </Badge>
            {user.is_hidden ? (
              <Badge variant="outline" className="gap-1">
                <EyeOff className="size-3" />
                {t("hidden")}
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1 text-green-600">
                <Eye className="size-3" />
                {t("active")}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {user.description && (
        <>
          <Separator />
          <p className="text-sm text-muted-foreground">{user.description}</p>
        </>
      )}

      <Separator />

      <div className="grid gap-3 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Mail className="size-4 shrink-0" />
          <span>{user.email}</span>
        </div>
        {user.phone && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="size-4 shrink-0" />
            <span>{user.phone}</span>
          </div>
        )}
        {user.location && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="size-4 shrink-0" />
            <span>{user.location}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-muted-foreground">
          <CreditCard className="size-4 shrink-0" />
          <span>
            {user.card_count} {t("cardCount")}
          </span>
        </div>
      </div>
    </div>
  )
}
