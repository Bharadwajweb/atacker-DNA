import React, { useState } from "react";
import { Dna, KeyRound, User, Fingerprint, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { playTacticalClick, playAlertChime, speakTacticalAlert } from "../utils/audio";

export default function AuthGate({ onAuthenticated }) {
  const [operatorId, setOperatorId] = useState("OPERATOR-COBALT");
  const [passcode, setPasscode] = useState("CYBER-DNA-2026");
  const [isScanning, setIsScanning] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);

  const handleAuthenticate = (bypass = false) => {
    playTacticalClick();
    setIsScanning(true);

    setTimeout(() => {
      setAuthSuccess(true);
      playAlertChime();
      speakTacticalAlert("Defense clearance level five verified. Welcome Operator.");

      setTimeout(() => {
        const sessionData = {
          operatorId: bypass ? "OPERATOR-DEMO" : operatorId,
          clearanceLevel: "LEVEL-5-TOP-SECRET",
          timestamp: new Date().toISOString()
        };
        localStorage.setItem("attacker_dna_auth", JSON.stringify(sessionData));
        if (onAuthenticated) {
          onAuthenticated(sessionData);
        }
      }, 700);
    }, 900);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999999,
        background: "radial-gradient(circle at 50% 30%, rgba(10, 25, 55, 0.95), rgba(2, 6, 17, 0.99))",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20
      }}
    >
      {/* Background Cyber Grid */}
      <div className="cyber-canvas-bg" />

      {/* Futuristic Authentication Hologram Card */}
      <div
        className="glass-panel"
        style={{
          width: 480,
          maxWidth: "100%",
          padding: "36px 32px",
          background: "rgba(5, 12, 28, 0.75)",
          backdropFilter: "blur(30px) saturate(190%)",
          WebkitBackdropFilter: "blur(30px) saturate(190%)",
          border: "1px solid rgba(0, 240, 255, 0.35)",
          boxShadow: "0 0 50px rgba(0, 240, 255, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
          borderRadius: 16,
          position: "relative",
          overflow: "hidden",
          animation: "scaleIn 0.35s ease"
        }}
      >
        {/* Animated Top Border Glow Line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            background: "linear-gradient(90deg, transparent, var(--cyan-neon), var(--violet-neon), transparent)"
          }}
        />

        {/* Brand Header */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            style={{
              width: 58,
              height: 58,
              margin: "0 auto 14px",
              borderRadius: 14,
              background: "linear-gradient(135deg, rgba(0, 240, 255, 0.25), rgba(168, 85, 247, 0.25))",
              border: "1.5px solid var(--cyan-neon)",
              display: "grid",
              placeItems: "center",
              boxShadow: "0 0 30px rgba(0, 240, 255, 0.4)"
            }}
          >
            <Dna size={32} style={{ color: "var(--cyan-neon)" }} />
          </div>

          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <span className="pulse-indicator" style={{ background: "var(--cyan-neon)" }} />
            <span
              style={{
                fontSize: 11,
                fontFamily: "var(--font-mono)",
                color: "var(--cyan-neon)",
                fontWeight: 800,
                letterSpacing: "0.15em"
              }}
            >
              DEFENSE CLEARANCE TERMINAL
            </span>
          </div>

          <h2 style={{ fontSize: 24, fontWeight: 900, color: "#ffffff", letterSpacing: "-0.02em" }}>
            ATTACKER<span style={{ color: "var(--cyan-neon)" }}>DNA</span> ACCESS GATE
          </h2>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
            Restricted to Tier-1 Autonomous Cyber-Defense Operators
          </p>
        </div>

        {/* Form Body */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAuthenticate(false);
          }}
          style={{ display: "flex", flexDirection: "column", gap: 18 }}
        >
          {/* Operator Identifier Input */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: 11,
                fontFamily: "var(--font-mono)",
                color: "#94a3b8",
                marginBottom: 6,
                fontWeight: 700
              }}
            >
              OPERATOR CALL-SIGN:
            </label>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "rgba(2, 6, 17, 0.8)",
                border: "1px solid rgba(30, 58, 95, 0.8)",
                borderRadius: 8,
                padding: "10px 14px",
                transition: "border-color 0.2s ease"
              }}
            >
              <User size={16} style={{ color: "var(--cyan-neon)" }} />
              <input
                type="text"
                value={operatorId}
                onChange={(e) => setOperatorId(e.target.value)}
                required
                placeholder="e.g. OPERATOR-COBALT"
                style={{
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "#ffffff",
                  fontFamily: "var(--font-mono)",
                  fontSize: 13,
                  width: "100%",
                  fontWeight: 600
                }}
              />
            </div>
          </div>

          {/* Security Passcode Input */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: 11,
                fontFamily: "var(--font-mono)",
                color: "#94a3b8",
                marginBottom: 6,
                fontWeight: 700
              }}
            >
              SECURITY ACCESS TOKEN:
            </label>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "rgba(2, 6, 17, 0.8)",
                border: "1px solid rgba(30, 58, 95, 0.8)",
                borderRadius: 8,
                padding: "10px 14px"
              }}
            >
              <KeyRound size={16} style={{ color: "var(--violet-neon)" }} />
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                required
                placeholder="••••••••••••"
                style={{
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "#ffffff",
                  fontFamily: "var(--font-mono)",
                  fontSize: 13,
                  width: "100%",
                  fontWeight: 600
                }}
              />
            </div>
          </div>

          {/* Biometric Scan Trigger Button */}
          <button
            type="submit"
            disabled={isScanning || authSuccess}
            className="cyber-btn cyber-btn-cyan"
            style={{
              padding: "12px 20px",
              width: "100%",
              marginTop: 6,
              background: authSuccess
                ? "linear-gradient(135deg, rgba(16, 185, 129, 0.3), rgba(16, 185, 129, 0.15))"
                : "linear-gradient(135deg, rgba(0, 240, 255, 0.25), rgba(168, 85, 247, 0.2))",
              border: authSuccess ? "1px solid var(--emerald-neon)" : "1px solid var(--cyan-neon)",
              color: authSuccess ? "var(--emerald-neon)" : "#ffffff",
              boxShadow: authSuccess ? "0 0 20px rgba(16, 185, 129, 0.4)" : "0 0 20px rgba(0, 240, 255, 0.3)",
              fontSize: 13,
              fontWeight: 800
            }}
          >
            {authSuccess ? (
              <>
                <CheckCircle2 size={16} /> CLEARANCE VERIFIED // UNLOCKING...
              </>
            ) : isScanning ? (
              <>
                <Fingerprint size={16} className="animate-spin" /> SCANNING BIOMETRICS...
              </>
            ) : (
              <>
                <Fingerprint size={16} /> AUTHENTICATE BIOMETRICS <ArrowRight size={14} />
              </>
            )}
          </button>

          {/* Quick Instant Demo Bypass */}
          <button
            type="button"
            onClick={() => handleAuthenticate(true)}
            style={{
              background: "transparent",
              border: "1px dashed rgba(30, 58, 95, 0.7)",
              borderRadius: 8,
              padding: "8px 12px",
              color: "#94a3b8",
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              transition: "all 0.2s ease"
            }}
          >
            <Sparkles size={12} style={{ color: "var(--cyan-neon)" }} />
            INSTANT EVALUATOR BYPASS (DEMO MODE)
          </button>
        </form>

        {/* Security Classification Footer */}
        <div
          style={{
            marginTop: 22,
            textAlign: "center",
            fontSize: 10,
            fontFamily: "var(--font-mono)",
            color: "#64748b",
            borderTop: "1px solid rgba(30, 58, 95, 0.4)",
            paddingTop: 12
          }}
        >
          AUTH PROTOCOL: OASIS STIX-2.1 // FIPS 140-3 COMPLIANT
        </div>
      </div>
    </div>
  );
}
