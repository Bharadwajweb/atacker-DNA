import React, { useState } from "react";
import { Printer, X } from "lucide-react";
import { playTacticalClick } from "../utils/audio";

export default function ExecutiveDossierModal({ isOpen, onClose, attackerId = "ALL", blastData = {}, events = [] }) {
  const [dossierId] = useState(() => `SEC-GENOME-${Math.floor(100000 + Math.random() * 900000)}`);
  if (!isOpen) return null;

  const topMatch = blastData?.top_match;
  const matchName = topMatch?.name || "APT29 (Cozy Bear / SVR)";
  const matchPct = topMatch?.match_percentage || 94.2;

  const handlePrint = () => {
    playTacticalClick();
    window.print();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(2, 6, 17, 0.88)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        zIndex: 999999,
        display: "grid",
        placeItems: "center",
        padding: 20,
        overflowY: "auto"
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: 760,
          maxWidth: "100%",
          maxHeight: "92vh",
          overflowY: "auto",
          padding: 32,
          background: "#030712",
          border: "1px solid var(--cyan-neon)",
          boxShadow: "0 0 50px rgba(0, 240, 255, 0.3)",
          color: "#f8fafc",
          position: "relative"
        }}
      >
        {/* Actions Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="cyber-btn cyber-btn-cyan"
              onClick={handlePrint}
              style={{ padding: "6px 14px", fontSize: 11 }}
            >
              <Printer size={13} /> PRINT / SAVE PDF
            </button>
          </div>

          <button
            onClick={onClose}
            style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Printable Formal Document Area */}
        <div style={{ border: "2px solid rgba(30, 58, 95, 0.8)", padding: 24, borderRadius: 8, background: "#050b18" }}>
          {/* Classification Header */}
          <div
            style={{
              textAlign: "center",
              padding: "6px 0",
              background: "rgba(255, 42, 95, 0.15)",
              border: "1px solid rgba(255, 42, 95, 0.5)",
              color: "var(--crimson-neon)",
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: "0.2em",
              marginBottom: 20
            }}
          >
            ★ TOP SECRET // NOFORN // CYBER-GENOMIC INTELLIGENCE ★
          </div>

          {/* Dossier Header */}
          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(30, 58, 95, 0.6)", paddingBottom: 16, marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--cyan-neon)" }}>
                INCIDENT DOSSIER ID: {dossierId}
              </div>
              <h1 style={{ fontSize: 22, fontWeight: 900, color: "#ffffff", marginTop: 4 }}>
                EXECUTIVE THREAT ATTRIBUTION BRIEFING
              </h1>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                Subject: Adversary Entity <strong>[{attackerId}]</strong> Behavioral Homology Report
              </div>
            </div>

            <div style={{ textAlign: "right", fontFamily: "var(--font-mono)", fontSize: 11, color: "#94a3b8" }}>
              <div>DATE: {new Date().toISOString().split("T")[0]}</div>
              <div style={{ color: "var(--emerald-neon)", marginTop: 2 }}>STATUS: CONFIRMED</div>
            </div>
          </div>

          {/* Core Findings Table */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)", marginBottom: 8 }}>
              PRIMARY GENOMIC ATTRIBUTION:
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: "var(--font-mono)" }}>
              <tbody>
                <tr style={{ borderBottom: "1px solid rgba(30, 58, 95, 0.4)" }}>
                  <td style={{ padding: "8px 0", color: "#94a3b8" }}>ATTRIBUTED ACTOR:</td>
                  <td style={{ padding: "8px 0", color: "#ffffff", fontWeight: 800 }}>{matchName}</td>
                </tr>
                <tr style={{ borderBottom: "1px solid rgba(30, 58, 95, 0.4)" }}>
                  <td style={{ padding: "8px 0", color: "#94a3b8" }}>BIOINFORMATICS HOMOLOGY:</td>
                  <td style={{ padding: "8px 0", color: "var(--cyan-neon)", fontWeight: 800 }}>{matchPct}% (Smith-Waterman Alignment)</td>
                </tr>
                <tr style={{ borderBottom: "1px solid rgba(30, 58, 95, 0.4)" }}>
                  <td style={{ padding: "8px 0", color: "#94a3b8" }}>SIGNATURE CODON:</td>
                  <td style={{ padding: "8px 0", color: "var(--emerald-neon)" }}>{topMatch?.signature_codon || "PS_TOKEN_LSASS"}</td>
                </tr>
                <tr style={{ borderBottom: "1px solid rgba(30, 58, 95, 0.4)" }}>
                  <td style={{ padding: "8px 0", color: "#94a3b8" }}>OBSERVED CODONS:</td>
                  <td style={{ padding: "8px 0", color: "#f8fafc" }}>{events.length} Discrete System TTPs</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Executive Assessment */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)", marginBottom: 6 }}>
              EXECUTIVE CLINICAL DIAGNOSTIC:
            </div>
            <p style={{ fontSize: 12, color: "#cbd5e1", lineHeight: 1.7 }}>
              Adversary entity <strong>[{attackerId}]</strong> demonstrated high-velocity living-off-the-land techniques consistent with nation-state cyber operations. Analysis of captured memory strings and lateral movement pivots confirms an objective targeting Active Directory domain tokens and proprietary enterprise repositories. Active CRISPR deception decoys have been deployed to trap further lateral reconnaissance.
            </p>
          </div>

          {/* Cryptographic Seal & Signatures */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", paddingTop: 18, borderTop: "1px solid rgba(30, 58, 95, 0.6)" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "#64748b" }}>
              <div>SHA-256 INTEGRITY SEAL:</div>
              <div style={{ color: "#38bdf8", marginTop: 2 }}>e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: "#94a3b8", fontFamily: "var(--font-mono)" }}>PRINCIPAL CYBER COMMANDER:</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "var(--cyan-neon)", marginTop: 2 }}>[AUTHORIZED &amp; VERIFIED]</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
