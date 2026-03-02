import { Crown } from "lucide-react"

interface PremiumBadgeProps {
  size?: "sm" | "md"
  className?: string
}

export function PremiumBadge({ size = "md", className = "" }: PremiumBadgeProps) {
  const sizeClasses = {
    sm: "text-[9px] px-1.5 py-0.5 gap-0.5",
    md: "text-[10px] px-2 py-0.5 gap-1",
  }

  const iconSize = size === "sm" ? "size-2.5" : "size-3"

  return (
    <span
      className={`inline-flex items-center rounded-full font-bold uppercase tracking-wider bg-gradient-to-r from-yellow-500 to-amber-500 text-white ${sizeClasses[size]} ${className}`}
    >
      <Crown className={iconSize} />
      PRO
    </span>
  )
}
