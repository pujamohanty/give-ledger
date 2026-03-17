"use client";
import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, Loader2, ChevronDown } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  roleId: string;
  roleTitle: string;
  ngoName: string;
}

const SUGGESTIONS = [
  "What will I learn from this role?",
  "What are the career prospects?",
  "What does a typical week look like?",
  "Is this role right for me?",
];

export default function RoleChatBot({ roleId, roleTitle, ngoName }: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  // Focus input when opened
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open]);

  // Greet on first open
  useEffect(() => {
    if (open && !hasGreeted) {
      setHasGreeted(true);
      setMessages([{
        role: "assistant",
        content: `Hi! I'm the GiveLedger Career Advisor. I can tell you everything about the **${roleTitle}** role at **${ngoName}** — what you'll work on, what skills you'll build, and what this could mean for your career.\n\nWhat would you like to know?`,
      }]);
    }
  }, [open, hasGreeted, roleTitle, ngoName]);

  async function sendMessage(text: string) {
    if (!text.trim() || streaming) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setStreaming(true);

    // Add empty assistant message that we'll stream into
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/ai/role-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roleId,
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) throw new Error("Failed");

      const contentType = res.headers.get("content-type") ?? "";

      // Non-streaming fallback (no GROQ_API_KEY)
      if (contentType.includes("application/json")) {
        const data = await res.json();
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: data.message ?? "Sorry, I couldn't respond right now." };
          return updated;
        });
        return;
      }

      // SSE streaming
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6).trim();
          if (payload === "[DONE]") continue;
          try {
            const json = JSON.parse(payload);
            const delta = json.choices?.[0]?.delta?.content ?? "";
            if (delta) {
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: "assistant",
                  content: updated[updated.length - 1].content + delta,
                };
                return updated;
              });
            }
          } catch {
            // malformed chunk — skip
          }
        }
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "Sorry, I ran into an issue. Please try again in a moment.",
        };
        return updated;
      });
    } finally {
      setStreaming(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  // Simple markdown bold renderer
  function renderText(text: string) {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) =>
      part.startsWith("**") && part.endsWith("**")
        ? <strong key={i}>{part.slice(2, -2)}</strong>
        : <span key={i}>{part}</span>
    );
  }

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold px-4 py-2.5 rounded-full shadow-lg transition-all duration-200 hover:scale-105"
        aria-label="Chat about this role"
      >
        {open
          ? <ChevronDown className="w-4 h-4" />
          : <MessageCircle className="w-4 h-4" />
        }
        {!open && <span>Ask about this role</span>}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-20 right-6 z-50 w-[360px] max-w-[calc(100vw-24px)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          style={{ height: "520px" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-emerald-700 text-white shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold leading-tight">Career Advisor</p>
                <p className="text-[10px] text-emerald-200 leading-tight">Powered by GiveLedger AI</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-white/70 hover:text-white transition-colors"
              aria-label="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mr-2 mt-0.5">
                    <Bot className="w-3.5 h-3.5 text-emerald-700" />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-emerald-700 text-white rounded-br-sm"
                    : "bg-gray-100 text-gray-800 rounded-bl-sm"
                }`}>
                  {msg.content
                    ? msg.content.split("\n").map((line, j) => (
                        <p key={j} className={j > 0 ? "mt-1.5" : ""}>{renderText(line)}</p>
                      ))
                    : streaming && i === messages.length - 1
                      ? <span className="inline-flex gap-1 items-center text-gray-400">
                          <Loader2 className="w-3 h-3 animate-spin" /> Thinking…
                        </span>
                      : null
                  }
                </div>
              </div>
            ))}

            {/* Suggestion chips — only when no user messages yet */}
            {messages.length === 1 && !streaming && (
              <div className="flex flex-col gap-2 pt-1">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="text-left text-xs text-emerald-700 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 rounded-xl px-3 py-2 transition-colors font-medium"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input area */}
          <div className="shrink-0 border-t border-gray-100 px-3 py-2.5 flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about this role…"
              rows={1}
              disabled={streaming}
              className="flex-1 text-sm text-gray-800 placeholder:text-gray-400 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 resize-none outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100 disabled:opacity-50 transition-colors"
              style={{ maxHeight: "96px", overflowY: "auto" }}
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = "auto";
                el.style.height = Math.min(el.scrollHeight, 96) + "px";
              }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || streaming}
              className="w-8 h-8 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white rounded-xl flex items-center justify-center shrink-0 transition-colors"
              aria-label="Send"
            >
              {streaming
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <Send className="w-3.5 h-3.5" />
              }
            </button>
          </div>
        </div>
      )}
    </>
  );
}
