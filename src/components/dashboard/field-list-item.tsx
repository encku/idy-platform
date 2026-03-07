"use client"

import { useRef } from "react"
import Image from "next/image"
import { GripVertical, Trash2 } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { apiClient } from "@/lib/api-client"

const DELETE_THRESHOLD = -80
const SPRING_EASE = "cubic-bezier(0.22, 1, 0.36, 1)"

interface FieldListItemProps {
  id: number
  name: string
  icon: string
  isActive: boolean
  cardId: string
  isDirect: boolean
  disableSwitch: boolean
  readOnly?: boolean
  onClick?: () => void
  onActiveChange: (id: number, active: boolean) => void
  onDelete?: (id: number) => void
}

export function FieldListItem({
  id,
  name,
  icon,
  isActive,
  cardId,
  isDirect,
  disableSwitch,
  readOnly,
  onClick,
  onActiveChange,
  onDelete,
}: FieldListItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: readOnly })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const swipeRef = useRef<HTMLDivElement>(null)
  const touchStart = useRef({ x: 0, y: 0 })
  const currentOffset = useRef(0)
  const direction = useRef<"none" | "horizontal" | "vertical">("none")

  function animateTo(target: number) {
    const el = swipeRef.current
    if (!el) return
    el.style.transition = `transform 0.3s ${SPRING_EASE}`
    el.style.transform = `translateX(${target}px)`
    currentOffset.current = target
  }

  function handleTouchStart(e: React.TouchEvent) {
    const touch = e.touches[0]
    touchStart.current = { x: touch.clientX, y: touch.clientY }
    direction.current = "none"
    if (swipeRef.current) swipeRef.current.style.transition = "none"
  }

  function handleTouchMove(e: React.TouchEvent) {
    const touch = e.touches[0]
    const dx = touch.clientX - touchStart.current.x
    const dy = touch.clientY - touchStart.current.y

    if (direction.current === "none") {
      if (Math.abs(dx) < 5 && Math.abs(dy) < 5) return
      direction.current = Math.abs(dx) > Math.abs(dy) ? "horizontal" : "vertical"
    }

    if (direction.current !== "horizontal") return

    let newX = currentOffset.current + dx
    if (newX < DELETE_THRESHOLD) {
      newX = DELETE_THRESHOLD + (newX - DELETE_THRESHOLD) * 0.1
    } else if (newX > 0) {
      newX = newX * 0.1
    }

    if (swipeRef.current) {
      swipeRef.current.style.transform = `translateX(${newX}px)`
    }
  }

  function handleTouchEnd() {
    if (direction.current !== "horizontal") return
    const el = swipeRef.current
    if (!el) return
    const match = el.style.transform.match(/translateX\(([-\d.]+)px\)/)
    const x = match ? parseFloat(match[1]) : 0
    animateTo(x < DELETE_THRESHOLD / 2 ? DELETE_THRESHOLD : 0)
  }

  async function handleToggle(checked: boolean) {
    onActiveChange(id, checked)
    try {
      if (isDirect) {
        if (checked) {
          await apiClient.post(`/api/cards/${cardId}/direct-mode`, {
            card_field_id: id,
          })
        }
      } else {
        await apiClient.put(`/api/cards/${cardId}/fields/${id}/active`, {
          is_active: checked,
        })
      }
    } catch {
      onActiveChange(id, !checked)
    }
  }

  function handleDeleteClick(e: React.MouseEvent) {
    e.stopPropagation()
    animateTo(0)
    onDelete?.(id)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative overflow-hidden rounded-2xl my-2"
    >
      {/* Delete button layer (behind) */}
      {!readOnly && (
        <div className="absolute inset-y-0 right-0 flex items-center">
          <button
            onClick={handleDeleteClick}
            className="flex h-full w-20 items-center justify-center bg-destructive text-white rounded-r-2xl"
          >
            <Trash2 className="size-5" />
          </button>
        </div>
      )}

      {/* Swipeable foreground */}
      <div
        ref={swipeRef}
        onTouchStart={readOnly ? undefined : handleTouchStart}
        onTouchMove={readOnly ? undefined : handleTouchMove}
        onTouchEnd={readOnly ? undefined : handleTouchEnd}
        className="relative flex items-center gap-2 rounded-2xl bg-card p-3 shadow-sm"
      >
        {!readOnly && (
          <button
            className="flex size-8 shrink-0 cursor-grab items-center justify-center text-muted-foreground touch-none"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="size-5" />
          </button>
        )}

        <div
          className="flex flex-1 items-center gap-3"
          onClick={onClick}
          role={onClick ? "button" : undefined}
        >
          <Image
            src={icon}
            alt={name}
            width={44}
            height={44}
            className="size-11 shrink-0 rounded-lg object-contain"
          />
          <span className="flex-1 text-sm font-medium text-left">{name}</span>
        </div>

        <div onClick={(e) => e.stopPropagation()}>
          <Switch
            checked={isActive}
            onCheckedChange={handleToggle}
            disabled={readOnly || disableSwitch}
          />
        </div>
      </div>
    </div>
  )
}
