"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { QRCodeSVG } from "qrcode.react"
import {
  Smartphone,
  Mail,
  Copy,
  Download,
  ShieldCheck,
  ShieldOff,
  Loader2,
  RefreshCw,
  CheckCircle,
} from "lucide-react"
import { AppHeader } from "@/components/dashboard/app-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { apiClient } from "@/lib/api-client"
import { useTranslation } from "@/lib/i18n/context"
import { toast } from "sonner"

interface TwoFactorStatus {
  is_enabled: boolean
  method: string
  totp_verified: boolean
  backup_codes_remaining: number
  email_2fa_allowed: boolean
}

type Step = "overview" | "totp-setup" | "email-setup" | "verify" | "backup-codes"

export default function TwoFactorSettingsPage() {
  const { t } = useTranslation()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<TwoFactorStatus | null>(null)
  const [step, setStep] = useState<Step>("overview")

  // TOTP setup
  const [provisioningUri, setProvisioningUri] = useState("")
  const [totpSecret, setTotpSecret] = useState("")

  // Email setup
  const [emailChallengeToken, setEmailChallengeToken] = useState("")

  // Verification
  const [code, setCode] = useState("")
  const [verifying, setVerifying] = useState(false)

  // Backup codes
  const [backupCodes, setBackupCodes] = useState<string[]>([])

  // Disable
  const [disableOpen, setDisableOpen] = useState(false)
  const [disablePassword, setDisablePassword] = useState("")
  const [disableCode, setDisableCode] = useState("")
  const [disabling, setDisabling] = useState(false)

  // Regenerate
  const [regenOpen, setRegenOpen] = useState(false)
  const [regenCode, setRegenCode] = useState("")
  const [regenerating, setRegenerating] = useState(false)

  async function fetchStatus() {
    try {
      const res = await apiClient.get<{ data: TwoFactorStatus }>("/api/user/2fa/status")
      setStatus(res.data)
    } catch {
      toast.error(t("errorOccurred"))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  async function handleSetupTOTP() {
    try {
      const res = await apiClient.post<{
        data: { provisioning_uri: string; secret: string }
      }>("/api/user/2fa/totp/setup")
      setProvisioningUri(res.data.provisioning_uri)
      setTotpSecret(res.data.secret)
      setStep("totp-setup")
    } catch (err: any) {
      toast.error(err?.message || t("errorOccurred"))
    }
  }

  async function handleSetupEmail() {
    try {
      const res = await apiClient.post<{
        data: { challenge_token: string }
      }>("/api/user/2fa/email/setup")
      setEmailChallengeToken(res.data.challenge_token)
      setStep("email-setup")
    } catch (err: any) {
      toast.error(err?.message || t("errorOccurred"))
    }
  }

  async function handleVerifyTOTP() {
    setVerifying(true)
    try {
      const res = await apiClient.post<{
        data: { backup_codes: string[] }
      }>("/api/user/2fa/totp/verify-setup", { code })
      setBackupCodes(res.data.backup_codes)
      setStep("backup-codes")
      toast.success(t("twoFactorSetupSuccess"))
    } catch (err: any) {
      toast.error(err?.message || t("invalidCode"))
    } finally {
      setVerifying(false)
    }
  }

  async function handleVerifyEmail() {
    setVerifying(true)
    try {
      const res = await apiClient.post<{
        data: { backup_codes: string[] }
      }>("/api/user/2fa/email/verify-setup", {
        challenge_token: emailChallengeToken,
        code,
      })
      setBackupCodes(res.data.backup_codes)
      setStep("backup-codes")
      toast.success(t("twoFactorSetupSuccess"))
    } catch (err: any) {
      toast.error(err?.message || t("invalidCode"))
    } finally {
      setVerifying(false)
    }
  }

  async function handleDisable() {
    setDisabling(true)
    try {
      await apiClient.post("/api/user/2fa/disable", {
        password: disablePassword,
        code: disableCode,
      })
      toast.success(t("twoFactorDisableSuccess"))
      setDisableOpen(false)
      setDisablePassword("")
      setDisableCode("")
      await fetchStatus()
      setStep("overview")
    } catch (err: any) {
      toast.error(err?.message || t("errorOccurred"))
    } finally {
      setDisabling(false)
    }
  }

  async function handleRegenerate() {
    setRegenerating(true)
    try {
      const res = await apiClient.post<{
        data: { backup_codes: string[] }
      }>("/api/user/2fa/backup-codes/regenerate", { code: regenCode })
      setBackupCodes(res.data.backup_codes)
      setRegenOpen(false)
      setRegenCode("")
      setStep("backup-codes")
      toast.success(t("backupCodesRegenerated"))
    } catch (err: any) {
      toast.error(err?.message || t("invalidCode"))
    } finally {
      setRegenerating(false)
    }
  }

  function copyBackupCodes() {
    navigator.clipboard.writeText(backupCodes.join("\n"))
    toast.success(t("copied"))
  }

  function downloadBackupCodes() {
    const blob = new Blob([backupCodes.join("\n")], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "idycard-backup-codes.txt"
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleDone() {
    setBackupCodes([])
    setTotpSecret("")
    setProvisioningUri("")
    setEmailChallengeToken("")
    setCode("")
    fetchStatus()
    setStep("overview")
  }

  if (loading) {
    return (
      <>
        <AppHeader title={t("twoFactorAuth")} backButton />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      </>
    )
  }

  return (
    <>
      <AppHeader title={t("twoFactorAuth")} backButton />

      <div className="px-5 pt-5 pb-8 max-w-lg mx-auto">
        {/* Overview - 2FA not enabled */}
        {step === "overview" && !status?.is_enabled && (
          <div className="space-y-6">
            <div className="rounded-xl border bg-muted/30 p-6 text-center space-y-3">
              <ShieldOff className="size-12 text-muted-foreground mx-auto" />
              <h3 className="text-lg font-semibold">{t("twoFactorDisabled")}</h3>
              <p className="text-sm text-muted-foreground">{t("twoFactorAuthDescription")}</p>
            </div>

            <div className="space-y-3">
              <Button onClick={handleSetupTOTP} className="w-full justify-start gap-3 h-14" variant="outline">
                <Smartphone className="size-5" />
                <div className="text-left">
                  <div className="font-medium">{t("twoFactorMethodTotp")}</div>
                  <div className="text-xs text-muted-foreground">{t("totpDescription")}</div>
                </div>
              </Button>

              {status?.email_2fa_allowed && (
                <Button onClick={handleSetupEmail} className="w-full justify-start gap-3 h-14" variant="outline">
                  <Mail className="size-5" />
                  <div className="text-left">
                    <div className="font-medium">{t("twoFactorMethodEmail")}</div>
                    <div className="text-xs text-muted-foreground">{t("emailOtpDescription")}</div>
                  </div>
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Overview - 2FA enabled */}
        {step === "overview" && status?.is_enabled && (
          <div className="space-y-6">
            <div className="rounded-xl border border-green-500/30 bg-green-50 dark:bg-green-950/20 p-6 text-center space-y-3">
              <ShieldCheck className="size-12 text-green-600 mx-auto" />
              <h3 className="text-lg font-semibold text-green-700 dark:text-green-400">{t("twoFactorEnabled")}</h3>
              <p className="text-sm text-muted-foreground">
                {status.method === "totp" ? t("twoFactorMethodTotp") : t("twoFactorMethodEmail")}
              </p>
            </div>

            <div className="rounded-xl border bg-muted/30 p-4 flex items-center gap-3">
              <div className="flex-1">
                <p className="text-sm font-medium">{t("backupCodes")}</p>
                <p className="text-xs text-muted-foreground">
                  {status.backup_codes_remaining} {t("backupCodesRemaining")}
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={() => setRegenOpen(true)}>
                <RefreshCw className="size-4 mr-1" />
                {t("regenerateBackupCodes")}
              </Button>
            </div>

            <Button
              variant="destructive"
              className="w-full"
              onClick={() => setDisableOpen(true)}
            >
              <ShieldOff className="size-4 mr-2" />
              {t("disableTwoFactor")}
            </Button>
          </div>
        )}

        {/* TOTP Setup - QR Code */}
        {step === "totp-setup" && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">{t("scanQRCode")}</h3>
              <p className="text-sm text-muted-foreground">{t("scanQRCodeDescription")}</p>
            </div>

            <div className="flex justify-center p-6 bg-white rounded-xl border">
              <QRCodeSVG value={provisioningUri} size={200} level="M" />
            </div>

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{t("manualEntry")}</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded-lg bg-muted p-3 text-xs font-mono break-all">
                  {totpSecret}
                </code>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(totpSecret)
                    toast.success(t("copied"))
                  }}
                >
                  <Copy className="size-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t("enterVerificationCode")}</Label>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={6}
                className="text-center text-lg tracking-widest font-mono"
                autoFocus
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => { setStep("overview"); setCode(""); setTotpSecret(""); setProvisioningUri("") }}>
                {t("cancel")}
              </Button>
              <Button className="flex-1" onClick={handleVerifyTOTP} disabled={verifying || code.length !== 6}>
                {verifying ? <Loader2 className="size-4 animate-spin" /> : t("verifyCode")}
              </Button>
            </div>
          </div>
        )}

        {/* Email Setup */}
        {step === "email-setup" && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Mail className="size-12 text-primary mx-auto" />
              <h3 className="text-lg font-semibold">{t("enterEmailCode")}</h3>
              <p className="text-sm text-muted-foreground">{t("enterEmailCodeDescription")}</p>
            </div>

            <div className="space-y-2">
              <Label>{t("verificationCode")}</Label>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={6}
                className="text-center text-lg tracking-widest font-mono"
                autoFocus
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => { setStep("overview"); setCode(""); setEmailChallengeToken("") }}>
                {t("cancel")}
              </Button>
              <Button className="flex-1" onClick={handleVerifyEmail} disabled={verifying || code.length !== 6}>
                {verifying ? <Loader2 className="size-4 animate-spin" /> : t("verifyCode")}
              </Button>
            </div>
          </div>
        )}

        {/* Backup Codes Display */}
        {step === "backup-codes" && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <CheckCircle className="size-12 text-green-600 mx-auto" />
              <h3 className="text-lg font-semibold">{t("backupCodes")}</h3>
              <p className="text-sm text-muted-foreground">{t("backupCodesDescription")}</p>
            </div>

            <div className="rounded-xl border border-amber-500/30 bg-amber-50 dark:bg-amber-950/20 p-3">
              <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">{t("backupCodesWarning")}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 p-4 bg-muted/50 rounded-xl">
              {backupCodes.map((c, i) => (
                <code key={i} className="text-center text-sm font-mono py-1.5 bg-background rounded-lg">
                  {c}
                </code>
              ))}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={copyBackupCodes}>
                <Copy className="size-4 mr-1" />
                {t("copyBackupCodes")}
              </Button>
              <Button variant="outline" className="flex-1" onClick={downloadBackupCodes}>
                <Download className="size-4 mr-1" />
                {t("downloadBackupCodes")}
              </Button>
            </div>

            <Button className="w-full" onClick={handleDone}>
              {t("done")}
            </Button>
          </div>
        )}
      </div>

      {/* Disable 2FA Dialog */}
      <AlertDialog open={disableOpen} onOpenChange={setDisableOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("disableTwoFactor")}</AlertDialogTitle>
            <AlertDialogDescription>{t("disableTwoFactorConfirm")}</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label className="text-xs">{t("password")}</Label>
              <Input
                type="password"
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
                placeholder={t("enterPassword")}
              />
            </div>
            <p className="text-xs text-muted-foreground text-center">{t("or")}</p>
            <div className="space-y-1">
              <Label className="text-xs">{t("verificationCode")}</Label>
              <Input
                type="text"
                inputMode="numeric"
                value={disableCode}
                onChange={(e) => setDisableCode(e.target.value)}
                placeholder="000000"
                maxLength={6}
                className="font-mono"
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); handleDisable() }}
              disabled={disabling || (!disablePassword && !disableCode)}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {disabling ? <Loader2 className="size-4 animate-spin" /> : t("disableTwoFactor")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Regenerate Backup Codes Dialog */}
      <AlertDialog open={regenOpen} onOpenChange={setRegenOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("regenerateBackupCodes")}</AlertDialogTitle>
            <AlertDialogDescription>{t("regenerateBackupCodesConfirm")}</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 py-2">
            <Label className="text-xs">{t("verificationCode")}</Label>
            <Input
              type="text"
              inputMode="numeric"
              value={regenCode}
              onChange={(e) => setRegenCode(e.target.value)}
              placeholder="000000"
              maxLength={6}
              className="font-mono"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); handleRegenerate() }}
              disabled={regenerating || regenCode.length !== 6}
            >
              {regenerating ? <Loader2 className="size-4 animate-spin" /> : t("regenerateBackupCodes")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
