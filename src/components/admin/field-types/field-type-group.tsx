"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { FieldType } from "@/lib/admin/types"

interface FieldTypeGroupProps {
  groupName: string
  fieldTypes: FieldType[]
}

export function FieldTypeGroup({ groupName, fieldTypes }: FieldTypeGroupProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <Card>
      <CardHeader
        className="cursor-pointer select-none"
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            {collapsed ? (
              <ChevronRight className="size-4" />
            ) : (
              <ChevronDown className="size-4" />
            )}
            {groupName}
            <span className="text-sm font-normal text-muted-foreground">
              ({fieldTypes.length})
            </span>
          </CardTitle>
        </div>
      </CardHeader>
      {!collapsed && (
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {fieldTypes.map((ft) => (
              <div
                key={ft.id}
                className="flex items-center gap-3 rounded-lg border p-3"
              >
                {ft.icon_url ? (
                  <img src={ft.icon_url} alt="" className="size-6" />
                ) : (
                  <div className="size-6 rounded bg-muted flex items-center justify-center text-xs">
                    {ft.icon || ft.name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{ft.name}</p>
                  <p className="text-xs text-muted-foreground">ID: {ft.id}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  )
}
