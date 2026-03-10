"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiClient } from "@/lib/api-client"
import { useTranslation } from "@/lib/i18n/context"
import { toast } from "sonner"
import { Copy, RefreshCw, Loader2 } from "lucide-react"

interface Props {
  connectionId: string
}

export function SCIMConfigTab({ connectionId }: Props) {
  const { t } = useTranslation()
  const [generatedToken, setGeneratedToken] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [scimEndpoint, setScimEndpoint] = useState("/scim/v2")

  useEffect(() => {
    setScimEndpoint(`${window.location.origin}/scim/v2`)
  }, [])

  async function handleGenerateToken() {
    setGenerating(true)
    try {
      const res = await apiClient.post<{ data: { token: string } }>(
        `/api/admin/ad-sync/connections/${connectionId}/scim-token`,
        {}
      )
      setGeneratedToken(res.data.token)
    } catch {
      toast.error(t("errorOccurred"))
    } finally {
      setGenerating(false)
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
    toast.success(t("tokenCopied"))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("scimConfiguration")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{t("scimConfigDesc")}</p>

          <div className="space-y-2">
            <Label>{t("scimEndpointUrl")}</Label>
            <div className="flex gap-2">
              <Input value={scimEndpoint} readOnly className="font-mono text-xs" />
              <Button variant="outline" size="icon" onClick={() => copyToClipboard(scimEndpoint)}>
                <Copy className="size-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t("scimBearerToken")}</Label>
            {generatedToken ? (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={generatedToken}
                    readOnly
                    className="font-mono text-xs"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(generatedToken)}
                  >
                    <Copy className="size-4" />
                  </Button>
                </div>
                <p className="text-xs text-amber-600">{t("scimTokenWarning")}</p>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleGenerateToken} disabled={generating}>
                  {generating ? (
                    <Loader2 className="size-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="size-4 mr-2" />
                  )}
                  {t("generateToken")}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
