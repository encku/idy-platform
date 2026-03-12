/**
 * Integration test setup — Logs in once and provides cookies for all tests.
 * If the server is unreachable, all tests are skipped (not failed).
 */
import { beforeAll } from "vitest"
import { config } from "dotenv"
import { resolve } from "path"

config({ path: resolve(__dirname, "../../../.env.test"), override: true })

const BASE_URL = process.env.BASE_URL || "http://localhost:3000"
const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || ""
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || ""

/** Stored cookies after login */
let _cookies = ""
let _serverAvailable = false
let _loginDone = false

/** First discovered entity IDs (auto-discovered from list endpoints) */
const _discovered: Record<string, string | number> = {}

export function getBaseUrl(): string {
  return BASE_URL
}

export function getCookies(): string {
  return _cookies
}

export function isServerAvailable(): boolean {
  return _serverAvailable
}

export function getDiscovered(key: string): string | number | undefined {
  return _discovered[key]
}

export function setDiscovered(key: string, value: string | number): void {
  _discovered[key] = value
}

/**
 * Perform login and cache cookies. Called once before all integration tests.
 */
async function login(): Promise<boolean> {
  if (_loginDone) return _serverAvailable

  _loginDone = true

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.warn(
      "[integration] TEST_ADMIN_EMAIL or TEST_ADMIN_PASSWORD not set in .env.test — skipping"
    )
    return false
  }

  // Check if server is reachable
  try {
    const probe = await fetch(`${BASE_URL}/api/auth/me`, {
      signal: AbortSignal.timeout(5000),
    })
    // Even a 401 means the server is up
    if (probe.status === 0) return false
  } catch {
    console.warn(
      `[integration] Server not reachable at ${BASE_URL} — skipping all integration tests`
    )
    return false
  }

  // Login
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
      redirect: "manual",
    })

    if (!res.ok) {
      console.warn(
        `[integration] Login failed with status ${res.status} — skipping`
      )
      return false
    }

    // Extract Set-Cookie headers
    const setCookies = res.headers.getSetCookie?.() ?? []
    if (setCookies.length === 0) {
      // Fallback: try raw header
      const raw = res.headers.get("set-cookie")
      if (raw) {
        _cookies = raw
          .split(/,(?=\s*\w+=)/)
          .map((c) => c.split(";")[0].trim())
          .join("; ")
      }
    } else {
      _cookies = setCookies.map((c) => c.split(";")[0].trim()).join("; ")
    }

    if (!_cookies) {
      console.warn("[integration] No cookies received after login — skipping")
      return false
    }

    _serverAvailable = true
    console.log("[integration] Login successful, cookies acquired")
    return true
  } catch (err) {
    console.warn(`[integration] Login error: ${err} — skipping`)
    return false
  }
}

// Run login before all tests
beforeAll(async () => {
  await login()
})
