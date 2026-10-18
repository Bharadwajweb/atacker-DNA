import React, { useState, useRef, useEffect } from "react";
import { Terminal, CornerDownLeft } from "lucide-react";
import { playTacticalClick, playAlertChime } from "../utils/audio";

const QUICK_COMMANDS = [
  "whoami",
  "ipconfig",
  "net user",
  "mimikatz",
  "powershell -ExecutionPolicy Bypass",
  "vssadmin delete shadows /all",
  "dir Confidential_Patents"
];

export default function HoneyShell({ onCommandExecuted, apiBase = "http://127.0.0.1:8000" }) {
  const [history, setHistory] = useState([
    { type: "system", text: "DNA-DECOY-SHELL v4.2 [SANDBOX CONTAINER 10.0.1.99]" },
    { type: "system", text: "Type commands or click quick actions to observe real-time codon sequencing." }
  ]);
  const [inputVal, setInputVal] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const executeCommand = async (cmd) => {
    const clean = cmd.trim();
    if (!clean) return;

    playTacticalClick();
    setIsExecuting(true);
    setHistory(prev => [...prev, { type: "input", text: `PS C:\\Users\\svc_backup_admin> ${clean}` }]);
    setInputVal("");

    try {
      const res = await fetch(`${apiBase}/honeyshell/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: clean, attacker_id: "INTERACTIVE-INTRUDER" })
      });
      const data = await res.json();
      playAlertChime();

      setHistory(prev => [
        ...prev,
        { type: "output", text: data.output },
        { type: "badge", text: `[DNA SEQUENCED] ➔ Codon: ${data.event.event_type.toUpperCase()} (Severity: ${data.event.severity})` }
      ]);

      if (onCommandExecuted) {
        onCommandExecuted();
      }
    } catch (err) {
      setHistory(prev => [...prev, { type: "error", text: `Execution failed: ${err.message}` }]);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: 24, position: "relative" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              className="cyber-badge"
              style={{
                background: "rgba(16, 185, 129, 0.15)",
                color: "var(--emerald-neon)",
                border: "1px solid rgba(16, 185, 129, 0.4)"
              }}
            >
              <Terminal size={13} /> LIVE HONEYSHELL CLI
            </span>
            <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
              INTERACTIVE RECONNAISSANCE SANDBOX
            </span>
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 800, marginTop: 4, letterSpacing: "-0.02em" }}>
            Honeypot Command Execution & Direct Codon Synthesis
          </h3>
          <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>
            Simulate adversary terminal access. Commands executed here are instantly converted into cyber nucleotide codons in the live 3D Helix.
          </p>
        </div>
      </div>

      {/* Quick Exploitation Chips */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 10, marginBottom: 10 }}>
        {QUICK_COMMANDS.map((qc, i) => (
          <button
            key={i}
            onClick={() => executeCommand(qc)}
            disabled={isExecuting}
            style={{
              padding: "4px 10px",
              background: "rgba(10, 20, 38, 0.7)",
              border: "1px solid rgba(0, 240, 255, 0.3)",
              borderRadius: 6,
              color: "#38bdf8",
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all 0.15s ease"
            }}
          >
            $ {qc}
          </button>
        ))}
      </div>

      {/* Terminal Display */}
      <div
        style={{
          background: "#010409",
          border: "1px solid rgba(30, 58, 95, 0.8)",
          borderRadius: 8,
          padding: 16,
          height: 280,
          overflowY: "auto",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 12,
          lineHeight: 1.6
        }}
      >
        {history.map((line, idx) => {
          if (line.type === "system") {
            return <div key={idx} style={{ color: "#64748b" }}>{line.text}</div>;
          }
          if (line.type === "input") {
            return <div key={idx} style={{ color: "var(--cyan-neon)", fontWeight: 700, marginTop: 8 }}>{line.text}</div>;
          }
          if (line.type === "badge") {
            return <div key={idx} style={{ color: "var(--emerald-neon)", fontWeight: 700, marginTop: 4 }}>{line.text}</div>;
          }
          if (line.type === "error") {
            return <div key={idx} style={{ color: "var(--crimson-neon)" }}>{line.text}</div>;
          }
          return <div key={idx} style={{ color: "#e2e8f0", whiteSpace: "pre-wrap" }}>{line.text}</div>;
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          executeCommand(inputVal);
        }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginTop: 12
        }}
      >
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--cyan-neon)", fontWeight: 800 }}>
          PS&gt;
        </span>
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Enter command (e.g., whoami, mimikatz, vssadmin)..."
          disabled={isExecuting}
          style={{
            flex: 1,
            padding: "8px 14px",
            background: "#020611",
            border: "1px solid rgba(0, 240, 255, 0.4)",
            borderRadius: 6,
            color: "#ffffff",
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            outline: "none"
          }}
        />
        <button
          type="submit"
          disabled={isExecuting || !inputVal.trim()}
          className="cyber-btn cyber-btn-cyan"
          style={{ padding: "8px 16px" }}
        >
          <CornerDownLeft size={14} /> EXECUTE
        </button>
      </form>
    </div>
  );
}
