"use client"

import { useMemo, useState, useEffect } from "react"
import { Cpu, FileText, AlertTriangle, XCircle, TrendingUp } from "lucide-react"
import api from "@/lib/api"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { cn } from "@/lib/utils"

const generateLogsOverTime = () => {
  const data = []
  const now = new Date()
  for (let i = 11; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 3600000)
    data.push({
      time: time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      logs: Math.floor(Math.random() * 500) + 200,
      errors: Math.floor(Math.random() * 30) + 5,
    })
  }
  return data
}

type LogEntry = {
  id: number
  log_type: string
  message: string
  source: string
  time: string
  priority: number
}

const getLogType = (priority: number): string => {
  if (priority >= 3) return "error"
  if (priority >= 4) return "warning"
  return "info"
}

const getTimeAgo = (index: number): string => {
  const minutes = (index + 1) * 2
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  return `${hours}h ago`
}

interface StatCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: "positive" | "negative" | "neutral"
  icon: React.ReactNode
}

function StatCard({ title, value, change, changeType = "neutral", icon }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:border-border/80 hover:shadow-lg hover:shadow-black/5">
      <div className="flex items-center justify-between">
        <div className="rounded-lg bg-muted p-2.5">{icon}</div>
        {change && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-medium",
              changeType === "positive" && "text-success",
              changeType === "negative" && "text-destructive",
              changeType === "neutral" && "text-muted-foreground"
            )}
          >
            <TrendingUp className={cn("h-3 w-3", changeType === "negative" && "rotate-180")} />
            {change}
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-semibold text-foreground">{value}</p>
        <p className="mt-1 text-sm text-muted-foreground">{title}</p>
      </div>
    </div>
  )
}

export function Dashboard() {
  const [recentLogs, setRecentLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [logCounts, setLogCounts] = useState({
    TOTAL: 0,
    ERROR: 0,
    WARNING: 0,
    INFO: 0
  })

  const logsOverTime = useMemo(() => {
    // Use real data from logCounts
    const data = []
    const now = new Date()
    for (let i = 11; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 3600000)
      data.push({
        time: time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        logs: Math.floor((logCounts.TOTAL || 0) / 12), // Distribute total across hours
        errors: Math.floor((logCounts.ERROR || 0) / 12), // Distribute errors across hours
      })
    }
    return data
  }, [logCounts])

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch logs
        const logsResponse = await api.get("/logs")
        const logsData = logsResponse.data.logs || []
        
        // Transform backend logs to frontend format
        const transformedLogs = logsData.slice(0, 6).map((log: any, index: number) => ({
          id: index + 1,
          log_type: getLogType(log.priority),
          message: log.message,
          source: log.source || "unknown",
          time: getTimeAgo(index),
          priority: log.priority
        }))
        
        setRecentLogs(transformedLogs)

        // Fetch log counts
        const countsResponse = await api.get("/logCount")
        console.log("Log counts from API:", countsResponse.data)
        setLogCounts(countsResponse.data)
        
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const severityData = useMemo(() => {
    const total = logCounts.TOTAL || 1 // Avoid division by zero
    return [
      { 
        name: "Info", 
        value: Math.round((logCounts.INFO / total) * 100), 
        color: "var(--info)" 
      },
      { 
        name: "Warning", 
        value: Math.round((logCounts.WARNING / total) * 100), 
        color: "var(--warning)" 
      },
      { 
        name: "Error", 
        value: Math.round((logCounts.ERROR / total) * 100), 
        color: "var(--destructive)" 
      },
    ]
  }, [logCounts])

  const getLevelStyles = (level: string) => {
    switch (level) {
      case "error":
        return "text-destructive bg-destructive/10"
      case "warning":
        return "text-warning bg-warning/10"
      default:
        return "text-info bg-info/10"
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="CPU Usage"
          value="42%"
          change="+2.5%"
          changeType="neutral"
          icon={<Cpu className="h-4 w-4 text-primary" />}
        />
        <StatCard
          title="Total Logs"
          value={(logCounts.TOTAL || 0).toLocaleString()}
          icon={<FileText className="h-4 w-4 text-info" />}
        />
        <StatCard
          title="Warnings"
          value={(logCounts.WARNING || 0).toLocaleString()}
          icon={<AlertTriangle className="h-4 w-4 text-warning" />}
        />
        <StatCard
          title="Errors"
          value={(logCounts.ERROR || 0).toLocaleString()}
          icon={<XCircle className="h-4 w-4 text-destructive" />}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Line Chart */}
        <div className="col-span-1 rounded-xl border border-border bg-card p-5 lg:col-span-2">
          <h3 className="mb-4 text-sm font-medium text-foreground">Logs Over Time</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={logsOverTime}>
                <XAxis
                  dataKey="time"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    color: "var(--popover-foreground)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="logs"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="errors"
                  stroke="var(--destructive)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex items-center gap-6 text-xs">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <span className="text-muted-foreground">Total Logs</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-destructive" />
              <span className="text-muted-foreground">Errors</span>
            </div>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-4 text-sm font-medium text-foreground">Severity Distribution</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    color: "var(--popover-foreground)",
                  }}
                  formatter={(value: number) => [`${value}%`, ""]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex flex-col gap-2">
            {severityData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
                <span className="font-medium text-foreground">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Logs Table */}
      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <h3 className="text-sm font-medium text-foreground">Recent Logs</h3>
        </div>
        <div className="divide-y divide-border">
          {loading ? (
            <div className="px-5 py-8 text-center text-sm text-muted-foreground">
              Loading logs...
            </div>
          ) : recentLogs.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-muted-foreground">
              No logs available
            </div>
          ) : (
            recentLogs.map((log) => (
            <div
              key={log.id}
              className="flex items-center gap-4 px-5 py-3 transition-colors hover:bg-accent/30"
            >
              <span
                className={cn(
                  "shrink-0 rounded px-2 py-0.5 font-mono text-xs font-medium uppercase",
                  getLevelStyles(log.log_type)
                )}
              >
                {log.log_type}
              </span>
              <span className="flex-1 truncate text-sm text-foreground">{log.message}</span>
              <span className="shrink-0 text-xs text-muted-foreground">{log.source}</span>
              <span className="shrink-0 text-xs text-muted-foreground">{log.time}</span>
            </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
