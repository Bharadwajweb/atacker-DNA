import React, { useState, useEffect } from "react";
import { Stethoscope, Activity, Loader2, CheckCircle2 } from "lucide-react";

export default function PathologistReport({ attackerId = "ALL", apiBase = "http://127.0.0.1:8000" }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchReport() {
      try {
        setLoading(true);
        const res = await fetch(`${apiBase}/pathologist/${attackerId}`);
        const data = await res.json();
        setReport(data);
      } catch (e) {
        console.error("Error fetching pathologist report:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchReport();
  }, [attackerId, apiBase]);

  if (loading && !report) {
    return (
      <div className="glass-panel" style={{ padding: 40, textAlign: "center", color: "var(--cyan-neon)", fontFamily: "var(--font-mono)" }}>
        <Loader2 size={24} className="animate-spin" style={{ margin: "0 auto 8px" }} />
        [SYNTHESIZING CLINICAL FORENSIC PATHOLOGY REPORT...]
      </div>
    );
  }

  if (!report) {
    return null;
  }

  const threatColor =
    report.threat_level === "EMERGENCY"
      ? "var(--crimson-neon)"
      : report.threat_level === "CRITICAL"
      ? "#f43f5e"
      : "var(--amber-neon)";

  return (
    <div className="glass-panel" style={{ padding: 24, position: "relative" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
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
              <Stethoscope size={13} /> AI THREAT PATHOLOGIST
            </span>
            <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
              CLINICAL FORENSIC INTELLIGENCE DEBRIEF
            </span>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginTop: 6, letterSpacing: "-0.02em" }}>
            Adversary Clinical Diagnostics & Containment Playbook
          </h2>
        </div>

        {/* Threat Level Badge */}
        <div
          style={{
            padding: "8px 16px",
            background: `${threatColor}1a`,
            border: `1px solid ${threatColor}`,
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            gap: 8
          }}
        >
          <Activity size={16} style={{ color: threatColor }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 800, color: threatColor }}>
            RISK LEVEL: {report.threat_level}
          </span>
        </div>
      </div>

      {/* Executive Briefing Box */}
      <div
        style={{
          background: "rgba(5, 11, 24, 0.8)",
          border: "1px solid rgba(30, 58, 95, 0.6)",
          borderRadius: 10,
          padding: 18,
          marginBottom: 20
        }}
      >
        <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--cyan-neon)", marginBottom: 6 }}>
          PATHOLOGICAL CLINICAL SUMMARY:
        </div>
        <p style={{ fontSize: 13, color: "#e2e8f0", lineHeight: 1.7 }}>
          {report.executive_summary}
        </p>

        <div style={{ display: "flex", gap: 20, marginTop: 14, paddingTop: 12, borderTop: "1px solid rgba(30, 58, 95, 0.5)", fontSize: 12 }}>
          <div>
            <span style={{ color: "var(--text-muted)" }}>GENOMIC SIGNATURE:</span>{" "}
            <span style={{ fontFamily: "var(--font-mono)", color: "var(--cyan-neon)", fontWeight: 700 }}>
              {report.genomic_signature}
            </span>
          </div>
          <div>
            <span style={{ color: "var(--text-muted)" }}>PRIMARY HOMOLOGY:</span>{" "}
            <strong style={{ color: "#ffffff" }}>{report.top_attribution}</strong> ({report.attribution_confidence}%)
          </div>
        </div>
      </div>

      {/* 4-Phase Containment Playbook */}
      <div>
        <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)", marginBottom: 12, textTransform: "uppercase" }}>
          SURGICAL INCIDENT RESPONSE & CONTAINMENT PLAYBOOK:
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
          {report.containment_playbook.map((step, idx) => (
            <div
              key={idx}
              style={{
                background: "rgba(10, 20, 38, 0.6)",
                border: "1px solid rgba(30, 58, 95, 0.5)",
                borderRadius: 8,
                padding: 14,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--cyan-neon)", fontWeight: 700 }}>
                    {step.phase}
                  </span>
                  <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--crimson-neon)", fontWeight: 700 }}>
                    {step.urgency}
                  </span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#ffffff", marginBottom: 6 }}>
                  {step.action}
                </div>
                <p style={{ fontSize: 11, color: "#94a3b8", lineHeight: 1.5 }}>
                  {step.details}
                </p>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12, fontSize: 11, color: "var(--emerald-neon)" }}>
                <CheckCircle2 size={12} /> Playbook action ready for orchestration
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
