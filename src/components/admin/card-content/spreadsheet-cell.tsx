"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Loader2, Check, X } from "lucide-react"

interface SpreadsheetCellProps {
  value: string
  fieldId: number | null
  cardPublicKey: string
  fieldTypeName: string
  isEmpty: boolean
  onSave: (
    cardPublicKey: string,
    fieldId: number,
    newValue: string
  ) => Promise<boolean>
}

export function SpreadsheetCell({
  value,
  fieldId,
  cardPublicKey,
  fieldTypeName,
  isEmpty,
  onSave,
}: SpreadsheetCellProps) {
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  function handleDoubleClick() {
    if (isEmpty || !fieldId) return
    setEditValue(value)
    setEditing(true)
  }

  async function handleSave() {
    if (editValue === value) {
      setEditing(false)
      return
    }

    setSaving(true)
    const success = await onSave(cardPublicKey, fieldId!, editValue)
    setSaving(false)

    if (success) {
      setSaved(true)
      setEditing(false)
      setTimeout(() => setSaved(false), 1500)
    }
  }

  function handleCancel() {
    setEditValue(value)
    setEditing(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      handleSave()
    } else if (e.key === "Escape") {
      handleCancel()
    }
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <Input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          className="h-7 text-xs px-2 min-w-[120px]"
          disabled={saving}
        />
        {saving && <Loader2 className="size-3 animate-spin shrink-0" />}
      </div>
    )
  }

  return (
    <div
      onDoubleClick={handleDoubleClick}
      className={cn(
        "px-2 py-1 text-xs truncate max-w-[200px] rounded transition-colors",
        isEmpty
          ? "bg-muted/50 text-muted-foreground/40 italic cursor-default"
          : "cursor-pointer hover:bg-muted/80",
        saved && "bg-emerald-50 dark:bg-emerald-950/30"
      )}
      title={isEmpty ? `${fieldTypeName}: -` : value}
    >
      {saved ? (
        <span className="flex items-center gap-1 text-emerald-600">
          <Check className="size-3" />
          {editValue}
        </span>
      ) : isEmpty ? (
        "-"
      ) : (
        value
      )}
    </div>
  )
}
