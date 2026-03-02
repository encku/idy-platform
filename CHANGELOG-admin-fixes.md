# IDY Platform - Admin Panel Bug Fix & Improvement Log

**Tarih:** 2026-02-12
**Kapsam:** idy-platform (Next.js 16 / App Router)
**Etkilenen Alan:** Admin panel guvenlik, mimari, performans

---

## 1. Middleware Admin Route Korumasi (Kritik)

**Sorun:** Middleware sadece authentication kontrol ediyordu. Herhangi bir authenticated kullanici (read_only, viewer dahil) `/admin/*` route'larina erisebiliyordu.

**Cozum:**
- `src/lib/auth.ts` — `getRoleFromToken()` helper fonksiyonu eklendi (JWT payload'dan role claim'i okur)
- `src/middleware.ts` — `/admin/*` route'lari icin role kontrolu eklendi. Sadece `admin` ve `company_admin` rolleri erisebilir. Non-admin kullanicilar `/`'e redirect edilir. Token refresh sonrasinda da ayni kontrol uygulanir.

**Degisen dosyalar:**
- `src/lib/auth.ts`
- `src/middleware.ts`

---

## 2. PhonePreview Proxy Pattern (Kritik)

**Sorun:** `PhonePreview` componenti `NEXT_PUBLIC_API_URL` ile dogrudan backend'e istek atiyordu. Backend URL'si client tarafina expose oluyordu ve mevcut proxy pattern bypass ediliyordu.

**Cozum:**
- Iki yeni proxy route olusturuldu:
  - `src/app/api/cards/[cardId]/profile/route.ts` — Card profile verisi icin GET proxy
  - `src/app/api/cards/[cardId]/lead-form/route.ts` — Lead form verisi icin POST proxy
- `src/components/admin/phone-preview.tsx` — `API_URL` referansi kaldirildi, fetch URL'leri `/api/cards/...` proxy route'larina yonlendirildi

**Degisen dosyalar:**
- `src/components/admin/phone-preview.tsx`

**Yeni dosyalar:**
- `src/app/api/cards/[cardId]/profile/route.ts`
- `src/app/api/cards/[cardId]/lead-form/route.ts`

---

## 3. Spreadsheet Admin Endpoint (Kritik)

**Sorun:** Admin spreadsheet inline edit islemi `/api/cards/[cardId]/fields/[fieldId]` (user endpoint) kullaniyordu. Bu endpoint backend'de kart sahiplik kontrolu yapiyor, bu yuzden admin baska bir kullanicinin kartini duzenleyemiyordu.

**Cozum:**
- Yeni admin proxy route olusturuldu: `src/app/api/admin/cards/[cardId]/fields/[fieldId]/route.ts`
  - Backend'deki `/admin/card/{cardId}/field/{fieldId}` endpoint'ine yonlendirir
  - Multipart form-data ve JSON destegi mevcut
- `src/components/admin/card-content/spreadsheet-view.tsx` — Endpoint `/api/admin/cards/...` olarak guncellendi

**Not:** Backend'de `PUT /admin/card/{cardId}/field/{fieldId}` endpoint'inin mevcut olmasi gerekiyor. Mevcut degilse backend'e eklenmeli.

**Degisen dosyalar:**
- `src/components/admin/card-content/spreadsheet-view.tsx`

**Yeni dosyalar:**
- `src/app/api/admin/cards/[cardId]/fields/[fieldId]/route.ts`

---

## 4. N+1 Query Optimizasyonu (Yuksek)

**Sorun:** Card content endpoint'i 1 kart listesi istegi + N profil istegi yapiyordu (30 kart = 31 HTTP istegi). Tum istekler `Promise.all` ile paralel atiliyordu ama backend'e asiri yuk biniyordu.

**Cozum:**
- `src/app/api/admin/cards/content/route.ts` — Concurrency-limited batch fetch uygulamasi (5'li gruplar halinde paralel istek)
- Response'a cache header eklendi: `Cache-Control: private, max-age=30, stale-while-revalidate=60`
- Backend bulk endpoint icin TODO yorumu eklendi

**Gelecek iyilestirme:** Backend'e `POST /admin/card/bulk-profiles` veya `GET /admin/card?include=fields` gibi tek istekte tum field'lari donen bir endpoint eklenmeli.

**Degisen dosyalar:**
- `src/app/api/admin/cards/content/route.ts`

---

## 5. Dashboard Layout SSR (Orta)

**Sorun:** `(dashboard)/layout.tsx` tamamen `"use client"` olarak isaretlenmisti. Bu, tum dashboard sayfalari icin server-side rendering kaybina yol aciyordu.

**Cozum:**
- Client-side logic (AuthProvider, FeaturesProvider, conditional rendering) yeni `DashboardShell` componentine tasindi
- `layout.tsx` artik server component — `"use client"` direktifi kaldirildi
- Client boundary mumkun olan en dar noktaya (`DashboardShell`) itildi

**Mimari:**
```
layout.tsx (Server Component)
  └── DashboardShell (Client Component - "use client")
        ├── AuthProvider
        ├── FeaturesProvider
        └── DashboardContent
              ├── isDesktop && isAdmin → AdminLayoutShell (3 panel)
              └── default → Mobile Layout (max-w-md + BottomNav)
```

**Degisen dosyalar:**
- `src/app/(dashboard)/layout.tsx`

**Yeni dosyalar:**
- `src/components/dashboard/dashboard-shell.tsx`

---

## 6. Search Debounce Memory Leak (Orta)

**Sorun:** 3 admin sayfada (cards, users, card-content) debounce icin `useState` ile setTimeout ID saklaniyor ama component unmount oldiginda timeout temizlenmiyordu. Bu, unmount sonrasi state update'e ve potansiyel memory leak'e yol aciyordu.

**Cozum:**
- Yeni `useDebouncedSearch` hook olusturuldu:
  - `useRef` ile timeout referansi (state yerine)
  - `useEffect` cleanup ile unmount'ta otomatik temizleme
  - `callbackRef` ile stale closure onlenmesi
- 3 admin sayfadan `searchTimeout` state kaldirildi, hook ile degistirildi

**Degisen dosyalar:**
- `src/app/(dashboard)/admin/cards/page.tsx`
- `src/app/(dashboard)/admin/users/page.tsx`
- `src/app/(dashboard)/admin/card-content/page.tsx`

**Yeni dosyalar:**
- `src/lib/hooks/use-debounced-search.ts`

---

## 7. Sidebar Rol Gostergesi (Orta)

**Sorun:** `company_admin` ile `admin` (superadmin) sidebar'da ayni gorunume sahipti. Rol farki yeterince belirgin degildi.

**Cozum:**
- `src/components/admin/admin-sidebar.tsx` — Kullanici bilgi alanindaki rol yazisi renkli badge'e donusturuldu:
  - Super Admin: primary renk (mavi ton) badge
  - Company Admin: turuncu badge
- Tum menu ogeleri her iki rol icin gorunur kalir (company_admin da Users dahil tum menuleri gorur)
- Veri kapsamlama (scope) backend tarafinda yonetilir

**Degisen dosyalar:**
- `src/components/admin/admin-sidebar.tsx`

---

## Mobil Gorunum Notu

Mobil gorunum (`max-w-md` container + `BottomNav`) ayrı bir scope olarak korunmaktadir:

- **Konum:** `src/components/dashboard/dashboard-shell.tsx` icinde `DashboardContent` default branch'i
- **Kosul:** `!(isDesktop && isAdmin)` durumunda render edilir
- **Bagimsizlik:** `idy-base-mobile` (React Native) ile paralel gelistirmeye uygundur
- **Etkilesim yok:** Admin panel degisiklikleri mobil gorunumu etkilemez, ayni route'lar ve component'lar kullanilir

Mobil web gorunumu su component'leri kullanir:
- `src/components/dashboard/bottom-nav.tsx` — Alt navigasyon (Profile, Cards, AI Assistant, Stats, Settings)
- `src/components/dashboard/app-header.tsx` — Ust baslik
- Sayfa component'lari (`/`, `/cards`, `/settings` vb.)

---

## Tum Yeni Dosyalar

| Dosya | Amac |
|-------|------|
| `src/app/api/cards/[cardId]/profile/route.ts` | Card profile proxy (Issue 2) |
| `src/app/api/cards/[cardId]/lead-form/route.ts` | Lead form proxy (Issue 2) |
| `src/app/api/admin/cards/[cardId]/fields/[fieldId]/route.ts` | Admin field edit proxy (Issue 3) |
| `src/lib/hooks/use-debounced-search.ts` | Debounce hook (Issue 6) |
| `src/components/dashboard/dashboard-shell.tsx` | Dashboard client shell (Issue 5) |

## Tum Degisen Dosyalar

| Dosya | Issue |
|-------|-------|
| `src/lib/auth.ts` | 1 — getRoleFromToken eklendi |
| `src/middleware.ts` | 1 — Admin route korumasi |
| `src/components/admin/phone-preview.tsx` | 2 — Proxy URL'leri |
| `src/components/admin/card-content/spreadsheet-view.tsx` | 3 — Admin endpoint |
| `src/app/api/admin/cards/content/route.ts` | 4 — Batch fetch + cache |
| `src/app/(dashboard)/layout.tsx` | 5 — Server component |
| `src/app/(dashboard)/admin/cards/page.tsx` | 6 — Debounce hook |
| `src/app/(dashboard)/admin/users/page.tsx` | 6 — Debounce hook |
| `src/app/(dashboard)/admin/card-content/page.tsx` | 6 — Debounce hook |
| `src/components/admin/admin-sidebar.tsx` | 7 — Rol badge |

---

## Dogrulama Kontrol Listesi

- [ ] Non-admin kullaniciyla `/admin` route'una erisim → `/`'e redirect olmali
- [ ] PhonePreview'de network tab'da `NEXT_PUBLIC_API_URL` dogrudan gorulmemeli
- [ ] Spreadsheet inline edit admin olarak baska kullanicinin kartinda calismali
- [ ] Card content sayfasi 5'li batch'ler halinde profil yuklemeli
- [ ] Admin sayfalarinda arama yapip hizlica route degistirirken console'da state warning olmamali
- [ ] Company admin sidebar'da turuncu "Company Admin" badge'i gorulmeli
- [ ] Super admin sidebar'da mavi "Super Admin" badge'i gorulmeli
- [ ] `next build` basarili olmali (dogrulandi)
