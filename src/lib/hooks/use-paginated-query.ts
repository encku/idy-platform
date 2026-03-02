"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { apiClient } from "@/lib/api-client"

interface UsePaginatedQueryOptions {
  /** API endpoint, e.g. "/api/admin/users" */
  url: string
  /** Items per page (default 20) */
  pageSize?: number
  /** How many pages ahead to prefetch (default 2) */
  prefetch?: number
  /** Extra query params appended to every request */
  extraParams?: Record<string, string>
}

interface UsePaginatedQueryResult<T> {
  data: T[]
  total: number
  page: number
  totalPages: number
  loading: boolean
  search: string
  setPage: (page: number) => void
  setSearch: (value: string) => void
  /** Re-fetch current page and invalidate cache */
  refetch: () => void
}

interface CacheEntry<T> {
  data: T[]
  total: number
  timestamp: number
}

const CACHE_TTL = 60_000 // 1 minute
const DEBOUNCE_DELAY = 400

export function usePaginatedQuery<T>(
  options: UsePaginatedQueryOptions
): UsePaginatedQueryResult<T> {
  const { url, pageSize = 20, prefetch = 2, extraParams } = options

  const [data, setData] = useState<T[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPageState] = useState(1)
  const [search, setSearchState] = useState("")
  const [loading, setLoading] = useState(true)

  const cacheRef = useRef<Map<string, CacheEntry<T>>>(new Map())
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const buildKey = useCallback(
    (p: number, s: string) => `${url}|${p}|${s}|${JSON.stringify(extraParams ?? {})}`,
    [url, extraParams]
  )

  const fetchPage = useCallback(
    async (p: number, s: string): Promise<CacheEntry<T> | null> => {
      // Check cache
      const key = buildKey(p, s)
      const cached = cacheRef.current.get(key)
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached
      }

      try {
        const params = new URLSearchParams({
          page: String(p),
          limit: String(pageSize),
          search: s,
          ...extraParams,
        })
        const res = await apiClient.get<{ data: T[]; total: number }>(
          `${url}?${params}`
        )
        const entry: CacheEntry<T> = {
          data: res.data || [],
          total: res.total || 0,
          timestamp: Date.now(),
        }
        cacheRef.current.set(key, entry)
        return entry
      } catch {
        return null
      }
    },
    [url, pageSize, extraParams, buildKey]
  )

  const prefetchAhead = useCallback(
    (currentPage: number, s: string, maxPage: number) => {
      for (let i = 1; i <= prefetch; i++) {
        const nextPage = currentPage + i
        if (nextPage > maxPage) break
        const key = buildKey(nextPage, s)
        if (!cacheRef.current.has(key)) {
          // Fire and forget — don't await, don't set state
          fetchPage(nextPage, s)
        }
      }
    },
    [prefetch, buildKey, fetchPage]
  )

  const loadPage = useCallback(
    async (p: number, s: string, showLoading = true) => {
      // Serve from cache instantly if available
      const key = buildKey(p, s)
      const cached = cacheRef.current.get(key)
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        if (!mountedRef.current) return
        setData(cached.data)
        setTotal(cached.total)
        setLoading(false)
        const tp = Math.ceil(cached.total / pageSize)
        prefetchAhead(p, s, tp)
        return
      }

      if (showLoading && mountedRef.current) setLoading(true)

      const entry = await fetchPage(p, s)
      if (!mountedRef.current) return

      if (entry) {
        setData(entry.data)
        setTotal(entry.total)
        const tp = Math.ceil(entry.total / pageSize)
        prefetchAhead(p, s, tp)
      } else {
        setData([])
        setTotal(0)
      }
      setLoading(false)
    },
    [buildKey, fetchPage, pageSize, prefetchAhead]
  )

  // Initial load
  useEffect(() => {
    loadPage(1, "")
  }, [loadPage])

  const setPage = useCallback(
    (p: number) => {
      setPageState(p)
      loadPage(p, search)
    },
    [search, loadPage]
  )

  const setSearch = useCallback(
    (value: string) => {
      setSearchState(value)
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        // Clear cache on search change
        cacheRef.current.clear()
        setPageState(1)
        loadPage(1, value)
      }, DEBOUNCE_DELAY)
    },
    [loadPage]
  )

  const refetch = useCallback(() => {
    cacheRef.current.clear()
    loadPage(page, search, true)
  }, [page, search, loadPage])

  const totalPages = Math.ceil(total / pageSize)

  return {
    data,
    total,
    page,
    totalPages,
    loading,
    search,
    setPage,
    setSearch,
    refetch,
  }
}
