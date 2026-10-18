import React, { useState } from "react";
import { Globe } from "lucide-react";

const THREAT_ACTOR_GEO = {
  "APT29_COZY_BEAR": { name: "APT29 (Cozy Bear)", city: "Moscow", country: "Russian Federation", x: 620, y: 120, color: "#ff2a5f", ip: "185.220.101.5" },
  "APT28_FANCY_BEAR": { name: "APT28 (Fancy Bear)", city: "St. Petersburg", country: "Russian Federation", x: 605, y: 110, color: "#f43f5e", ip: "91.240.118.17" },
  "LAZARUS_GROUP": { name: "Lazarus Group", city: "Pyongyang", country: "DPRK", x: 800, y: 175, color: "#a855f7", ip: "175.45.178.2" },
  "FIN7_CARBANAK": { name: "FIN7 Syndicate", city: "Bucharest / Tor", country: "Transnational", x: 570, y: 145, color: "#f59e0b", ip: "193.109.69.4" },
  "LOCKBIT_3_CARTEL": { name: "LockBit Cartel", city: "Distributed Tor Relays", country: "Darknet", x: 540, y: 130, color: "#ff2a5f", ip: "194.26.29.112" },
  "VOLT_TYPHOON_CRITICAL": { name: "Volt Typhoon", city: "Guangzhou", country: "PRC", x: 765, y: 165, color: "#f59e0b", ip: "202.108.22.5" },
  "VOLT_TYPHOON": { name: "Volt Typhoon", city: "Guangzhou", country: "PRC", x: 765, y: 165, color: "#f59e0b", ip: "202.108.22.5" }
};

const TARGET_DATACENTER = {
  name: "Target Enterprise Sovereign Core",
  city: "Ashburn (US-East)",
  x: 245,
  y: 165,
  color: "#00f0ff",
  ip: "10.0.0.1"
};

export default function ThreatGeoMap({ topMatchId = "APT29_COZY_BEAR" }) {
  const [hoveredNode, setHoveredNode] = useState(null);

  const activeActor = THREAT_ACTOR_GEO[topMatchId] || THREAT_ACTOR_GEO["APT29_COZY_BEAR"];

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
              <Globe size={13} /> GEOPOLITICAL THREAT RADAR
            </span>
            <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
              GLOBAL INTRUSION TRAJECTORY
            </span>
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 800, marginTop: 4, letterSpacing: "-0.02em" }}>
            Adversary C2 Origin & Transnational Telemetry Vector
          </h3>
        </div>

        {/* Live Vector Summary */}
        <div style={{ textAlign: "right", fontFamily: "var(--font-mono)", fontSize: 11 }}>
          <div style={{ color: "var(--text-muted)" }}>ACTIVE THREAT ORIGIN:</div>
          <div style={{ color: "var(--crimson-neon)", fontWeight: 800, fontSize: 13, marginTop: 2 }}>
            {activeActor.city} ({activeActor.country})
          </div>
        </div>
      </div>

      {/* SVG Map Visualizer */}
      <div
        style={{
          width: "100%",
          height: 320,
          background: "radial-gradient(circle at 50% 50%, rgba(6, 18, 40, 0.9), rgba(2, 6, 17, 0.98))",
          borderRadius: 10,
          border: "1px solid rgba(30, 58, 95, 0.7)",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <svg width="100%" height="100%" viewBox="0 0 960 360" style={{ overflow: "visible" }}>
          {/* Subtle World Map Grid Outlines */}
          <defs>
            <linearGradient id="arcGlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--crimson-neon)" stopOpacity="0.8" />
              <stop offset="50%" stopColor="var(--violet-neon)" stopOpacity="0.6" />
              <stop offset="100%" stopColor="var(--cyan-neon)" stopOpacity="0.9" />
            </linearGradient>
            <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Latitude & Longitude Digital Grid Lines */}
          {[60, 120, 180, 240, 300].map(y => (
            <line key={y} x1="40" y1={y} x2="920" y2={y} stroke="rgba(30, 58, 95, 0.3)" strokeDasharray="3,6" />
          ))}
          {[160, 320, 480, 640, 800].map(x => (
            <line key={x} x1={x} y1="30" x2={x} y2="330" stroke="rgba(30, 58, 95, 0.3)" strokeDasharray="3,6" />
          ))}

          {/* Stylized Continental Outlines (Abstracted Cyber Polygons) */}
          {/* North America */}
          <path d="M 160 80 L 320 80 L 300 170 L 250 200 L 220 230 L 170 140 Z" fill="rgba(15, 28, 55, 0.4)" stroke="rgba(0, 240, 255, 0.2)" />
          {/* South America */}
          <path d="M 270 230 L 330 250 L 310 330 L 270 300 Z" fill="rgba(15, 28, 55, 0.4)" stroke="rgba(0, 240, 255, 0.2)" />
          {/* Europe */}
          <path d="M 470 80 L 590 80 L 570 150 L 460 140 Z" fill="rgba(15, 28, 55, 0.4)" stroke="rgba(0, 240, 255, 0.2)" />
          {/* Asia / Russia */}
          <path d="M 590 70 L 890 80 L 850 200 L 670 220 L 570 150 Z" fill="rgba(15, 28, 55, 0.4)" stroke="rgba(0, 240, 255, 0.2)" />
          {/* Africa */}
          <path d="M 480 160 L 580 160 L 550 280 L 480 230 Z" fill="rgba(15, 28, 55, 0.4)" stroke="rgba(0, 240, 255, 0.2)" />
          {/* Australia */}
          <path d="M 760 250 L 850 250 L 830 320 L 760 300 Z" fill="rgba(15, 28, 55, 0.4)" stroke="rgba(0, 240, 255, 0.2)" />

          {/* Parabolic Attack Trajectory Arc */}
          {(() => {
            const startX = activeActor.x;
            const startY = activeActor.y;
            const endX = TARGET_DATACENTER.x;
            const endY = TARGET_DATACENTER.y;
            const midX = (startX + endX) / 2;
            const midY = Math.min(startY, endY) - 75; // Arching peak

            const arcD = `M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`;

            return (
              <g>
                {/* Glowing Background Arc */}
                <path d={arcD} fill="none" stroke="url(#arcGlow)" strokeWidth="3" filter="url(#glowFilter)" strokeDasharray="6,4" />
                {/* Secondary crisp arc */}
                <path d={arcD} fill="none" stroke="#ffffff" strokeWidth="1" strokeDasharray="2,6" />

                {/* Animated Tracer Particle along the Arc */}
                <circle r="4" fill="var(--cyan-neon)" filter="url(#glowFilter)">
                  <animateMotion path={arcD} dur="2.4s" repeatCount="indefinite" />
                </circle>
              </g>
            );
          })()}

          {/* Threat Actor Nodes */}
          {Object.entries(THREAT_ACTOR_GEO).map(([key, node]) => {
            const isTarget = key === topMatchId;
            return (
              <g
                key={key}
                onMouseEnter={() => setHoveredNode(node)}
                onMouseLeave={() => setHoveredNode(null)}
                style={{ cursor: "pointer" }}
              >
                {/* Outer Pulse Ring */}
                {isTarget && (
                  <circle cx={node.x} cy={node.y} r="14" fill="none" stroke={node.color} opacity="0.6">
                    <animate attributeName="r" values="8;22" dur="1.8s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.8;0" dur="1.8s" repeatCount="indefinite" />
                  </circle>
                )}

                {/* Core Dot */}
                <circle cx={node.x} cy={node.y} r="6" fill={node.color} filter="url(#glowFilter)" />
                <circle cx={node.x} cy={node.y} r="2.5" fill="#ffffff" />

                {/* Label */}
                <text
                  x={node.x}
                  y={node.y - 12}
                  fill={isTarget ? "#ffffff" : "#94a3b8"}
                  fontSize="10"
                  fontFamily="'JetBrains Mono', monospace"
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {node.name.split(" ")[0]}
                </text>
              </g>
            );
          })}

          {/* Victim Target Node (Enterprise Datacenter) */}
          <g>
            <circle cx={TARGET_DATACENTER.x} cy={TARGET_DATACENTER.y} r="18" fill="none" stroke="var(--cyan-neon)" opacity="0.5">
              <animate attributeName="r" values="8;24" dur="2.2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.9;0" dur="2.2s" repeatCount="indefinite" />
            </circle>
            <circle cx={TARGET_DATACENTER.x} cy={TARGET_DATACENTER.y} r="7" fill="var(--cyan-neon)" filter="url(#glowFilter)" />
            <circle cx={TARGET_DATACENTER.x} cy={TARGET_DATACENTER.y} r="3" fill="#ffffff" />
            <text
              x={TARGET_DATACENTER.x}
              y={TARGET_DATACENTER.y + 22}
              fill="var(--cyan-neon)"
              fontSize="10"
              fontFamily="'JetBrains Mono', monospace"
              fontWeight="800"
              textAnchor="middle"
            >
              [CORE DC (10.0.0.1)]
            </text>
          </g>
        </svg>

        {/* Floating Node Details Card */}
        {hoveredNode && (
          <div
            style={{
              position: "absolute",
              top: 12,
              left: 14,
              padding: "10px 14px",
              background: "rgba(5, 11, 24, 0.95)",
              border: `1px solid ${hoveredNode.color}`,
              borderRadius: 8,
              fontSize: 11,
              fontFamily: "var(--font-mono)",
              boxShadow: "0 0 15px rgba(0,0,0,0.8)"
            }}
          >
            <div style={{ fontWeight: 800, color: "#ffffff" }}>{hoveredNode.name}</div>
            <div style={{ color: "#94a3b8", marginTop: 2 }}>
              Location: {hoveredNode.city}, {hoveredNode.country}
            </div>
            <div style={{ color: "var(--cyan-neon)", marginTop: 2 }}>
              C2 Relay IP: {hoveredNode.ip}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
