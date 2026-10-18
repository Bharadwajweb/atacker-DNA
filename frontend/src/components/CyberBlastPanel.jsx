import React, { useState } from "react";
import { Dna, Crosshair, AlertTriangle, CheckCircle, Globe } from "lucide-react";
import { playTacticalClick } from "../utils/audio";

export default function CyberBlastPanel({ blastData }) {
  const [activeTab, setActiveTab] = useState(0);

  if (!blastData || !blastData.rankings || blastData.rankings.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: 24, textAlign: "center" }}>
        <Dna size={32} style={{ color: "var(--cyan-neon)", margin: "0 auto 12px" }} />
        <h3 style={{ fontSize: 18, fontWeight: 700 }}>Cyber-BLAST Sequence Alignment</h3>
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>
          Awaiting telemetry sequence to perform Smith-Waterman adversary alignment.
        </p>
      </div>
    );
  }

  const topMatch = blastData.top_match || blastData.rankings[0];
  const selectedApt = blastData.rankings[activeTab] || topMatch;

  return (
    <div className="glass-panel" style={{ padding: 24, position: "relative" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className="cyber-badge" style={{ background: "rgba(255, 42, 95, 0.15)", color: "var(--crimson-neon)", border: "1px solid rgba(255, 42, 95, 0.4)" }}>
              <Crosshair size={13} /> CYBER-BLAST HOMOLOGY ENGINE
            </span>
            <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
              SMITH-WATERMAN LOCAL ALIGNMENT
            </span>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginTop: 6, letterSpacing: "-0.02em" }}>
            Adversary Threat Actor Attribution & Mutation Analysis
          </h2>
        </div>

        {/* Top Match Highlight Badge */}
        {topMatch && (
          <div
            style={{
              padding: "10px 18px",
              background: "linear-gradient(135deg, rgba(255, 42, 95, 0.15), rgba(168, 85, 247, 0.15))",
              border: "1px solid rgba(255, 42, 95, 0.5)",
              borderRadius: 10,
              textAlign: "right"
            }}
          >
            <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--crimson-neon)", fontWeight: 700 }}>
              HIGHEST MATCH PROBABILITY
            </div>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#ffffff", marginTop: 2 }}>
              {topMatch.name.split(" ")[0]} ({topMatch.match_percentage}%)
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: APT Tabs on Left, Detailed Alignment on Right */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(280px, 1fr) 2fr", gap: 20 }}>
        {/* Left: Ranked Adversary Profiles */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)", textTransform: "uppercase" }}>
            HOMOLOGY RANKING TABLE:
          </div>
          {blastData.rankings.map((apt, index) => {
            const isSelected = activeTab === index;
            const isTop = index === 0;

            return (
              <button
                key={apt.apt_id}
                onClick={() => {
                  playTacticalClick();
                  setActiveTab(index);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  background: isSelected ? "rgba(0, 240, 255, 0.12)" : "rgba(8, 17, 34, 0.6)",
                  border: isSelected ? "1px solid var(--cyan-neon)" : "1px solid rgba(30, 58, 95, 0.4)",
                  borderRadius: 10,
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.2s ease"
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontFamily: "var(--font-mono)",
                        fontWeight: 800,
                        color: isTop ? "var(--crimson-neon)" : "#64748b"
                      }}
                    >
                      #{index + 1}
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#f8fafc" }}>{apt.name}</span>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3 }}>
                    Origin: {apt.origin}
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 900,
                      fontFamily: "var(--font-mono)",
                      color: apt.match_percentage > 50 ? "var(--crimson-neon)" : (apt.match_percentage > 25 ? "var(--amber-neon)" : "var(--cyan-neon)")
                    }}
                  >
                    {apt.match_percentage}%
                  </div>
                  <div style={{ fontSize: 10, color: "#64748b", fontFamily: "var(--font-mono)" }}>
                    SCORE: {apt.alignment_score}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: Selected Adversary Genomic Breakdown */}
        <div
          style={{
            background: "rgba(5, 11, 24, 0.8)",
            border: "1px solid rgba(0, 240, 255, 0.25)",
            borderRadius: 12,
            padding: 20
          }}
        >
          {/* Dossier Top Bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid rgba(30, 58, 95, 0.5)", paddingBottom: 16, marginBottom: 16 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <h3 style={{ fontSize: 20, fontWeight: 900, color: "#ffffff" }}>{selectedApt.name}</h3>
                <span className="cyber-badge" style={{ background: "rgba(239, 68, 68, 0.15)", color: "#f87171" }}>
                  {selectedApt.danger_level}
                </span>
              </div>
              <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
                <Globe size={12} style={{ display: "inline", marginRight: 4 }} />
                Nation/Affiliation: <strong style={{ color: "#e2e8f0" }}>{selectedApt.origin}</strong> • Objective: {selectedApt.primary_objective}
              </p>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--cyan-neon)" }}>SIGNATURE CODON</div>
              <div style={{ fontSize: 13, fontFamily: "var(--font-mono)", fontWeight: 800, color: "#ffffff", marginTop: 2 }}>
                {selectedApt.signature_codon}
              </div>
            </div>
          </div>

          {/* Alignment Visualization (Bioinformatics format) */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)", marginBottom: 10 }}>
              SMITH-WATERMAN BIOINFORMATICS STRAND ALIGNMENT:
            </div>

            <div
              style={{
                background: "#020611",
                border: "1px solid rgba(30, 58, 95, 0.6)",
                borderRadius: 8,
                padding: "16px",
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                overflowX: "auto"
              }}
            >
              {/* Reference Strand */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                <span style={{ width: 90, color: "#94a3b8", fontWeight: 700 }}>REF [APT]:</span>
                <div style={{ display: "flex", gap: 6 }}>
                  {selectedApt.aligned_reference.map((ref, idx) => (
                    <span
                      key={idx}
                      style={{
                        padding: "3px 8px",
                        background: ref === "— GAP —" ? "rgba(239, 68, 68, 0.2)" : "rgba(30, 58, 95, 0.5)",
                        borderRadius: 4,
                        color: ref === "— GAP —" ? "#f87171" : "#38bdf8",
                        border: "1px solid rgba(30, 58, 95, 0.6)"
                      }}
                    >
                      {ref}
                    </span>
                  ))}
                </div>
              </div>

              {/* Match connector ticks */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                <span style={{ width: 90, color: "#64748b" }}>HOMOLOGY:</span>
                <div style={{ display: "flex", gap: 6 }}>
                  {selectedApt.aligned_observed.map((obs, idx) => {
                    const ref = selectedApt.aligned_reference[idx];
                    const isMatch = obs === ref && obs !== "— GAP —";
                    return (
                      <span
                        key={idx}
                        style={{
                          width: 32,
                          textAlign: "center",
                          color: isMatch ? "var(--emerald-neon)" : "var(--crimson-neon)",
                          fontWeight: 900
                        }}
                      >
                        {isMatch ? "|" : "x"}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Observed Strand */}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ width: 90, color: "var(--cyan-neon)", fontWeight: 700 }}>OBSERVED:</span>
                <div style={{ display: "flex", gap: 6 }}>
                  {selectedApt.aligned_observed.map((obs, idx) => {
                    const ref = selectedApt.aligned_reference[idx];
                    const isMatch = obs === ref && obs !== "— GAP —";
                    return (
                      <span
                        key={idx}
                        style={{
                          padding: "3px 8px",
                          background: isMatch ? "rgba(16, 185, 129, 0.15)" : "rgba(255, 42, 95, 0.15)",
                          borderRadius: 4,
                          color: isMatch ? "var(--emerald-neon)" : "var(--crimson-neon)",
                          border: isMatch ? "1px solid rgba(16, 185, 129, 0.4)" : "1px solid rgba(255, 42, 95, 0.4)"
                        }}
                      >
                        {obs}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Tactical Mutations Detected */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <AlertTriangle size={14} style={{ color: "var(--amber-neon)" }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--amber-neon)", fontFamily: "var(--font-mono)" }}>
                DETECTED GENOMIC MUTATIONS ({selectedApt.mutations.length})
              </span>
            </div>

            {selectedApt.mutations.length === 0 ? (
              <div style={{ fontSize: 12, color: "var(--emerald-neon)", display: "flex", alignItems: "center", gap: 6 }}>
                <CheckCircle size={14} /> Exact genomic concordance observed. Zero evasion mutations detected.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {selectedApt.mutations.map((mut, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      background: "rgba(15, 23, 42, 0.7)",
                      border: "1px solid rgba(245, 158, 11, 0.3)",
                      borderRadius: 6,
                      fontSize: 12
                    }}
                  >
                    <div>
                      <strong style={{ color: "#f8fafc" }}>{mut.type.replace(/_/g, " ")}:</strong>{" "}
                      <span style={{ color: "#94a3b8" }}>
                        Observed <span style={{ color: "var(--cyan-neon)" }}>{mut.observed || "NONE"}</span> instead of{" "}
                        <span style={{ color: "#f87171" }}>{mut.expected || "NONE"}</span>
                      </span>
                    </div>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--amber-neon)" }}>
                      POSITION #{mut.position + 1}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
