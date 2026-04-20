"use client"

import { LayoutDashboard, Radio, Terminal, Activity } from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  activeView: "dashboard" | "livelogs" | "terminal"
  onViewChange: (view: "dashboard" | "livelogs" | "terminal") => void
}

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const navItems = [
    { id: "dashboard" as const, label: "Dashboard", icon: LayoutDashboard },
    { id: "livelogs" as const, label: "Live Logs", icon: Radio },
    { id: "terminal" as const, label: "Terminal", icon: Terminal },
  ]

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-full w-60 flex-col border-r border-border bg-sidebar">
      <div className="flex h-16 items-center gap-2 px-6">
        <Activity className="h-5 w-5 text-primary" />
        <span className="font-semibold text-sidebar-foreground">LogMaster</span>
      </div>
      
      <nav className="flex-1 px-3 py-4">
        <div className="rounded-lg bg-sidebar-accent/30 p-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeView === item.id
            
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <Icon className={cn("h-4 w-4", isActive && "text-primary")} />
                {item.label}
              </button>
            )
          })}
        </div>
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-2.5 w-2.5 rounded-full bg-success" />
            <div className="absolute inset-0 h-2.5 w-2.5 animate-ping rounded-full bg-success opacity-75" />
          </div>
          <span className="text-xs text-muted-foreground">System Healthy</span>
        </div>
      </div>
    </aside>
  )
}
