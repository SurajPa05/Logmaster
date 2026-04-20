"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Check, Play, Send, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import api from "@/lib/api"

type CommandResult = {
  id: string
  command: string
  output: string
  isCollapsed: boolean
  isSelected: boolean
  isSuggestion?: boolean
}

const AI_MODELS = [
  "GPT-4o",
  "Claude 3.5 Sonnet",
  "Gemini 1.5 Pro",
  "Llama 3",
  "Mistral",
]

const MOCK_OUTPUTS = [
  "Command executed successfully\nOutput: 42 lines processed\nStatus: OK",
  "Error: Permission denied\nPlease run with sudo privileges",
  "Processing...\nFound 127 matching entries\nExport complete",
  "Connection established\nTransfer rate: 1.2 MB/s\nCompleted in 3.4s",
  "Analyzing logs...\n- 45 errors found\n- 128 warnings\n- 2,341 info messages",
]

export function Terminal() {
  const [commandHistory, setCommandHistory] = useState<CommandResult[]>([])
  const [directCommand, setDirectCommand] = useState("")
  const [aiPrompt, setAiPrompt] = useState("")
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0])

  const getMockOutput = () => {
    return MOCK_OUTPUTS[Math.floor(Math.random() * MOCK_OUTPUTS.length)]
  }

  const executeCommand = (command: string, id?: string) => {
    const mockOutput = getMockOutput()
    
    // TODO: Replace with real API call
    // const response = await api.post('/terminal/execute', { command })
    
    if (id) {
      // Update existing suggestion with result
      setCommandHistory(prev =>
        prev.map(cmd =>
          cmd.id === id
            ? { ...cmd, output: mockOutput, isSuggestion: false }
            : cmd
        )
      )
    } else {
      // Add new command to history
      const newCommand: CommandResult = {
        id: Date.now().toString(),
        command,
        output: mockOutput,
        isCollapsed: false,
        isSelected: false,
      }
      setCommandHistory(prev => [...prev, newCommand])
    }
  }

  const handleDirectCommand = () => {
    if (!directCommand.trim()) return
    executeCommand(directCommand)
    setDirectCommand("")
  }

  const handleAiPrompt = () => {
    if (!aiPrompt.trim()) return

    // Mock AI suggestion
    const suggestedCommand = `grep "${aiPrompt.split(" ")[0]}" /var/log/syslog | tail -n 50`
    
    // TODO: Replace with real API call
    // const response = await api.post('/terminal/ai-suggest', { 
    //   prompt: aiPrompt, 
    //   model: selectedModel 
    // })
    
    const suggestion: CommandResult = {
      id: Date.now().toString(),
      command: suggestedCommand,
      output: "Click 'Execute' to run this suggested command",
      isCollapsed: false,
      isSelected: false,
      isSuggestion: true,
    }
    
    setCommandHistory(prev => [...prev, suggestion])
    setAiPrompt("")
  }

  const toggleCollapse = (id: string) => {
    setCommandHistory(prev =>
      prev.map(cmd =>
        cmd.id === id ? { ...cmd, isCollapsed: !cmd.isCollapsed } : cmd
      )
    )
  }

  const toggleSelect = (id: string) => {
    setCommandHistory(prev =>
      prev.map(cmd =>
        cmd.id === id ? { ...cmd, isSelected: !cmd.isSelected } : cmd
      )
    )
  }

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Command History Panel */}
      <div className="flex-1 overflow-auto rounded-xl border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <h3 className="text-sm font-medium text-foreground">Command History</h3>
        </div>
        <div className="space-y-3 p-4">
          {commandHistory.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No commands executed yet. Try running a command below or ask the AI for suggestions.
            </div>
          ) : (
            commandHistory.map((cmd) => (
              <div
                key={cmd.id}
                className={cn(
                  "overflow-hidden rounded-lg border transition-all",
                  cmd.isSelected
                    ? "border-success shadow-lg shadow-success/10"
                    : "border-border",
                  cmd.isSuggestion && "border-primary/50"
                )}
              >
                {/* Command Header */}
                <div
                  className={cn(
                    "flex items-center justify-between px-4 py-3",
                    cmd.isSuggestion
                      ? "bg-primary/10"
                      : "bg-muted/30"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {cmd.isSuggestion && (
                      <span className="flex items-center gap-1 rounded bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
                        <Sparkles className="h-3 w-3" />
                        AI Suggested
                      </span>
                    )}
                    <code className="font-mono text-sm text-foreground">
                      {cmd.command}
                    </code>
                  </div>
                  <div className="flex items-center gap-2">
                    {cmd.isSuggestion && (
                      <button
                        onClick={() => executeCommand(cmd.command, cmd.id)}
                        className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                      >
                        <Play className="h-3 w-3" />
                        Execute
                      </button>
                    )}
                    <button
                      onClick={() => toggleCollapse(cmd.id)}
                      className="rounded-lg bg-primary/20 p-1.5 text-primary transition-colors hover:bg-primary/30"
                    >
                      {cmd.isCollapsed ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronUp className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Command Output */}
                {!cmd.isCollapsed && (
                  <div className="bg-[#0d0d0d]">
                    <div className="px-4 py-3">
                      <pre className="whitespace-pre-wrap font-mono text-xs text-[#a8b5a8]">
                        {cmd.output}
                      </pre>
                    </div>
                    <div className="flex justify-end border-t border-border/30 px-4 py-2">
                      <button
                        onClick={() => toggleSelect(cmd.id)}
                        className={cn(
                          "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                          cmd.isSelected
                            ? "bg-success text-success-foreground shadow-sm"
                            : "bg-success/20 text-success hover:bg-success/30"
                        )}
                      >
                        <Check className="h-3 w-3" />
                        {cmd.isSelected ? "Selected" : "Select"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Direct Terminal Input */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm font-medium text-primary">$</span>
          <input
            type="text"
            value={directCommand}
            onChange={(e) => setDirectCommand(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleDirectCommand()}
            placeholder="Enter command directly..."
            className="flex-1 bg-transparent font-mono text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          <button
            onClick={handleDirectCommand}
            disabled={!directCommand.trim()}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="h-4 w-4" />
            Run
          </button>
        </div>
      </div>

      {/* AI Chat Section */}
      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-medium text-foreground">AI Assistant</h4>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Describe what you want to do, and the AI will suggest a command
          </p>
        </div>
        <div className="flex items-center gap-3 p-4">
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="h-10 rounded-lg border border-border bg-input px-3 text-sm text-foreground outline-none transition-colors focus:border-primary"
          >
            {AI_MODELS.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAiPrompt()}
            placeholder="e.g., show me all failed login attempts"
            className="h-10 flex-1 rounded-lg border border-border bg-input px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground transition-colors focus:border-primary"
          />
          <button
            onClick={handleAiPrompt}
            disabled={!aiPrompt.trim()}
            className="flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
