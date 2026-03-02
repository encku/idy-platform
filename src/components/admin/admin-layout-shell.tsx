"use client"

import { useState, createContext, useContext } from "react"
import { usePathname } from "next/navigation"
import { AdminSidebar } from "./admin-sidebar"
import { PhonePreview } from "./phone-preview"
import { Toaster } from "@/components/ui/sonner"

// Context for sharing selected card across admin pages
interface AdminContextValue {
  selectedCardPublicKey: string | null
  setSelectedCardPublicKey: (key: string | null) => void
}

const AdminContext = createContext<AdminContextValue>({
  selectedCardPublicKey: null,
  setSelectedCardPublicKey: () => {},
})

export function useAdminContext() {
  return useContext(AdminContext)
}

export function AdminLayoutShell({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [selectedCardPublicKey, setSelectedCardPublicKey] = useState<
    string | null
  >(null)
  const pathname = usePathname()
  const isAdminRoute = pathname.startsWith("/admin")

  return (
    <AdminContext.Provider
      value={{ selectedCardPublicKey, setSelectedCardPublicKey }}
    >
      <div className="flex h-svh overflow-hidden bg-background">
        {/* Left: Sidebar */}
        <AdminSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Center: Content */}
        <main className="flex-1 overflow-y-auto">
          {isAdminRoute ? (
            <div className="p-6 max-w-6xl">{children}</div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground space-y-2">
                <p className="text-lg font-medium">Admin Dashboard</p>
                <p className="text-sm">
                  Sol menuden bir bolum secin
                </p>
              </div>
            </div>
          )}
        </main>

        {/* Right: Phone Preview */}
        <PhonePreview selectedCardPublicKey={selectedCardPublicKey} />

        <Toaster position="top-center" />
      </div>
    </AdminContext.Provider>
  )
}
