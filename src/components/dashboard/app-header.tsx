"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft, Share2, ExternalLink } from "lucide-react"

interface AppHeaderProps {
  title?: string
  backButton?: boolean
  shareUrl?: string
  previewUrl?: string
}

export function AppHeader({
  title,
  backButton,
  shareUrl,
  previewUrl,
}: AppHeaderProps) {
  const router = useRouter()

  function handleShare() {
    if (!shareUrl) return
    if (navigator.share) {
      navigator.share({ url: shareUrl }).catch(() => {})
    } else {
      window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}`, "_blank")
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
      {/* Left */}
      <div className="flex w-16 items-center">
        {backButton && (
          <button
            onClick={() => router.back()}
            className="flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-5" />
          </button>
        )}
        {!backButton && shareUrl && (
          <button
            onClick={handleShare}
            className="flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground transition-colors"
          >
            <Share2 className="size-5" />
          </button>
        )}
      </div>

      {/* Center */}
      <div className="flex flex-1 justify-center">
        {title ? (
          <span className="text-sm font-semibold tracking-tight">{title}</span>
        ) : (
          <div className="flex size-8 items-center justify-center rounded-lg bg-foreground text-background font-bold text-xs">
            id
          </div>
        )}
      </div>

      {/* Right */}
      <div className="flex w-16 items-center justify-end">
        {previewUrl && (
          <button
            onClick={() => window.open(previewUrl, "_blank")}
            className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ExternalLink className="size-4" />
          </button>
        )}
      </div>
    </header>
  )
}
