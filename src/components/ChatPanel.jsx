import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { sendChatMessage } from "../services/chatbotService";

// ── Suggested questions ────────────────────────────────────────
const SUGGESTED_QUESTIONS = [
  "What is Log4Shell and how dangerous is it?",
  "How do I prioritize which CVEs to patch first?",
  "What does KEV mean and why does it matter?",
  "How is EPSS different from CVSS?",
  "What is a zero-day vulnerability?",
];

const WELCOME_MESSAGE = {
  id:        "welcome",
  role:      "assistant",
  content:   `## CyberBot 👋\n\nAsk me anything about the vulnerabilities found in your scan — CVE details, patching strategies, risk assessment, or security concepts.`,
  timestamp: new Date(),
};

// ── Helpers ────────────────────────────────────────────────────
function formatTime(date) {
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

// ── Markdown renderer ──────────────────────────────────────────
function MarkdownContent({ content }) {
  return (
    <ReactMarkdown
      components={{
        h2: ({ children }) => (
          <h2 className="text-sm font-bold text-slate-200 mt-3 mb-1 first:mt-0">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-xs font-bold text-slate-300 mt-2 mb-1">{children}</h3>
        ),
        p: ({ children }) => (
          <p className="text-xs text-slate-300 leading-relaxed mb-2 last:mb-0">{children}</p>
        ),
        ul: ({ children }) => (
          <ul className="space-y-1 mb-2 last:mb-0">{children}</ul>
        ),
        li: ({ children }) => (
          <li className="flex items-start gap-1.5 text-xs text-slate-300">
            <span className="text-cyan-500 mt-0.5 flex-shrink-0">•</span>
            <span>{children}</span>
          </li>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold text-slate-200">{children}</strong>
        ),
        code: ({ children }) => (
          <code className="text-[10px] font-mono bg-slate-800 text-cyan-300 px-1 py-0.5 rounded">
            {children}
          </code>
        ),
        a: ({ href, children }) => (
          <a href={href} target="_blank" rel="noopener noreferrer"
            className="text-cyan-400 hover:text-cyan-300 underline">
            {children}
          </a>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

// ── Typing indicator ───────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <div className="h-6 w-6 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0">
        <i className="ti ti-shield-bolt text-[10px] text-white" />
      </div>
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl rounded-bl-sm px-3 py-2">
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-1.5 w-1.5 rounded-full bg-slate-500 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Message bubble ─────────────────────────────────────────────
function MessageBubble({ message }) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex items-end justify-end gap-2">
        <div className="max-w-[85%]">
          <div className="bg-cyan-600/20 border border-cyan-500/30 rounded-2xl rounded-br-sm px-3 py-2">
            <p className="text-xs text-slate-200 leading-relaxed">{message.content}</p>
          </div>
          <p className="text-[10px] text-slate-700 mt-0.5 text-right">{formatTime(message.timestamp)}</p>
        </div>
        <div className="h-6 w-6 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
          <i className="ti ti-user text-[10px] text-slate-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-2">
      <div className="h-6 w-6 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0">
        <i className="ti ti-shield-bolt text-[10px] text-white" />
      </div>
      <div className="max-w-[88%]">
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl rounded-bl-sm px-3 py-2.5">
          {message.error ? (
            <div className="flex items-center gap-2 text-xs text-red-400">
              <i className="ti ti-alert-circle text-sm flex-shrink-0" />
              {message.content}
            </div>
          ) : (
            <MarkdownContent content={message.content} />
          )}
        </div>
        <p className="text-[10px] text-slate-700 mt-0.5">{formatTime(message.timestamp)} · CyberBot</p>
      </div>
    </div>
  );
}

// ── Main ChatPanel Component ───────────────────────────────────
// Embedded panel — no floating bubble, no positioning
export default function ChatPanel({ onClose }) {
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input,    setInput]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  // Auto-scroll on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Focus input when panel opens
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Close with Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  // Send message
  const sendMessage = useCallback(async (question) => {
    const trimmed = (question || input).trim();
    if (!trimmed || loading) return;

    const userMsg = {
      id:        Date.now(),
      role:      "user",
      content:   trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res    = await sendChatMessage(trimmed);
      const answer = res.data.answer;

      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "assistant", content: answer, timestamp: new Date() },
      ]);
    } catch (err) {
      let msg = "Something went wrong. Please try again.";
      if      (err.response?.status === 429)                  msg = "Too many requests. Wait a moment and try again.";
      else if (err.response?.status === 503 || err.response?.status === 504) msg = "AI assistant temporarily unavailable.";
      else if (err.response?.status === 400)                  msg = "Invalid question. Please rephrase.";
      else if (!err.response)                                 msg = "Cannot reach the server. Check your connection.";

      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "assistant", content: msg, timestamp: new Date(), error: true },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }, [input, loading]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => setMessages([WELCOME_MESSAGE]);
  const showSuggestions = messages.length === 1 && !loading;

  // ── RENDER ─────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/80 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/20">
            <i className="ti ti-shield-bolt text-sm text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100 leading-none mb-0.5">CyberBot</h3>
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[10px] text-slate-500">AI Security Assistant </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {messages.length > 1 && (
            <button onClick={clearChat} title="Clear chat"
              className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-all">
              <i className="ti ti-trash text-xs" />
            </button>
          )}

          {onClose && (
            <button onClick={onClose} title="Close assistant" aria-label="Close assistant"
              className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-800 transition-all">
              <i className="ti ti-x text-sm" />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Suggested questions */}
      {showSuggestions && (
        <div className="px-4 pb-2 flex-shrink-0">
          <p className="text-[10px] text-slate-600 mb-2 uppercase tracking-wider font-medium">
            Try asking
          </p>
          <div className="space-y-1.5">
            {SUGGESTED_QUESTIONS.slice(0, 3).map((q) => (
              <button key={q} onClick={() => sendMessage(q)}
                className="w-full text-left text-[11px] text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-600 px-3 py-2 rounded-xl transition-all">
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-slate-800 flex-shrink-0">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about CVEs, threats, patching..."
            rows={1}
            disabled={loading}
            className="flex-1 bg-slate-800/80 border border-slate-700 text-xs text-slate-200 placeholder-slate-600 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-colors max-h-20"
            style={{ scrollbarWidth: "none" }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className={`h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
              input.trim() && !loading
                ? "bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-500/20"
                : "bg-slate-800 text-slate-600 cursor-not-allowed"
            }`}
          >
            {loading
              ? <i className="ti ti-loader-2 text-sm animate-spin" />
              : <i className="ti ti-send text-sm" />
            }
          </button>
        </div>
        <p className="text-[10px] text-slate-700 mt-1.5 text-center">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
