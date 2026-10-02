"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Bot, Loader2, Send, Sparkles, User } from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string };

const QUICK = [
  "Summarise the key findings of this project",
  "Which factors most influence IMDb ratings and why?",
  "Explain the difference between Pearson and Spearman correlation here",
  "Why is the model's R² only around 0.5?",
  "Explain hypothesis testing using this project as example",
];

export function ChatPanel() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm the AI analyst for this IMDb ratings project, powered by DeepSeek V4.1 Flash. Ask me anything about the data, the statistics or the prediction model.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const send = async (text: string) => {
    const prompt = text.trim();
    if (!prompt || loading) return;
    const next = [...messages, { role: "user" as const, content: prompt }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "chat",
          prompt,
          history: next.slice(-6),
        }),
      });
      const data = await res.json();
      setMessages((m) => [
        ...m,
        { role: "assistant", content: data.answer ?? data.error ?? "No response" },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Could not reach the AI service." },
      ]);
    } finally {
      setLoading(false);
      requestAnimationFrame(() =>
        endRef.current?.scrollIntoView({ behavior: "smooth" }),
      );
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="card flex h-[560px] flex-col lg:col-span-2">
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <span
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
                  m.role === "user" ? "bg-surface-3 text-white" : "bg-imdb text-black"
                }`}
              >
                {m.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </span>
              <div
                className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-surface-3 text-white"
                    : "bg-surface-2 text-white/90 ring-1 ring-line"
                }`}
              >
                {m.content}
              </div>
            </motion.div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted">
              <Loader2 className="h-4 w-4 animate-spin text-imdb" /> Thinking...
            </div>
          )}
          <div ref={endRef} />
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-center gap-2 border-t border-line p-3"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about the data, statistics or model..."
            className="flex-1 rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-white outline-none placeholder:text-muted focus:border-imdb/50"
          />
          <button
            type="submit"
            disabled={loading}
            className="grid h-10 w-10 place-items-center rounded-xl bg-imdb text-black transition hover:brightness-110 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>

      <div className="card h-fit p-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
          <Sparkles className="h-4 w-4 text-imdb" /> Quick questions
        </h3>
        <div className="mt-4 space-y-2">
          {QUICK.map((q) => (
            <button
              key={q}
              onClick={() => send(q)}
              disabled={loading}
              className="w-full rounded-xl border border-line bg-surface-2 px-3.5 py-2.5 text-left text-xs text-muted transition hover:border-imdb/40 hover:text-white disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
        <p className="mt-4 text-[11px] leading-relaxed text-muted">
          Powered by OpenCode Go · DeepSeek V4.1 Flash. The server holds the API
          key, so it stays secret.
        </p>
      </div>
    </div>
  );
}
