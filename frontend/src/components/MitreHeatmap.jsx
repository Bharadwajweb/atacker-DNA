import React, { useState } from "react";
import { Grid } from "lucide-react";
import { playTacticalClick } from "../utils/audio";

const MITRE_TACTICS = [
  { id: "TA0001", name: "Initial Access", color: "#38bdf8" },
  { id: "TA0002", name: "Execution", color: "#818cf8" },
  { id: "TA0003", name: "Persistence", color: "#a855f7" },
  { id: "TA0004", name: "Priv Escalation", color: "#f43f5e" },
  { id: "TA0005", name: "Defense Evasion", color: "#fb7185" },
  { id: "TA0006", name: "Credential Access", color: "#ff2a5f" },
  { id: "TA0007", name: "Discovery", color: "#f59e0b" },
  { id: "TA0008", name: "Lateral Movement", color: "#e11d48" },
  { id: "TA0009", name: "Collection", color: "#06b6d4" },
  { id: "TA0011", name: "Command & Control", color: "#10b981" },
  { id: "TA0010", name: "Exfiltration", color: "#14b8a6" }
];

const TECHNIQUE_MAP = {
  failed_login: { id: "T1110", name: "Brute Force", tactic: "Initial Access" },
  successful_login: { id: "T1078", name: "Valid Accounts", tactic: "Initial Access" },
  process_created: { id: "T1059", name: "Command & Scripting", tactic: "Execution" },
  powershell_execution: { id: "T1059.001", name: "PowerShell Stager", tactic: "Execution" },
  privilege_escalation: { id: "T1068", name: "Exploitation for Priv Escalation", tactic: "Priv Escalation" },
  credential_access: { id: "T1003", name: "OS Credential Dumping (LSASS)", tactic: "Credential Access" },
  lateral_movement: { id: "T1021", name: "Remote Services (SMB/WMI)", tactic: "Lateral Movement" },
  data_access: { id: "T1005", name: "Data from Local System", tactic: "Collection" }
};

export default function MitreHeatmap({ events = [] }) {
  const [selectedTactic, setSelectedTactic] = useState(null);

  // Group observed events by tactic
  const tacticHits = React.useMemo(() => {
    const hits = {};
    MITRE_TACTICS.forEach(t => { hits[t.name] = []; });

    events.forEach(ev => {
      const tech = TECHNIQUE_MAP[ev.event_type];
      if (tech && hits[tech.tactic]) {
        hits[tech.tactic].push({ ...ev, technique: tech });
      }
    });

    return hits;
  }, [events]);

  return (
    <div className="glass-panel" style={{ padding: 24, position: "relative" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              className="cyber-badge"
              style={{
                background: "rgba(56, 189, 248, 0.15)",
                color: "#38bdf8",
                border: "1px solid rgba(56, 189, 248, 0.4)"
              }}
            >
              <Grid size={13} /> MITRE ATT&CK HEATMAP
            </span>
            <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
              ENTERPRISE MATRIX v15.1
            </span>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginTop: 6, letterSpacing: "-0.02em" }}>
            Adversary TTP Coverage & Tactic Velocity
          </h2>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>
            Real-time visual map of attacker movements across the MITRE ATT&CK kill-chain spectrum.
          </p>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(135px, 1fr))",
          gap: 10,
          marginBottom: 16
        }}
      >
        {MITRE_TACTICS.map(tactic => {
          const hitCount = (tacticHits[tactic.name] || []).length;
          const isActive = hitCount > 0;
          const isSelected = selectedTactic?.name === tactic.name;

          return (
            <button
              key={tactic.id}
              onClick={() => {
                playTacticalClick();
                setSelectedTactic(isActive ? tactic : null);
              }}
              style={{
                padding: "12px 10px",
                background: isActive
                  ? `linear-gradient(180deg, ${tactic.color}22, rgba(8, 17, 34, 0.9))`
                  : "rgba(5, 11, 24, 0.6)",
                border: isSelected
                  ? `1px solid ${tactic.color}`
                  : (isActive ? `1px solid ${tactic.color}55` : "1px solid rgba(30, 58, 95, 0.3)"),
                borderRadius: 8,
                cursor: isActive ? "pointer" : "default",
                textAlign: "left",
                transition: "all 0.2s ease",
                boxShadow: isActive ? `0 0 15px ${tactic.color}15` : "none"
              }}
            >
              <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#64748b" }}>
                {tactic.id}
              </div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: isActive ? "#ffffff" : "#475569",
                  marginTop: 2,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}
              >
                {tactic.name}
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: 10,
                  paddingTop: 8,
                  borderTop: "1px solid rgba(30, 58, 95, 0.4)"
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    fontFamily: "var(--font-mono)",
                    color: isActive ? tactic.color : "#475569",
                    fontWeight: 800
                  }}
                >
                  {hitCount} HITS
                </span>
                {isActive && (
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: tactic.color,
                      boxShadow: `0 0 8px ${tactic.color}`
                    }}
                  />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Tactic Events Breakdown */}
      {selectedTactic && (
        <div
          style={{
            padding: 16,
            background: "rgba(5, 11, 24, 0.8)",
            border: `1px solid ${selectedTactic.color}`,
            borderRadius: 8,
            animation: "fadeIn 0.2s ease"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: selectedTactic.color }}>
              OBSERVED ACTIONS FOR {selectedTactic.name.toUpperCase()} ({tacticHits[selectedTactic.name].length})
            </div>
            <button
              onClick={() => setSelectedTactic(null)}
              style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 12 }}
            >
              CLOSE
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
            {tacticHits[selectedTactic.name].map((ev, idx) => (
              <div
                key={idx}
                style={{
                  padding: "10px 12px",
                  background: "rgba(10, 20, 38, 0.7)",
                  border: "1px solid rgba(30, 58, 95, 0.5)",
                  borderRadius: 6
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--cyan-neon)" }}>
                    {ev.technique.id}
                  </span>
                  <span style={{ fontSize: 10, color: "#64748b", fontFamily: "var(--font-mono)" }}>
                    {ev.attacker_id}
                  </span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#ffffff", marginTop: 2 }}>
                  {ev.technique.name}
                </div>
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
                  Target: {ev.host} ({ev.user})
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
