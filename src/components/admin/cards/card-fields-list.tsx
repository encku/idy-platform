"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useTranslation } from "@/lib/i18n/context"
import type { AdminCardField } from "@/lib/admin/types"

interface CardFieldsListProps {
  fields: AdminCardField[]
}

export function CardFieldsList({ fields }: CardFieldsListProps) {
  const { t } = useTranslation()

  if (fields.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4">{t("noResults")}</p>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead>{t("fieldType")}</TableHead>
            <TableHead>{t("fieldName")}</TableHead>
            <TableHead>{t("fieldValue")}</TableHead>
            <TableHead>{t("status")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fields.map((field) => (
            <TableRow key={field.id}>
              <TableCell className="text-muted-foreground">
                {field.order}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {field.field_type.icon_url && (
                    <img
                      src={field.field_type.icon_url}
                      alt=""
                      className="size-4"
                    />
                  )}
                  <span className="text-sm">{field.field_type.name}</span>
                </div>
              </TableCell>
              <TableCell className="font-medium">{field.name}</TableCell>
              <TableCell className="max-w-xs truncate text-muted-foreground">
                {field.data}
              </TableCell>
              <TableCell>
                {field.is_active ? (
                  <Badge variant="outline">{t("active")}</Badge>
                ) : (
                  <Badge variant="secondary">{t("hidden")}</Badge>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
