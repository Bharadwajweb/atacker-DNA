import React from "react";
import { Dna, Volume2, VolumeX, Monitor, RefreshCw, RotateCcw, FileText, AlertOctagon, Sparkles, Play, LogOut, Palette } from "lucide-react";
import { toggleSound, playTacticalClick } from "../utils/audio";

export default function Header({
  attackers = [],
  selectedAttacker = "ALL",
  onSelectAttacker,
  stats = {},
  scanlinesEnabled = false,
  onToggleScanlines,
  onRefresh,
  onOpenCopilot,
  onOpenDossier,
  onOpenImmunize,
  onRunAutoDemo,
  authSession,
  onLogout,
  currentTheme = "matrix",
  onSelectTheme
}) {
  const [soundOn, setSoundOn] = React.useState(true);

  const handleSoundToggle = () => {
    const newState = toggleSound();
    setSoundOn(newState);
    if (newState) playTacticalClick();
  };

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "rgba(3, 7, 18, 0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(0, 240, 255, 0.2)",
        padding: "14px 28px"
      }}
    >
      <div style={{ maxWidth: 1680, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: "linear-gradient(135deg, rgba(0, 240, 255, 0.2), rgba(168, 85, 247, 0.2))",
              border: "1px solid var(--cyan-neon)",
              display: "grid",
              placeItems: "center",
              boxShadow: "0 0 20px rgba(0, 240, 255, 0.3)"
            }}
          >
            <Dna size={26} style={{ color: "var(--cyan-neon)" }} />
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h1 style={{ fontSize: 20, fontWeight: 900, letterSpacing: "-0.03em", color: "#ffffff" }}>
                ATTACKER<span style={{ color: "var(--cyan-neon)" }}>DNA</span>
              </h1>
              <span className="cyber-badge" style={{ background: "rgba(0, 240, 255, 0.15)", color: "var(--cyan-neon)" }}>
                v2.5 PRO
              </span>
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
              AUTONOMOUS ADVERSARY GENOMIC PROFILING & CRISPR DECEPTION
            </div>
          </div>
        </div>

        {/* Live Metrics Pills */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div
            style={{
              padding: "6px 14px",
              background: "rgba(10, 20, 38, 0.6)",
              border: "1px solid rgba(30, 58, 95, 0.5)",
              borderRadius: 8,
              fontSize: 12,
              fontFamily: "var(--font-mono)"
            }}
          >
            <span style={{ color: "var(--text-muted)" }}>EVENTS:</span>{" "}
            <strong style={{ color: "var(--cyan-neon)" }}>{stats.events || 0}</strong>
          </div>

          <div
            style={{
              padding: "6px 14px",
              background: "rgba(10, 20, 38, 0.6)",
              border: "1px solid rgba(30, 58, 95, 0.5)",
              borderRadius: 8,
              fontSize: 12,
              fontFamily: "var(--font-mono)"
            }}
          >
            <span style={{ color: "var(--text-muted)" }}>PROFILES:</span>{" "}
            <strong style={{ color: "var(--violet-neon)" }}>{attackers.length || 0}</strong>
          </div>

          <div
            style={{
              padding: "6px 14px",
              background: "rgba(10, 20, 38, 0.6)",
              border: "1px solid rgba(30, 58, 95, 0.5)",
              borderRadius: 8,
              fontSize: 12,
              fontFamily: "var(--font-mono)"
            }}
          >
            <span style={{ color: "var(--text-muted)" }}>TOP HOMOLOGY:</span>{" "}
            <strong style={{ color: "#ffffff" }}>{stats.top_attribution || "APT29 Cozy Bear"}</strong>
          </div>

          {/* Active Operator Clearance Pill */}
          {authSession && (
            <div
              style={{
                padding: "6px 14px",
                background: "linear-gradient(135deg, rgba(0, 240, 255, 0.12), rgba(168, 85, 247, 0.12))",
                border: "1px solid rgba(0, 240, 255, 0.4)",
                borderRadius: 8,
                fontSize: 12,
                fontFamily: "var(--font-mono)",
                display: "flex",
                alignItems: "center",
                gap: 8
              }}
            >
              <span className="pulse-indicator" style={{ background: "var(--emerald-neon)", width: 6, height: 6 }} />
              <span style={{ color: "var(--text-muted)" }}>CLEARANCE:</span>
              <strong style={{ color: "var(--cyan-neon)" }}>{authSession.operatorId}</strong>
              <button
                onClick={onLogout}
                title="Lock Terminal & Log Out"
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  display: "grid",
                  placeItems: "center",
                  color: "var(--crimson-neon)",
                  marginLeft: 4
                }}
              >
                <LogOut size={13} />
              </button>
            </div>
          )}
        </div>

        {/* Selector & Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {/* Cyber Theme Switcher */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Palette size={14} style={{ color: "var(--cyan-neon)" }} />
            <select
              value={currentTheme}
              onChange={(e) => {
                playTacticalClick();
                if (onSelectTheme) onSelectTheme(e.target.value);
              }}
              title="Select Active Cyber Command Deck Theme"
              style={{
                padding: "7px 12px",
                background: "var(--bg-void)",
                border: "1px solid var(--border-glow)",
                borderRadius: 8,
                color: "var(--cyan-neon)",
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                fontWeight: 800,
                outline: "none",
                cursor: "pointer",
                boxShadow: "0 0 12px var(--cyan-glow)"
              }}
            >
              <option value="matrix">🟢 QUANTUM MATRIX</option>
              <option value="tokyo">🟣 NEO-TOKYO SYNTH</option>
              <option value="solaris">🟠 SOLARIS DEFENSE</option>
              <option value="arctic">🔵 ARCTIC TITANIUM</option>
            </select>
          </div>

          {/* Attacker Filter Dropdown */}
          <select
            value={selectedAttacker}
            onChange={(e) => {
              playTacticalClick();
              onSelectAttacker(e.target.value);
            }}
            style={{
              padding: "7px 14px",
              background: "var(--bg-void)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 8,
              color: "var(--cyan-neon)",
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              fontWeight: 700,
              outline: "none",
              cursor: "pointer"
            }}
          >
            <option value="ALL">ALL ADVERSARIES ({attackers.length})</option>
            {attackers.map(a => (
              <option key={a.attacker_id} value={a.attacker_id}>
                {a.attacker_id} ({a.total_events} evts - Risk: {a.risk_score}%)
              </option>
            ))}
          </select>

          {/* Export STIX 2.1 Bundle */}
          <button
            className="cyber-btn"
            onClick={async () => {
              playTacticalClick();
              try {
                const res = await fetch(`http://127.0.0.1:8000/export/stix/${selectedAttacker}`);
                const data = await res.json();
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `stix_bundle_${selectedAttacker}.json`;
                a.click();
              } catch (e) {
                alert("Failed to export STIX: " + e.message);
              }
            }}
            title="Download OASIS STIX 2.1 Threat Intel Bundle"
            style={{
              padding: "7px 12px",
              background: "rgba(0, 240, 255, 0.12)",
              color: "var(--cyan-neon)",
              border: "1px solid rgba(0, 240, 255, 0.35)",
              fontSize: 11
            }}
          >
            STIX 2.1
          </button>

          {/* Automated Live Presentation Demo */}
          <button
            className="cyber-btn"
            onClick={() => {
              playTacticalClick();
              if (onRunAutoDemo) onRunAutoDemo();
            }}
            title="Run Automated Guided Attack & Defense Demonstration"
            style={{
              padding: "7px 13px",
              background: "linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(0, 240, 255, 0.25))",
              color: "#ffffff",
              border: "1px solid var(--emerald-neon)",
              fontSize: 11,
              fontWeight: 800,
              boxShadow: "0 0 14px rgba(16, 185, 129, 0.35)"
            }}
          >
            <Play size={12} style={{ color: "var(--emerald-neon)", fill: "var(--emerald-neon)" }} /> AUTO DEMO
          </button>

          {/* AI Copilot Drawer Trigger */}
          <button
            className="cyber-btn"
            onClick={() => {
              playTacticalClick();
              if (onOpenCopilot) onOpenCopilot();
            }}
            title="Open Autonomous AI Cyber Copilot"
            style={{
              padding: "7px 13px",
              background: "linear-gradient(135deg, rgba(0, 240, 255, 0.2), rgba(168, 85, 247, 0.25))",
              color: "#ffffff",
              border: "1px solid var(--cyan-neon)",
              fontSize: 11,
              fontWeight: 800,
              boxShadow: "0 0 12px rgba(0, 240, 255, 0.3)"
            }}
          >
            <Sparkles size={13} style={{ color: "var(--cyan-neon)" }} /> COPILOT
          </button>

          {/* Executive Dossier Trigger */}
          <button
            className="cyber-btn"
            onClick={() => {
              playTacticalClick();
              if (onOpenDossier) onOpenDossier();
            }}
            title="Generate Printable C-Level Forensic Threat Dossier"
            style={{
              padding: "7px 12px",
              background: "rgba(168, 85, 247, 0.15)",
              color: "var(--violet-neon)",
              border: "1px solid rgba(168, 85, 247, 0.4)",
              fontSize: 11
            }}
          >
            <FileText size={13} /> DOSSIER
          </button>

          {/* Surgical Enterprise Immunize Trigger */}
          <button
            className="cyber-btn"
            onClick={() => {
              playTacticalClick();
              if (onOpenImmunize) onOpenImmunize();
            }}
            title="Execute Emergency 4-Phase Containment Lockdown"
            style={{
              padding: "7px 13px",
              background: "linear-gradient(135deg, rgba(255, 42, 95, 0.25), rgba(225, 29, 72, 0.3))",
              color: "#ffffff",
              border: "1px solid var(--crimson-neon)",
              fontSize: 11,
              fontWeight: 800,
              boxShadow: "0 0 15px rgba(255, 42, 95, 0.4)"
            }}
          >
            <AlertOctagon size={13} style={{ color: "var(--crimson-neon)" }} /> IMMUNIZE
          </button>

          {/* Test Honeypot Tripwire */}
          <button
            className="cyber-btn"
            onClick={async () => {
              playTacticalClick();
              try {
                await fetch("http://127.0.0.1:8000/trap/canary_credentials", { method: "POST" });
              } catch {
                // Trap error gracefully ignored
              }
            }}
            title="Trigger Live Honeypot Tripwire Alert"
            style={{
              padding: "7px 12px",
              background: "rgba(255, 42, 95, 0.15)",
              color: "var(--crimson-neon)",
              border: "1px solid rgba(255, 42, 95, 0.4)",
              fontSize: 11
            }}
          >
            TRIP DECOY
          </button>

          {/* Sound Toggle */}
          <button
            className="cyber-btn"
            onClick={handleSoundToggle}
            title={soundOn ? "Mute Sci-Fi Audio" : "Enable Sci-Fi Audio"}
            style={{
              padding: "8px",
              background: soundOn ? "rgba(0, 240, 255, 0.15)" : "rgba(30, 58, 95, 0.4)",
              color: soundOn ? "var(--cyan-neon)" : "#64748b",
              border: soundOn ? "1px solid var(--cyan-neon)" : "1px solid rgba(30, 58, 95, 0.5)"
            }}
          >
            {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          {/* CRT Scanlines Toggle */}
          <button
            className="cyber-btn"
            onClick={onToggleScanlines}
            title="Toggle CRT Scanline Hologram Overlay"
            style={{
              padding: "8px",
              background: scanlinesEnabled ? "rgba(168, 85, 247, 0.2)" : "rgba(30, 58, 95, 0.4)",
              color: scanlinesEnabled ? "var(--violet-neon)" : "#64748b",
              border: scanlinesEnabled ? "1px solid var(--violet-neon)" : "1px solid rgba(30, 58, 95, 0.5)"
            }}
          >
            <Monitor size={16} />
          </button>

          {/* Reset Baseline */}
          <button
            className="cyber-btn"
            onClick={async () => {
              playTacticalClick();
              if (window.confirm("Reset all telemetry and graph nodes to baseline state?")) {
                await fetch("http://127.0.0.1:8000/reset", { method: "POST" });
                if (onRefresh) onRefresh();
              }
            }}
            title="Reset Database to Clean Baseline State"
            style={{
              padding: "8px",
              background: "rgba(30, 58, 95, 0.4)",
              color: "#94a3b8",
              border: "1px solid rgba(30, 58, 95, 0.5)"
            }}
          >
            <RotateCcw size={15} />
          </button>

          {/* Refresh Data */}
          <button
            className="cyber-btn"
            onClick={onRefresh}
            title="Reload Live Telemetry"
            style={{
              padding: "8px",
              background: "rgba(30, 58, 95, 0.4)",
              color: "#cbd5e1",
              border: "1px solid rgba(30, 58, 95, 0.5)"
            }}
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}

