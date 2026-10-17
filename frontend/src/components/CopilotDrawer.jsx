import React, { useState, useRef, useEffect } from "react";
import { Bot, Sparkles, Send, Copy, Check, X, Loader2 } from "lucide-react";
import { playTacticalClick, playAlertChime, speakTacticalAlert } from "../utils/audio";

const PROMPT_CHIPS = [
  "Generate surgical PowerShell containment script",
  "Explain Smith-Waterman homology alignment",
  "Predict next likely adversary pivot & decoy trap",
  "Who is attacking and what is their origin?",
  "How does CRISPR protect our sensitive data?",
  "Generate YARA memory signature"
];

export default function CopilotDrawer({ isOpen, onClose, attackerId = "ALL", apiBase = "http://127.0.0.1:8000" }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      title: "Attacker DNA Autonomous Copilot Online",
      content: "I am actively monitoring adversary telemetry and genomic codon transitions. Ask for surgical containment scripts, trajectory forecasts, or Smith-Waterman alignment explanations.",
      code_snippet: null
    }
  ]);
  const [inputPrompt, setInputPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (queryText) => {
    const q = (queryText !== undefined && queryText !== null ? queryText : inputPrompt).trim();
    if (!q) return;

    playTacticalClick();
    setIsLoading(true);
    setMessages(prev => [...prev, { role: "user", content: q }]);
    setInputPrompt("");

    try {
      const res = await fetch(`${apiBase}/copilot/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: q, attacker_id: attackerId })
      });
      const data = await res.json();
      playAlertChime();
      if (data.title) {
        speakTacticalAlert(data.title);
      }

      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          title: data.title,
          content: data.content,
          code_snippet: data.code_snippet,
          language: data.language
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { role: "assistant", title: "Connection Error", content: `Copilot request failed: ${err.message}` }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyCode = (code, idx) => {
    playTacticalClick();
    navigator.clipboard.writeText(code);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        width: 520,
        maxWidth: "92vw",
        background: "rgba(3, 7, 18, 0.95)",
        backdropFilter: "blur(25px)",
        WebkitBackdropFilter: "blur(25px)",
        borderLeft: "1px solid var(--cyan-neon)",
        boxShadow: "-10px 0 40px rgba(0, 240, 255, 0.2)",
        zIndex: 99999,
        display: "flex",
        flexDirection: "column",
        animation: "slideInRight 0.25s ease"
      }}
    >
      {/* Drawer Header */}
      <div
        style={{
          padding: "18px 24px",
          borderBottom: "1px solid rgba(30, 58, 95, 0.6)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: "linear-gradient(135deg, rgba(0, 240, 255, 0.2), rgba(168, 85, 247, 0.2))",
              border: "1px solid var(--cyan-neon)",
              display: "grid",
              placeItems: "center"
            }}
          >
            <Bot size={20} style={{ color: "var(--cyan-neon)" }} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#ffffff" }}>GENOME-COPILOT</div>
            <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--cyan-neon)" }}>
              TARGET ENTITY: {attackerId}
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Suggested Quick Prompts */}
      <div style={{ padding: "12px 20px", borderBottom: "1px solid rgba(30, 58, 95, 0.4)", display: "flex", gap: 6, overflowX: "auto" }}>
        {PROMPT_CHIPS.map((chip, i) => (
          <button
            key={i}
            onClick={() => handleSend(chip)}
            style={{
              padding: "5px 10px",
              background: "rgba(10, 20, 38, 0.7)",
              border: "1px solid rgba(0, 240, 255, 0.3)",
              borderRadius: 6,
              color: "#38bdf8",
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              cursor: "pointer",
              whiteSpace: "nowrap"
            }}
          >
            <Sparkles size={10} style={{ display: "inline", marginRight: 4 }} />
            {chip}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div style={{ flex: 1, padding: 20, overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }}>
        {messages.map((m, idx) => (
          <div
            key={idx}
            style={{
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "92%",
              background: m.role === "user" ? "rgba(0, 240, 255, 0.15)" : "rgba(8, 17, 34, 0.8)",
              border: m.role === "user" ? "1px solid var(--cyan-neon)" : "1px solid rgba(30, 58, 95, 0.6)",
              borderRadius: 10,
              padding: "12px 16px"
            }}
          >
            {m.title && (
              <div style={{ fontSize: 12, fontWeight: 800, color: "var(--cyan-neon)", marginBottom: 4 }}>
                {m.title}
              </div>
            )}
            <div style={{ fontSize: 12, color: "#e2e8f0", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
              {m.content}
            </div>

            {m.code_snippet && (
              <div style={{ marginTop: 10, position: "relative" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "#050b18",
                    padding: "4px 10px",
                    borderTopLeftRadius: 6,
                    borderTopRightRadius: 6,
                    border: "1px solid rgba(30, 58, 95, 0.6)",
                    borderBottom: "none",
                    fontSize: 10,
                    fontFamily: "var(--font-mono)",
                    color: "var(--cyan-neon)"
                  }}
                >
                  <span>{m.language?.toUpperCase() || "CODE"}</span>
                  <button
                    onClick={() => copyCode(m.code_snippet, idx)}
                    style={{ background: "transparent", border: "none", color: "#38bdf8", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
                  >
                    {copiedIndex === idx ? <Check size={12} /> : <Copy size={12} />}
                    {copiedIndex === idx ? "COPIED" : "COPY"}
                  </button>
                </div>
                <pre
                  style={{
                    background: "#010409",
                    padding: 12,
                    borderBottomLeftRadius: 6,
                    borderBottomRightRadius: 6,
                    border: "1px solid rgba(30, 58, 95, 0.6)",
                    overflowX: "auto",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 11,
                    color: "#38bdf8",
                    lineHeight: 1.5,
                    maxHeight: 240
                  }}
                >
                  <code>{m.code_snippet}</code>
                </pre>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        style={{
          padding: 16,
          borderTop: "1px solid rgba(30, 58, 95, 0.6)",
          display: "flex",
          gap: 10
        }}
      >
        <input
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          placeholder="Ask copilot for containment, predictions, or code..."
          disabled={isLoading}
          style={{
            flex: 1,
            padding: "10px 14px",
            background: "#020611",
            border: "1px solid rgba(0, 240, 255, 0.4)",
            borderRadius: 8,
            color: "#ffffff",
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            outline: "none"
          }}
        />
        <button
          type="submit"
          disabled={isLoading || !inputPrompt.trim()}
          className="cyber-btn cyber-btn-cyan"
          style={{ padding: "10px 18px" }}
        >
          {isLoading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
        </button>
      </form>
    </div>
  );
}
