"use client";

/**
 * GiveLedger AI Assistant — powered by PageAgent + Groq (llama-3.3-70b)
 *
 * PageAgent observes the live DOM, sends it to the LLM, and executes
 * actions (click, type, navigate) in a ReAct loop until the task is done.
 *
 * The LLM proxy lives at /api/ai-proxy — the Groq key is never exposed
 * to the browser.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { Sparkles, X, Send, Square, ChevronDown } from "lucide-react";

// Suggestions shown per portal role
const DONOR_SUGGESTIONS = [
  "Take me to my donations page",
  "Show me my skill contributions",
  "Go to my GiveLedger credential",
  "Open the post builder",
  "Take me to NGO standing page",
];

const NGO_SUGGESTIONS = [
  "Take me to skill contribution reviews",
  "Open the donor recognition page",
  "Go to project creation form",
  "Show me the post builder",
  "Take me to NGO finances",
];

type Status = "idle" | "running" | "done" | "error";

interface Props {
  role?: "donor" | "ngo" | "admin";
}

export default function GiveLedgerAssistant({ role = "donor" }: Props) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [statusText, setStatusText] = useState("");
  const [history, setHistory] = useState<{ instruction: string; result: string }[]>([]);
  const agentRef = useRef<InstanceType<typeof import("page-agent")["PageAgent"]> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = role === "ngo" ? NGO_SUGGESTIONS : DONOR_SUGGESTIONS;

  // Lazy-initialise PageAgent once the panel opens (browser-only)
  const getAgent = useCallback(async () => {
    if (agentRef.current) return agentRef.current;

    const { PageAgent } = await import("page-agent");

    agentRef.current = new PageAgent({
      // Point at our server-side Groq proxy — key never hits the browser
      baseURL: `${window.location.origin}/api/ai-proxy`,
      apiKey: "proxy",              // ignored by our proxy, required by PageAgent type
      model: "llama-3.3-70b-versatile",
      language: "en-US",
    });

    return agentRef.current;
  }, []);

  // Focus input when panel opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 80);
  }, [open]);

  const run = useCallback(async (instruction: string) => {
    if (!instruction.trim() || status === "running") return;

    setStatus("running");
    setStatusText("Thinking…");
    setInput("");

    try {
      const agent = await getAgent();

      // Monitor status changes if PageAgent exposes an event emitter
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (agent as any).on?.("statuschange", (s: string) => {
        if (s === "running") setStatusText("Executing…");
      });

      const result = await agent.execute(instruction);

      const summary =
        typeof result === "object" && result !== null
          ? (result as { success?: boolean; message?: string }).message ??
            ((result as { success?: boolean }).success ? "Done." : "Could not complete.")
          : "Done.";

      setHistory((prev) => [{ instruction, result: summary }, ...prev.slice(0, 4)]);
      setStatus("done");
      setStatusText(summary);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setHistory((prev) => [{ instruction, result: `Error: ${msg}` }, ...prev.slice(0, 4)]);
      setStatus("error");
      setStatusText(msg);
    } finally {
      setTimeout(() => setStatus("idle"), 3000);
    }
  }, [getAgent, status]);

  const stop = useCallback(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (agentRef.current as any)?.stop?.();
    setStatus("idle");
    setStatusText("");
  }, []);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      run(input);
    }
    if (e.key === "Escape") setOpen(false);
  };

  const statusColor: Record<Status, string> = {
    idle: "bg-gray-400",
    running: "bg-amber-400 animate-pulse",
    done: "bg-emerald-500",
    error: "bg-red-500",
  };

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Open AI Assistant"
        className={`
          fixed bottom-6 right-6 z-50
          w-13 h-13 rounded-full shadow-xl
          flex items-center justify-center
          bg-gradient-to-br from-emerald-500 to-teal-600
          text-white transition-all duration-200
          hover:scale-105 hover:shadow-emerald-500/40 hover:shadow-2xl
          ${open ? "rotate-12" : ""}
        `}
        style={{ width: 52, height: 52 }}
      >
        {open ? <ChevronDown className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
      </button>

      {/* Panel */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 w-80 rounded-2xl shadow-2xl border border-gray-200 bg-white flex flex-col overflow-hidden"
          style={{ maxHeight: "70vh" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-semibold">GiveLedger AI</span>
              <span className="text-xs text-emerald-200 ml-1">llama 3.3 · Groq</span>
            </div>
            <button onClick={() => setOpen(false)} className="hover:bg-white/20 rounded-lg p-1">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Status bar */}
          {status !== "idle" && (
            <div className={`px-4 py-2 text-xs flex items-center gap-2 ${
              status === "running" ? "bg-amber-50 text-amber-800" :
              status === "done"    ? "bg-emerald-50 text-emerald-800" :
                                     "bg-red-50 text-red-800"
            }`}>
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${statusColor[status]}`} />
              <span className="truncate">{statusText}</span>
              {status === "running" && (
                <button
                  onClick={stop}
                  className="ml-auto flex-shrink-0 flex items-center gap-1 text-xs text-amber-700 hover:text-amber-900 font-medium"
                >
                  <Square className="w-3 h-3" /> Stop
                </button>
              )}
            </div>
          )}

          {/* Suggestions */}
          {history.length === 0 && status === "idle" && (
            <div className="px-3 pt-3 pb-1">
              <p className="text-xs text-gray-400 mb-2 px-1">Try asking:</p>
              <div className="flex flex-wrap gap-1.5">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => run(s)}
                    className="text-xs bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 text-gray-600 rounded-lg px-2.5 py-1.5 transition-colors text-left"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* History */}
          {history.length > 0 && (
            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 min-h-0">
              {history.map((h, i) => (
                <div key={i} className="text-xs space-y-0.5">
                  <p className="text-gray-700 font-medium">↳ {h.instruction}</p>
                  <p className="text-gray-400 pl-3">{h.result}</p>
                </div>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-3 pb-3 pt-2 border-t border-gray-100 flex gap-2 items-center">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Tell me what to do…"
              disabled={status === "running"}
              className="flex-1 text-sm rounded-xl border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 placeholder:text-gray-400 disabled:opacity-50"
            />
            <button
              onClick={() => run(input)}
              disabled={!input.trim() || status === "running"}
              className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 disabled:opacity-40 flex-shrink-0 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
