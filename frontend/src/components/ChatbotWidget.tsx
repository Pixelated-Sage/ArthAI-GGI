"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Sparkles,
  Cpu,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/utils/cn";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  source?: "gemini" | "ollama" | "error";
  stocks?: string[];
  timestamp: string;
}

interface ChatResponse {
  reply: string;
  session_id: string;
  source: string;
  stocks_referenced: string[];
  timestamp: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Hey! 👋 I'm **ArthAI Assistant**, your smart companion for stocks and trading.\n\nAsk me anything:\n- 📈 *\"How is Reliance doing?\"*\n- 💡 *\"What is a candlestick?\"*\n- 🧠 *\"Should I invest in TCS?\"*",
  source: "gemini",
  timestamp: new Date().toISOString(),
};

function formatMarkdown(text: string): React.ReactNode {
  // Simple markdown: **bold**, *italic*, bullet points, line breaks
  const lines = text.split("\n");
  return lines.map((line, i) => {
    // Bold
    let formatted = line.replace(
      /\*\*(.*?)\*\*/g,
      '<strong class="font-semibold">$1</strong>'
    );
    // Italic
    formatted = formatted.replace(
      /\*(.*?)\*/g,
      '<em class="italic">$1</em>'
    );
    // Bullet
    if (formatted.startsWith("- ")) {
      formatted = `<span class="flex gap-2 items-start"><span class="text-indigo-400 mt-0.5">•</span><span>${formatted.slice(2)}</span></span>`;
    }

    if (formatted.trim() === "") return <br key={i} />;
    return (
      <span
        key={i}
        className="block leading-relaxed"
        dangerouslySetInnerHTML={{ __html: formatted }}
      />
    );
  });
}

function SourceBadge({ source }: { source?: string }) {
  if (!source || source === "error") return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mt-1",
        source === "gemini"
          ? "bg-blue-500/10 text-blue-400"
          : "bg-amber-500/10 text-amber-400"
      )}
    >
      {source === "gemini" ? <Sparkles size={10} /> : <Cpu size={10} />}
      {source === "gemini" ? "Gemini" : "Local AI"}
    </span>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-indigo-400"
            animate={{ y: [0, -6, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.15,
            }}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground ml-2">Thinking...</span>
    </div>
  );
}

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, messages.length, scrollToBottom]);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } =
      scrollContainerRef.current;
    setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 100);
  };

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: trimmed,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/chatbot/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          session_id: sessionId,
        }),
      });

      if (!res.ok) throw new Error("API error");

      const data: ChatResponse = await res.json();
      setSessionId(data.session_id);

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.reply,
        source: data.source as Message["source"],
        stocks: data.stocks_referenced,
        timestamp: data.timestamp,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      const errMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "Sorry, I couldn't connect to the server. Please make sure the backend is running. 🔧",
        source: "error",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Bubble */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-2xl shadow-indigo-500/40 flex items-center justify-center cursor-pointer group"
          >
            <MessageCircle size={24} className="group-hover:rotate-12 transition-transform" />
            {/* Ping animation */}
            <span className="absolute inset-0 rounded-full bg-indigo-400 animate-ping opacity-20" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-[400px] h-[600px] max-h-[80vh] flex flex-col rounded-3xl overflow-hidden border border-border/60 shadow-2xl shadow-black/30"
            style={{
              background:
                "linear-gradient(145deg, var(--card) 0%, var(--background) 100%)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/40 bg-card/80 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  <Bot size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-tight">
                    ArthAI Assistant
                  </h3>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Online • Stocks & Trading AI
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin scrollbar-thumb-border/40 scrollbar-track-transparent"
            >
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex gap-2",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center shrink-0 mt-1">
                      {msg.source === "error" ? (
                        <AlertCircle size={14} className="text-red-400" />
                      ) : (
                        <Bot size={14} className="text-indigo-400" />
                      )}
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-3 text-sm",
                      msg.role === "user"
                        ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-br-md"
                        : msg.source === "error"
                        ? "bg-red-500/10 border border-red-500/20 text-foreground rounded-bl-md"
                        : "bg-muted/60 border border-border/40 text-foreground rounded-bl-md"
                    )}
                  >
                    <div className="space-y-1">
                      {msg.role === "assistant"
                        ? formatMarkdown(msg.content)
                        : msg.content}
                    </div>
                    {msg.role === "assistant" && (
                      <SourceBadge source={msg.source} />
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shrink-0 mt-1">
                      <User size={14} className="text-white" />
                    </div>
                  )}
                </motion.div>
              ))}

              {isLoading && (
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0">
                    <Bot size={14} className="text-indigo-400" />
                  </div>
                  <div className="bg-muted/60 border border-border/40 rounded-2xl rounded-bl-md">
                    <TypingIndicator />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Scroll to bottom button */}
            <AnimatePresence>
              {showScrollBtn && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  onClick={scrollToBottom}
                  className="absolute bottom-20 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-card border border-border shadow-lg flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ChevronDown size={16} />
                </motion.button>
              )}
            </AnimatePresence>

            {/* Input */}
            <div className="px-4 py-3 border-t border-border/40 bg-card/60 backdrop-blur-sm">
              <div className="flex items-center gap-2 bg-muted/50 border border-border/40 rounded-2xl px-4 py-2 focus-within:border-indigo-500/40 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about stocks, trading..."
                  disabled={isLoading}
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50 disabled:opacity-50"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center transition-all shrink-0",
                    input.trim() && !isLoading
                      ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/30 hover:shadow-lg cursor-pointer"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  )}
                >
                  <Send size={14} />
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground/50 text-center mt-2">
                AI-generated • Not financial advice
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
