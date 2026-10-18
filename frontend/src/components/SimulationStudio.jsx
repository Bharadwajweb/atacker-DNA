import React, { useState } from "react";
import { PlayCircle, Terminal, Loader2, Sparkles, Skull, EyeOff, FileKey } from "lucide-react";
import { playSimulationLaunch, playTacticalClick } from "../utils/audio";

const SCENARIOS = [
  {
    id: "APT29_ESPIONAGE",
    title: "APT29 (Cozy Bear) Stealth Cloud Espionage",
    badge: "STATE-SPONSORED SVR",
    badgeColor: "#a855f7",
    icon: EyeOff,
    danger: "CRITICAL",
    target: "Azure AD & Core Kerberos Authentication",
    description: "Reconnaissance spray ➔ Token theft ➔ LSASS dump ➔ Silent cloud exfiltration."
  },
  {
    id: "LOCKBIT_RANSOMWARE",
    title: "LockBit 3.0 Ransomware Velocity Strike",
    badge: "EXTORTION CARTEL",
    badgeColor: "#ff2a5f",
    icon: Skull,
    danger: "EMERGENCY",
    target: "Enterprise Hospital Domain Controller",
    description: "Domain admin takeover ➔ Volume Shadow Purge ➔ Multi-threaded encryption."
  },
  {
    id: "INSIDER_EXFIL",
    title: "Disgruntled Privileged Insider Exfiltration",
    badge: "INSIDER THREAT",
    badgeColor: "#f59e0b",
    icon: FileKey,
    danger: "HIGH",
    target: "Aerospace CAD Patent Repository",
    description: "Off-hours login ➔ 7-Zip encrypted staging ➔ Security event log purge."
  },
  {
    id: "LAZARUS_HEIST",
    title: "Lazarus Group (HIDDEN COBRA) Crypto-Bridge Heist",
    badge: "STATE-NEXUS DPRK",
    badgeColor: "#00f0ff",
    icon: Terminal,
    danger: "CRITICAL",
    target: "DeFi Core & Cryptographic Key Store",
    description: "Trojanized npm stager ➔ Ed25519 memory scraping ➔ Transaction signature forgery."
  }
];

export default function SimulationStudio({ onSimulationComplete, apiBase = "http://127.0.0.1:8000" }) {
  const [selectedScenario, setSelectedScenario] = useState("APT29_ESPIONAGE");
  const [isSimulating, setIsSimulating] = useState(false);
  const [simLog, setSimLog] = useState([]);

  const handleLaunch = async () => {
    playSimulationLaunch();
    setIsSimulating(true);
    setSimLog([`[SYS] Initializing cyber-range sandbox for ${selectedScenario}...`]);

    try {
      // Animated step-by-step telemetry injection
      await new Promise(r => setTimeout(r, 600));
      setSimLog(prev => [...prev, `[NET] Routing synthetic adversary traffic through anonymized proxy nodes...`]);

      await new Promise(r => setTimeout(r, 700));
      setSimLog(prev => [...prev, `[DNA] Generating adversary nucleotide codons and binding CRISPR decoys...`]);

      const res = await fetch(`${apiBase}/simulate/${selectedScenario}`, {
        method: "POST"
      });
      const data = await res.json();

      await new Promise(r => setTimeout(r, 600));
      setSimLog(prev => [
        ...prev,
        `[OK] Ingested ${data.events_added} synthetic events! Pipeline regenerated.`,
        `[BLAST] Top attribution: ${data.blast?.top_match?.name || "APT Identified"}`
      ]);

      if (onSimulationComplete) {
        onSimulationComplete(data);
      }
    } catch (err) {
      setSimLog(prev => [...prev, `[ERR] Simulation failed: ${err.message}`]);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: 24, position: "relative" }}>
      {/* Title */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className="cyber-badge" style={{ background: "rgba(168, 85, 247, 0.15)", color: "var(--violet-neon)", border: "1px solid rgba(168, 85, 247, 0.4)" }}>
              <Sparkles size={13} /> LIVE BREACH SIMULATOR STUDIO
            </span>
            <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
              CYBER-WARFARE SANDBOX REPLAY
            </span>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginTop: 6, letterSpacing: "-0.02em" }}>
            Autonomous Incident Replay & Genome Stress Test
          </h2>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>
            Trigger pre-configured APT invasion scenarios to test real-time DNA sequencing and automated CRISPR deception traps.
          </p>
        </div>
      </div>

      {/* Scenario Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14, marginBottom: 20 }}>
        {SCENARIOS.map(sc => {
          const isSelected = selectedScenario === sc.id;
          const IconComponent = sc.icon;

          return (
            <div
              key={sc.id}
              onClick={() => {
                playTacticalClick();
                setSelectedScenario(sc.id);
              }}
              style={{
                padding: "16px",
                background: isSelected ? "rgba(168, 85, 247, 0.12)" : "rgba(8, 17, 34, 0.6)",
                border: isSelected ? "1px solid var(--violet-neon)" : "1px solid rgba(30, 58, 95, 0.4)",
                borderRadius: 10,
                cursor: "pointer",
                transition: "all 0.2s ease",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span
                    className="cyber-badge"
                    style={{ background: `${sc.badgeColor}22`, color: sc.badgeColor, border: `1px solid ${sc.badgeColor}55` }}
                  >
                    {sc.badge}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontFamily: "var(--font-mono)",
                      color: sc.danger === "EMERGENCY" ? "var(--crimson-neon)" : "var(--amber-neon)",
                      fontWeight: 800
                    }}
                  >
                    {sc.danger}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <IconComponent size={20} style={{ color: sc.badgeColor }} />
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: "#f8fafc" }}>{sc.title}</h4>
                </div>

                <p style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>
                  {sc.description}
                </p>
              </div>

              <div style={{ marginTop: 14, paddingTop: 10, borderTop: "1px solid rgba(30, 58, 95, 0.4)", fontSize: 11, color: "#64748b" }}>
                Target: <span style={{ color: "#cbd5e1" }}>{sc.target}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Button & Terminal Console */}
      <div style={{ display: "flex", gap: 16, alignItems: "stretch", flexWrap: "wrap" }}>
        <button
          className="cyber-btn"
          onClick={handleLaunch}
          disabled={isSimulating}
          style={{
            padding: "16px 28px",
            fontSize: 14,
            fontWeight: 800,
            background: "linear-gradient(135deg, #a855f7, #6366f1)",
            color: "#ffffff",
            boxShadow: "0 0 25px rgba(168, 85, 247, 0.4)",
            cursor: isSimulating ? "not-allowed" : "pointer",
            border: "none",
            minWidth: 240
          }}
        >
          {isSimulating ? (
            <>
              <Loader2 size={18} className="animate-spin" /> EXECUTING INVASION...
            </>
          ) : (
            <>
              <PlayCircle size={18} /> LAUNCH LIVE BREACH
            </>
          )}
        </button>

        {/* Live Terminal Output */}
        <div
          style={{
            flex: 1,
            minWidth: 320,
            background: "#020611",
            border: "1px solid rgba(30, 58, 95, 0.6)",
            borderRadius: 8,
            padding: "12px 16px",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "#38bdf8",
            maxHeight: 120,
            overflowY: "auto"
          }}
        >
          <div style={{ color: "#64748b", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
            <Terminal size={12} /> TELEMETRY INGESTION TERMINAL:
          </div>
          {simLog.length === 0 ? (
            <span style={{ color: "#475569" }}>Click 'LAUNCH LIVE BREACH' to stream synthetic telemetry.</span>
          ) : (
            simLog.map((log, idx) => (
              <div key={idx} style={{ marginTop: 2, color: log.includes("[OK]") ? "var(--emerald-neon)" : (log.includes("[ERR]") ? "var(--crimson-neon)" : "#38bdf8") }}>
                {log}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
