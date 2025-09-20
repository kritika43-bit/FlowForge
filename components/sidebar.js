"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { FlowForgeLogo } from "./logo"
import { Button } from "./ui/button"
import { cn } from "../lib/utils"
import {
  LayoutDashboard,
  Package,
  Wrench,
  Factory,
  Archive,
  FileText,
  BarChart3,
  User,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Manufacturing Orders", href: "/manufacturing-orders", icon: Package },
  { name: "Work Orders", href: "/work-orders", icon: Wrench },
  { name: "Work Centers", href: "/work-centers", icon: Factory },
  { name: "Stock Ledger", href: "/stock-ledger", icon: Archive },
  { name: "BOM", href: "/bom", icon: FileText },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Profile", href: "/profile", icon: User },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <div
      className={cn(
        "flex flex-col h-screen bg-card border-r border-border transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className={cn("flex items-center gap-3 transition-opacity duration-200", collapsed && "opacity-0")}>
          <FlowForgeLogo className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-xl font-bold text-foreground">FlowForge</h1>
            <p className="text-xs text-muted-foreground">Manufacturing Hub</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setCollapsed(!collapsed)} className="h-8 w-8 p-0">
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <nav className="flex-1 p-2 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-11 transition-all duration-200",
                  collapsed && "px-2",
                  isActive && "bg-primary text-primary-foreground shadow-sm",
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className={cn("transition-opacity duration-200", collapsed && "opacity-0 w-0")}>{item.name}</span>
              </Button>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className={cn("p-4 border-t border-border transition-opacity duration-200", collapsed && "opacity-0")}>
        <p className="text-xs text-muted-foreground text-center">FlowForge v1.0</p>
      </div>
    </div>
  )
}
