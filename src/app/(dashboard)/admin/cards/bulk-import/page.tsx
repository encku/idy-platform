"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { apiClient } from "@/lib/api-client"
import { useTranslation } from "@/lib/i18n/context"
import { toast } from "sonner"
import { Upload, Plus, Trash2 } from "lucide-react"

interface ImportRow {
  public_key: string
  name: string
  email: string
}

export default function BulkImportPage() {
  const { t } = useTranslation()
  const [rows, setRows] = useState<ImportRow[]>([
    { public_key: "", name: "", email: "" },
  ])
  const [importing, setImporting] = useState(false)
  const [csvFile, setCsvFile] = useState<File | null>(null)

  function addRow() {
    setRows((prev) => [...prev, { public_key: "", name: "", email: "" }])
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index))
  }

  function updateRow(index: number, field: keyof ImportRow, value: string) {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    )
  }

  async function handleManualImport() {
    const validRows = rows.filter((r) => r.public_key && r.name)
    if (validRows.length === 0) return

    setImporting(true)
    try {
      await apiClient.post("/api/admin/cards/bulk-import", {
        cards: validRows.map((r) => ({
          public_key: r.public_key,
          name: r.name,
          email: r.email || undefined,
          fields: [],
        })),
      })
      toast.success(t("importSuccess"))
      setRows([{ public_key: "", name: "", email: "" }])
    } catch {
      toast.error(t("importFailed"))
    } finally {
      setImporting(false)
    }
  }

  async function handleCsvImport() {
    if (!csvFile) return
    setImporting(true)
    try {
      const formData = new FormData()
      formData.append("file", csvFile)
      await apiClient.post("/api/admin/cards/bulk-import/csv", formData)
      toast.success(t("importSuccess"))
      setCsvFile(null)
    } catch {
      toast.error(t("importFailed"))
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader title={t("bulkImport")} backHref="/admin/cards" />

      <Tabs defaultValue="manual">
        <TabsList>
          <TabsTrigger value="manual">{t("manualEntry")}</TabsTrigger>
          <TabsTrigger value="csv">{t("csvUpload")}</TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("manualEntry")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {rows.map((row, i) => (
                <div key={i} className="flex items-end gap-2">
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">{t("publicKey")}</Label>
                    <Input
                      value={row.public_key}
                      onChange={(e) => updateRow(i, "public_key", e.target.value)}
                      placeholder="abc123"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">{t("name")}</Label>
                    <Input
                      value={row.name}
                      onChange={(e) => updateRow(i, "name", e.target.value)}
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">{t("email")}</Label>
                    <Input
                      value={row.email}
                      onChange={(e) => updateRow(i, "email", e.target.value)}
                      type="email"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    onClick={() => removeRow(i)}
                    disabled={rows.length <= 1}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
              <div className="flex justify-between pt-2">
                <Button variant="outline" size="sm" onClick={addRow}>
                  <Plus className="size-4 mr-2" />
                  {t("addRow")}
                </Button>
                <Button onClick={handleManualImport} disabled={importing}>
                  {importing ? t("saving") : t("importCards")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="csv" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("csvUpload")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Upload className="size-8 mx-auto mb-3 text-muted-foreground" />
                <Input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                  className="max-w-xs mx-auto"
                />
                {csvFile && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {csvFile.name} ({(csvFile.size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={handleCsvImport}
                  disabled={!csvFile || importing}
                >
                  {importing ? t("saving") : t("uploadCsv")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
