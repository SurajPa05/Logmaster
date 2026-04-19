"use client"

import { useEffect, useRef, useState, useMemo } from "react"
import { cn } from "@/lib/utils"
import { LogFilterBar, type LogLevel } from "./log-filter-bar"

interface LogEntry {
  id: string
  timestamp: Date
  level: LogLevel
  message: string
  source: string
}

const generateMockLogs = (): LogEntry[] => {
  const sources = ["api-gateway", "auth-service", "db-connector", "worker-1", "cache-layer"]
  const errorMessages = [
    "Connection refused to database server",
    "Failed to authenticate user request",
    "Timeout exceeded for API call",
    "Memory allocation failed",
    "Invalid JSON payload received",
  ]
  const warningMessages = [
    "High memory usage detected (85%)",
    "Slow query execution (>2s)",
    "Rate limit approaching threshold",
    "Certificate expires in 7 days",
    "Deprecated API version in use",
  ]
  const infoMessages = [
    "Server started on port 3000",
    "User session created successfully",
    "Cache cleared for key: user_*",
    "Background job completed",
    "Health check passed",
    "New connection established",
    "Request processed in 142ms",
  ]

  const logs: LogEntry[] = []
  const now = new Date()

  for (let i = 0; i < 50; i++) {
    const rand = Math.random()
    let level: LogLevel
    let messages: string[]

    if (rand < 0.15) {
      level = "error"
      messages = errorMessages
    } else if (rand < 0.35) {
      level = "warning"
      messages = warningMessages
    } else {
      level = "info"
      messages = infoMessages
    }

    logs.push({
      id: `log-${i}`,
      timestamp: new Date(now.getTime() - i * 30000 - Math.random() * 10000),
      level,
      message: messages[Math.floor(Math.random() * messages.length)],
      source: sources[Math.floor(Math.random() * sources.length)],
    })
  }

  return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
}

export function LogStream() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLevels, setSelectedLevels] = useState<LogLevel[]>(["error", "warning", "info"])
  const containerRef = useRef<HTMLDivElement>(null)
  const [autoScroll, setAutoScroll] = useState(true)

  useEffect(() => {
    setLogs(generateMockLogs())

    const interval = setInterval(() => {
      const sources = ["api-gateway", "auth-service", "db-connector", "worker-1", "cache-layer"]
      const rand = Math.random()
      let level: LogLevel
      let message: string

      if (rand < 0.1) {
        level = "error"
        message = ["Connection timeout", "Auth failed", "Server error 500"][Math.floor(Math.random() * 3)]
      } else if (rand < 0.3) {
        level = "warning"
        message = ["High latency detected", "Memory usage elevated", "Queue backing up"][Math.floor(Math.random() * 3)]
      } else {
        level = "info"
        message = ["Request processed", "Job completed", "Connection established", "Cache hit"][Math.floor(Math.random() * 4)]
      }

      const newLog: LogEntry = {
        id: `log-${Date.now()}`,
        timestamp: new Date(),
        level,
        message,
        source: sources[Math.floor(Math.random() * sources.length)],
      }

      setLogs((prev) => [newLog, ...prev].slice(0, 100))
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollTop = 0
    }
  }, [logs, autoScroll])

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesLevel = selectedLevels.includes(log.level)
      const matchesSearch =
        !searchQuery ||
        log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.source.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesLevel && matchesSearch
    })
  }, [logs, selectedLevels, searchQuery])

  const handleLevelToggle = (level: LogLevel) => {
    setSelectedLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    )
  }

  const handleClearFilters = () => {
    setSearchQuery("")
    setSelectedLevels(["error", "warning", "info"])
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const getLevelStyles = (level: LogLevel) => {
    switch (level) {
      case "error":
        return "text-destructive bg-destructive/10"
      case "warning":
        return "text-warning bg-warning/10"
      case "info":
        return "text-info bg-info/10"
    }
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <LogFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedLevels={selectedLevels}
        onLevelToggle={handleLevelToggle}
        onClearFilters={handleClearFilters}
      />

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{filteredLogs.length} logs</span>
        <button
          onClick={() => setAutoScroll(!autoScroll)}
          className={cn(
            "rounded px-2 py-1 transition-colors",
            autoScroll ? "bg-primary/20 text-primary" : "hover:bg-muted"
          )}
        >
          Auto-scroll: {autoScroll ? "ON" : "OFF"}
        </button>
      </div>

      <div
        ref={containerRef}
        className="flex-1 overflow-auto rounded-lg border border-border bg-card font-mono text-sm"
      >
        {filteredLogs.map((log, index) => (
          <div
            key={log.id}
            className={cn(
              "flex items-start gap-4 border-b border-border/50 px-4 py-2.5 transition-colors hover:bg-accent/30",
              index === 0 && "animate-in fade-in-0 slide-in-from-top-1 duration-300"
            )}
          >
            <span className="shrink-0 text-muted-foreground">
              {formatTime(log.timestamp)}
            </span>
            <span
              className={cn(
                "shrink-0 rounded px-1.5 py-0.5 text-xs font-medium uppercase",
                getLevelStyles(log.level)
              )}
            >
              {log.level}
            </span>
            <span className="shrink-0 text-muted-foreground">[{log.source}]</span>
            <span className="flex-1 text-foreground">{log.message}</span>
          </div>
        ))}
        {filteredLogs.length === 0 && (
          <div className="flex h-32 items-center justify-center text-muted-foreground">
            No logs match the current filters
          </div>
        )}
      </div>
    </div>
  )
}
