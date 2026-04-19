"use client"

import { useEffect, useState, useCallback } from "react"
import { Search, LayoutDashboard, Terminal, Filter, RefreshCw, Download, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  onNavigate: (view: "dashboard" | "terminal") => void
  onAction?: (action: string) => void
}

const commands = [
  { id: "dashboard", label: "Go to Dashboard", icon: LayoutDashboard, category: "Navigation" },
  { id: "terminal", label: "Go to Terminal", icon: Terminal, category: "Navigation" },
  { id: "filter-errors", label: "Filter: Errors Only", icon: Filter, category: "Filters" },
  { id: "filter-warnings", label: "Filter: Warnings Only", icon: Filter, category: "Filters" },
  { id: "filter-info", label: "Filter: Info Only", icon: Filter, category: "Filters" },
  { id: "refresh", label: "Refresh Logs", icon: RefreshCw, category: "Actions" },
  { id: "export", label: "Export Logs", icon: Download, category: "Actions" },
]

export function CommandPalette({ isOpen, onClose, onNavigate, onAction }: CommandPaletteProps) {
  const [search, setSearch] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)

  const filteredCommands = commands.filter(
    (cmd) =>
      cmd.label.toLowerCase().includes(search.toLowerCase()) ||
      cmd.category.toLowerCase().includes(search.toLowerCase())
  )

  const handleSelect = useCallback((command: typeof commands[0]) => {
    if (command.id === "dashboard" || command.id === "terminal") {
      onNavigate(command.id)
    } else {
      onAction?.(command.id)
    }
    onClose()
    setSearch("")
    setSelectedIndex(0)
  }, [onNavigate, onAction, onClose])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        if (isOpen) {
          onClose()
        }
      }

      if (!isOpen) return

      if (e.key === "Escape") {
        onClose()
        setSearch("")
        setSelectedIndex(0)
      }

      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % filteredCommands.length)
      }

      if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length)
      }

      if (e.key === "Enter" && filteredCommands[selectedIndex]) {
        handleSelect(filteredCommands[selectedIndex])
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose, filteredCommands, selectedIndex, handleSelect])

  useEffect(() => {
    setSelectedIndex(0)
  }, [search])

  if (!isOpen) return null

  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = []
    acc[cmd.category].push(cmd)
    return acc
  }, {} as Record<string, typeof commands>)

  let globalIndex = 0

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed left-1/2 top-[20%] z-50 w-full max-w-lg -translate-x-1/2 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200">
        <div className="overflow-hidden rounded-xl border border-border bg-popover shadow-2xl">
          <div className="flex items-center gap-3 border-b border-border px-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Type a command or search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent py-4 text-sm text-foreground outline-none placeholder:text-muted-foreground"
              autoFocus
            />
            <button
              onClick={onClose}
              className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto p-2">
            {Object.entries(groupedCommands).map(([category, cmds]) => (
              <div key={category} className="mb-2">
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                  {category}
                </div>
                {cmds.map((cmd) => {
                  const Icon = cmd.icon
                  const currentIndex = globalIndex++
                  return (
                    <button
                      key={cmd.id}
                      onClick={() => handleSelect(cmd)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                        currentIndex === selectedIndex
                          ? "bg-accent text-accent-foreground"
                          : "text-foreground hover:bg-accent/50"
                      )}
                    >
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      {cmd.label}
                    </button>
                  )
                })}
              </div>
            ))}
            {filteredCommands.length === 0 && (
              <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                No commands found
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
