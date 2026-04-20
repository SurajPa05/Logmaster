"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { Navbar } from "@/components/navbar"
import { CommandPalette } from "@/components/command-palette"
import { Dashboard } from "@/components/dashboard"
import { LogStream } from "@/components/log-stream"
import { Terminal } from "@/components/terminal"

export default function Home() {
  const [activeView, setActiveView] = useState<"dashboard" | "livelogs" | "terminal">("dashboard")
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setIsCommandPaletteOpen(true)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const handleCommandAction = (action: string) => {
    if (action.startsWith("filter-")) {
      setActiveView("livelogs")
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      <Navbar onOpenCommandPalette={() => setIsCommandPaletteOpen(true)} />
      
      <main className="ml-60 mt-16 flex-1 overflow-auto p-6">
        {activeView === "dashboard" && <Dashboard />}
        {activeView === "livelogs" && <LogStream />}
        {activeView === "terminal" && <Terminal />}
      </main>

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={setActiveView}
        onAction={handleCommandAction}
      />
    </div>
  )
}
