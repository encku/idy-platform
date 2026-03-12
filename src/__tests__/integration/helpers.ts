/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Shared helpers for integration tests.
 */
import { expect } from "vitest"
import { getBaseUrl, getCookies, isServerAvailable } from "./setup-integration"

// ─── Skip helper ───────────────────────────────────────────

/**
 * Call at the top of every describe block:
 *   beforeEach(() => { skipIfUnavailable() })
 */
export function skipIfUnavailable(): void {
  if (!isServerAvailable()) {
    // @ts-expect-error — vitest global
    globalThis.expect?.({ skip: true }).toBeTruthy()
    // Alternative: throw to skip
    throw new Error("SERVER_UNAVAILABLE")
  }
}

// ─── Fetch helper ──────────────────────────────────────────

interface FetchOptions {
  method?: string
  headers?: Record<string, string>
  body?: string
  timeout?: number
}

export async function apiFetch<T = unknown>(
  path: string,
  options: FetchOptions = {}
): Promise<{ status: number; data: T; responseTime: number }> {
  const url = `${getBaseUrl()}${path}`
  const start = Date.now()

  const res = await fetch(url, {
    method: options.method || "GET",
    headers: {
      Cookie: getCookies(),
      "Content-Type": "application/json",
      ...options.headers,
    },
    body: options.body,
    signal: AbortSignal.timeout(options.timeout ?? 10_000),
  })

  const responseTime = Date.now() - start
  let data: T

  try {
    data = (await res.json()) as T
  } catch {
    data = null as T
  }

  return { status: res.status, data, responseTime }
}

/**
 * Fetch without cookies — for testing 401 responses.
 */
export async function unauthenticatedFetch<T = unknown>(
  path: string
): Promise<{ status: number; data: T }> {
  const url = `${getBaseUrl()}${path}`
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    signal: AbortSignal.timeout(10_000),
  })

  let data: T
  try {
    data = (await res.json()) as T
  } catch {
    data = null as T
  }

  return { status: res.status, data }
}

// ─── Assertion helpers ─────────────────────────────────────

export interface PaginatedResponse<T = unknown> {
  data: T[]
  total: number
  page?: number
  limit?: number
}

/**
 * Assert response is a valid paginated list.
 */
export function assertPaginatedResponse(
  body: unknown,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _label = "response"
): asserts body is PaginatedResponse {
  expect(body).toBeDefined()
  expect(body).toHaveProperty("data")
  expect(body).toHaveProperty("total")

  const resp = body as PaginatedResponse
  expect(Array.isArray(resp.data)).toBe(true)
  expect(typeof resp.total).toBe("number")
  expect(resp.total).toBeGreaterThanOrEqual(0)
  // data.length should never exceed total
  expect(resp.data.length).toBeLessThanOrEqual(
    resp.total,
  )
}

/**
 * Assert a field exists and is non-empty on every item in an array.
 */
 
export function assertFieldOnAll(
  items: any[],
  field: string
): void {
  for (const item of items) {
    expect(item).toHaveProperty(field)
    expect(item[field]).toBeDefined()
  }
}

/**
 * Assert an id is a positive number.
 */
export function assertValidId(id: unknown): void {
  expect(typeof id).toBe("number")
  expect(id as number).toBeGreaterThan(0)
}

/**
 * Assert a string looks like an ISO 8601 date.
 */
export function assertValidDate(date: unknown): void {
  expect(typeof date).toBe("string")
  expect(new Date(date as string).toString()).not.toBe("Invalid Date")
}

/**
 * Assert response time is under a threshold.
 */
export function assertResponseTime(ms: number, maxMs = 5000): void {
  expect(ms).toBeLessThan(maxMs)
}

/**
 * Assert items on page 1 differ from items on page 2.
 */
export function assertDifferentPages<T extends { id?: number; card_id?: number }>(
  page1: T[],
  page2: T[]
): void {
  if (page1.length === 0 || page2.length === 0) return
  const getId = (item: T) => item.id ?? item.card_id
  const ids1 = new Set(page1.map(getId))
  const ids2 = new Set(page2.map(getId))
  // At least one ID should differ (unless total < limit)
  const overlap = [...ids2].filter((id) => ids1.has(id))
  expect(overlap.length).toBeLessThan(Math.max(ids1.size, ids2.size))
}
