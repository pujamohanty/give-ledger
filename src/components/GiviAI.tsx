"use client";
import { useState, useRef, useEffect } from "react";
import { Sparkles, X, Send, Bot, Loader2, ChevronDown } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "How does GiveLedger work?",
  "What plans are available?",
  "What is a GiveLedger Credential?",
  "How do I apply for a role?",
];

export default function GiviAI() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open]);

  useEffect(() => {
    if (open && !hasGreeted) {
      setHasGreeted(true);
      setMessages([{
        role: "assistant",
        content:
          "Hi! I'm Givi — your GiveLedger guide.\n\nI can help you understand how the platform works, pick the right plan, find open roles, or explain how your credential and impact are tracked.\n\nWhat would you like to know?",
      }]);
    }
  }, [open, hasGreeted]);

  async function sendMessage(text: string) {
    if (!text.trim() || streaming) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setStreaming(true);
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) throw new Error("Failed");

      const contentType = res.headers.get("content-type") ?? "";

      if (contentType.includes("application/json")) {
        const data = await res.json();
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: data.message ?? "Sorry, I couldn't respond right now.",
          };
          return updated;
        });
        return;
      }

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
            // malformed chunk
          }
        }
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "Sorry, I ran into an issue. Please try again.",
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

  function renderText(text: string) {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) =>
      part.startsWith("**") && part.endsWith("**")
        ? <strong key={i}>{part.slice(2, -2)}</strong>
        : <span key={i}>{part}</span>
    );
  }

  return (
    <div className="fixed top-16 right-4 z-50 flex flex-col items-end">
      {/* Trigger button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close Givi AI" : "Ask Givi"}
        className={`flex items-center gap-2 text-sm font-bold px-4 py-2.5 rounded-full shadow-lg transition-all duration-200 hover:scale-105 focus:outline-none ${
          open
            ? "bg-gray-800 hover:bg-gray-700 text-white"
            : "bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 text-white"
        }`}
      >
        {open ? (
          <>
            <ChevronDown className="w-4 h-4" />
            <span>Close</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            <span>Ask Givi</span>
          </>
        )}
      </button>

      {/* Chat panel — opens downward */}
      {open && (
        <div
          className="mt-2 w-[360px] max-w-[calc(100vw-32px)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          style={{ height: "500px" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-violet-600 to-purple-700 text-white shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold leading-tight">Givi</p>
                <p className="text-[10px] text-purple-200 leading-tight">GiveLedger AI Assistant</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-white/70 hover:text-white transition-colors"
              aria-label="Close Givi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center shrink-0 mr-2 mt-0.5">
                    <Bot className="w-3.5 h-3.5 text-violet-700" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-violet-600 text-white rounded-br-sm"
                      : "bg-gray-100 text-gray-800 rounded-bl-sm"
                  }`}
                >
                  {msg.content
                    ? msg.content.split("\n").map((line, j) => (
                        <p key={j} className={j > 0 ? "mt-1.5" : ""}>{renderText(line)}</p>
                      ))
                    : streaming && i === messages.length - 1
                    ? (
                        <span className="inline-flex gap-1 items-center text-gray-400">
                          <Loader2 className="w-3 h-3 animate-spin" /> Thinking…
                        </span>
                      )
                    : null}
                </div>
              </div>
            ))}

            {/* Suggestion chips — only before user sends anything */}
            {messages.length === 1 && !streaming && (
              <div className="flex flex-col gap-2 pt-1">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="text-left text-xs text-violet-700 border border-violet-200 bg-violet-50 hover:bg-violet-100 rounded-xl px-3 py-2 transition-colors font-medium"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="shrink-0 border-t border-gray-100 px-3 py-2.5 flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Givi anything…"
              rows={1}
              disabled={streaming}
              className="flex-1 text-sm text-gray-800 placeholder:text-gray-400 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 resize-none outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-100 disabled:opacity-50 transition-colors"
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
              aria-label="Send"
              className="w-8 h-8 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white rounded-xl flex items-center justify-center shrink-0 transition-colors"
            >
              {streaming
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <Send className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
