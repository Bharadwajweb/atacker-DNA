import React, { useState, useEffect } from "react";
import { ShieldCheck, Copy, Check, Download, FileCode, Terminal } from "lucide-react";
import { playTacticalClick } from "../utils/audio";

export default function RuleSynthesizer({ attackerId = "ALL", apiBase = "http://127.0.0.1:8000" }) {
  const [activeTab, setActiveTab] = useState("sigma");
  const [rules, setRules] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchRules() {
      try {
        setLoading(true);
        const res = await fetch(`${apiBase}/rules/${attackerId}`);
        const data = await res.json();
        setRules(data.rules);
      } catch (e) {
        console.error("Error fetching rules:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchRules();
  }, [attackerId, apiBase]);

  const currentCode = rules ? rules[activeTab] : "# Loading automated genetic rules...";

  const handleCopy = () => {
    playTacticalClick();
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    playTacticalClick();
    const ext = activeTab === "sigma" ? "yml" : (activeTab === "yara" ? "yar" : "rules");
    const blob = new Blob([currentCode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attacker_dna_${attackerId}_${activeTab}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="glass-panel" style={{ padding: 24, position: "relative" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className="cyber-badge" style={{ background: "rgba(16, 185, 129, 0.15)", color: "var(--emerald-neon)", border: "1px solid rgba(16, 185, 129, 0.4)" }}>
              <ShieldCheck size={13} /> AUTOMATED DEFENSE COMPILER
            </span>
            <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
              TARGET: {attackerId}
            </span>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginTop: 6, letterSpacing: "-0.02em" }}>
            Genetic Countermeasure & Detection Rule Synthesizer
          </h2>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>
            Instant operationalization: Convert decoded adversary codons into production-ready SIEM, EDR, and IDS signatures.
          </p>
        </div>

        {/* Copy / Export Buttons */}
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="cyber-btn cyber-btn-cyan"
            style={{ padding: "6px 14px", fontSize: 12 }}
            onClick={handleCopy}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "COPIED TO CLIPBOARD!" : "COPY RULE"}
          </button>
          <button
            className="cyber-btn"
            style={{ padding: "6px 14px", fontSize: 12, background: "rgba(30, 58, 95, 0.4)", color: "#e2e8f0" }}
            onClick={handleDownload}
          >
            <Download size={14} /> DOWNLOAD
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {[
          { id: "sigma", label: "SIGMA DETECTION RULE (YAML)", icon: FileCode },
          { id: "yara", label: "YARA MEMORY SIGNATURE", icon: Terminal },
          { id: "snort", label: "SNORT / SURICATA NETWORK IDS", icon: ShieldCheck }
        ].map(tab => {
          const isSelected = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => {
                playTacticalClick();
                setActiveTab(tab.id);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 16px",
                background: isSelected ? "rgba(0, 240, 255, 0.15)" : "rgba(8, 17, 34, 0.6)",
                border: isSelected ? "1px solid var(--cyan-neon)" : "1px solid rgba(30, 58, 95, 0.4)",
                borderRadius: 8,
                color: isSelected ? "var(--cyan-neon)" : "#94a3b8",
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              <Icon size={14} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Code Viewer */}
      <div
        className="cyber-code-block"
        style={{
          maxHeight: 340,
          overflowY: "auto",
          fontSize: 12,
          position: "relative"
        }}
      >
        <code>{currentCode}</code>
      </div>
    </div>
  );
}
