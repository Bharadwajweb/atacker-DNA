import React, { useState } from "react";
import { UploadCloud, CheckCircle2, AlertCircle, Loader2, Sparkles } from "lucide-react";
import { playTacticalClick, playAlertChime } from "../utils/audio";

const SAMPLE_LOGS = {
  sysmon: `EventID: 1 | Image: C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe | CommandLine: powershell.exe -ExecutionPolicy Bypass -NoProfile -Enc JABjAGwAaQBlAG4AdAA...
EventID: 10 | TargetImage: C:\\Windows\\System32\\lsass.exe | GrantedAccess: 0x1010 | SourceUser: NT AUTHORITY\\SYSTEM
EventID: 3 | DestinationIp: 185.220.101.5 | DestinationPort: 443 | Protocol: tcp`,
  mimikatz: `lsass.exe minidump generated successfully to C:\\Windows\\Temp\\debug.dmp
sekurlsa::logonpasswords initiated by user NT AUTHORITY\\SYSTEM
Kerberos ticket extraction complete: 4 domain administrator TGTs harvested`
};

export default function LogDropzone({ onLogIngested, apiBase = "http://127.0.0.1:8000" }) {
  const [logText, setLogText] = useState("");
  const [attackerId, setAttackerId] = useState("EXTERNAL-PROBE-01");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  const handleSubmit = async () => {
    if (!logText.trim()) return;
    playTacticalClick();
    setIsSubmitting(true);
    setStatusMsg(null);

    try {
      const res = await fetch(`${apiBase}/ingest/log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          log_text: logText,
          attacker_id: attackerId
        })
      });
      const data = await res.json();
      playAlertChime();
      setStatusMsg({ type: "success", text: `Sequenced ${data.ingested_count} events from uploaded logs!` });
      setLogText("");
      if (onLogIngested) onLogIngested(data);
    } catch (err) {
      setStatusMsg({ type: "error", text: `Ingestion failed: ${err.message}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogText(event.target.result);
      };
      reader.readAsText(file);
    }
  };

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
              <UploadCloud size={13} /> LIVE LOG DROPZONE
            </span>
            <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
              SYSMON / EVTX / PCAP / SURICATA
            </span>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginTop: 6, letterSpacing: "-0.02em" }}>
            Ingest Raw Security Telemetry
          </h2>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>
            Drag and drop log files or paste raw event lines to parse atomic system events and sequence adversary DNA.
          </p>
        </div>

        {/* Quick Sample Buttons */}
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="cyber-btn"
            style={{ padding: "6px 12px", fontSize: 11, background: "rgba(30, 58, 95, 0.4)", color: "#94a3b8" }}
            onClick={() => {
              playTacticalClick();
              setLogText(SAMPLE_LOGS.sysmon);
            }}
          >
            <Sparkles size={12} /> LOAD SYSMON SAMPLE
          </button>
          <button
            className="cyber-btn"
            style={{ padding: "6px 12px", fontSize: 11, background: "rgba(30, 58, 95, 0.4)", color: "#94a3b8" }}
            onClick={() => {
              playTacticalClick();
              setLogText(SAMPLE_LOGS.mimikatz);
            }}
          >
            <Sparkles size={12} /> LOAD MIMIKATZ SAMPLE
          </button>
        </div>
      </div>

      {/* Drop / Text Area */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        style={{
          border: "2px dashed rgba(0, 240, 255, 0.3)",
          borderRadius: 10,
          background: "rgba(2, 6, 17, 0.7)",
          padding: 16,
          marginBottom: 16
        }}
      >
        <textarea
          rows={5}
          value={logText}
          onChange={(e) => setLogText(e.target.value)}
          placeholder="Paste Sysmon lines, Suricata JSON alerts, or drag a .log file here..."
          style={{
            width: "100%",
            background: "transparent",
            border: "none",
            color: "#38bdf8",
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            resize: "vertical",
            outline: "none"
          }}
        />
      </div>

      {/* Footer Submission Bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>TAG ATTACKER ID:</span>
          <input
            type="text"
            value={attackerId}
            onChange={(e) => setAttackerId(e.target.value)}
            style={{
              padding: "6px 12px",
              background: "#020611",
              border: "1px solid rgba(30, 58, 95, 0.6)",
              borderRadius: 6,
              color: "#ffffff",
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              outline: "none"
            }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {statusMsg && (
            <span
              style={{
                fontSize: 12,
                color: statusMsg.type === "success" ? "var(--emerald-neon)" : "var(--crimson-neon)",
                display: "flex",
                alignItems: "center",
                gap: 6
              }}
            >
              {statusMsg.type === "success" ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
              {statusMsg.text}
            </span>
          )}

          <button
            className="cyber-btn cyber-btn-cyan"
            onClick={handleSubmit}
            disabled={isSubmitting || !logText.trim()}
          >
            {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
            {isSubmitting ? "SEQUENCING DNA..." : "SEQUENCE UPLOADED TELEMETRY"}
          </button>
        </div>
      </div>
    </div>
  );
}
