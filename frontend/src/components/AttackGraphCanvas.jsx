import React, { useMemo } from "react";
import { ReactFlow, Background, Controls, MiniMap, Handle, Position } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Network } from "lucide-react";

const SEVERITY_COLORS = {
  CRITICAL: "#ff2a5f",
  HIGH: "#f43f5e",
  MEDIUM: "#f59e0b",
  LOW: "#38bdf8",
  DEFAULT: "#818cf8"
};

function CustomAttackNode({ data }) {
  const color = SEVERITY_COLORS[data.severity] || SEVERITY_COLORS.DEFAULT;

  return (
    <div
      style={{
        padding: "10px 14px",
        borderRadius: 8,
        background: "rgba(5, 11, 24, 0.95)",
        border: `1.5px solid ${color}`,
        boxShadow: `0 0 15px ${color}33`,
        color: "#ffffff",
        minWidth: 160,
        fontFamily: "var(--font-main)",
        position: "relative"
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: color, width: 8, height: 8, border: "none" }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", color, fontWeight: 800 }}>
          {data.severity || "INFO"}
        </span>
        <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#64748b" }}>
          {data.attacker_id}
        </span>
      </div>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#f8fafc" }}>
        {data.label}
      </div>
      {data.host && (
        <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2, fontFamily: "var(--font-mono)" }}>
          Host: {data.host}
        </div>
      )}
      <Handle type="source" position={Position.Bottom} style={{ background: color, width: 8, height: 8, border: "none" }} />
    </div>
  );
}

const nodeTypes = {
  attackNode: CustomAttackNode
};

export default function AttackGraphCanvas({ graphData = { nodes: [], edges: [] }, events = [] }) {
  // If graphData nodes are empty, dynamically build flow nodes from events
  const flowElements = useMemo(() => {
    if (graphData && graphData.nodes && graphData.nodes.length > 0) {
      const nodes = graphData.nodes.map((n, idx) => ({
        id: String(n.id || idx),
        type: "attackNode",
        position: n.position || { x: (idx % 4) * 220 + 40, y: Math.floor(idx / 4) * 120 + 40 },
        data: {
          label: (n.label || n.event_type || "Event").replace(/_/g, " ").toUpperCase(),
          severity: n.severity || "HIGH",
          attacker_id: n.attacker || n.attacker_id || "APT",
          host: n.host || "NODE"
        }
      }));

      const edges = (graphData.edges || []).map((e, idx) => ({
        id: `e-${idx}`,
        source: String(e.source),
        target: String(e.target),
        animated: true,
        style: { stroke: "#00f0ff", strokeWidth: 2 }
      }));

      return { nodes, edges };
    }

    // Fallback: build from events
    const nodes = events.slice(0, 16).map((ev, idx) => ({
      id: String(ev.event_id || idx),
      type: "attackNode",
      position: { x: (idx % 4) * 220 + 40, y: Math.floor(idx / 4) * 130 + 40 },
      data: {
        label: ev.event_type.replace(/_/g, " ").toUpperCase(),
        severity: ev.severity || "MEDIUM",
        attacker_id: ev.attacker_id,
        host: ev.host
      }
    }));

    const edges = [];
    for (let i = 0; i < nodes.length - 1; i++) {
      edges.push({
        id: `edge-${i}`,
        source: nodes[i].id,
        target: nodes[i + 1].id,
        animated: true,
        style: { stroke: "#00f0ff", strokeWidth: 2 }
      });
    }

    return { nodes, edges };
  }, [graphData, events]);

  return (
    <div className="glass-panel" style={{ padding: 24, position: "relative" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              className="cyber-badge"
              style={{
                background: "rgba(16, 185, 129, 0.15)",
                color: "var(--emerald-neon)",
                border: "1px solid rgba(16, 185, 129, 0.4)"
              }}
            >
              <Network size={13} /> REACTFLOW TOPOLOGY GRAPH
            </span>
            <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
              NODES: {flowElements.nodes.length} // EDGES: {flowElements.edges.length}
            </span>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginTop: 6, letterSpacing: "-0.02em" }}>
            Reconstructed Lateral Attack Trajectory
          </h2>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>
            Interactive DAG visualizer showing sequential host transitions and privilege pivots.
          </p>
        </div>
      </div>

      {/* ReactFlow Canvas */}
      <div
        style={{
          width: "100%",
          height: 480,
          background: "#020611",
          borderRadius: 10,
          border: "1px solid rgba(30, 58, 95, 0.6)",
          overflow: "hidden"
        }}
      >
        <ReactFlow
          nodes={flowElements.nodes}
          edges={flowElements.edges}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background color="#1e3a5f" gap={20} size={1} />
          <Controls style={{ fill: "#ffffff" }} />
          <MiniMap
            nodeColor={(node) => SEVERITY_COLORS[node.data?.severity] || "#38bdf8"}
            style={{ background: "#050b18", border: "1px solid rgba(30, 58, 95, 0.6)" }}
          />
        </ReactFlow>
      </div>
    </div>
  );
}
