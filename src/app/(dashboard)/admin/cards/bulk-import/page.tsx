"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { apiClient } from "@/lib/api-client"
import { useTranslation } from "@/lib/i18n/context"
import { toast } from "sonner"
import {
  Upload,
  Plus,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  X,
  FileSpreadsheet,
  Zap,
} from "lucide-react"
import type { BulkImportPayload } from "@/lib/admin/types"

// ─── Types ───

interface FieldType {
  id: number
  name: string
  icon_url?: string
}

interface SelectedFieldType extends FieldType {
  uniqueId: string
  displayName: string
  fieldName?: string
  fromCSV?: boolean
}

interface TableRowData {
  rowNumber: number
  publicKey: string
  name: string
  company: string
  title: string
  fields: Record<string, string>
  errors: Record<string, string>
  warnings: Record<string, string>
  serverStatus: CardStatus | null
  emailStatus: EmailStatus | null
  isValid: boolean
}

interface CardStatus {
  public_key: string
  exists: boolean
  assigned_user_id?: number
  assigned_user_name?: string
  assigned_company_id?: number
}

interface EmailStatus {
  email: string
  exists: boolean
  has_card: boolean
  user_id?: number
  user_name?: string
}

interface CompanyOption {
  value: number
  label: string
}

interface UserOption {
  value: number
  label: string
}

// ─── Constants ───

const CARD_TYPES = [
  { id: 1, key: "cardTypeCard" },
  { id: 2, key: "cardTypeTag" },
  { id: 3, key: "cardTypePhoneCard" },
] as const

const CARD_COLORS = [
  { id: 1, key: "colorBlack" },
  { id: 2, key: "colorWhite" },
  { id: 3, key: "colorHologram" },
  { id: 4, key: "colorBlue" },
  { id: 5, key: "colorGreen" },
  { id: 6, key: "colorPink" },
  { id: 7, key: "colorGray" },
] as const

// ─── Helpers ───

const FIELD_PREFIXES: Record<number, string[]> = {
  3: [
    "https://www.instagram.com/",
    "https://instagram.com/",
    "http://www.instagram.com/",
    "http://instagram.com/",
    "instagram.com/",
    "@",
  ],
  20: [
    "https://www.facebook.com/",
    "https://facebook.com/",
    "http://www.facebook.com/",
    "http://facebook.com/",
    "facebook.com/",
  ],
  8: [
    "https://www.youtube.com/",
    "https://youtube.com/",
    "http://www.youtube.com/",
    "http://youtube.com/",
    "youtube.com/",
  ],
  9: [
    "https://www.x.com/",
    "https://x.com/",
    "https://www.twitter.com/",
    "https://twitter.com/",
    "http://www.twitter.com/",
    "http://twitter.com/",
    "twitter.com/",
    "x.com/",
    "@",
  ],
  46: [
    "https://www.linkedin.com/",
    "https://linkedin.com/",
    "http://www.linkedin.com/",
    "http://linkedin.com/",
    "linkedin.com/",
  ],
}

function stripFieldPrefix(value: string, fieldTypeId: number): string {
  if (!value) return value
  let v = value.trim()
  const prefixes = FIELD_PREFIXES[fieldTypeId] || []
  for (const prefix of prefixes) {
    if (v.toLowerCase().startsWith(prefix.toLowerCase())) {
      v = v.substring(prefix.length)
      break
    }
  }
  return v.replace(/\/+$/, "").trim()
}

function validateEmail(email: string): boolean {
  if (!email) return true
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validateURL(url: string): boolean {
  if (!url) return true
  try {
    new URL(url.startsWith("http") ? url : `https://${url}`)
    return true
  } catch {
    return false
  }
}

function validatePhone(phone: string): boolean {
  if (!phone) return true
  const cleaned = phone.replace(/[\s()\-]/g, "")
  return /^(\+?90|0)?[0-9]{10}$/.test(cleaned)
}

function parseLine(line: string, delimiter = ","): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = line[i + 1]

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim())
      current = ""
    } else {
      current += char
    }
  }
  result.push(current.trim())
  return result
}

function getFieldTypeIdFromKey(
  key: string,
  selectedFieldTypes: SelectedFieldType[]
): number | null {
  const ft = selectedFieldTypes.find((f) => f.uniqueId === key)
  if (ft) return ft.id

  const parsed = parseInt(key)
  if (!isNaN(parsed)) return parsed

  const parts = key.split("_")
  if (parts.length > 0) {
    const id = parseInt(parts[0])
    if (!isNaN(id)) return id
  }
  return null
}

// ─── Quick Create Tab ───

function QuickCreateTab({
  companies,
  fetchUsers,
}: {
  companies: CompanyOption[]
  fetchUsers: (companyId?: number) => Promise<void>
}) {
  const { t } = useTranslation()

  const [publicKeysText, setPublicKeysText] = useState("")
  const [selectedCardType, setSelectedCardType] = useState("1")
  const [selectedColor, setSelectedColor] = useState("1")
  const [selectedCompany, setSelectedCompany] = useState("")
  const [selectedUser, setSelectedUser] = useState("")
  const [users, setLocalUsers] = useState<UserOption[]>([])
  const [creating, setCreating] = useState(false)
  const [quickName, setQuickName] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch users when company changes
  useEffect(() => {
    setSelectedUser("")
    setLocalUsers([])
    if (selectedCompany) {
      const companyId = parseInt(selectedCompany)
      apiClient
        .get<{
          data: Array<{
            id: number
            name: string
            email: string
            card_count?: number
            role_name?: string
          }>
        }>(`/api/admin/users?limit=100&page=1&company_id=${companyId}`)
        .then((res) => {
          setLocalUsers(
            (res.data || []).map((u) => {
              let label = `${u.name} (${u.email})`
              if (u.card_count !== undefined) label += ` - ${u.card_count} kart`
              if (u.role_name?.trim()) label += ` [${u.role_name}]`
              return { value: u.id, label }
            })
          )
        })
        .catch(() => {})
    }
  }, [selectedCompany, fetchUsers])

  const publicKeys = publicKeysText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      // If CSV with multiple columns, take first column
      const lines = text.split("\n").filter((l) => l.trim())
      const keys: string[] = []
      for (const line of lines) {
        let key = line.trim()
        // Handle CSV format - take first column
        if (key.includes(",") || key.includes(";") || key.includes("\t")) {
          const delim = key.includes("\t") ? "\t" : key.includes(";") ? ";" : ","
          key = key.split(delim)[0].trim()
        }
        // Extract from URL
        if (key.includes("id.idycard.com/")) {
          const parts = key.split("id.idycard.com/")
          if (parts.length > 1) key = parts[1]
        }
        // Remove quotes
        key = key.replace(/^["']|["']$/g, "").trim()
        if (key) keys.push(key)
      }
      setPublicKeysText(keys.join("\n"))
      toast.success(`${keys.length} public key yüklendi`)
    }
    reader.readAsText(file)
  }

  async function handleQuickCreate() {
    if (publicKeys.length === 0) {
      toast.error("En az bir public key girin")
      return
    }

    // Check for duplicates
    const uniqueKeys = [...new Set(publicKeys)]
    if (uniqueKeys.length < publicKeys.length) {
      toast.warning(
        `${publicKeys.length - uniqueKeys.length} tekrarlanan public key silindi`
      )
    }

    setCreating(true)
    try {
      const payload: BulkImportPayload = {
        company_id: selectedCompany ? parseInt(selectedCompany) : null,
        user_id: selectedUser ? parseInt(selectedUser) : null,
        assign_to_individual_users: false,
        card_type_id: parseInt(selectedCardType),
        color_id: parseInt(selectedColor),
        cards: uniqueKeys.map((pk) => ({
          public_key: pk,
          name: quickName || pk,
          fields: [],
        })),
      }

      const res = await apiClient.post<{
        created_cards: number
        updated_cards: number
        errors?: string[]
      }>("/api/admin/cards/bulk-import", payload)

      toast.success(
        `${res.created_cards} kart oluşturuldu, ${res.updated_cards} kart güncellendi`
      )

      if (res.errors?.length) console.warn("Import errors:", res.errors)

      // Reset
      setPublicKeysText("")
      setQuickName("")
      if (fileInputRef.current) fileInputRef.current.value = ""
    } catch (err) {
      console.error("Quick create error:", err)
      toast.error(
        (err as { message?: string })?.message ||
          "Kartlar oluşturulurken bir hata oluştu"
      )
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Card Type & Color Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {t("cardType")} / {t("cardColor")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">{t("cardType")}</Label>
              <Select value={selectedCardType} onValueChange={setSelectedCardType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CARD_TYPES.map((ct) => (
                    <SelectItem key={ct.id} value={String(ct.id)}>
                      {t(ct.key)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">{t("cardColor")}</Label>
              <Select value={selectedColor} onValueChange={setSelectedColor}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CARD_COLORS.map((cc) => (
                    <SelectItem key={cc.id} value={String(cc.id)}>
                      {t(cc.key)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">{t("company")}</Label>
              <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                <SelectTrigger>
                  <SelectValue placeholder={t("selectCompany")} />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((c) => (
                    <SelectItem key={c.value} value={String(c.value)}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">{t("selectUser")}</Label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder={t("selectUser")} />
                </SelectTrigger>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u.value} value={String(u.value)}>
                      {u.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Public Keys Input */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("publicKeys")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">{t("name")} ({t("optional")})</Label>
            <Input
              value={quickName}
              onChange={(e) => setQuickName(e.target.value)}
              placeholder="Tüm kartlar için ortak isim (boş bırakılırsa public key kullanılır)"
            />
          </div>

          <Textarea
            value={publicKeysText}
            onChange={(e) => setPublicKeysText(e.target.value)}
            placeholder={t("publicKeysPlaceholder")}
            rows={10}
            className="font-mono text-sm"
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.tsv,.txt,text/plain,text/csv"
                onChange={handleFileUpload}
                className="text-sm file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
              />
              {publicKeys.length > 0 && (
                <Badge variant="secondary">
                  {publicKeys.length} public key
                </Badge>
              )}
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            {t("quickCreateHint")}
          </p>

          {/* Preview table for entered keys */}
          {publicKeys.length > 0 && (
            <>
              <Separator />
              <div className="overflow-x-auto border rounded-md max-h-[300px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12 text-center">#</TableHead>
                      <TableHead>Public Key</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {publicKeys.map((pk, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-center text-xs text-muted-foreground">
                          {i + 1}
                        </TableCell>
                        <TableCell className="font-mono text-sm">{pk}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}

          {/* Create Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleQuickCreate}
              disabled={creating || publicKeys.length === 0}
              size="lg"
            >
              {creating ? (
                <>
                  <RefreshCw className="size-4 mr-2 animate-spin" />
                  {t("saving")}
                </>
              ) : (
                <>
                  <Zap className="size-4 mr-2" />
                  {t("createCards")} ({publicKeys.length})
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Main Component ───

export default function BulkImportPage() {
  const { t } = useTranslation()

  // Company/User Selection
  const [selectedCompany, setSelectedCompany] = useState<string>("")
  const [selectedUser, setSelectedUser] = useState<string>("")
  const [assignToIndividualUsers, setAssignToIndividualUsers] = useState(false)
  const [userPassword, setUserPassword] = useState("")
  const [companies, setCompanies] = useState<CompanyOption[]>([])
  const [users, setUsers] = useState<UserOption[]>([])

  // Field Types
  const [fieldTypes, setFieldTypes] = useState<FieldType[]>([])
  const [selectedFieldType, setSelectedFieldType] = useState<string>("")
  const [selectedFieldTypes, setSelectedFieldTypes] = useState<
    SelectedFieldType[]
  >([])
  const [csvFieldNames, setCsvFieldNames] = useState<Record<string, string>>({})

  // Table Data
  const [tableRows, setTableRows] = useState<TableRowData[]>([
    {
      rowNumber: 1,
      publicKey: "",
      name: "",
      company: "",
      title: "",
      fields: {},
      errors: {},
      warnings: {},
      serverStatus: null,
      emailStatus: null,
      isValid: true,
    },
  ])

  // CSV
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvParseErrors, setCsvParseErrors] = useState<string[]>([])

  // Loading States
  const [loadingFieldTypes, setLoadingFieldTypes] = useState(false)
  const [importingCards, setImportingCards] = useState(false)
  const [checkingStatus, setCheckingStatus] = useState(false)

  // Refs
  const validateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const selectedFieldTypesRef = useRef(selectedFieldTypes)
  selectedFieldTypesRef.current = selectedFieldTypes

  // ─── Fetch Field Types ───

  const fetchFieldTypes = useCallback(async () => {
    setLoadingFieldTypes(true)
    try {
      const res = await apiClient.get<{
        data: Array<{ fields: Array<Record<string, unknown>> }>
      }>("/api/admin/field-types/groups")
      const allTypes: FieldType[] = []
      res.data?.forEach((group) => {
        group.fields?.forEach((field) => {
          allTypes.push({
            id: field.id as number,
            name: field.name as string,
            icon_url: (field.icon_url || field.iconUrl || "") as string,
          })
        })
      })
      setFieldTypes(allTypes)
      return allTypes
    } catch (err) {
      console.error("Error fetching field types:", err)
      return []
    } finally {
      setLoadingFieldTypes(false)
    }
  }, [])

  // ─── Fetch Companies ───

  const fetchCompanies = useCallback(async () => {
    try {
      const res = await apiClient.get<{
        data: Array<{ id: number; name: string }>
      }>("/api/admin/companies?limit=100&page=1")
      setCompanies(
        (res.data || []).map((c) => ({ value: c.id, label: c.name }))
      )
    } catch (err) {
      console.error("Error fetching companies:", err)
    }
  }, [])

  // ─── Fetch Users ───

  const fetchUsers = useCallback(async (companyId?: number) => {
    try {
      const query = companyId
        ? `?limit=100&page=1&company_id=${companyId}`
        : "?limit=100&page=1"
      const res = await apiClient.get<{
        data: Array<{
          id: number
          name: string
          email: string
          card_count?: number
          role_name?: string
        }>
      }>(`/api/admin/users${query}`)
      setUsers(
        (res.data || []).map((u) => {
          let label = `${u.name} (${u.email})`
          if (u.card_count !== undefined) label += ` - ${u.card_count} kart`
          if (u.role_name?.trim()) label += ` [${u.role_name}]`
          return { value: u.id, label }
        })
      )
    } catch (err) {
      console.error("Error fetching users:", err)
    }
  }, [])

  // ─── Init ───

  useEffect(() => {
    fetchFieldTypes()
    fetchCompanies()
  }, [fetchFieldTypes, fetchCompanies])

  // ─── Company Change → reload users ───

  useEffect(() => {
    setSelectedUser("")
    setUsers([])
    if (selectedCompany) {
      fetchUsers(parseInt(selectedCompany))
    }
  }, [selectedCompany, fetchUsers])

  // ─── Validate Rows (stable) ───

  const doValidateRows = useCallback(
    (
      rows: TableRowData[],
      sft: SelectedFieldType[],
      indivMode: boolean,
      selUser: string
    ): TableRowData[] => {
      const pkCount: Record<string, number> = {}
      const duplicatePks = new Set<string>()
      rows.forEach((row) => {
        if (row.publicKey?.trim()) {
          const key = row.publicKey.trim().toLowerCase()
          pkCount[key] = (pkCount[key] || 0) + 1
          if (pkCount[key] > 1) duplicatePks.add(key)
        }
      })

      return rows.map((row) => {
        const errors: Record<string, string> = {}
        const warnings: Record<string, string> = {}
        let isValid = true

        // Public Key
        if (!row.publicKey?.trim()) {
          errors.publicKey = "Public key zorunludur"
          isValid = false
        } else if (row.publicKey.length < 3) {
          errors.publicKey = "Public key çok kısa"
          isValid = false
        } else if (duplicatePks.has(row.publicKey.trim().toLowerCase())) {
          errors.publicKey = `Bu public key ${pkCount[row.publicKey.trim().toLowerCase()]} kez kullanılmış`
          isValid = false
        } else if (row.serverStatus) {
          if (
            !indivMode &&
            selUser &&
            row.serverStatus.assigned_user_id
          ) {
            const assignedId = Number(row.serverStatus.assigned_user_id)
            const selectedId = Number(selUser)
            if (assignedId === selectedId) {
              warnings.publicKey = "Kart zaten bu kullanıcıya atanmış"
            } else {
              errors.publicKey = `Kart başka bir kullanıcıya atanmış (${row.serverStatus.assigned_user_name || "ID: " + assignedId})`
              isValid = false
            }
          } else if (
            row.serverStatus.assigned_user_id &&
            indivMode
          ) {
            errors.publicKey = `Kart zaten bir kullanıcıya atanmış (${row.serverStatus.assigned_user_name || "ID: " + row.serverStatus.assigned_user_id})`
            isValid = false
          } else if (
            row.serverStatus.exists &&
            row.serverStatus.assigned_company_id &&
            !row.serverStatus.assigned_user_id
          ) {
            warnings.publicKey = "Zaten bir şirkete atanmış"
          } else if (
            row.serverStatus.exists &&
            !row.serverStatus.assigned_user_id &&
            !row.serverStatus.assigned_company_id
          ) {
            warnings.publicKey = "Kart mevcut, güncellenecek"
          } else if (!row.serverStatus.exists) {
            warnings.publicKey = "Yeni kart oluşturulacak"
          }
        }

        // Name
        if (!row.name?.trim()) {
          errors.name = "İsim zorunludur"
          isValid = false
        }

        // Email status (individual users mode)
        if (indivMode && row.emailStatus) {
          Object.entries(row.fields).forEach(([fieldKey, data]) => {
            if (!data) return
            const ftId = getFieldTypeIdFromKey(fieldKey, sft)
            if (ftId !== 19) return
            if (row.emailStatus!.exists && row.emailStatus!.has_card) {
              errors[`field_${fieldKey}`] = `Bu email zaten kayıtlı (${row.emailStatus!.user_name})`
              isValid = false
            } else if (row.emailStatus!.exists && !row.emailStatus!.has_card) {
              warnings[`field_${fieldKey}`] = `Mevcut kullanıcıya kart atanacak (${row.emailStatus!.user_name})`
            } else if (!row.emailStatus!.exists) {
              warnings[`field_${fieldKey}`] = "Yeni kullanıcı oluşturulacak"
            }
          })
        }

        // Email required check
        if (indivMode) {
          let hasEmail = false
          Object.entries(row.fields).forEach(([fieldKey, data]) => {
            if (!data) return
            const ftId = getFieldTypeIdFromKey(fieldKey, sft)
            if (ftId === 19 && data.trim()) hasEmail = true
          })
          if (!hasEmail) {
            errors.email = "Email zorunludur (Her kart ayrı kullanıcıya modu)"
            isValid = false
            Object.keys(row.fields).forEach((fieldKey) => {
              const ftId = getFieldTypeIdFromKey(fieldKey, sft)
              if (ftId === 19) errors[`field_${fieldKey}`] = "Email zorunludur"
            })
          }
        }

        // Field validations
        Object.entries(row.fields).forEach(([fieldKey, value]) => {
          if (!value?.trim()) return
          const ftId = getFieldTypeIdFromKey(fieldKey, sft)
          if (!ftId) return
          if (ftId === 19 && !validateEmail(value)) {
            errors[`field_${fieldKey}`] = "Geçersiz e-posta adresi"
            isValid = false
          }
          if (ftId === 15 && !validateURL(value)) {
            errors[`field_${fieldKey}`] = "Geçersiz URL"
            isValid = false
          }
          if ((ftId === 2 || ftId === 13) && !validatePhone(value)) {
            warnings[`field_${fieldKey}`] = "Telefon formatı kontrol edilmeli"
          }
        })

        return { ...row, errors, warnings, isValid }
      })
    },
    []
  )

  const debouncedValidate = useCallback(() => {
    if (validateTimeoutRef.current) clearTimeout(validateTimeoutRef.current)
    validateTimeoutRef.current = setTimeout(() => {
      setTableRows((prev) =>
        doValidateRows(
          prev,
          selectedFieldTypesRef.current,
          assignToIndividualUsers,
          selectedUser
        )
      )
    }, 150)
  }, [doValidateRows, assignToIndividualUsers, selectedUser])

  // Re-validate when user/mode changes
  useEffect(() => {
    setTableRows((prev) => {
      if (prev.length === 0 || !prev[0].publicKey) return prev
      return doValidateRows(
        prev,
        selectedFieldTypesRef.current,
        assignToIndividualUsers,
        selectedUser
      )
    })
  }, [selectedUser, assignToIndividualUsers, doValidateRows])

  // ─── Check Cards Status ───

  const checkCardsStatus = useCallback(
    async (rows: TableRowData[]): Promise<TableRowData[]> => {
      const publicKeys = rows.map((r) => r.publicKey).filter((pk) => pk?.trim())
      if (publicKeys.length === 0) return rows

      setCheckingStatus(true)
      try {
        const res = await apiClient.post<{ data?: CardStatus[] }>(
          "/api/admin/cards/check-bulk-status",
          { public_keys: publicKeys }
        )
        const results: CardStatus[] = Array.isArray(res) ? res : res?.data || []
        return rows.map((row) => {
          if (!row.publicKey) return row
          const status = results.find((r) => r.public_key === row.publicKey)
          return status ? { ...row, serverStatus: status } : row
        })
      } catch (err) {
        console.error("Error checking cards status:", err)
        return rows
      } finally {
        setCheckingStatus(false)
      }
    },
    []
  )

  // ─── Check Emails Status ───

  const checkEmailsStatus = useCallback(
    async (
      rows: TableRowData[],
      sft: SelectedFieldType[]
    ): Promise<TableRowData[]> => {
      const emails: string[] = []
      rows.forEach((row) => {
        Object.entries(row.fields).forEach(([fieldKey, data]) => {
          if (!data?.trim()) return
          const ftId = getFieldTypeIdFromKey(fieldKey, sft)
          if (ftId === 19) emails.push(data.trim())
        })
      })
      if (emails.length === 0) return rows

      try {
        const res = await apiClient.post<{ data?: EmailStatus[] }>(
          "/api/admin/cards/check-bulk-emails",
          { emails }
        )
        const results: EmailStatus[] = Array.isArray(res) ? res : res?.data || []
        return rows.map((row) => {
          let rowEmail: string | null = null
          Object.entries(row.fields).forEach(([fieldKey, data]) => {
            if (!data?.trim()) return
            const ftId = getFieldTypeIdFromKey(fieldKey, sft)
            if (ftId === 19) rowEmail = data.trim()
          })
          if (!rowEmail) return row
          const status = results.find(
            (r) => r.email.toLowerCase() === rowEmail!.toLowerCase()
          )
          return status ? { ...row, emailStatus: status } : row
        })
      } catch (err) {
        console.error("Error checking emails status:", err)
        return rows
      }
    },
    []
  )

  // ─── Add Field Type Column ───

  function addFieldTypeColumn() {
    if (!selectedFieldType) return
    const ftId = parseInt(selectedFieldType)
    const ft = fieldTypes.find((f) => f.id === ftId)
    if (!ft) return

    const timestamp = Date.now()
    const uniqueId = `${ft.id}_${timestamp}`
    const existingCount = selectedFieldTypes.filter((f) => f.id === ft.id).length

    const newFt: SelectedFieldType = {
      ...ft,
      uniqueId,
      displayName:
        existingCount > 0 ? `${ft.name} (${existingCount + 1})` : ft.name,
    }

    setSelectedFieldTypes((prev) => [...prev, newFt])
    setSelectedFieldType("")
    setTableRows((prev) =>
      prev.map((row) => ({
        ...row,
        fields: { ...row.fields, [uniqueId]: "" },
      }))
    )
  }

  // ─── Remove Field Type Column ───

  function removeFieldTypeColumn(uniqueId: string) {
    setSelectedFieldTypes((prev) => prev.filter((ft) => ft.uniqueId !== uniqueId))
    setTableRows((prev) =>
      prev.map((row) => {
        const fields = { ...row.fields }
        delete fields[uniqueId]
        return { ...row, fields }
      })
    )
    setCsvFieldNames((prev) => {
      const next = { ...prev }
      delete next[uniqueId]
      return next
    })
  }

  // ─── Add/Remove Table Row ───

  function addTableRow() {
    setTableRows((prev) => {
      const newRow: TableRowData = {
        rowNumber: prev.length + 1,
        publicKey: "",
        name: "",
        company: "",
        title: "",
        fields: {},
        errors: {},
        warnings: {},
        serverStatus: null,
        emailStatus: null,
        isValid: true,
      }
      selectedFieldTypesRef.current.forEach((ft) => {
        newRow.fields[ft.uniqueId] = ""
      })
      return [...prev, newRow]
    })
  }

  function removeTableRow(index: number) {
    setTableRows((prev) => {
      const next = prev.filter((_, i) => i !== index)
      return doValidateRows(
        next.map((row, i) => ({ ...row, rowNumber: i + 1 })),
        selectedFieldTypesRef.current,
        assignToIndividualUsers,
        selectedUser
      )
    })
  }

  // ─── Update Row ───

  function updateRowField(index: number, field: string, value: string) {
    setTableRows((prev) =>
      prev.map((row, i) => {
        if (i !== index) return row
        if (["publicKey", "name", "company", "title"].includes(field)) {
          return { ...row, [field]: value }
        }
        if (field.startsWith("field_")) {
          const fieldKey = field.replace("field_", "")
          return { ...row, fields: { ...row.fields, [fieldKey]: value } }
        }
        return row
      })
    )
    debouncedValidate()
  }

  // ─── Trim & Strip Prefix on Blur ───

  function handleFieldBlur(index: number, field: string) {
    setTableRows((prev) =>
      prev.map((row, i) => {
        if (i !== index) return row
        if (field === "publicKey") return { ...row, publicKey: row.publicKey?.trim() || "" }
        if (field === "name") return { ...row, name: row.name?.trim() || "" }
        if (field === "company") return { ...row, company: row.company?.trim() || "" }
        if (field === "title") {
          return { ...row, title: row.title?.trim() || "" }
        }
        if (field.startsWith("field_")) {
          const fieldKey = field.replace("field_", "")
          const ftId = getFieldTypeIdFromKey(fieldKey, selectedFieldTypesRef.current)
          let val = row.fields[fieldKey]?.trim() || ""
          if (ftId) val = stripFieldPrefix(val, ftId)
          return { ...row, fields: { ...row.fields, [fieldKey]: val } }
        }
        return row
      })
    )
    debouncedValidate()

    // Check single row status on publicKey blur
    if (field === "publicKey") {
      const row = tableRows[index]
      if (row?.publicKey?.trim()) {
        apiClient
          .post<{ data?: CardStatus[] }>("/api/admin/cards/check-bulk-status", {
            public_keys: [row.publicKey],
          })
          .then((res) => {
            const results: CardStatus[] = Array.isArray(res) ? res : res?.data || []
            if (results.length > 0) {
              setTableRows((current) =>
                doValidateRows(
                  current.map((r, idx) =>
                    idx === index ? { ...r, serverStatus: results[0] } : r
                  ),
                  selectedFieldTypesRef.current,
                  assignToIndividualUsers,
                  selectedUser
                )
              )
            }
          })
          .catch(() => {})
      }
    }
  }

  // ─── Parse CSV ───

  function parseCSV(
    csvText: string,
    fileName: string,
    currentFieldTypes: FieldType[]
  ) {
    const lines = csvText.split("\n").filter((line) => line.trim() !== "")
    if (lines.length < 3) {
      throw new Error(
        "Dosya en az 2 header satırı (field name ve field type ID) ve bir veri satırı içermelidir"
      )
    }

    // Auto-detect delimiter
    const firstLine = lines[0]
    let delimiter = ","
    if (fileName.toLowerCase().endsWith(".tsv") || fileName.toLowerCase().endsWith(".tab")) {
      delimiter = "\t"
    } else {
      const commaCount = (firstLine.match(/,/g) || []).length
      const semicolonCount = (firstLine.match(/;/g) || []).length
      const tabCount = (firstLine.match(/\t/g) || []).length
      if (semicolonCount > commaCount && semicolonCount > tabCount) delimiter = ";"
      else if (tabCount > commaCount && tabCount > semicolonCount) delimiter = "\t"
    }

    const row0 = parseLine(lines[0], delimiter)
    const row1 = parseLine(lines[1], delimiter)

    // Score to detect which row has field type IDs
    const calculateIDScore = (row: string[]) => {
      let score = 0
      if (row.length <= 4) return 0
      for (let i = 4; i < row.length; i++) {
        const val = row[i]?.trim() || ""
        if (!val) continue
        const num = parseInt(val)
        if (!isNaN(num) && num > 0 && String(num) === val) score++
      }
      return score
    }

    const score0 = calculateIDScore(row0)
    const score1 = calculateIDScore(row1)
    const [fieldTypeRow, fieldNameRow] =
      score0 > score1 ? [row0, row1] : [row1, row0]

    // Detect company/title column indices
    let companyIdx = 2
    let titleIdx = 3
    fieldNameRow.forEach((colName, index) => {
      const lower = (colName || "").toLowerCase().trim()
      if (lower.includes("şirket") || lower.includes("company")) companyIdx = index
      else if (lower.includes("görev") || lower.includes("unvan") || lower.includes("title"))
        titleIdx = index
    })

    // Field type mappings (columns after index 4)
    const fieldTypeMappings: Array<{
      columnIndex: number
      fieldTypeId: number
      fieldName: string
      fieldTypeName: string
      uniqueId: string
    }> = []

    for (let i = 4; i < fieldTypeRow.length; i++) {
      const ftIdStr = fieldTypeRow[i]?.trim() || ""
      if (!ftIdStr) continue
      const ftId = parseInt(ftIdStr)
      if (isNaN(ftId) || ftId <= 0) continue
      const fieldName =
        i < fieldNameRow.length && fieldNameRow[i] ? fieldNameRow[i].trim() : ""
      const ft = currentFieldTypes.find((f) => f.id === ftId)
      fieldTypeMappings.push({
        columnIndex: i,
        fieldTypeId: ftId,
        fieldName: fieldName || (ft ? ft.name : `Field ${ftId}`),
        fieldTypeName: ft ? ft.name : `Field ${ftId}`,
        uniqueId: "",
      })
    }

    // Build selectedFieldTypes from CSV
    const newFieldTypes: SelectedFieldType[] = []
    const newCsvFieldNames: Record<string, string> = {}

    fieldTypeMappings.forEach((mapping, index) => {
      const timestamp = Date.now() + index
      const uniqueId = `${mapping.fieldTypeId}_${timestamp}`
      mapping.uniqueId = uniqueId

      const existingCount = newFieldTypes.filter((f) => f.id === mapping.fieldTypeId).length
      const ft = currentFieldTypes.find((f) => f.id === mapping.fieldTypeId)

      newFieldTypes.push({
        id: mapping.fieldTypeId,
        name: mapping.fieldTypeName,
        icon_url: ft?.icon_url || "",
        uniqueId,
        displayName:
          existingCount > 0
            ? `${mapping.fieldTypeName} (${existingCount + 1})`
            : mapping.fieldTypeName,
        fieldName: mapping.fieldName,
        fromCSV: true,
      })

      if (mapping.fieldName) newCsvFieldNames[uniqueId] = mapping.fieldName
    })

    // Parse data rows (starting from row 3, index 2)
    const parsedRows: TableRowData[] = []
    const parseErrors: string[] = []

    for (let rowIdx = 2; rowIdx < lines.length; rowIdx++) {
      const columns = parseLine(lines[rowIdx], delimiter)
      if (columns.length < 4 || !columns[1] || columns[1] === "YEDEK") continue

      let publicKey = ""
      if (columns[0].includes("id.idycard.com/")) {
        const parts = columns[0].split("id.idycard.com/")
        if (parts.length > 1) publicKey = parts[1]
      } else {
        publicKey = columns[0]
      }

      if (!publicKey) {
        parseErrors.push(`Satır ${rowIdx + 1}: Public key bulunamadı`)
        continue
      }

      const fields: Record<string, string> = {}
      fieldTypeMappings.forEach((mapping) => {
        if (mapping.columnIndex < columns.length && mapping.uniqueId) {
          const value = columns[mapping.columnIndex]
          if (value && value !== "YOK" && value.trim() !== "") {
            fields[mapping.uniqueId] = stripFieldPrefix(value.trim(), mapping.fieldTypeId)
          }
        }
      })

      parsedRows.push({
        rowNumber: parsedRows.length + 1,
        publicKey: publicKey.trim(),
        name: (columns[1] || "").trim(),
        company: (columns.length > companyIdx ? columns[companyIdx] : "").trim(),
        title: (columns.length > titleIdx ? columns[titleIdx] : "").trim(),
        fields,
        errors: {},
        warnings: {},
        serverStatus: null,
        emailStatus: null,
        isValid: true,
      })
    }

    return { parsedRows, errors: parseErrors, newFieldTypes, newCsvFieldNames }
  }

  // ─── Handle CSV Upload ───

  async function handleCSVUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setCsvFile(file)
    setCsvParseErrors([])

    const reader = new FileReader()
    reader.onload = async (ev) => {
      const csvText = ev.target?.result as string
      try {
        let currentFieldTypes = fieldTypes
        if (currentFieldTypes.length === 0) {
          currentFieldTypes = await fetchFieldTypes()
        }

        const { parsedRows, errors, newFieldTypes, newCsvFieldNames } = parseCSV(
          csvText,
          file.name,
          currentFieldTypes
        )

        if (errors.length > 0) setCsvParseErrors(errors)

        setSelectedFieldTypes(newFieldTypes)
        setCsvFieldNames(newCsvFieldNames)

        // Check statuses
        let updatedRows = await checkCardsStatus(parsedRows)
        if (assignToIndividualUsers) {
          updatedRows = await checkEmailsStatus(updatedRows, newFieldTypes)
        }

        setTableRows(
          doValidateRows(updatedRows, newFieldTypes, assignToIndividualUsers, selectedUser)
        )

        if (parsedRows.length === 0) {
          toast.warning("CSV dosyasında geçerli veri satırı bulunamadı")
        } else {
          const validCount = updatedRows.filter((r) => r.isValid).length
          const invalidCount = parsedRows.length - validCount
          if (invalidCount > 0) {
            toast.warning(
              `${parsedRows.length} satır parse edildi. ${validCount} geçerli, ${invalidCount} hatalı.`
            )
          } else {
            toast.success(`${parsedRows.length} satır başarıyla parse edildi.`)
          }
        }
      } catch (err) {
        console.error("CSV parse error:", err)
        toast.error((err as Error).message || "CSV dosyası parse edilemedi")
      }
    }
    reader.readAsText(file)
  }

  // ─── Check All Status ───

  async function handleCheckStatus() {
    let updated = await checkCardsStatus(tableRows)
    if (assignToIndividualUsers) {
      updated = await checkEmailsStatus(updated, selectedFieldTypesRef.current)
    }
    setTableRows(
      doValidateRows(updated, selectedFieldTypesRef.current, assignToIndividualUsers, selectedUser)
    )
  }

  // ─── Import Cards ───

  async function handleImport() {
    const sft = selectedFieldTypesRef.current
    const validated = doValidateRows(tableRows, sft, assignToIndividualUsers, selectedUser)
    setTableRows(validated)

    const invalidRows = validated.filter((row) => !row.isValid || !row.publicKey || !row.name)
    if (invalidRows.length > 0) {
      toast.error(
        `${invalidRows.length} hatalı satır var. Tüm hataları düzeltmeden import yapılamaz.`
      )
      return
    }

    if (!assignToIndividualUsers && !selectedUser) {
      toast.error(
        "Kartlar mutlaka bir kullanıcıya atanmalı. Lütfen kullanıcı seçin veya 'Her kart ayrı kullanıcıya' modunu aktif edin."
      )
      return
    }

    if (assignToIndividualUsers && (!userPassword || userPassword.length < 6)) {
      toast.error("Kullanıcı şifresi en az 6 karakter olmalıdır.")
      return
    }

    setImportingCards(true)
    try {
      const payload: BulkImportPayload = {
        company_id: selectedCompany ? parseInt(selectedCompany) : null,
        user_id: selectedUser ? parseInt(selectedUser) : null,
        assign_to_individual_users: assignToIndividualUsers,
        password: assignToIndividualUsers ? userPassword : "",
        profile_picture_url: null,
        field_icons: null,
        cards: validated.map((row) => {
          let emailValue: string | null = null
          Object.entries(row.fields).forEach(([fieldKey, data]) => {
            if (!data?.trim()) return
            const ftId = getFieldTypeIdFromKey(fieldKey, sft)
            if (ftId === 19) emailValue = data.trim()
          })

          return {
            public_key: row.publicKey,
            name: row.name,
            company: row.company,
            title: row.title,
            email: emailValue,
            user_id: null,
            fields: Object.entries(row.fields)
              .filter(([, value]) => value?.trim())
              .map(([fieldKey, data]) => {
                const ftId = getFieldTypeIdFromKey(fieldKey, sft)
                const ft = sft.find((f) => f.uniqueId === fieldKey)
                const fieldName = csvFieldNames[fieldKey] || ft?.name || ""
                return {
                  field_type_id: ftId || 0,
                  data: data.trim(),
                  name: fieldName,
                }
              })
              .filter((f) => f.field_type_id > 0),
          }
        }),
      }

      const res = await apiClient.post<{
        created_cards: number
        updated_cards: number
        errors?: string[]
      }>("/api/admin/cards/bulk-import", payload)

      toast.success(
        `${res.created_cards} kart oluşturuldu, ${res.updated_cards} kart güncellendi`
      )

      if (res.errors?.length) console.warn("Import errors:", res.errors)

      // Reset
      setUserPassword("")
      setCsvFile(null)
      setCsvParseErrors([])
      setSelectedFieldTypes([])
      setCsvFieldNames({})
      setTableRows([
        {
          rowNumber: 1,
          publicKey: "",
          name: "",
          company: "",
          title: "",
          fields: {},
          errors: {},
          warnings: {},
          serverStatus: null,
          emailStatus: null,
          isValid: true,
        },
      ])
      if (fileInputRef.current) fileInputRef.current.value = ""
    } catch (err) {
      console.error("Import error:", err)
      toast.error(
        (err as { message?: string })?.message ||
          "Kartlar içe aktarılırken bir hata oluştu"
      )
    } finally {
      setImportingCards(false)
    }
  }

  // ─── Stats ───

  const validationStats = {
    total: tableRows.length,
    valid: tableRows.filter((r) => r.isValid).length,
    invalid: tableRows.filter((r) => !r.isValid).length,
  }

  // ─── Render ───

  return (
    <div className="space-y-6">
      <AdminPageHeader title={t("bulkImport")} backHref="/admin/cards" />

      <Tabs defaultValue="bulk-import">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="bulk-import">
            <FileSpreadsheet className="size-4 mr-2" />
            {t("bulkImportTab")}
          </TabsTrigger>
          <TabsTrigger value="quick-create">
            <Zap className="size-4 mr-2" />
            {t("quickCreateTab")}
          </TabsTrigger>
        </TabsList>

        {/* ─── Quick Create Tab ─── */}
        <TabsContent value="quick-create">
          <QuickCreateTab companies={companies} fetchUsers={fetchUsers} />
        </TabsContent>

        {/* ─── Bulk Import Tab ─── */}
        <TabsContent value="bulk-import" className="space-y-6">
          {/* Company / User Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {t("selectCompany")} / {t("selectUser")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">{t("company")}</Label>
                  <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("selectCompany")} />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((c) => (
                        <SelectItem key={c.value} value={String(c.value)}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">{t("selectUser")}</Label>
                  <Select
                    value={selectedUser}
                    onValueChange={setSelectedUser}
                    disabled={assignToIndividualUsers}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("selectUser")} />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((u) => (
                        <SelectItem key={u.value} value={String(u.value)}>
                          {u.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end pb-1">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="individualUsers"
                      checked={assignToIndividualUsers}
                      onCheckedChange={(checked) => {
                        setAssignToIndividualUsers(!!checked)
                        if (!checked) setSelectedUser("")
                      }}
                    />
                    <label htmlFor="individualUsers" className="text-sm cursor-pointer">
                      {t("assignToIndividualUsers")}
                    </label>
                  </div>
                </div>

                {assignToIndividualUsers && (
                  <div className="space-y-1.5">
                    <Label className="text-xs">{t("password")}</Label>
                    <Input
                      type="password"
                      value={userPassword}
                      onChange={(e) => setUserPassword(e.target.value)}
                      placeholder={t("userPasswordPlaceholder")}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* CSV Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                <FileSpreadsheet className="inline size-4 mr-2" />
                CSV / TSV {t("csvUpload")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <Upload className="size-8 mx-auto mb-3 text-muted-foreground" />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.tsv,.tab,text/csv,text/tab-separated-values"
                  onChange={handleCSVUpload}
                  className="max-w-xs mx-auto block text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
                />
                {csvFile && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {csvFile.name} ({(csvFile.size / 1024).toFixed(1)} KB)
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  {t("csvUploadHint")}
                </p>
              </div>

              {csvParseErrors.length > 0 && (
                <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-md p-3">
                  <div className="flex items-center gap-2 font-medium text-sm text-yellow-800 dark:text-yellow-200 mb-1">
                    <AlertTriangle className="size-4" />
                    Parse Uyarıları
                  </div>
                  <ul className="text-sm text-yellow-700 dark:text-yellow-300 list-disc pl-5">
                    {csvParseErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Field Type Mapping */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("fieldTypeMapping")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-end gap-2">
                <div className="flex-1 space-y-1.5">
                  <Label className="text-xs">{t("selectFieldType")}</Label>
                  <Select
                    value={selectedFieldType}
                    onValueChange={setSelectedFieldType}
                    disabled={loadingFieldTypes}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Field Type seçin..." />
                    </SelectTrigger>
                    <SelectContent>
                      {fieldTypes.map((ft) => (
                        <SelectItem key={ft.id} value={String(ft.id)}>
                          {ft.name} (ID: {ft.id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={addFieldTypeColumn} disabled={!selectedFieldType}>
                  <Plus className="size-4 mr-1" />
                  {t("add")}
                </Button>
              </div>

              {selectedFieldTypes.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {t("selectedFieldTypes")}:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedFieldTypes.map((ft) => (
                        <Badge key={ft.uniqueId} variant="secondary" className="gap-1 pr-1">
                          {csvFieldNames[ft.uniqueId] || ft.fieldName || ft.displayName} (ID:{" "}
                          {ft.id})
                          <button
                            onClick={() => removeFieldTypeColumn(ft.uniqueId)}
                            className="ml-1 hover:bg-muted rounded-sm p-0.5"
                          >
                            <X className="size-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Data Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-base">{t("cardData")}</CardTitle>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCheckStatus}
                    disabled={checkingStatus}
                  >
                    <RefreshCw className={`size-4 mr-1 ${checkingStatus ? "animate-spin" : ""}`} />
                    {t("checkStatus")}
                  </Button>
                  <Button variant="outline" size="sm" onClick={addTableRow}>
                    <Plus className="size-4 mr-1" />
                    {t("addRow")}
                  </Button>
                  {validationStats.total > 0 && (
                    <div className="flex gap-1.5">
                      <Badge variant="outline">
                        {t("total")}: {validationStats.total}
                      </Badge>
                      {validationStats.valid > 0 && (
                        <Badge variant="outline" className="border-green-500 text-green-600">
                          <CheckCircle2 className="size-3 mr-1" />
                          {validationStats.valid}
                        </Badge>
                      )}
                      {validationStats.invalid > 0 && (
                        <Badge variant="destructive">
                          <AlertCircle className="size-3 mr-1" />
                          {validationStats.invalid}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto border rounded-md max-h-[600px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12 text-center sticky left-0 bg-background z-10">
                        #
                      </TableHead>
                      <TableHead className="min-w-[160px]">Public Key</TableHead>
                      <TableHead className="min-w-[160px]">{t("name")}</TableHead>
                      <TableHead className="min-w-[140px]">{t("company")}</TableHead>
                      <TableHead className="min-w-[140px]">{t("title")}</TableHead>
                      {selectedFieldTypes.map((ft) => (
                        <TableHead key={ft.uniqueId} className="min-w-[160px]">
                          {csvFieldNames[ft.uniqueId] || ft.fieldName || ft.displayName}
                        </TableHead>
                      ))}
                      <TableHead className="w-12">{t("actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tableRows.map((row, index) => (
                      <TableRow
                        key={`row-${index}`}
                        className={!row.isValid ? "bg-destructive/5" : ""}
                      >
                        <TableCell className="text-center text-xs text-muted-foreground font-medium sticky left-0 bg-background z-10">
                          {row.rowNumber}
                        </TableCell>

                        {/* Public Key */}
                        <TableCell
                          className={
                            row.errors.publicKey
                              ? "bg-destructive/10"
                              : row.warnings.publicKey
                                ? "bg-yellow-50 dark:bg-yellow-950/30"
                                : ""
                          }
                        >
                          <Input
                            value={row.publicKey}
                            onChange={(e) => updateRowField(index, "publicKey", e.target.value)}
                            onBlur={() => handleFieldBlur(index, "publicKey")}
                            placeholder="public-key"
                            className={`h-8 text-sm ${row.errors.publicKey ? "border-destructive" : ""}`}
                          />
                          {row.errors.publicKey && (
                            <p className="text-[10px] text-destructive mt-0.5">
                              {row.errors.publicKey}
                            </p>
                          )}
                          {row.warnings.publicKey && (
                            <p className="text-[10px] text-yellow-600 dark:text-yellow-400 mt-0.5">
                              {row.warnings.publicKey}
                            </p>
                          )}
                        </TableCell>

                        {/* Name */}
                        <TableCell className={row.errors.name ? "bg-destructive/10" : ""}>
                          <Input
                            value={row.name}
                            onChange={(e) => updateRowField(index, "name", e.target.value)}
                            onBlur={() => handleFieldBlur(index, "name")}
                            placeholder="Ad Soyad"
                            className={`h-8 text-sm ${row.errors.name ? "border-destructive" : ""}`}
                          />
                          {row.errors.name && (
                            <p className="text-[10px] text-destructive mt-0.5">{row.errors.name}</p>
                          )}
                        </TableCell>

                        {/* Company */}
                        <TableCell>
                          <Input
                            value={row.company}
                            onChange={(e) => updateRowField(index, "company", e.target.value)}
                            onBlur={() => handleFieldBlur(index, "company")}
                            placeholder={t("company")}
                            className="h-8 text-sm"
                          />
                        </TableCell>

                        {/* Title */}
                        <TableCell>
                          <Input
                            value={row.title}
                            onChange={(e) => updateRowField(index, "title", e.target.value)}
                            onBlur={() => handleFieldBlur(index, "title")}
                            placeholder={t("title")}
                            className="h-8 text-sm"
                          />
                        </TableCell>

                        {/* Dynamic Field Columns */}
                        {selectedFieldTypes.map((ft) => {
                          const fieldKey = ft.uniqueId
                          const errorKey = `field_${fieldKey}`
                          const error = row.errors[errorKey]
                          const warning = row.warnings[errorKey]
                          return (
                            <TableCell
                              key={ft.uniqueId}
                              className={
                                error
                                  ? "bg-destructive/10"
                                  : warning
                                    ? "bg-yellow-50 dark:bg-yellow-950/30"
                                    : ""
                              }
                            >
                              <Input
                                value={row.fields[fieldKey] || ""}
                                onChange={(e) =>
                                  updateRowField(index, `field_${fieldKey}`, e.target.value)
                                }
                                onBlur={() => handleFieldBlur(index, `field_${fieldKey}`)}
                                placeholder={ft.displayName}
                                className={`h-8 text-sm ${error ? "border-destructive" : ""}`}
                              />
                              {error && (
                                <p className="text-[10px] text-destructive mt-0.5">{error}</p>
                              )}
                              {warning && (
                                <p className="text-[10px] text-yellow-600 dark:text-yellow-400 mt-0.5">
                                  {warning}
                                </p>
                              )}
                            </TableCell>
                          )
                        })}

                        {/* Actions */}
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7"
                            onClick={() => removeTableRow(index)}
                            disabled={tableRows.length <= 1}
                          >
                            <Trash2 className="size-3.5 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Import Button */}
              <div className="flex justify-end mt-4">
                <Button
                  onClick={handleImport}
                  disabled={importingCards || tableRows.length === 0 || validationStats.invalid > 0}
                  size="lg"
                >
                  {importingCards ? (
                    <>
                      <RefreshCw className="size-4 mr-2 animate-spin" />
                      {t("saving")}
                    </>
                  ) : (
                    <>
                      <Upload className="size-4 mr-2" />
                      {t("importCards")}
                      {validationStats.invalid > 0 && (
                        <span className="ml-1">({validationStats.invalid} hata var)</span>
                      )}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
