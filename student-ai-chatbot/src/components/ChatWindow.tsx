import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Bot, User, WifiOff } from "lucide-react";
import { sendMessage } from "@/lib/api";

// ─── MessageBubble (inlined — only used here) ───────────────
interface BubbleProps { role: "user" | "ai"; content: string; index?: number; }

function MessageBubble({ role, content, index = 0 }: BubbleProps) {
  const isUser = role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`flex items-end gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}
      data-testid={`message-bubble-${role}-${index}`}
    >
      <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-medium ${isUser ? "bg-gradient-to-br from-indigo-500 to-violet-600 text-white" : "bg-gradient-to-br from-emerald-500 to-teal-600 text-white"}`}>
        {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
      </div>
      <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isUser ? "bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-br-sm" : "bg-card border border-border text-foreground rounded-bl-sm"}`}>
        {content}
      </div>
    </motion.div>
  );
}

// ─── TypingIndicator (inlined — only used here) ─────────────
function TypingIndicator() {
  return (
    <div className="flex items-center space-x-1 bg-card border border-border p-4 rounded-2xl rounded-tl-sm w-16">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-primary rounded-full"
          animate={{ y: ["0%", "-50%", "0%"] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

// ─── Re-exports so pages can import from here ───────────────
export { MessageBubble, TypingIndicator };

// ─── Mock fallback responses ────────────────────────────────
const MOCK_RESPONSES = [
  "Great question! Let me break that down for you step by step.",
  "I can help with that. Here's a clear explanation based on the core concepts.",
  "Excellent! This is a fascinating topic. Let me walk you through the key ideas.",
  "Of course! This concept builds on fundamentals you likely already know.",
  "That's a really thoughtful question. Here's how I'd approach explaining this clearly.",
];

const INITIAL_MESSAGES = [
  { id: "1", role: "ai" as const, content: "Hello! I'm StudyMind, your personal study companion. What would you like to learn today?" },
];

// ─── ChatWindow ─────────────────────────────────────────────
export function ChatWindow() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [usingMock, setUsingMock] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isTyping]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isTyping) return;

    setMessages((prev) => [...prev, { id: Date.now().toString(), role: "user" as const, content: text }]);
    setInput("");
    setIsTyping(true);

    try {
      // ── Calls POST /student/chat → change path in src/lib/api.ts ──
      const res = await sendMessage(text);
      setIsTyping(false);
      setUsingMock(false);
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "ai" as const, content: res.content }]);
    } catch {
      setTimeout(() => {
        setIsTyping(false);
        setUsingMock(true);
        setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "ai" as const, content: MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)] }]);
      }, 1200);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {usingMock && (
        <div className="flex items-center justify-center gap-2 py-1.5 bg-amber-500/10 border-b border-amber-500/20">
          <WifiOff className="w-3 h-3 text-amber-400" />
          <span className="text-xs text-amber-400 font-medium">Demo mode — connect your backend for real responses</span>
        </div>
      )}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4" data-testid="chat-messages">
        {messages.map((msg, i) => <MessageBubble key={msg.id} role={msg.role} content={msg.content} index={i} />)}
        {isTyping && (
          <div className="flex items-end gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs flex-shrink-0">SM</div>
            <TypingIndicator />
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div className="px-4 pb-4">
        <motion.div
          className="flex items-center gap-3 bg-card border border-border rounded-2xl px-4 py-3"
          whileFocusWithin={{ borderColor: "rgba(99,102,241,0.5)", boxShadow: "0 0 0 3px rgba(99,102,241,0.1)" }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Ask me anything..."
            disabled={isTyping}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
            data-testid="input-chat-message"
          />
          <motion.button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
            data-testid="button-send-message"
          >
            <Send className="w-3.5 h-3.5" />
          </motion.button>
        </motion.div>
        <p className="text-center text-xs text-muted-foreground mt-2">StudyMind can make mistakes. Verify important information.</p>
      </div>
    </div>
  );
}
