import React, { useState } from "react";
import { AlertOctagon, ShieldCheck, CheckCircle2, Lock, X, Loader2, ArrowRight } from "lucide-react";
import { playAlertChime, playTacticalClick } from "../utils/audio";

export default function ImmunizeModal({ isOpen, onClose, apiBase = "http://127.0.0.1:8000" }) {
  const [step, setStep] = useState("CONFIRM"); // CONFIRM -> EXECUTING -> COMPLETE
  const [result, setResult] = useState(null);

  if (!isOpen) return null;

  const handleExecute = async () => {
    playAlertChime();
    setStep("EXECUTING");

    try {
      await new Promise(r => setTimeout(r, 700));
      const res = await fetch(`${apiBase}/immunize`, { method: "POST" });
      const data = await res.json();
      setResult(data);
      setStep("COMPLETE");
    } catch (e) {
      alert("Immunization failed: " + e.message);
      setStep("CONFIRM");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(2, 6, 17, 0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        zIndex: 999999,
        display: "grid",
        placeItems: "center",
        padding: 20
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: 580,
          maxWidth: "100%",
          padding: 28,
          border: "2px solid var(--crimson-neon)",
          boxShadow: "0 0 50px rgba(255, 42, 95, 0.35)",
          animation: "scaleIn 0.25s ease"
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: "rgba(255, 42, 95, 0.2)",
                border: "1px solid var(--crimson-neon)",
                display: "grid",
                placeItems: "center"
              }}
            >
              <AlertOctagon size={24} style={{ color: "var(--crimson-neon)" }} />
            </div>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: "#ffffff" }}>
                SURGICAL ENTERPRISE IMMUNIZATION
              </h2>
              <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--crimson-neon)" }}>
                CRITICAL CONTAINMENT PROTOCOL (DEFCON 1)
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content depending on step */}
        {step === "CONFIRM" && (
          <div>
            <p style={{ fontSize: 13, color: "#e2e8f0", lineHeight: 1.6, marginBottom: 16 }}>
              You are about to initiate an enterprise-wide surgical containment sequence. This will:
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24, fontSize: 12, fontFamily: "var(--font-mono)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--crimson-neon)" }}>
                <ArrowRight size={14} /> Sever all outbound TCP/UDP network interfaces across compromised nodes.
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--amber-neon)" }}>
                <ArrowRight size={14} /> Invalidate all Active Directory Kerberos TGT and Azure AD session tokens.
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--emerald-neon)" }}>
                <ArrowRight size={14} /> Deploy poisoned canary decoy honeytokens into memory caches.
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                className="cyber-btn"
                onClick={onClose}
                style={{ background: "rgba(30, 58, 95, 0.5)", color: "#94a3b8" }}
              >
                ABORT
              </button>
              <button
                className="cyber-btn cyber-btn-crimson"
                onClick={handleExecute}
                style={{ padding: "10px 24px", fontSize: 13, fontWeight: 900 }}
              >
                EXECUTE SURGICAL IMMUNIZATION
              </button>
            </div>
          </div>
        )}

        {step === "EXECUTING" && (
          <div style={{ textAlign: "center", padding: "30px 0" }}>
            <Loader2 size={40} className="animate-spin" style={{ color: "var(--crimson-neon)", margin: "0 auto 16px" }} />
            <h3 style={{ fontSize: 18, fontWeight: 800 }}>Engaging EDR Network Isolation...</h3>
            <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 4, fontFamily: "var(--font-mono)" }}>
              Broadcasting kernel quarantine hooks and revoking high-privilege credentials...
            </p>
          </div>
        )}

        {step === "COMPLETE" && result && (
          <div>
            <div
              style={{
                padding: "12px 16px",
                background: "rgba(16, 185, 129, 0.15)",
                border: "1px solid var(--emerald-neon)",
                borderRadius: 8,
                color: "#6ee7b7",
                fontSize: 13,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 16
              }}
            >
              <CheckCircle2 size={18} /> IMMUNIZATION SUCCESSFULLY ORCHESTRATED!
            </div>

            <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)", marginBottom: 8 }}>
              CONTAINMENT AUDIT LEDGER:
            </div>

            <div style={{ maxHeight: 180, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
              {result.isolation_ledger.map((l, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "8px 12px",
                    background: "rgba(10, 20, 38, 0.7)",
                    border: "1px solid rgba(30, 58, 95, 0.5)",
                    borderRadius: 6,
                    fontSize: 11,
                    fontFamily: "var(--font-mono)"
                  }}
                >
                  <span style={{ color: "#ffffff" }}>{l.target}</span>
                  <span style={{ color: "var(--crimson-neon)", fontWeight: 700 }}>[SEVERED]</span>
                </div>
              ))}
              {result.revocation_ledger.map((r, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "8px 12px",
                    background: "rgba(10, 20, 38, 0.7)",
                    border: "1px solid rgba(30, 58, 95, 0.5)",
                    borderRadius: 6,
                    fontSize: 11,
                    fontFamily: "var(--font-mono)"
                  }}
                >
                  <span style={{ color: "#ffffff" }}>{r.user}</span>
                  <span style={{ color: "var(--amber-neon)", fontWeight: 700 }}>[TOKEN_REVOKED]</span>
                </div>
              ))}
            </div>

            <button
              className="cyber-btn cyber-btn-cyan"
              onClick={onClose}
              style={{ width: "100%", padding: "10px 0" }}
            >
              DISMISS PROTOCOL
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
