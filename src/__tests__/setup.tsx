/* eslint-disable @next/next/no-img-element, jsx-a11y/alt-text */
import "@testing-library/jest-dom/vitest"
import { cleanup } from "@testing-library/react"
import { afterEach, vi } from "vitest"

afterEach(() => {
  cleanup()
})

// ── next/navigation ──
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
  redirect: vi.fn(),
  notFound: vi.fn(),
}))

// ── next/image ──
vi.mock("next/image", () => ({
  default: function MockImage(props: Record<string, unknown>) {
     
    // Strip next/image-specific props before passing to <img>
    const { fill, priority, placeholder, blurDataURL, ...rest } = props // eslint-disable-line @typescript-eslint/no-unused-vars
    return <img {...(rest as React.ImgHTMLAttributes<HTMLImageElement>)} />
  },
}))

// ── next/link ──
vi.mock("next/link", () => ({
  default: function MockLink({
    children,
    href,
    ...rest
  }: {
    children: React.ReactNode
    href: string
    [key: string]: unknown
  }) {
    return (
      <a href={href} {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {children}
      </a>
    )
  },
}))

// ── next-themes ──
vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "light", setTheme: vi.fn(), resolvedTheme: "light" }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}))

// ── sonner ──
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
  Toaster: () => null,
}))

// ── i18n context ──
vi.mock("@/lib/i18n/context", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    locale: "en",
    setLocale: vi.fn(),
  }),
  I18nProvider: ({ children }: { children: React.ReactNode }) => children,
}))

// ── auth context ──
vi.mock("@/lib/auth/context", () => ({
  useAuth: () => ({
    user: { id: 1, name: "Test User", email: "test@test.com", email_verified: true },
    role: "admin" as const,
    isAdmin: true,
    isViewer: false,
    canEdit: true,
    loading: false,
    refetch: vi.fn(),
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}))

// ── apiClient ──
vi.mock("@/lib/api-client", () => ({
  apiClient: {
    get: vi.fn().mockResolvedValue({ data: [], total: 0 }),
    post: vi.fn().mockResolvedValue({ data: {} }),
    put: vi.fn().mockResolvedValue({ data: {} }),
    del: vi.fn().mockResolvedValue({ data: {} }),
  },
}))

// ── features context ──
vi.mock("@/lib/features/context", () => ({
  useFeatures: () => ({
    isPremium: true,
    isInTrial: false,
    hasFeature: () => true,
    features: null,
    loading: false,
    refetch: vi.fn(),
  }),
  FeaturesProvider: ({ children }: { children: React.ReactNode }) => children,
}))

// ── company features context ──
vi.mock("@/lib/admin/company-features-context", () => ({
  useCompanyFeatures: () => ({
    hasCompanyFeature: () => true,
    loading: false,
  }),
  CompanyFeaturesProvider: ({ children }: { children: React.ReactNode }) => children,
}))

// ── usePaginatedQuery ──
vi.mock("@/lib/hooks/use-paginated-query", () => ({
  usePaginatedQuery: () => ({
    data: [],
    total: 0,
    page: 1,
    totalPages: 1,
    loading: false,
    search: "",
    setPage: vi.fn(),
    setSearch: vi.fn(),
    refetch: vi.fn(),
  }),
}))

// ── useDebouncedSearch ──
vi.mock("@/lib/hooks/use-debounced-search", () => ({
  useDebouncedSearch: () => ({
    search: "",
    debouncedSearch: "",
    setSearch: vi.fn(),
  }),
}))

// ── useMediaQuery ──
vi.mock("@/lib/hooks/use-media-query", () => ({
  useMediaQuery: () => false,
}))

// ── recharts ──
vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  LineChart: () => <div data-testid="line-chart" />,
  BarChart: () => <div data-testid="bar-chart" />,
  PieChart: () => <div data-testid="pie-chart" />,
  AreaChart: () => <div data-testid="area-chart" />,
  Line: () => null,
  Bar: () => null,
  Pie: () => null,
  Area: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
  Cell: () => null,
}))

// ── Suppress ResizeObserver not defined ──
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// ── Mock IntersectionObserver ──
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
  root = null
  rootMargin = ""
  thresholds = []
  takeRecords() {
    return []
  }
} as unknown as typeof IntersectionObserver

// ── Mock matchMedia ──
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// ── Mock localStorage ──
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, "localStorage", { value: localStorageMock })
