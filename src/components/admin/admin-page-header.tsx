"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

interface AdminPageHeaderProps {
  title: string
  subtitle?: string
  backHref?: string
  action?: {
    label: string
    icon?: React.ReactNode
    onClick: () => void
  }
}

export function AdminPageHeader({
  title,
  subtitle,
  backHref,
  action,
}: AdminPageHeaderProps) {
  const router = useRouter()

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        {backHref && (
          <Button
            variant="ghost"
            size="icon"
            className="mt-0.5 shrink-0"
            onClick={() => router.push(backHref)}
          >
            <ArrowLeft className="size-4" />
          </Button>
        )}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {subtitle && (
            <p className="text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
      </div>
      {action && (
        <Button onClick={action.onClick} className="shrink-0">
          {action.icon}
          {action.label}
        </Button>
      )}
    </div>
  )
}
