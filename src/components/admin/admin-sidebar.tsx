"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth/context"
import { useTranslation } from "@/lib/i18n/context"
import {
  Users,
  CreditCard,
  Table2,
  LayoutDashboard,
  Building2,
  BarChart3,
  Bell,
  Layers,
  Menu,
  ChevronLeft,
  LogOut,
  Crown,
  FolderSync,
  Smartphone,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useCompanyFeatures } from "@/lib/admin/company-features-context"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip"

const adminNavItems: {
  href: string
  icon: typeof LayoutDashboard
  labelKey: string
  featureGate?: string
}[] = [
  { href: "/admin", icon: LayoutDashboard, labelKey: "adminDashboard" },
  { href: "/admin/users", icon: Users, labelKey: "adminUsers" },
  { href: "/admin/cards", icon: CreditCard, labelKey: "adminCards" },
  { href: "/admin/card-content", icon: Table2, labelKey: "adminCardContent" },
  { href: "/admin/companies", icon: Building2, labelKey: "adminCompanies" },
  { href: "/admin/subscriptions", icon: Crown, labelKey: "adminSubscriptions" },
  { href: "/admin/analytics", icon: BarChart3, labelKey: "adminAnalytics" },
  { href: "/admin/ad-sync", icon: FolderSync, labelKey: "adminADSync", featureGate: "ad_sync" },
  { href: "/admin/notifications", icon: Bell, labelKey: "adminNotifications" },
  { href: "/admin/field-types", icon: Layers, labelKey: "adminFieldTypes" },
]

interface AdminSidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function AdminSidebar({ collapsed, onToggle }: AdminSidebarProps) {
  const pathname = usePathname()
  const { user, role } = useAuth()
  const { t } = useTranslation()
  const { hasCompanyFeature, loading: featuresLoading } = useCompanyFeatures()

  const visibleNavItems = adminNavItems.filter(
    (item) => !item.featureGate || featuresLoading || hasCompanyFeature(item.featureGate)
  )

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "flex flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-200",
          collapsed ? "w-16" : "w-60"
        )}
      >
        {/* Header */}
        <div className="flex h-14 items-center border-b px-3 gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="shrink-0"
          >
            {collapsed ? (
              <Menu className="size-5" />
            ) : (
              <ChevronLeft className="size-5" />
            )}
          </Button>
          {!collapsed && (
            <span className="font-semibold text-sm truncate">
              {t("adminPanel")}
            </span>
          )}
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-2">
          <nav className="flex flex-col gap-1 px-2">
            {visibleNavItems.map((item) => {
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href)

              const link = (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                    collapsed && "justify-center px-0",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  <item.icon className="size-4 shrink-0" />
                  {!collapsed && <span>{t(item.labelKey)}</span>}
                </Link>
              )

              if (collapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>{link}</TooltipTrigger>
                    <TooltipContent side="right">
                      {t(item.labelKey)}
                    </TooltipContent>
                  </Tooltip>
                )
              }

              return link
            })}
          </nav>
        </ScrollArea>

        {/* Version */}
        <p className="text-center text-[10px] text-sidebar-foreground/30 py-1">
          v{process.env.NEXT_PUBLIC_APP_VERSION}
        </p>

        {/* My Account */}
        <div className="border-t px-2 py-2">
          {(() => {
            const isActive = !pathname.startsWith("/admin")
            const link = (
              <Link
                href="/"
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                  collapsed && "justify-center px-0",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <Smartphone className="size-4 shrink-0" />
                {!collapsed && <span>{t("myAccount")}</span>}
              </Link>
            )

            if (collapsed) {
              return (
                <Tooltip>
                  <TooltipTrigger asChild>{link}</TooltipTrigger>
                  <TooltipContent side="right">
                    {t("myAccount")}
                  </TooltipContent>
                </Tooltip>
              )
            }

            return link
          })()}
        </div>

        {/* User info */}
        <div className="border-t p-3">
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center justify-center">
                  <div className="size-8 rounded-full bg-sidebar-accent flex items-center justify-center text-xs font-medium">
                    {user?.name?.charAt(0) || "?"}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{role}</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <div className="flex items-center gap-3">
              <div className="size-8 shrink-0 rounded-full bg-sidebar-accent flex items-center justify-center text-xs font-medium">
                {user?.name?.charAt(0) || "?"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{user?.name}</p>
                <span
                  className={cn(
                    "inline-block text-[10px] px-1.5 py-0.5 rounded-full font-medium truncate",
                    role === "admin"
                      ? "bg-primary/10 text-primary"
                      : "bg-orange-500/10 text-orange-600"
                  )}
                >
                  {role === "admin" ? t("roleAdmin") : t("roleCompanyAdmin")}
                </span>
              </div>
            </div>
          )}
        </div>
      </aside>
    </TooltipProvider>
  )
}
