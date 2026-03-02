"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import tr from "./tr"
import en from "./en"

type Locale = "tr" | "en"

const dictionaries: Record<Locale, Record<string, string>> = { tr, en }

interface I18nContextValue {
  locale: Locale
  setLocale: (l: Locale) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

function detectLocale(): Locale {
  if (typeof window === "undefined") return "tr"
  const saved = localStorage.getItem("idy_locale")
  if (saved === "tr" || saved === "en") return saved
  const lang = navigator.language.split("-")[0]
  return lang === "en" ? "en" : "tr"
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(detectLocale)

  const handleSetLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem("idy_locale", newLocale)
  }, [])

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const t = useCallback(
    (key: string) => dictionaries[locale][key] ?? dictionaries.en[key] ?? key,
    [locale]
  )

  return (
    <I18nContext.Provider value={{ locale, setLocale: handleSetLocale, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useTranslation() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error("useTranslation must be used within I18nProvider")
  return ctx
}
