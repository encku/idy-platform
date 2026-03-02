"use client"

import { useCallback, useRef, useState } from "react"
import { Loader2, ArrowDown } from "lucide-react"

interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  children: React.ReactNode
}

const THRESHOLD = 80

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const startY = useRef(0)
  const pulling = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (refreshing) return
      const scrollTop = containerRef.current?.scrollTop ?? 0
      if (scrollTop <= 0) {
        startY.current = e.touches[0].clientY
        pulling.current = true
      }
    },
    [refreshing]
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!pulling.current || refreshing) return
      const delta = e.touches[0].clientY - startY.current
      if (delta > 0) {
        // Dampen the pull distance
        const dampened = Math.min(delta * 0.5, THRESHOLD * 1.5)
        setPullDistance(dampened)
      } else {
        pulling.current = false
        setPullDistance(0)
      }
    },
    [refreshing]
  )

  const handleTouchEnd = useCallback(async () => {
    if (!pulling.current) return
    pulling.current = false

    if (pullDistance >= THRESHOLD) {
      setRefreshing(true)
      setPullDistance(THRESHOLD * 0.6)
      try {
        await onRefresh()
      } finally {
        setRefreshing(false)
        setPullDistance(0)
      }
    } else {
      setPullDistance(0)
    }
  }, [pullDistance, onRefresh])

  const progress = Math.min(pullDistance / THRESHOLD, 1)

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative"
    >
      {/* Pull indicator */}
      <div
        className="flex items-center justify-center overflow-hidden transition-[height] duration-200"
        style={{
          height: pullDistance > 0 || refreshing ? `${pullDistance}px` : 0,
          transitionDuration: pulling.current ? "0ms" : "200ms",
        }}
      >
        {refreshing ? (
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        ) : (
          <ArrowDown
            className="size-5 text-muted-foreground transition-transform duration-200"
            style={{
              opacity: progress,
              transform: `rotate(${progress >= 1 ? 180 : 0}deg)`,
            }}
          />
        )}
      </div>

      {children}
    </div>
  )
}
