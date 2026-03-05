"use client"

import { BottomNav } from "@/components/dashboard/bottom-nav"
import { Toaster } from "@/components/ui/sonner"
import { FeaturesProvider } from "@/lib/features/context"
import { AuthProvider, useAuth } from "@/lib/auth/context"
import { useIsDesktop } from "@/lib/hooks/use-media-query"
import { AdminLayoutShell } from "@/components/admin/admin-layout-shell"
import { Skeleton } from "@/components/ui/skeleton"

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useAuth()
  const isDesktop = useIsDesktop()

  if (loading) {
    return (
      <div className="mx-auto min-h-svh max-w-md pb-20">
        <div className="p-5 space-y-4">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
        </div>
      </div>
    )
  }

  if (isDesktop && isAdmin) {
    return <AdminLayoutShell>{children}</AdminLayoutShell>
  }

  return (
    <div className="flex flex-col min-h-svh mx-auto max-w-md">
      <div className="flex-1">{children}</div>
      <BottomNav />
      <Toaster position="top-center" />
    </div>
  )
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <FeaturesProvider>
        <DashboardContent>{children}</DashboardContent>
      </FeaturesProvider>
    </AuthProvider>
  )
}
