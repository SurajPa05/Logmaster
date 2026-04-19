"use client"

import { Command, User } from "lucide-react"
import { Button } from "@/components/ui/button"

interface NavbarProps {
  onOpenCommandPalette: () => void
}

export function Navbar({ onOpenCommandPalette }: NavbarProps) {
  return (
    <header className="fixed left-60 right-0 top-0 z-30 flex h-16 items-center justify-between border-b border-border/50 bg-background/80 px-6 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenCommandPalette}
          className="gap-2 bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <Command className="h-3.5 w-3.5" />
          <span className="text-xs">Search</span>
          <kbd className="ml-2 hidden rounded bg-border px-1.5 py-0.5 text-[10px] font-medium sm:inline-block">
            ⌘K
          </kbd>
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full bg-muted hover:bg-accent"
        >
          <User className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>
    </header>
  )
}
