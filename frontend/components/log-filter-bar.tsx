"use client"

import { Search, Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"

export type LogLevel = "error" | "warning" | "info"

interface LogFilterBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedLevels: LogLevel[]
  onLevelToggle: (level: LogLevel) => void
  onClearFilters: () => void
}

export function LogFilterBar({
  searchQuery,
  onSearchChange,
  selectedLevels,
  onLevelToggle,
  onClearFilters,
}: LogFilterBarProps) {
  const hasActiveFilters = searchQuery || selectedLevels.length < 3

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search logs..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-md bg-muted py-2 pl-10 pr-4 text-sm text-foreground outline-none ring-ring placeholder:text-muted-foreground focus:ring-1"
        />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-3.5 w-3.5" />
            Severity
            {selectedLevels.length < 3 && (
              <span className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                {selectedLevels.length}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Filter by level
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={selectedLevels.includes("error")}
            onCheckedChange={() => onLevelToggle("error")}
            className="gap-2"
          >
            <span className="h-2 w-2 rounded-full bg-destructive" />
            Error
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={selectedLevels.includes("warning")}
            onCheckedChange={() => onLevelToggle("warning")}
            className="gap-2"
          >
            <span className="h-2 w-2 rounded-full bg-warning" />
            Warning
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={selectedLevels.includes("info")}
            onCheckedChange={() => onLevelToggle("info")}
            className="gap-2"
          >
            <span className="h-2 w-2 rounded-full bg-info" />
            Info
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
          Clear
        </Button>
      )}
    </div>
  )
}
