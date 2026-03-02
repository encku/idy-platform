"use client"

import { useRef, useEffect, useCallback } from "react"

export function useDebouncedSearch(
  callback: (value: string) => void,
  delay = 400
) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const debouncedSearch = useCallback(
    (value: string) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(value)
      }, delay)
    },
    [delay]
  )

  return debouncedSearch
}
