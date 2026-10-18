import React, { useState } from "react";
import { ShieldAlert, Key, Database, Server, Terminal, Lock, CheckCircle2, PlusCircle } from "lucide-react";
import { playAlertChime } from "../utils/audio";

const DECOYS = [
  { id: "decoy-lsass", name: "Canary AD Domain Admin in LSASS", type: "CREDENTIAL_TRAP", icon: Key, status: "PRIMED", hits: 3 },
  { id: "decoy-sql", name: "Poisoned Patient Database (Port 1433)", type: "DATABASE_TRAP", icon: Database, status: "ACTIVE", hits: 1 },
  { id: "decoy-rdp", name: "Decoy Finance Workstation (10.0.99.4)", type: "HOST_HONEYPOT", icon: Server, status: "LISTENING", hits: 0 },
  { id: "decoy-pwsh", name: "Sandboxed PowerShell AMSI Wrapper", type: "EXEC_CONTAINER", icon: Terminal, status: "ARMED", hits: 2 }
];

export default function DeceptionGrid({ deceptionData = { active: false, actions: [] } }) {
  const [decoys, setDecoys] = useState(DECOYS);
  const [deploySuccess, setDeploySuccess] = useState(false);

  const handleDeployNewDecoy = () => {
    playAlertChime();
    const newDecoy = {
      id: `decoy-${Date.now()}`,
      name: `Synthetic AWS IAM Secret (adm-canary-${Math.floor(Math.random() * 899 + 100)})`,
      type: "CLOUD_CANARY",
      icon: Lock,
      status: "ARMED",
      hits: 0
    };
    setDecoys(prev => [newDecoy, ...prev]);
    setDeploySuccess(true);
    setTimeout(() => setDeploySuccess(false), 2500);
  };

  return (
    <div className="glass-panel" style={{ padding: 24, position: "relative" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
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
              <ShieldAlert size={13} /> CRISPR DECEPTION GRID
            </span>
            <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
              {deceptionData?.events || decoys.length} ASSETS PRIMED • SYNTHETIC HONEYTOKEN BINDING
            </span>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginTop: 6, letterSpacing: "-0.02em" }}>
            Active Deception Decoys & Honey-Traps
          </h2>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>
            Proactively deployed synthetic assets that bind directly to attacker TTP sequences.
          </p>
        </div>

        {/* Deploy Button */}
        <button
          className="cyber-btn cyber-btn-cyan"
          onClick={handleDeployNewDecoy}
          style={{ padding: "8px 16px" }}
        >
          <PlusCircle size={15} /> DEPLOY CANARY TOKEN
        </button>
      </div>

      {deploySuccess && (
        <div
          style={{
            padding: "10px 14px",
            background: "rgba(16, 185, 129, 0.15)",
            border: "1px solid var(--emerald-neon)",
            borderRadius: 8,
            color: "#6ee7b7",
            fontSize: 12,
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            gap: 8
          }}
        >
          <CheckCircle2 size={16} /> New synthetic AWS canary token successfully injected into enterprise credential cache!
        </div>
      )}

      {/* Decoys Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
        {decoys.map(decoy => {
          const IconComponent = decoy.icon;
          const isTriggered = decoy.hits > 0;

          return (
            <div
              key={decoy.id}
              style={{
                padding: "16px",
                background: isTriggered ? "rgba(255, 42, 95, 0.08)" : "rgba(8, 17, 34, 0.6)",
                border: isTriggered ? "1px solid rgba(255, 42, 95, 0.4)" : "1px solid rgba(30, 58, 95, 0.4)",
                borderRadius: 10,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span
                    className="cyber-badge"
                    style={{
                      background: isTriggered ? "rgba(255, 42, 95, 0.2)" : "rgba(16, 185, 129, 0.15)",
                      color: isTriggered ? "var(--crimson-neon)" : "var(--emerald-neon)",
                      border: `1px solid ${isTriggered ? "rgba(255, 42, 95, 0.4)" : "rgba(16, 185, 129, 0.3)"}`
                    }}
                  >
                    {decoy.status}
                  </span>
                  <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: isTriggered ? "var(--crimson-neon)" : "#64748b", fontWeight: 700 }}>
                    {decoy.hits} TRAP HITS
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <IconComponent size={18} style={{ color: isTriggered ? "var(--crimson-neon)" : "var(--emerald-neon)" }} />
                  <h4 style={{ fontSize: 14, fontWeight: 700, color: "#f8fafc" }}>{decoy.name}</h4>
                </div>

                <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
                  TYPE: {decoy.type}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
