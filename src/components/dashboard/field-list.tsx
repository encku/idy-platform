"use client"

import { useState } from "react"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import { AnimatePresence, motion } from "framer-motion"
import { FieldListItem } from "./field-list-item"
import { apiClient } from "@/lib/api-client"
import { useRouter } from "next/navigation"
import { useTranslation } from "@/lib/i18n/context"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// We need this modifiers import - let's inline it
const modifiers = [restrictToVerticalAxis]

export interface FieldItem {
  id: number
  name: string
  icon: string
  isActive: boolean
  haveMultipleFields: boolean
}

interface FieldListProps {
  fields: FieldItem[]
  cardId: string
  isDirect: boolean
  onFieldsChange: (fields: FieldItem[]) => void
  readOnly?: boolean
}

export function FieldList({
  fields,
  cardId,
  isDirect,
  onFieldsChange,
  readOnly,
}: FieldListProps) {
  const router = useRouter()
  const { t } = useTranslation()

  const [deleteTarget, setDeleteTarget] = useState<FieldItem | null>(null)
  const [deleting, setDeleting] = useState(false)

  const activeSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  )
  const noSensors = useSensors()
  const sensors = readOnly ? noSensors : activeSensors

  function canSwitch(item: FieldItem) {
    if (isDirect) {
      if (item.haveMultipleFields) return false
      const activeCount = fields.filter((f) => f.isActive).length
      if (activeCount > 0 && !item.isActive) return false
    }
    return true
  }

  function handleActiveChange(id: number, active: boolean) {
    const updated = fields.map((f) =>
      isDirect
        ? { ...f, isActive: f.id === id ? active : false }
        : f.id === id
          ? { ...f, isActive: active }
          : f
    )
    onFieldsChange(updated)
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = fields.findIndex((f) => f.id === active.id)
    const newIndex = fields.findIndex((f) => f.id === over.id)
    const reordered = arrayMove(fields, oldIndex, newIndex)
    onFieldsChange(reordered)

    try {
      await apiClient.put(`/api/cards/${cardId}/fields`, {
        fields: reordered.map((f) => f.id),
      })
    } catch {
      onFieldsChange(fields)
    }
  }

  function handleDeleteRequest(id: number) {
    const field = fields.find((f) => f.id === id)
    if (field) setDeleteTarget(field)
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await apiClient.del(`/api/cards/${cardId}/fields/${deleteTarget.id}`)
      onFieldsChange(fields.filter((f) => f.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch {
      // Keep dialog open on error so user can retry
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={modifiers}
      >
        <SortableContext
          items={fields.map((f) => f.id)}
          strategy={verticalListSortingStrategy}
        >
          <AnimatePresence initial={false}>
            {fields.map((field) => (
              <motion.div
                key={field.id}
                layout
                exit={{ x: -400, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <FieldListItem
                  id={field.id}
                  name={field.name}
                  icon={field.icon}
                  isActive={field.isActive}
                  cardId={cardId}
                  isDirect={isDirect}
                  disableSwitch={!canSwitch(field)}
                  readOnly={readOnly}
                  onClick={readOnly ? undefined : () =>
                    router.push(`/card/${cardId}/edit/${field.id}`)
                  }
                  onActiveChange={handleActiveChange}
                  onDelete={readOnly ? undefined : handleDeleteRequest}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </SortableContext>
      </DndContext>

      {!readOnly && (
        <AlertDialog
          open={!!deleteTarget}
          onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("delete")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("deleteFieldMessage")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="bg-destructive text-white hover:bg-destructive/90"
              >
                {t("delete")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  )
}
