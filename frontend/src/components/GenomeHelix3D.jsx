import React, { useRef, useEffect, useState } from "react";
import { Play, Pause, ZoomIn, Zap } from "lucide-react";
import { playTacticalClick, playGenomeScanPulse } from "../utils/audio";

const CODON_COLORS = {
  failed_login: "#f59e0b",
  successful_login: "#38bdf8",
  process_created: "#818cf8",
  powershell_execution: "#c084fc",
  credential_access: "#ff2a5f",
  privilege_escalation: "#f43f5e",
  lateral_movement: "#e11d48",
  data_access: "#fb7185",
  default: "#00f0ff"
};

const CODON_LABELS = {
  failed_login: "F [AUTH_FAIL]",
  successful_login: "S [AUTH_PASS]",
  process_created: "P [PROC_SPAWN]",
  powershell_execution: "X [PWSH_EXEC]",
  credential_access: "C [CRED_HARV]",
  privilege_escalation: "E [PRIV_ESCAL]",
  lateral_movement: "L [LAT_PIVOT]",
  data_access: "D [DATA_EXFIL]",
  default: "? [UNKNOWN]"
};

const DEFENSE_PAIRS = {
  failed_login: "D3FEND: Decoy Auth Target",
  successful_login: "D3FEND: MFA Step-up Challenge",
  process_created: "D3FEND: EDR Process Behavioral Hook",
  powershell_execution: "D3FEND: ScriptBlock AMSI Shield",
  credential_access: "D3FEND: Canary Token Injected in LSASS",
  privilege_escalation: "D3FEND: Token Impersonation Block",
  lateral_movement: "D3FEND: Dynamic Microsegmentation",
  data_access: "D3FEND: Poisoned Honey-Database",
  default: "D3FEND: Active Telemetry Trap"
};

export default function GenomeHelix3D({ events = [], selectedAttacker = "ALL" }) {
  const canvasRef = useRef(null);
  const [isRotating, setIsRotating] = useState(true);
  const [rotationSpeed] = useState(1.0);
  const [selectedCodon, setSelectedCodon] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [isDragging, setIsDragging] = useState(false);

  // Interaction tracking refs
  const angleRef = useRef(0);
  const isDraggingRef = useRef(false);
  const lastMouseXRef = useRef(0);

  // Filter events for active attacker if specified
  const displayEvents = React.useMemo(() => {
    if (!events || events.length === 0) return [];
    if (selectedAttacker && selectedAttacker !== "ALL") {
      const filtered = events.filter(e => e.attacker_id === selectedAttacker);
      return filtered.length > 0 ? filtered : events.slice(0, 16);
    }
    return events.slice(0, 24);
  }, [events, selectedAttacker]);

  const displayEventsRef = useRef(displayEvents);
  useEffect(() => {
    displayEventsRef.current = displayEvents;
  }, [displayEvents]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;

    const render = () => {
      // Handle resizing cleanly
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (width > 0 && height > 0 && (canvas.width !== width || canvas.height !== height)) {
        canvas.width = width;
        canvas.height = height;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const currentEvents = displayEventsRef.current || [];
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const totalPairs = Math.max(currentEvents.length, 10);
      const verticalSpacing = Math.min(38 * zoomLevel, (canvas.height - 80) / totalPairs);
      const radius = 110 * zoomLevel;
      const startY = centerY - ((totalPairs - 1) * verticalSpacing) / 2;

      if (isRotating) {
        angleRef.current += 0.015 * rotationSpeed;
      }

      const nodesToRender = [];

      // Calculate 3D coordinates for each base-pair
      for (let i = 0; i < totalPairs; i++) {
        const ev = currentEvents[i % currentEvents.length] || { event_type: "process_created" };
        const twist = (i * 0.42) + angleRef.current;
        const y = startY + i * verticalSpacing;

        // Attacker Strand (Strand A)
        const xA = centerX + Math.cos(twist) * radius;
        const zA = Math.sin(twist) * radius; // Z depth [-radius, +radius]
        const scaleA = 1 + (zA / (radius * 2.5));

        // Defense Strand (Strand B) - Opposite 180 deg
        const xB = centerX + Math.cos(twist + Math.PI) * radius;
        const zB = Math.sin(twist + Math.PI) * radius;
        const scaleB = 1 + (zB / (radius * 2.5));

        nodesToRender.push({
          index: i,
          event: ev,
          twist,
          y,
          // Rung line between Strand A and B
          zA,
          zB,
          avgZ: (zA + zB) / 2,
          posA: { x: xA, y, z: zA, scale: scaleA },
          posB: { x: xB, y, z: zB, scale: scaleB }
        });
      }

      // Sort by depth (avgZ) so further elements are drawn first (painter's algorithm)
      nodesToRender.sort((a, b) => a.avgZ - b.avgZ);

      // Draw Rungs (Hydrogen bonds with glowing pulses)
      nodesToRender.forEach(pair => {
        const alpha = Math.max(0.15, (pair.avgZ + radius) / (radius * 2));
        
        // Connecting gradient rung
        const gradient = ctx.createLinearGradient(pair.posA.x, pair.posA.y, pair.posB.x, pair.posB.y);
        const colA = CODON_COLORS[pair.event.event_type] || CODON_COLORS.default;
        gradient.addColorStop(0, colA);
        gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.4)");
        gradient.addColorStop(1, "#10b981");

        ctx.beginPath();
        ctx.strokeStyle = gradient;
        ctx.globalAlpha = alpha * 0.8;
        ctx.lineWidth = 2.5 * ((pair.posA.scale + pair.posB.scale) / 2);
        ctx.moveTo(pair.posA.x, pair.posA.y);
        ctx.lineTo(pair.posB.x, pair.posB.y);
        ctx.stroke();

        // Animated energy pulse along the bond
        const pulseProgress = (Math.sin(angleRef.current * 3 + pair.index) + 1) / 2;
        const pulseX = pair.posA.x + (pair.posB.x - pair.posA.x) * pulseProgress;
        const pulseY = pair.posA.y + (pair.posB.y - pair.posA.y) * pulseProgress;

        ctx.beginPath();
        ctx.arc(pulseX, pulseY, 3, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "#00f0ff";
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Draw Nucleotide Nodes (Spheres)
      nodesToRender.forEach(pair => {
        // --- Strand A (Attacker Codon) ---
        const alphaA = Math.max(0.2, (pair.posA.z + radius) / (radius * 2));
        const colorA = CODON_COLORS[pair.event.event_type] || CODON_COLORS.default;
        const radiusA = 9 * pair.posA.scale;

        ctx.globalAlpha = alphaA;
        ctx.beginPath();
        ctx.arc(pair.posA.x, pair.posA.y, radiusA, 0, Math.PI * 2);
        ctx.fillStyle = colorA;
        ctx.shadowColor = colorA;
        ctx.shadowBlur = 12 * pair.posA.scale;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Inner glowing core
        ctx.beginPath();
        ctx.arc(pair.posA.x, pair.posA.y, radiusA * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();

        // Node letter label
        if (pair.posA.z > -radius * 0.5) {
          ctx.font = `bold ${Math.round(9 * pair.posA.scale)}px 'JetBrains Mono', monospace`;
          ctx.fillStyle = "#ffffff";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          const baseChar = (pair.event.event_type || "A")[0].toUpperCase();
          ctx.fillText(baseChar, pair.posA.x, pair.posA.y);
        }

        // --- Strand B (Defense CRISPR / D3FEND Countermeasure) ---
        const alphaB = Math.max(0.2, (pair.posB.z + radius) / (radius * 2));
        const colorB = "#10b981"; // Emerald bio-defense
        const radiusB = 8 * pair.posB.scale;

        ctx.globalAlpha = alphaB;
        ctx.beginPath();
        ctx.arc(pair.posB.x, pair.posB.y, radiusB, 0, Math.PI * 2);
        ctx.fillStyle = colorB;
        ctx.shadowColor = colorB;
        ctx.shadowBlur = 10 * pair.posB.scale;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.beginPath();
        ctx.arc(pair.posB.x, pair.posB.y, radiusB * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();

        ctx.globalAlpha = 1.0;
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => cancelAnimationFrame(animId);
  }, [isRotating, rotationSpeed, zoomLevel]);

  // Mouse drag handlers for 3D manual rotation
  const handleMouseDown = (e) => {
    isDraggingRef.current = true;
    setIsDragging(true);
    lastMouseXRef.current = e.clientX;
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - lastMouseXRef.current;
    angleRef.current += deltaX * 0.008;
    lastMouseXRef.current = e.clientX;
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    setIsDragging(false);
  };

  const handleCodonClick = (ev) => {
    playGenomeScanPulse();
    setSelectedCodon(ev);
  };

  return (
    <div className="glass-panel" style={{ padding: "24px", position: "relative", overflow: "hidden" }}>
      {/* Header & Controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className="cyber-badge" style={{ background: "rgba(0, 240, 255, 0.15)", color: "var(--cyan-neon)", border: "1px solid rgba(0, 240, 255, 0.4)" }}>
              <Zap size={13} /> 3D BIO-CYBER HELIX
            </span>
            <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
              CODON PAIRS: {displayEvents.length} // ATTRIBUTION: {selectedAttacker}
            </span>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginTop: 6, letterSpacing: "-0.02em" }}>
            Attacker Genomic Sequencing & CRISPR Strand
          </h2>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>
            Left Strand: Attacker TTP Codons • Right Strand: Active D3FEND Countermeasures • Rungs: Binding Affinity
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            className="cyber-btn cyber-btn-cyan"
            style={{ padding: "6px 12px", fontSize: 12 }}
            onClick={() => {
              playTacticalClick();
              setIsRotating(!isRotating);
            }}
            title={isRotating ? "Pause 3D Rotation" : "Resume 3D Rotation"}
          >
            {isRotating ? <Pause size={14} /> : <Play size={14} />}
            {isRotating ? "PAUSE" : "ROTATE"}
          </button>

          <button
            className="cyber-btn"
            style={{ padding: "6px 12px", fontSize: 12, background: "rgba(30, 58, 95, 0.4)", color: "#94a3b8", border: "1px solid rgba(30, 58, 95, 0.6)" }}
            onClick={() => {
              playTacticalClick();
              setZoomLevel(prev => (prev >= 1.4 ? 0.8 : prev + 0.2));
            }}
            title="Adjust Zoom"
          >
            <ZoomIn size={14} /> {Math.round(zoomLevel * 100)}%
          </button>
        </div>
      </div>

      {/* Main 3D Canvas Area */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: 480,
          background: "radial-gradient(circle at 50% 50%, rgba(5, 15, 35, 0.8), rgba(2, 6, 17, 0.98))",
          borderRadius: 12,
          border: "1px solid rgba(0, 240, 255, 0.2)",
          cursor: isDragging ? "grabbing" : "grab",
          overflow: "hidden"
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />

        {/* Interactive Overlays */}
        <div style={{ position: "absolute", bottom: 12, left: 16, display: "flex", gap: 14, pointerEvents: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff2a5f", boxShadow: "0 0 8px #ff2a5f" }} />
            <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "#cbd5e1" }}>ATTACKER TTP STRAND</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px #10b981" }} />
            <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "#cbd5e1" }}>CRISPR D3FEND STRAND</span>
          </div>
        </div>

        <div style={{ position: "absolute", top: 12, right: 14, fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)", pointerEvents: "none" }}>
          DRAG TO ROTATE 360° • HOVER / CLICK CODON
        </div>
      </div>

      {/* Codon Sequence Strip */}
      <div style={{ marginTop: 16 }}>
        <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          SEQUENCED GENOME BASE-PAIRS (CLICK CODON TO DISSECT):
        </div>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8 }}>
          {displayEvents.map((ev, idx) => {
            const color = CODON_COLORS[ev.event_type] || CODON_COLORS.default;
            const label = CODON_LABELS[ev.event_type] || ev.event_type;
            const isSelected = selectedCodon?.event_id === ev.event_id;

            return (
              <button
                key={ev.event_id || idx}
                onClick={() => handleCodonClick(ev)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  minWidth: 140,
                  padding: "8px 12px",
                  background: isSelected ? "rgba(0, 240, 255, 0.15)" : "rgba(10, 20, 38, 0.6)",
                  border: isSelected ? "1px solid var(--cyan-neon)" : "1px solid rgba(30, 58, 95, 0.5)",
                  borderRadius: 8,
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.2s ease"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6, width: "100%" }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: color }} />
                  <span style={{ fontSize: 11, fontWeight: 700, color, fontFamily: "var(--font-mono)" }}>
                    {label.split(" ")[0]}
                  </span>
                  <span style={{ marginLeft: "auto", fontSize: 10, color: "#64748b", fontFamily: "var(--font-mono)" }}>
                    #{idx + 1}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: "#e2e8f0", marginTop: 4, fontWeight: 600 }}>
                  {ev.event_type.replace(/_/g, " ").toUpperCase()}
                </div>
                <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2, fontFamily: "var(--font-mono)" }}>
                  {ev.host || "UNKNOWN_HOST"}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Codon Dissection Drawer */}
      {selectedCodon && (
        <div
          style={{
            marginTop: 16,
            padding: 16,
            background: "linear-gradient(135deg, rgba(8, 20, 44, 0.9), rgba(5, 11, 24, 0.95))",
            border: "1px solid var(--cyan-neon)",
            borderRadius: 10,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
            animation: "fadeIn 0.25s ease"
          }}
        >
          <div>
            <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--cyan-neon)" }}>SELECTED CODON</div>
            <div style={{ fontSize: 17, fontWeight: 800, marginTop: 2, color: "#ffffff" }}>
              {selectedCodon.event_type.replace(/_/g, " ").toUpperCase()}
            </div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
              Event ID: <span style={{ fontFamily: "var(--font-mono)", color: "#38bdf8" }}>{selectedCodon.event_id}</span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "#a855f7" }}>TARGET CONTEXT</div>
            <div style={{ fontSize: 13, color: "#e2e8f0", marginTop: 2 }}>
              Host: <strong style={{ color: "#38bdf8" }}>{selectedCodon.host}</strong>
            </div>
            <div style={{ fontSize: 13, color: "#e2e8f0", marginTop: 2 }}>
              Account: <strong style={{ color: "#f59e0b" }}>{selectedCodon.user}</strong> | IP: {selectedCodon.source_ip}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--emerald-neon)" }}>SYNTHETIC CRISPR COUNTERMEASURE</div>
            <div style={{ fontSize: 13, color: "#6ee7b7", marginTop: 2, fontWeight: 600 }}>
              {DEFENSE_PAIRS[selectedCodon.event_type] || DEFENSE_PAIRS.default}
            </div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
              Decoy trap active on port & session
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
