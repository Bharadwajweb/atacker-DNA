import React, { useState } from "react";
import { Binary, Search, Shield, Eye, Cpu } from "lucide-react";
import { playTacticalClick } from "../utils/audio";

// Helper to generate simulated deterministic hex dump for a given event string
function generateHexDump(event) {
  const seedStr = `${event?.event_id || "EVT"}-${event?.event_type || "EXEC"}-${event?.details || "DEFAULT_PAYLOAD"}`;
  const lines = [];
  const chars = "abcdef0123456789";

  for (let row = 0; row < 8; row++) {
    const offset = (row * 16).toString(16).padStart(8, "0");
    let hexParts = [];
    let asciiParts = [];

    for (let col = 0; col < 16; col++) {
      const charCode = (seedStr.charCodeAt((row * 16 + col) % seedStr.length) + (col * 7) + (row * 13)) % 256;
      hexParts.push(charCode.toString(16).padStart(2, "0"));

      if (charCode >= 32 && charCode <= 126) {
        asciiParts.push(String.fromCharCode(charCode));
      } else {
        asciiParts.push(".");
      }
    }

    const hexFormatted = `${hexParts.slice(0, 8).join(" ")}  ${hexParts.slice(8).join(" ")}`;
    lines.push({
      offset,
      hex: hexFormatted,
      ascii: asciiParts.join("")
    });
  }

  return lines;
}

export default function HexDissector({ selectedEvent }) {
  const [highlightKeyword, setHighlightKeyword] = useState("");

  const activeEvent = selectedEvent || {
    event_id: "PAYLOAD-SYNTH-01",
    event_type: "powershell_execution",
    source_ip: "185.220.101.5",
    host: "AUTH-SRV-01",
    details: "powershell.exe -NoP -NonI -W Hidden -Enc JABjAGwAaQBlAG4AdAA..."
  };

  const hexLines = generateHexDump(activeEvent);

  return (
    <div className="glass-panel" style={{ padding: 24, position: "relative" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              className="cyber-badge"
              style={{
                background: "rgba(0, 240, 255, 0.15)",
                color: "var(--cyan-neon)",
                border: "1px solid rgba(0, 240, 255, 0.4)"
              }}
            >
              <Binary size={13} /> FORENSIC HEX DISSECTOR
            </span>
            <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
              TARGET: {activeEvent.event_id}
            </span>
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 800, marginTop: 4, letterSpacing: "-0.02em" }}>
            Raw Memory & Packet Payload Disassembly
          </h3>
          <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>
            Low-level binary inspection of captured buffer payloads and command line artifacts.
          </p>
        </div>

        {/* Packet Meta Badges */}
        <div style={{ display: "flex", gap: 8 }}>
          <span className="cyber-badge" style={{ background: "rgba(16, 185, 129, 0.15)", color: "var(--emerald-neon)" }}>
            TCP / 443
          </span>
          <span className="cyber-badge" style={{ background: "rgba(168, 85, 247, 0.15)", color: "var(--violet-neon)" }}>
            128 BYTES
          </span>
        </div>
      </div>

      {/* Hex Disassembly Terminal View */}
      <div
        style={{
          background: "#020611",
          border: "1px solid rgba(30, 58, 95, 0.7)",
          borderRadius: 8,
          padding: 16,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 12,
          overflowX: "auto"
        }}
      >
        <div style={{ display: "flex", color: "#64748b", borderBottom: "1px solid rgba(30, 58, 95, 0.5)", paddingBottom: 6, marginBottom: 8 }}>
          <span style={{ width: 110 }}>OFFSET</span>
          <span style={{ flex: 1 }}>HEX DUMP (00 - 0F)</span>
          <span style={{ width: 140 }}>ASCII DECODE</span>
        </div>

        {hexLines.map((line, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              lineHeight: 1.8,
              transition: "background 0.15s ease"
            }}
          >
            <span style={{ width: 110, color: "var(--cyan-neon)", fontWeight: 700 }}>
              {line.offset}:
            </span>
            <span style={{ flex: 1, color: "#38bdf8", letterSpacing: "0.05em" }}>
              {line.hex}
            </span>
            <span style={{ width: 140, color: "var(--emerald-neon)" }}>
              |{line.ascii}|
            </span>
          </div>
        ))}
      </div>

      {/* Payload Details */}
      <div style={{ marginTop: 12, fontSize: 11, fontFamily: "var(--font-mono)", color: "#94a3b8" }}>
        DISSECTED COMMANDLINE / STRING:{" "}
        <span style={{ color: "#ffffff" }}>{activeEvent.details || "No raw string attached"}</span>
      </div>
    </div>
  );
}
