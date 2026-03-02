# idy-platform

Digital business card platform — replaces both `idy-base-admin` (Vue 3) and `idy-base-social` (Vue 3). Built with Next.js 16 App Router.

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript
- **UI:** Shadcn UI + Tailwind CSS 4
- **Charts:** Recharts
- **State:** Page-level `useState` + `useCallback` (no global store)
- **Auth:** JWT (httpOnly cookies) with middleware protection
- **i18n:** Custom context (`useTranslation`) with flat key-value dicts
- **Toast:** Sonner (`toast.success/error`)
- **Package manager:** pnpm

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/           # Authenticated layout
│   │   ├── admin/             # Admin panel (role-protected)
│   │   │   ├── analytics/     # Card performance analytics
│   │   │   ├── card-content/  # Spreadsheet editor
│   │   │   ├── cards/         # Card management (detail, bulk-import, redirects)
│   │   │   ├── companies/     # Company CRUD + card/user assignment
│   │   │   ├── field-types/   # Field type viewer (grouped)
│   │   │   ├── notifications/ # Send, logs, device management
│   │   │   ├── users/         # User CRUD (list, create, edit, detail)
│   │   │   └── page.tsx       # Dashboard (stats, charts, timeline)
│   │   ├── card/[cardId]/     # User card editor (fields, add, edit)
│   │   ├── cards/             # User's card list
│   │   ├── profile/           # Profile edit, change password
│   │   └── settings/          # User settings
│   ├── api/
│   │   ├── admin/             # Admin API proxy routes
│   │   ├── auth/              # Auth endpoints (login, logout, refresh, me)
│   │   ├── cards/             # User card API
│   │   └── user/              # User profile API
│   ├── [cardId]/              # Public card view (no auth)
│   ├── login/                 # Public auth pages
│   ├── register/
│   └── forgot-password/
├── components/
│   ├── admin/                 # Admin-specific components
│   │   ├── analytics/         # Chart components (Line, Bar, Pie, DateRangePicker)
│   │   ├── cards/             # Card table, actions, detail stats, QR, clone
│   │   ├── companies/         # Company table, form, detail, assign dialogs
│   │   ├── dashboard/         # Stats cards, weekly/performance charts, timeline
│   │   ├── field-types/       # Collapsible group cards
│   │   ├── notifications/     # Send form, logs table, device table, cleanup
│   │   ├── users/             # User table, form, detail card, cards list
│   │   ├── admin-page-header.tsx
│   │   ├── admin-sidebar.tsx
│   │   ├── confirm-dialog.tsx
│   │   └── phone-preview.tsx
│   └── ui/                    # Shadcn primitives
├── lib/
│   ├── admin/types.ts         # All admin type definitions (single file)
│   ├── api-client.ts          # Client-side fetch wrapper with auto-refresh
│   ├── api-helpers.ts         # Server-side proxyRequest() for API routes
│   ├── auth.ts                # JWT helpers, cookie constants
│   ├── auth/                  # Auth context provider
│   ├── hooks/                 # useDebouncedSearch, usePaginatedQuery
│   └── i18n/                  # en.ts + tr.ts dictionaries, context provider
└── middleware.ts               # Route protection (admin role check)
```

## Key Architectural Patterns

### API Proxy
All backend calls go through Next.js API routes using `proxyRequest()` from `src/lib/api-helpers.ts`. Client components never access `NEXT_PUBLIC_API_URL` directly.

```
Client → apiClient.get("/api/admin/users") → API Route → proxyRequest(req, "/admin/user") → Backend
```

### Page Convention
- Pages: `src/app/(dashboard)/admin/{feature}/page.tsx` with `"use client"`
- API routes: `src/app/api/admin/{feature}/route.ts`
- Components: `src/components/admin/{feature}/`
- All admin types in single file: `src/lib/admin/types.ts`
- i18n keys in flat dictionaries: `src/lib/i18n/en.ts` + `tr.ts`

### Auth & Roles
- Cookies: `idy_access_token`, `idy_refresh_token`, `idy_user`
- Middleware protects `/admin/*` routes — requires `admin` or `company_admin` role
- `apiClient` auto-retries on 401 by calling `/api/auth/refresh`

### Common Components
- `AdminPageHeader` — title + subtitle + back button + action button
- `ConfirmDialog` — reusable AlertDialog for delete/confirm actions
- `Pagination` — reusable pagination with page numbers, first/last/prev/next, "X-Y / Z" info (`src/components/admin/pagination.tsx`)
- `useDebouncedSearch` — debounced search hook with cleanup
- `usePaginatedQuery` — paginated data fetching with built-in cache & prefetch (`src/lib/hooks/use-paginated-query.ts`)

### Table Pagination Convention
**Every admin table that fetches paginated data MUST use `usePaginatedQuery` + `Pagination`.** Do not implement manual fetch/state/pagination logic. Usage:
```tsx
import { Pagination } from "@/components/admin/pagination"
import { usePaginatedQuery } from "@/lib/hooks/use-paginated-query"

const { data, total, page, totalPages, loading, search, setPage, setSearch, refetch } =
  usePaginatedQuery<MyType>({ url: "/api/admin/my-endpoint" })

// In JSX:
<Pagination page={page} totalPages={totalPages} total={total} pageSize={20} onPageChange={setPage} />
```
Features:
- **Prefetch**: Automatically fetches next 2 pages in background after each page load
- **Cache**: 1-minute in-memory cache — cached pages render instantly (no loading spinner)
- **Debounced search**: Built-in 400ms debounce, clears cache on search change
- **refetch()**: Invalidates cache and re-fetches current page (use after create/update/delete)
- `Pagination` auto-hides when `totalPages <= 1`. Place it after the table/data section.

## Admin Modules

| Module | Sidebar Icon | Route | Status |
|--------|-------------|-------|--------|
| Dashboard | LayoutDashboard | `/admin` | Stats, trends, charts, timeline |
| Users | Users | `/admin/users` | Full CRUD + visibility toggle |
| Cards | CreditCard | `/admin/cards` | Detail, clone, QR, bulk import, merge/redirect |
| Card Content | Table2 | `/admin/card-content` | Spreadsheet editor |
| Companies | Building2 | `/admin/companies` | CRUD + card/user assignment |
| Analytics | BarChart3 | `/admin/analytics` | Overview, per-card detail with date range + charts |
| Notifications | Bell | `/admin/notifications` | Send, logs, device management, cleanup |
| Field Types | Layers | `/admin/field-types` | Grouped read-only listing |

## Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # ESLint
```

## Notes

- Some backend endpoints may not exist yet — API routes proxy as-is, frontend handles errors gracefully with `Promise.allSettled` or try/catch
- i18n keys must be added to both `en.ts` and `tr.ts`
- Public card routes (`/[cardId]`) bypass auth — detected by `isCardRoute()` in middleware
- No global state store — each page manages its own state
- **Timestamp convention:** The system uses `inserted_at` (not `created_at`) as the creation timestamp field name in both API responses and frontend code. Never use `created_at` — always use `inserted_at`.
