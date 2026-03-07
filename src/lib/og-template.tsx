import { readFile } from "node:fs/promises"
import { join } from "node:path"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export interface OGProfileData {
  name: string
  title: string
  company: string
  picture_url: string
  theme_color: string
}

export async function getCardProfile(cardId: string) {
  try {
    const res = await fetch(`${API_URL}/card/${cardId}/profile`, {
      next: { tags: [`card-${cardId}`], revalidate: 3600 },
    })
    if (!res.ok) return null
    const json = await res.json()
    return json.data as { user: OGProfileData }
  } catch {
    return null
  }
}

export async function fetchImageAsBase64(
  url: string
): Promise<string | null> {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const buffer = Buffer.from(await res.arrayBuffer())
    const ct = res.headers.get("content-type") || "image/jpeg"
    return `data:${ct};base64,${buffer.toString("base64")}`
  } catch {
    return null
  }
}

export async function loadLogo(): Promise<string> {
  const data = await readFile(
    join(process.cwd(), "public/logo.png"),
    "base64"
  )
  return `data:image/png;base64,${data}`
}

export function ProfileTemplate({
  user,
  avatarSrc,
  logoSrc,
}: {
  user: OGProfileData
  avatarSrc: string | null
  logoSrc: string
}) {
  const themeColor = user.theme_color || "#1e1e2e"
  const subtitle = [user.title, user.company].filter(Boolean).join("  ·  ")

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: `linear-gradient(135deg, ${themeColor} 0%, ${themeColor}dd 50%, ${themeColor}bb 100%)`,
        position: "relative",
      }}
    >
      {/* Dark overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.35)",
          display: "flex",
        }}
      />

      {/* Content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          flex: 1,
          padding: "50px 70px",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          {avatarSrc ? (
            <img
              src={avatarSrc}
              width={260}
              height={260}
              style={{
                borderRadius: "50%",
                border: "5px solid rgba(255,255,255,0.3)",
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              style={{
                width: 260,
                height: 260,
                borderRadius: "50%",
                border: "5px solid rgba(255,255,255,0.3)",
                background: "rgba(0,0,0,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 100,
                fontWeight: 700,
                color: "rgba(255,255,255,0.8)",
              }}
            >
              {user.name?.charAt(0)?.toUpperCase() || "?"}
            </div>
          )}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginLeft: 50,
              flex: 1,
            }}
          >
            <div
              style={{
                fontSize: 72,
                fontWeight: 700,
                color: "white",
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
              }}
            >
              {user.name}
            </div>
            {subtitle && (
              <div
                style={{
                  fontSize: 32,
                  color: "rgba(255,255,255,0.7)",
                  marginTop: 16,
                  lineHeight: 1.4,
                }}
              >
                {subtitle}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 70px 32px",
          position: "relative",
        }}
      >
        <img
          src={logoSrc}
          width={42}
          height={42}
          style={{ filter: "invert(1)", opacity: 0.6 }}
        />
      </div>
    </div>
  )
}

export function FallbackTemplate({ logoSrc }: { logoSrc: string }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #1e1e2e 0%, #2d2d3f 50%, #1a1a2e 100%)",
      }}
    >
      <img
        src={logoSrc}
        width={120}
        height={120}
        style={{ filter: "invert(1)" }}
      />
      <div
        style={{
          fontSize: 32,
          color: "rgba(255,255,255,0.6)",
          marginTop: 24,
        }}
      >
        Digital Business Card
      </div>
    </div>
  )
}

export function BrandedTemplate({ logoSrc }: { logoSrc: string }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #1e1e2e 0%, #2d2d3f 50%, #1a1a2e 100%)",
      }}
    >
      <img
        src={logoSrc}
        width={140}
        height={140}
        style={{ filter: "invert(1)" }}
      />
      <div
        style={{
          fontSize: 48,
          fontWeight: 700,
          color: "white",
          marginTop: 32,
          letterSpacing: "-0.02em",
        }}
      >
        idycard
      </div>
      <div
        style={{
          fontSize: 24,
          color: "rgba(255,255,255,0.5)",
          marginTop: 12,
        }}
      >
        Digital Business Card Platform
      </div>
    </div>
  )
}
