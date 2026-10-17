import React from "react";
import { Radar } from "lucide-react";

export default function ThreatRadar({ attacker = {}, events = [] }) {
  // Compute 6 tactical dimension scores (0 - 100)
  const stats = React.useMemo(() => {
    const total = events.length || 1;
    const actions = events.map(e => e.event_type || "");

    const stealth = Math.min(95, 40 + (actions.filter(a => a.includes("powershell") || a.includes("login")).length / total) * 60);
    const velocity = Math.min(95, 30 + Math.min(total * 8, 65));
    const privilege = actions.some(a => a.includes("privilege") || a.includes("credential")) ? 90 : 45;
    const blastRadius = Math.min(95, 20 + new Set(events.map(e => e.host)).size * 22);
    const mutation = actions.length > 5 ? 85 : 40;
    const dwell = actions.some(a => a.includes("data") || a.includes("lateral")) ? 88 : 50;

    return [
      { label: "STEALTH", value: stealth },
      { label: "VELOCITY", value: velocity },
      { label: "PRIVILEGE", value: privilege },
      { label: "BLAST RADIUS", value: blastRadius },
      { label: "MUTATION", value: mutation },
      { label: "PERSISTENCE", value: dwell }
    ];
  }, [events]);

  // Generate SVG polygon coordinates for a 6-axis radar (centerX=160, centerY=160, maxRadius=105)
  const cx = 160;
  const cy = 160;
  const r = 105;
  const numAxes = stats.length;

  const points = stats.map((stat, i) => {
    const angle = (Math.PI * 2 / numAxes) * i - Math.PI / 2;
    const distance = (stat.value / 100) * r;
    return {
      x: cx + Math.cos(angle) * distance,
      y: cy + Math.sin(angle) * distance,
      rawAngle: angle
    };
  });

  const polygonPath = points.map(p => `${p.x},${p.y}`).join(" ");

  // Baseline enterprise defensive boundary (e.g. constant 50%)
  const baselinePoints = stats.map((_, i) => {
    const angle = (Math.PI * 2 / numAxes) * i - Math.PI / 2;
    const distance = 0.5 * r;
    return `${cx + Math.cos(angle) * distance},${cy + Math.sin(angle) * distance}`;
  }).join(" ");

  return (
    <div className="glass-panel" style={{ padding: 24, position: "relative" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              className="cyber-badge"
              style={{
                background: "rgba(255, 42, 95, 0.15)",
                color: "var(--crimson-neon)",
                border: "1px solid rgba(255, 42, 95, 0.4)"
              }}
            >
              <Radar size={13} /> ADVERSARY THREAT RADAR
            </span>
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 800, marginTop: 4, letterSpacing: "-0.02em" }}>
            Hexagonal Vector Profiling
          </h3>
        </div>
      </div>

      {/* SVG Radar Visualizer */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 280 }}>
        <svg width="320" height="300" viewBox="0 0 320 320" style={{ overflow: "visible" }}>
          {/* Concentric Hexagons */}
          {[0.25, 0.5, 0.75, 1.0].map((level, idx) => {
            const hexPoints = stats.map((_, i) => {
              const angle = (Math.PI * 2 / numAxes) * i - Math.PI / 2;
              return `${cx + Math.cos(angle) * (r * level)},${cy + Math.sin(angle) * (r * level)}`;
            }).join(" ");

            return (
              <polygon
                key={idx}
                points={hexPoints}
                fill="none"
                stroke="rgba(30, 58, 95, 0.6)"
                strokeDasharray={idx === 1 ? "4,4" : "none"}
                strokeWidth="1"
              />
            );
          })}

          {/* Radial Axis Lines */}
          {stats.map((_, i) => {
            const angle = (Math.PI * 2 / numAxes) * i - Math.PI / 2;
            const x2 = cx + Math.cos(angle) * r;
            const y2 = cy + Math.sin(angle) * r;
            return (
              <line
                key={i}
                x1={cx}
                y1={cy}
                x2={x2}
                y2={y2}
                stroke="rgba(30, 58, 95, 0.8)"
                strokeWidth="1"
              />
            );
          })}

          {/* Baseline Safe Boundary (Cyan) */}
          <polygon
            points={baselinePoints}
            fill="rgba(0, 240, 255, 0.05)"
            stroke="rgba(0, 240, 255, 0.3)"
            strokeWidth="1.5"
            strokeDasharray="3,3"
          />

          {/* Attacker Vector Polygon (Crimson glow) */}
          <polygon
            points={polygonPath}
            fill="rgba(255, 42, 95, 0.25)"
            stroke="var(--crimson-neon)"
            strokeWidth="2.5"
            filter="drop-shadow(0 0 8px rgba(255, 42, 95, 0.5))"
          />

          {/* Point Dots & Labels */}
          {points.map((p, i) => {
            const stat = stats[i];
            const labelDist = r + 24;
            const lx = cx + Math.cos(p.rawAngle) * labelDist;
            const ly = cy + Math.sin(p.rawAngle) * labelDist;

            return (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r="4" fill="#ffffff" stroke="var(--crimson-neon)" strokeWidth="2" />
                <text
                  x={lx}
                  y={ly}
                  fill="#94a3b8"
                  fontSize="9"
                  fontFamily="'JetBrains Mono', monospace"
                  fontWeight="700"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {stat.label} ({Math.round(stat.value)}%)
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", justifyContent: "center", gap: 18, marginTop: 4, fontSize: 11, fontFamily: "var(--font-mono)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--crimson-neon)" }} />
          <span style={{ color: "#f8fafc" }}>ATTACKER THREAT VECTOR</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(0, 240, 255, 0.5)" }} />
          <span style={{ color: "#64748b" }}>DEFENSIVE THRESHOLD</span>
        </div>
      </div>
    </div>
  );
}
