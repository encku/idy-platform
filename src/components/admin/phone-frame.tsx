"use client"

import { type ReactNode } from "react"

interface PhoneFrameProps {
  children: ReactNode
  badge?: {
    label: string
    variant: "live" | "draft"
  }
}

export function PhoneFrame({ children, badge }: PhoneFrameProps) {
  return (
    <div className="relative w-[320px] h-[640px] rounded-[2.5rem] border-[6px] border-foreground/80 bg-background overflow-hidden shadow-2xl">
      {/* Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100px] h-[24px] bg-foreground/80 rounded-b-xl z-10" />

      {/* Badge */}
      {badge && (
        <div className="absolute top-[30px] right-2 z-20">
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold shadow-sm ${
              badge.variant === "live"
                ? "bg-green-500 text-white"
                : "bg-orange-500 text-white"
            }`}
          >
            {badge.label}
          </span>
        </div>
      )}

      {/* Content - scaled to simulate real mobile viewport */}
      <div className="h-full overflow-hidden">
        <div
          className="origin-top-left overflow-y-auto pt-[30px]"
          style={{
            width: 375,
            height: "calc(100% / 0.821)",
            transform: "scale(0.821)",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
