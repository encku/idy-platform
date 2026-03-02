"use client"

import { GripVertical, Trash2 } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { motion, useMotionValue, animate } from "framer-motion"
import { apiClient } from "@/lib/api-client"

const DELETE_THRESHOLD = -80

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

  const x = useMotionValue(0)

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

  function handleDragEnd() {
    const currentX = x.get()
    if (currentX < DELETE_THRESHOLD / 2) {
      animate(x, DELETE_THRESHOLD, { type: "spring", stiffness: 300, damping: 30 })
    } else {
      animate(x, 0, { type: "spring", stiffness: 300, damping: 30 })
    }
  }

  function handleDeleteClick(e: React.MouseEvent) {
    e.stopPropagation()
    animate(x, 0, { type: "spring", stiffness: 300, damping: 30 })
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
      <motion.div
        style={{ x }}
        drag={readOnly ? false : "x"}
        dragConstraints={readOnly ? undefined : { left: DELETE_THRESHOLD, right: 0 }}
        dragElastic={0.1}
        onDragEnd={readOnly ? undefined : handleDragEnd}
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
          <img
            src={icon}
            alt={name}
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
      </motion.div>
    </div>
  )
}
