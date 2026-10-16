import React, { useEffect, useMemo, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

const API = "http://127.0.0.1:8000";

/* =========================================================
   ATTACK NODE
========================================================= */

function AttackNode({ data }) {
  const color =
    data.severity === "high"
      ? "#ef4444"
      : data.severity === "medium"
      ? "#f59e0b"
      : "#22c55e";

  return (
    <div
      style={{
        minWidth: 150,
        padding: "12px 14px",
        borderRadius: 12,
        background: "#111827",
        border: `2px solid ${color}`,
        color: "#fff",
        boxShadow: `0 0 18px ${color}55`,
        textAlign: "center",
      }}
    >
      <Handle type="target" position={Position.Left} />

      <div
        style={{
          fontSize: 12,
          color,
          fontWeight: 800,
          marginBottom: 5,
        }}
      >
        {String(data.event_type || "EVENT")
          .replaceAll("_", " ")
          .toUpperCase()}
      </div>

      <div style={{ fontSize: 11, color: "#cbd5e1" }}>
        {data.attacker_id || "UNKNOWN"}
      </div>

      <div
        style={{
          marginTop: 7,
          display: "inline-block",
          padding: "3px 8px",
          borderRadius: 20,
          background: `${color}22`,
          color,
          fontSize: 10,
          fontWeight: 800,
        }}
      >
        {(data.severity || "low").toUpperCase()}
      </div>

      <Handle type="source" position={Position.Right} />
    </div>
  );
}

const nodeTypes = {
  attack: AttackNode,
};

/* =========================================================
   HELPERS
========================================================= */

const normalize = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const titleCase = (value) =>
  String(value || "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

const severityColor = (severity) => {
  const s = normalize(severity);

  if (s === "high") return "#ef4444";
  if (s === "medium") return "#f59e0b";
  return "#22c55e";
};

const severityWeight = (severity) => {
  const s = normalize(severity);

  if (s === "high") return 3;
  if (s === "medium") return 2;
  return 1;
};

/* =========================================================
   EVENT RISK WEIGHTS
========================================================= */

const EVENT_WEIGHTS = {
  failed_login: 5,
  successful_login: 8,
  process_created: 5,
  powershell_execution: 12,
  credential_access: 18,
  privilege_escalation: 20,
  lateral_movement: 22,
  data_access: 16,
};

/*
   Higher-level risk values used by the threat scoring engine.
   These represent how dangerous each behavior is.
*/

const EVENT_RISK = {
  failed_login: 15,
  successful_login: 10,
  process_created: 12,
  powershell_execution: 28,
  credential_access: 55,
  privilege_escalation: 65,
  lateral_movement: 75,
  data_access: 50,
};

/* =========================================================
   MITRE FALLBACK
========================================================= */

const FALLBACK_MITRE = {
  failed_login: {
    technique_id: "T1110",
    technique: "Brute Force",
    tactic: "Credential Access",
  },

  successful_login: {
    technique_id: "T1078",
    technique: "Valid Accounts",
    tactic: "Initial Access",
  },

  process_created: {
    technique_id: "T1059",
    technique: "Command and Scripting Interpreter",
    tactic: "Execution",
  },

  powershell_execution: {
    technique_id: "T1059.001",
    technique: "PowerShell",
    tactic: "Execution",
  },

  credential_access: {
    technique_id: "T1003",
    technique: "OS Credential Dumping",
    tactic: "Credential Access",
  },

  privilege_escalation: {
    technique_id: "T1068",
    technique: "Exploitation for Privilege Escalation",
    tactic: "Privilege Escalation",
  },

  lateral_movement: {
    technique_id: "T1021",
    technique: "Remote Services",
    tactic: "Lateral Movement",
  },

  data_access: {
    technique_id: "T1005",
    technique: "Data from Local System",
    tactic: "Collection",
  },
};

/* =========================================================
   THREAT LEVEL
========================================================= */

const getThreatLevel = (score) => {
  if (score >= 80) return "CRITICAL";
  if (score >= 60) return "HIGH";
  if (score >= 35) return "MEDIUM";
  return "LOW";
};

/* =========================================================
   ORDERED PROGRESSION CHECK
========================================================= */

function occursBefore(sequence, first, second) {
  const firstIndex = sequence.indexOf(first);
  const secondIndex = sequence.indexOf(second);

  return (
    firstIndex !== -1 &&
    secondIndex !== -1 &&
    firstIndex < secondIndex
  );
}

/* =========================================================
   THREAT SCORE
========================================================= */

function calculateThreatScore(events = []) {
  if (!events.length) {
    return {
      score: 0,
      level: "LOW",
      averageSeverity: "LOW",
      techniques: 0,
    };
  }

  /*
     Sort events chronologically so attack progression
     is evaluated using the actual observed order.
  */

  const sortedEvents = [...events].sort(
    (a, b) =>
      new Date(a.timestamp || 0).getTime() -
      new Date(b.timestamp || 0).getTime()
  );

  /*
     Severity multipliers
  */

  const severityMultiplier = {
    low: 0.55,
    medium: 0.8,
    high: 1.0,
    critical: 1.15,
  };

  /*
     Calculate weighted behavioral risk.
  */

  let weightedRisk = 0;

  sortedEvents.forEach((event) => {
    const type = normalize(event.event_type);
    const severity = normalize(event.severity);

    const baseRisk = EVENT_RISK[type] || 10;
    const multiplier =
      severityMultiplier[severity] || 0.55;

    weightedRisk += baseRisk * multiplier;
  });

  /*
     Average risk per event.
  */

  const averageRisk =
    weightedRisk / sortedEvents.length;

  /*
     Base score.

     EVENT_RISK is already approximately 0–75.
     Multiplying by 1.25 converts the behavioral
     risk into a stronger 0–100 threat scale.
  */

  let score = averageRisk * 1.25;

  /*
     High-risk behavior ratio.
  */

  const highRiskEvents = sortedEvents.filter((event) =>
    [
      "credential_access",
      "privilege_escalation",
      "lateral_movement",
      "data_access",
    ].includes(normalize(event.event_type))
  ).length;

  const highRiskRatio =
    highRiskEvents / sortedEvents.length;

  score += highRiskRatio * 12;

  /*
     High severity ratio.
  */

  const highSeverityEvents = sortedEvents.filter(
    (event) =>
      normalize(event.severity) === "high" ||
      normalize(event.severity) === "critical"
  ).length;

  const highSeverityRatio =
    highSeverityEvents / sortedEvents.length;

  score += highSeverityRatio * 8;

  /*
     Actual chronological attack progression.

     Example:

     failed_login
        ↓
     successful_login
        ↓
     powershell
        ↓
     privilege escalation
        ↓
     credential access
        ↓
     lateral movement
        ↓
     data access
  */

  const sequence = sortedEvents.map((event) =>
    normalize(event.event_type)
  );

  const progressionRules = [
    ["failed_login", "successful_login", 2],
    ["successful_login", "powershell_execution", 2],
    ["powershell_execution", "privilege_escalation", 3],
    ["privilege_escalation", "credential_access", 3],
    ["credential_access", "lateral_movement", 4],
    ["lateral_movement", "data_access", 4],
  ];

  let progressionBonus = 0;

  progressionRules.forEach(
    ([first, second, weight]) => {
      if (occursBefore(sequence, first, second)) {
        progressionBonus += weight;
      }
    }
  );

  score += progressionBonus;

  /*
     Behavioral diversity.

     This bonus is intentionally small because all
     attackers may have several common event types.
  */

  const uniqueActions = new Set(
    sequence.filter(Boolean)
  );

  const diversityBonus = Math.min(
    6,
    uniqueActions.size * 0.75
  );

  score += diversityBonus;

  /*
     Repeated dangerous actions.

     Repeated credential access / privilege escalation /
     lateral movement indicates persistent behavior.
  */

  const dangerousActionCount = sortedEvents.filter(
    (event) =>
      [
        "credential_access",
        "privilege_escalation",
        "lateral_movement",
      ].includes(normalize(event.event_type))
  ).length;

  if (dangerousActionCount >= 3) {
    score += 4;
  }

  /*
     Final score.
  */

  score = Math.round(
    Math.min(100, Math.max(0, score))
  );

  /*
     Average severity.
  */

  const averageSeverityValue =
    sortedEvents.reduce(
      (sum, event) =>
        sum + severityWeight(event.severity),
      0
    ) / sortedEvents.length;

  const averageSeverity =
    averageSeverityValue >= 2.5
      ? "HIGH"
      : averageSeverityValue >= 1.6
      ? "MEDIUM"
      : "LOW";

  return {
    score,
    level: getThreatLevel(score),
    averageSeverity,
    techniques: uniqueActions.size,
  };
}

/* =========================================================
   MITRE LOOKUP
========================================================= */

function getMitreForEvent(
  event,
  mitreMappings = []
) {
  if (!event) {
    return {
      technique_id: "N/A",
      technique: "Unknown Technique",
      tactic: "Unknown",
    };
  }

  const eventId =
    event.event_id ?? event.id;

  /*
     1. Exact event ID match
  */

  let mapping = mitreMappings.find(
    (item) =>
      String(
        item.event_id ??
          item.id ??
          ""
      ) === String(eventId ?? "")
  );

  /*
     2. Attacker + event type + timestamp
  */

  if (!mapping) {
    mapping = mitreMappings.find(
      (item) =>
        normalize(item.attacker_id) ===
          normalize(event.attacker_id) &&
        normalize(item.event_type) ===
          normalize(event.event_type) &&
        String(item.timestamp || "") ===
          String(event.timestamp || "")
    );
  }

  /*
     3. Attacker + event type
  */

  if (!mapping) {
    mapping = mitreMappings.find(
      (item) =>
        normalize(item.attacker_id) ===
          normalize(event.attacker_id) &&
        normalize(item.event_type) ===
          normalize(event.event_type)
    );
  }

  /*
     4. Event type
  */

  if (!mapping) {
    mapping = mitreMappings.find(
      (item) =>
        normalize(item.event_type) ===
        normalize(event.event_type)
    );
  }

  /*
     Actual JSON structure:

     {
       "mitre": {
         "technique_id": "...",
         "technique": "...",
         "tactic": "..."
       }
     }
  */

  if (mapping?.mitre) {
    return {
      technique_id:
        mapping.mitre.technique_id ||
        "N/A",

      technique:
        mapping.mitre.technique ||
        "Unknown Technique",

      tactic:
        mapping.mitre.tactic ||
        "Unknown",
    };
  }

  /*
     Direct field fallback.
  */

  if (mapping) {
    return {
      technique_id:
        mapping.technique_id ||
        mapping.mitre_id ||
        mapping.id ||
        "N/A",

      technique:
        mapping.technique ||
        mapping.technique_name ||
        mapping.name ||
        "Unknown Technique",

      tactic:
        mapping.tactic ||
        mapping.tactic_name ||
        "Unknown",
    };
  }

  /*
     Final event-type fallback.
  */

  return (
    FALLBACK_MITRE[
      normalize(event.event_type)
    ] || {
      technique_id: "N/A",
      technique: "Unknown Technique",
      tactic: "Unknown",
    }
  );
}

/* =========================================================
   PREDICTION MITRE
========================================================= */

function getPredictionMitre(action) {
  return (
    FALLBACK_MITRE[
      normalize(action)
    ] || {
      technique_id: "N/A",
      technique: "Unknown Technique",
      tactic: "Unknown",
    }
  );
}

/* =========================================================
   PREDICTION RISK
========================================================= */

function getPredictionRisk(
  confidence,
  action
) {
  const c = Number(confidence) || 0;

  /*
     Prediction risk is based ONLY on confidence.

     < 35%  = LOW
     35–59% = MEDIUM
     >= 60% = HIGH
  */

  if (c >= 60) return "HIGH";

  if (c >= 35) return "MEDIUM";

  return "LOW";
}

/* =========================================================
   ATTACK GRAPH
========================================================= */

function buildAttackGraph(events = []) {
  const nodes = [];
  const edges = [];

  const sorted = [...events].sort(
    (a, b) =>
      new Date(a.timestamp || 0).getTime() -
      new Date(b.timestamp || 0).getTime()
  );

  sorted.forEach((event, index) => {
    const id = `event-${
      event.event_id ||
      event.id ||
      index
    }`;

    nodes.push({
      id,
      type: "attack",

      position: {
        x: (index % 4) * 230,
        y:
          Math.floor(index / 4) *
          160,
      },

      data: {
        ...event,
      },
    });

    if (index > 0) {
      const previous =
        sorted[index - 1];

      edges.push({
        id: `edge-${index}`,

        source: `event-${
          previous.event_id ||
          previous.id ||
          index - 1
        }`,

        target: id,

        animated: true,

        style: {
          stroke: "#64748b",
          strokeWidth: 2,
        },
      });
    }
  });

  return {
    nodes,
    edges,
  };
}

/* =========================================================
   MAIN APP
========================================================= */

export default function App() {
  const [events, setEvents] =
    useState([]);

  const [attackers, setAttackers] =
    useState([]);

  const [graph, setGraph] =
    useState({
      nodes: [],
      edges: [],
    });

  const [mitre, setMitre] =
    useState([]);

  const [predictions, setPredictions] =
    useState([]);

  const [deception, setDeception] =
    useState({
      active: false,
      events: 0,
      actions: [],
    });

  const [loading, setLoading] =
    useState(true);

  const [
    selectedAttacker,
    setSelectedAttacker,
  ] = useState("ALL");

  const [
    severityFilter,
    setSeverityFilter,
  ] = useState("ALL");

  const [
    eventFilter,
    setEventFilter,
  ] = useState("ALL");

  /* =======================================================
     LOAD DATA
  ======================================================= */

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        const [
          eventsRes,
          attackersRes,
          graphRes,
          mitreRes,
          predictionsRes,
          deceptionRes,
        ] = await Promise.all([
          fetch(`${API}/events`),
          fetch(`${API}/attackers`),
          fetch(`${API}/graph`),
          fetch(`${API}/mitre`),
          fetch(`${API}/predictions`),
          fetch(`${API}/deception`),
        ]);

        const eventsData =
          await eventsRes.json();

        const attackersData =
          await attackersRes.json();

        const graphData =
          await graphRes.json();

        const mitreData =
          await mitreRes.json();

        const predictionsData =
          await predictionsRes.json();

        const deceptionData =
          await deceptionRes.json();

        setEvents(
          eventsData.events || []
        );

        setAttackers(
          attackersData || []
        );

        setGraph(
          graphData || {
            nodes: [],
            edges: [],
          }
        );

        setMitre(
          mitreData || []
        );

        setPredictions(
          predictionsData || []
        );

        setDeception(
          deceptionData || {}
        );
      } catch (error) {
        console.error(
          "Dashboard loading error:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  /* =======================================================
     FILTERED EVENTS
  ======================================================= */

  const filteredEvents =
    useMemo(() => {
      return events.filter(
        (event) => {
          const attackerMatch =
            selectedAttacker ===
              "ALL" ||
            event.attacker_id ===
              selectedAttacker;

          const severityMatch =
            severityFilter ===
              "ALL" ||
            normalize(
              event.severity
            ) ===
              normalize(
                severityFilter
              );

          const eventMatch =
            eventFilter ===
              "ALL" ||
            normalize(
              event.event_type
            ) ===
              normalize(
                eventFilter
              );

          return (
            attackerMatch &&
            severityMatch &&
            eventMatch
          );
        }
      );
    }, [
      events,
      selectedAttacker,
      severityFilter,
      eventFilter,
    ]);

  /* =======================================================
     ATTACKER THREAT DATA
  ======================================================= */

  const attackerThreats =
    useMemo(() => {
      const grouped = {};

      events.forEach((event) => {
        const id =
          event.attacker_id ||
          "UNKNOWN";

        if (!grouped[id]) {
          grouped[id] = [];
        }

        grouped[id].push(event);
      });

      return Object.entries(
        grouped
      ).map(
        ([id, attackerEvents]) => {
          const threat =
            calculateThreatScore(
              attackerEvents
            );

          const techniques =
            new Set();

          attackerEvents.forEach(
            (event) => {
              const m =
                getMitreForEvent(
                  event,
                  mitre
                );

              if (
                m.technique_id !==
                "N/A"
              ) {
                techniques.add(
                  m.technique_id
                );
              }
            }
          );

          return {
            id,
            events:
              attackerEvents,

            ...threat,

            techniques:
              techniques.size,
          };
        }
      );
    }, [events, mitre]);

  /* =======================================================
     GLOBAL STATISTICS
  ======================================================= */

  const stats = useMemo(() => {
    const high =
      events.filter(
        (e) =>
          normalize(
            e.severity
          ) === "high"
      ).length;

    const medium =
      events.filter(
        (e) =>
          normalize(
            e.severity
          ) === "medium"
      ).length;

    const low =
      events.filter(
        (e) =>
          normalize(
            e.severity
          ) === "low"
      ).length;

    const techniques =
      new Set(
        mitre
          .map(
            (m) =>
              m?.mitre
                ?.technique_id
          )
          .filter(Boolean)
      );

    return {
      events:
        events.length,

      attackers:
        new Set(
          events.map(
            (e) =>
              e.attacker_id
          )
        ).size,

      graphNodes:
        graph.nodes?.length ||
        events.length,

      graphEdges:
        graph.edges?.length ||
        Math.max(
          events.length - 1,
          0
        ),

      mitreEvents:
        mitre.length,

      predictions:
        predictions.length,

      deception:
        deception.events || 0,

      high,
      medium,
      low,

      techniques:
        techniques.size,
    };
  }, [
    events,
    attackers,
    graph,
    mitre,
    predictions,
    deception,
  ]);

  /* =======================================================
     GRAPH
  ======================================================= */

  const graphData =
    useMemo(() => {
      if (
        filteredEvents.length >
        0
      ) {
        return buildAttackGraph(
          filteredEvents
        );
      }

      return {
        nodes: [],
        edges: [],
      };
    }, [filteredEvents]);

  /* =======================================================
     TIMELINE
  ======================================================= */

  const timelineEvents =
    useMemo(() => {
      return [
        ...filteredEvents,
      ].sort(
        (a, b) =>
          new Date(
            a.timestamp || 0
          ).getTime() -
          new Date(
            b.timestamp || 0
          ).getTime()
      );
    }, [filteredEvents]);

  /* =======================================================
     DECEPTION LOOKUP
  ======================================================= */

  const getDeceptionForEvent =
    (event) => {
      return (
        deception.actions?.find(
          (action) =>
            normalize(
              action.event_type
            ) ===
              normalize(
                event.event_type
              ) &&
            normalize(
              action.attacker_id
            ) ===
              normalize(
                event.attacker_id
              )
        ) ||
        deception.actions?.find(
          (action) =>
            normalize(
              action.event_type
            ) ===
            normalize(
              event.event_type
            )
        ) ||
        null
      );
    };

  /* =======================================================
     STYLES
  ======================================================= */

  const page = {
    minHeight: "100vh",

    background:
      "radial-gradient(circle at top, #172033 0%, #080b12 42%, #05070b 100%)",

    color: "#f8fafc",

    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
  };

  const container = {
    width: "92%",
    maxWidth: 1450,
    margin: "0 auto",
  };

  const card = {
    background:
      "rgba(15,23,42,0.78)",

    border:
      "1px solid #263244",

    borderRadius: 18,

    padding: 22,

    boxShadow:
      "0 15px 45px rgba(0,0,0,.22)",

    backdropFilter:
      "blur(10px)",
  };

  const sectionTitle = {
    fontSize: 23,
    fontWeight: 900,
    marginBottom: 6,
  };

  const sectionSubtitle = {
    color: "#94a3b8",
    marginBottom: 20,
    fontSize: 14,
  };

  const badge = (color) => ({
    display: "inline-flex",
    alignItems: "center",
    padding: "5px 9px",
    borderRadius: 999,
    background: `${color}1f`,
    color,
    fontSize: 10,
    fontWeight: 900,
    letterSpacing: ".04em",
  });

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div
        style={{
          ...page,

          display: "flex",

          justifyContent:
            "center",

          alignItems:
            "center",

          minHeight:
            "100vh",
        }}
      >
        <div
          style={{
            textAlign:
              "center",
          }}
        >
          <div
            style={{
              fontSize: 42,
              fontWeight: 1000,
              letterSpacing:
                "-.04em",
            }}
          >
            ATTACK DNA X
          </div>

          <div
            style={{
              marginTop: 12,
              color: "#38bdf8",
              fontWeight: 700,
            }}
          >
            Loading threat
            intelligence
            engine...
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div style={page}>
      {/* =================================================
          HEADER
      ================================================= */}

      <header
        style={{
          borderBottom:
            "1px solid #1e293b",

          background:
            "rgba(2,6,23,.8)",

          position:
            "sticky",

          top: 0,

          zIndex: 50,

          backdropFilter:
            "blur(15px)",
        }}
      >
        <div
          style={{
            ...container,

            height: 72,

            display: "flex",

            alignItems:
              "center",

            justifyContent:
              "space-between",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 1000,
                letterSpacing:
                  ".02em",
              }}
            >
              ATTACK DNA X
            </div>

            <div
              style={{
                color: "#64748b",
                fontSize: 11,
                marginTop: 3,
              }}
            >
              Autonomous Threat
              Intelligence Engine
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems:
                "center",
              gap: 8,
            }}
          >
            <span
              style={{
                width: 9,
                height: 9,
                borderRadius:
                  "50%",
                background:
                  "#22c55e",
                boxShadow:
                  "0 0 12px #22c55e",
              }}
            />

            <span
              style={{
                color: "#86efac",
                fontWeight: 800,
                fontSize: 12,
              }}
            >
              SYSTEM ONLINE
            </span>
          </div>
        </div>
      </header>

      <main
        style={{
          ...container,
          padding:
            "45px 0 80px",
        }}
      >
        {/* =================================================
            HERO
        ================================================= */}

        <section
          style={{
            ...card,

            padding:
              "42px 38px",

            marginBottom: 24,

            background:
              "linear-gradient(135deg, rgba(15,23,42,.96), rgba(8,47,73,.55))",
          }}
        >
          <div
            style={{
              display:
                "inline-flex",

              ...badge(
                "#38bdf8"
              ),

              marginBottom: 14,
            }}
          >
            AUTONOMOUS SECURITY
            OPERATIONS
          </div>

          <h1
            style={{
              fontSize:
                "clamp(34px,5vw,66px)",

              lineHeight: 1,

              margin: 0,

              fontWeight: 1000,

              letterSpacing:
                "-.055em",
            }}
          >
            ATTACKER BEHAVIOR.
            <br />

            <span
              style={{
                color:
                  "#38bdf8",
              }}
            >
              PREDICTED.
            </span>
          </h1>

          <p
            style={{
              maxWidth: 850,

              color: "#94a3b8",

              fontSize: 16,

              lineHeight: 1.7,

              marginTop: 22,
            }}
          >
            ATTACK DNA X analyzes
            security events, builds
            attacker behavioral
            fingerprints,
            reconstructs attack
            paths, maps activity
            to MITRE ATT&CK,
            predicts next actions,
            and automatically
            deploys deception
            responses.
          </p>
        </section>

        {/* =================================================
            STATS
        ================================================= */}

        <section
          style={{
            display:
              "grid",

            gridTemplateColumns:
              "repeat(auto-fit,minmax(150px,1fr))",

            gap: 14,

            marginBottom: 24,
          }}
        >
          {[
            [
              "SECURITY EVENTS",
              stats.events,
              "#38bdf8",
            ],

            [
              "ATTACKERS",
              stats.attackers,
              "#a78bfa",
            ],

            [
              "GRAPH NODES",
              stats.graphNodes,
              "#22c55e",
            ],

            [
              "MITRE EVENTS",
              stats.mitreEvents,
              "#f59e0b",
            ],

            [
              "AI PREDICTIONS",
              stats.predictions,
              "#f472b6",
            ],

            [
              "DECEPTION",
              stats.deception,
              "#ef4444",
            ],
          ].map(
            ([
              label,
              value,
              color,
            ]) => (
              <div
                key={label}
                style={card}
              >
                <div
                  style={{
                    color:
                      "#64748b",

                    fontSize: 10,

                    fontWeight: 900,

                    letterSpacing:
                      ".08em",
                  }}
                >
                  {label}
                </div>

                <div
                  style={{
                    fontSize: 32,

                    fontWeight: 1000,

                    color,

                    marginTop: 8,
                  }}
                >
                  {value}
                </div>
              </div>
            )
          )}
        </section>

        {/* =================================================
            STEP 13 THREAT SCORING
        ================================================= */}

        <section
          style={{
            ...card,
            marginBottom: 24,
          }}
        >
          <div
            style={
              sectionTitle
            }
          >
            STEP 13 —
            Real-Time Threat
            Scoring
          </div>

          <div
            style={
              sectionSubtitle
            }
          >
            Behavioral risk scoring
            based on event severity,
            attack techniques,
            progression and
            attacker activity.
          </div>

          <div
            style={{
              display:
                "grid",

              gridTemplateColumns:
                "repeat(auto-fit,minmax(230px,1fr))",

              gap: 14,
            }}
          >
            {attackerThreats.map(
              (attacker) => {
                const color =
                  attacker.level ===
                  "CRITICAL"
                    ? "#ef4444"
                    : attacker.level ===
                      "HIGH"
                    ? "#f97316"
                    : attacker.level ===
                      "MEDIUM"
                    ? "#f59e0b"
                    : "#22c55e";

                return (
                  <div
                    key={
                      attacker.id
                    }
                    style={{
                      background:
                        "#0b1220",

                      border: `1px solid ${color}55`,

                      borderRadius: 14,

                      padding: 18,
                    }}
                  >
                    <div
                      style={{
                        display:
                          "flex",

                        justifyContent:
                          "space-between",

                        alignItems:
                          "center",
                      }}
                    >
                      <strong>
                        {
                          attacker.id
                        }
                      </strong>

                      <span
                        style={badge(
                          color
                        )}
                      >
                        {
                          attacker.level
                        }
                      </span>
                    </div>

                    <div
                      style={{
                        display:
                          "flex",

                        alignItems:
                          "end",

                        gap: 5,

                        marginTop: 18,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 38,

                          fontWeight:
                            1000,

                          color,
                        }}
                      >
                        {
                          attacker.score
                        }
                      </span>

                      <span
                        style={{
                          color:
                            "#64748b",

                          fontSize: 12,

                          paddingBottom:
                            7,
                        }}
                      >
                        / 100
                      </span>
                    </div>

                    <div
                      style={{
                        height: 7,

                        borderRadius:
                          99,

                        background:
                          "#1e293b",

                        marginTop: 8,

                        overflow:
                          "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${attacker.score}%`,

                          height:
                            "100%",

                          background:
                            color,

                          borderRadius:
                            99,
                        }}
                      />
                    </div>

                    <div
                      style={{
                        display:
                          "grid",

                        gridTemplateColumns:
                          "1fr 1fr 1fr",

                        gap: 6,

                        marginTop: 15,
                      }}
                    >
                      <div>
                        <div
                          style={{
                            color:
                              "#64748b",

                            fontSize: 10,
                          }}
                        >
                          EVENTS
                        </div>

                        <strong>
                          {
                            attacker
                              .events
                              .length
                          }
                        </strong>
                      </div>

                      <div>
                        <div
                          style={{
                            color:
                              "#64748b",

                            fontSize: 10,
                          }}
                        >
                          TECHNIQUES
                        </div>

                        <strong>
                          {
                            attacker.techniques
                          }
                        </strong>
                      </div>

                      <div>
                        <div
                          style={{
                            color:
                              "#64748b",

                            fontSize: 10,
                          }}
                        >
                          AVG SEV.
                        </div>

                        <strong>
                          {
                            attacker.averageSeverity
                          }
                        </strong>
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </section>

        {/* =================================================
            FILTERS
        ================================================= */}

        <section
          style={{
            ...card,
            marginBottom: 24,
          }}
        >
          <div
            style={
              sectionTitle
            }
          >
            Threat Investigation
            Filters
          </div>

          <div
            style={
              sectionSubtitle
            }
          >
            Investigate individual
            attackers, severities
            and event types.
          </div>

          <div
            style={{
              display:
                "grid",

              gridTemplateColumns:
                "repeat(auto-fit,minmax(200px,1fr))",

              gap: 12,
            }}
          >
            <select
              value={
                selectedAttacker
              }
              onChange={(e) =>
                setSelectedAttacker(
                  e.target.value
                )
              }
              style={{
                padding: 12,

                background:
                  "#0b1220",

                color: "#fff",

                border:
                  "1px solid #334155",

                borderRadius: 10,
              }}
            >
              <option value="ALL">
                All Attackers
              </option>

              {attackerThreats.map(
                (a) => (
                  <option
                    key={a.id}
                    value={a.id}
                  >
                    {a.id}
                  </option>
                )
              )}
            </select>

            <select
              value={
                severityFilter
              }
              onChange={(e) =>
                setSeverityFilter(
                  e.target.value
                )
              }
              style={{
                padding: 12,

                background:
                  "#0b1220",

                color: "#fff",

                border:
                  "1px solid #334155",

                borderRadius: 10,
              }}
            >
              <option value="ALL">
                All Severities
              </option>

              <option value="high">
                High
              </option>

              <option value="medium">
                Medium
              </option>

              <option value="low">
                Low
              </option>
            </select>

            <select
              value={
                eventFilter
              }
              onChange={(e) =>
                setEventFilter(
                  e.target.value
                )
              }
              style={{
                padding: 12,

                background:
                  "#0b1220",

                color: "#fff",

                border:
                  "1px solid #334155",

                borderRadius: 10,
              }}
            >
              <option value="ALL">
                All Event Types
              </option>

              {[
                ...new Set(
                  events.map(
                    (e) =>
                      e.event_type
                  )
                ),
              ].map(
                (type) => (
                  <option
                    key={type}
                    value={type}
                  >
                    {titleCase(
                      type
                    )}
                  </option>
                )
              )}
            </select>
          </div>
        </section>

        {/* =================================================
            ATTACK TIMELINE
        ================================================= */}

        <section
          style={{
            ...card,
            marginBottom: 24,
          }}
        >
          <div
            style={
              sectionTitle
            }
          >
            Attack Timeline
          </div>

          <div
            style={
              sectionSubtitle
            }
          >
            Chronological
            reconstruction of
            attacker activity.
          </div>

          <div
            style={{
              display:
                "flex",

              flexDirection:
                "column",

              gap: 12,
            }}
          >
            {timelineEvents.map(
              (event, index) => {
                const m =
                  getMitreForEvent(
                    event,
                    mitre
                  );

                const d =
                  getDeceptionForEvent(
                    event
                  );

                const color =
                  severityColor(
                    event.severity
                  );

                return (
                  <div
                    key={`${event.event_id}-${index}`}
                    style={{
                      display:
                        "grid",

                      gridTemplateColumns:
                        "42px 1fr auto",

                      gap: 14,

                      alignItems:
                        "start",

                      padding: 15,

                      borderRadius: 13,

                      background:
                        "#0b1220",

                      border:
                        "1px solid #1e293b",
                    }}
                  >
                    <div
                      style={{
                        width: 34,

                        height: 34,

                        borderRadius:
                          "50%",

                        background:
                          `${color}22`,

                        color,

                        display:
                          "flex",

                        justifyContent:
                          "center",

                        alignItems:
                          "center",

                        fontWeight: 900,
                      }}
                    >
                      {index + 1}
                    </div>

                    <div>
                      <div
                        style={{
                          display:
                            "flex",

                          flexWrap:
                            "wrap",

                          alignItems:
                            "center",

                          gap: 8,
                        }}
                      >
                        <strong>
                          {titleCase(
                            event.event_type
                          )}
                        </strong>

                        <span
                          style={badge(
                            color
                          )}
                        >
                          {String(
                            event.severity ||
                              "low"
                          ).toUpperCase()}
                        </span>

                        <span
                          style={badge(
                            "#38bdf8"
                          )}
                        >
                          {
                            event.attacker_id
                          }
                        </span>
                      </div>

                      <div
                        style={{
                          color:
                            "#64748b",

                          fontSize: 11,

                          marginTop: 5,
                        }}
                      >
                        {
                          event.timestamp ||
                          "Unknown time"
                        }

                        {" • "}

                        {
                          event.host ||
                          "Unknown host"
                        }

                        {" • "}

                        {
                          event.source_ip ||
                          "Unknown IP"
                        }
                      </div>

                      <div
                        style={{
                          marginTop: 12,

                          display:
                            "flex",

                          flexWrap:
                            "wrap",

                          gap: 8,
                        }}
                      >
                        <span
                          style={badge(
                            "#a78bfa"
                          )}
                        >
                          {
                            m.technique_id
                          }
                        </span>

                        <span
                          style={{
                            color:
                              "#cbd5e1",

                            fontSize: 12,
                          }}
                        >
                          {
                            m.technique
                          }
                        </span>

                        <span
                          style={badge(
                            "#22c55e"
                          )}
                        >
                          {m.tactic}
                        </span>
                      </div>

                      {d && (
                        <div
                          style={{
                            marginTop: 12,

                            padding: 10,

                            borderRadius: 9,

                            background:
                              "rgba(239,68,68,.08)",

                            border:
                              "1px solid rgba(239,68,68,.25)",

                            color:
                              "#fca5a5",

                            fontSize: 12,
                          }}
                        >
                          <strong>
                            DECEPTION:
                          </strong>{" "}
                          {
                            d.response
                          }
                          {" — "}
                          {
                            d.message
                          }
                        </div>
                      )}
                    </div>

                    <div
                      style={{
                        color:
                          "#475569",

                        fontSize: 11,
                      }}
                    >
                      #
                      {
                        event.event_id ||
                        event.id
                      }
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </section>

        {/* =================================================
            THREAT ASSESSMENT
        ================================================= */}

        <section
          style={{
            ...card,
            marginBottom: 24,
          }}
        >
          <div
            style={
              sectionTitle
            }
          >
            Threat Assessment
          </div>

          <div
            style={
              sectionSubtitle
            }
          >
            Current SOC threat
            distribution.
          </div>

          <div
            style={{
              display:
                "grid",

              gridTemplateColumns:
                "repeat(auto-fit,minmax(180px,1fr))",

              gap: 14,
            }}
          >
            {[
              [
                "HIGH",
                stats.high,
                "#ef4444",
              ],

              [
                "MEDIUM",
                stats.medium,
                "#f59e0b",
              ],

              [
                "LOW",
                stats.low,
                "#22c55e",
              ],
            ].map(
              ([
                name,
                count,
                color,
              ]) => (
                <div
                  key={name}
                  style={{
                    padding: 20,

                    borderRadius: 14,

                    background:
                      "#0b1220",

                    border: `1px solid ${color}44`,
                  }}
                >
                  <div
                    style={{
                      color,

                      fontSize: 12,

                      fontWeight: 900,
                    }}
                  >
                    {name}
                  </div>

                  <div
                    style={{
                      fontSize: 38,

                      fontWeight: 1000,

                      marginTop: 8,
                    }}
                  >
                    {count}
                  </div>

                  <div
                    style={{
                      color:
                        "#64748b",

                      fontSize: 11,
                    }}
                  >
                    security events
                  </div>
                </div>
              )
            )}
          </div>
        </section>

        {/* =================================================
            ATTACKER DNA
        ================================================= */}

        <section
          style={{
            ...card,
            marginBottom: 24,
          }}
        >
          <div
            style={
              sectionTitle
            }
          >
            Attacker DNA Profiles
          </div>

          <div
            style={
              sectionSubtitle
            }
          >
            Behavioral fingerprints
            derived from observed
            security activity.
          </div>

          <div
            style={{
              display:
                "grid",

              gridTemplateColumns:
                "repeat(auto-fit,minmax(260px,1fr))",

              gap: 14,
            }}
          >
            {attackerThreats.map(
              (attacker) => {
                const techniqueMap =
                  new Map();

                attacker.events.forEach(
                  (event) => {
                    const m =
                      getMitreForEvent(
                        event,
                        mitre
                      );

                    if (
                      m.technique_id !==
                      "N/A"
                    ) {
                      techniqueMap.set(
                        m.technique_id,
                        m.technique
                      );
                    }
                  }
                );

                return (
                  <div
                    key={
                      attacker.id
                    }
                    style={{
                      padding: 18,

                      background:
                        "#0b1220",

                      borderRadius: 14,

                      border:
                        "1px solid #1e293b",
                    }}
                  >
                    <div
                      style={{
                        display:
                          "flex",

                        justifyContent:
                          "space-between",

                        alignItems:
                          "center",
                      }}
                    >
                      <strong>
                        {
                          attacker.id
                        }
                      </strong>

                      <span
                        style={badge(
                          attacker.level ===
                            "HIGH" ||
                            attacker.level ===
                              "CRITICAL"
                            ? "#ef4444"
                            : attacker.level ===
                              "MEDIUM"
                            ? "#f59e0b"
                            : "#22c55e"
                        )}
                      >
                        {
                          attacker.level
                        }
                      </span>
                    </div>

                    <div
                      style={{
                        color:
                          "#64748b",

                        fontSize: 11,

                        marginTop: 6,
                      }}
                    >
                      Risk Score:{" "}
                      {
                        attacker.score
                      }
                      /100
                    </div>

                    <div
                      style={{
                        marginTop: 15,
                      }}
                    >
                      <div
                        style={{
                          color:
                            "#64748b",

                          fontSize: 10,

                          fontWeight: 900,
                        }}
                      >
                        BEHAVIORAL
                        SIGNATURE
                      </div>

                      <div
                        style={{
                          display:
                            "flex",

                          flexWrap:
                            "wrap",

                          gap: 6,

                          marginTop: 9,
                        }}
                      >
                        {[
                          ...techniqueMap.entries(),
                        ].map(
                          ([
                            id,
                            name,
                          ]) => (
                            <span
                              key={id}
                              title={
                                name
                              }
                              style={badge(
                                "#a78bfa"
                              )}
                            >
                              {id}
                            </span>
                          )
                        )}
                      </div>
                    </div>

                    <div
                      style={{
                        marginTop: 14,

                        display:
                          "grid",

                        gridTemplateColumns:
                          "1fr 1fr",

                        gap: 8,
                      }}
                    >
                      <div>
                        <div
                          style={{
                            color:
                              "#64748b",

                            fontSize: 10,
                          }}
                        >
                          EVENTS
                        </div>

                        <strong>
                          {
                            attacker
                              .events
                              .length
                          }
                        </strong>
                      </div>

                      <div>
                        <div
                          style={{
                            color:
                              "#64748b",

                            fontSize: 10,
                          }}
                        >
                          TECHNIQUES
                        </div>

                        <strong>
                          {
                            techniqueMap.size
                          }
                        </strong>
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </section>

        {/* =================================================
            INTERACTIVE ATTACK GRAPH
        ================================================= */}

        <section
          style={{
            ...card,
            marginBottom: 24,
          }}
        >
          <div
            style={
              sectionTitle
            }
          >
            Interactive Attack Path
          </div>

          <div
            style={
              sectionSubtitle
            }
          >
            Visual reconstruction of
            observed attacker
            activity.
          </div>

          <div
            style={{
              height: 600,

              borderRadius: 14,

              overflow: "hidden",

              border:
                "1px solid #1e293b",

              background:
                "#020617",
            }}
          >
            <ReactFlow
              nodes={
                graphData.nodes
              }
              edges={
                graphData.edges
              }
              nodeTypes={
                nodeTypes
              }
              fitView
            >
              <Background />

              <Controls />

              <MiniMap
                nodeColor={(node) =>
                  severityColor(
                    node.data
                      ?.severity
                  )
                }
              />
            </ReactFlow>
          </div>
        </section>

        {/* =================================================
            AI PREDICTIONS
        ================================================= */}

        <section
          style={{
            ...card,
            marginBottom: 24,
          }}
        >
          <div
            style={
              sectionTitle
            }
          >
            AI Next-Action
            Prediction
          </div>

          <div
            style={
              sectionSubtitle
            }
          >
            Predicted attacker
            actions based on
            behavioral transition
            patterns.
          </div>

          <div
            style={{
              display:
                "grid",

              gridTemplateColumns:
                "repeat(auto-fit,minmax(300px,1fr))",

              gap: 14,
            }}
          >
            {predictions.map(
              (
                prediction,
                index
              ) => {
                const current =
                  prediction.current_action;

                const next =
                  prediction.predicted_next_action;

                const confidence =
                  Number(
                    prediction.confidence
                  ) || 0;

                const currentMitre =
                  getPredictionMitre(
                    current
                  );

                const nextMitre =
                  getPredictionMitre(
                    next
                  );

                const risk =
                  getPredictionRisk(
                    confidence,
                    next
                  );

                const riskColor =
                  risk === "HIGH"
                    ? "#ef4444"
                    : risk ===
                      "MEDIUM"
                    ? "#f59e0b"
                    : "#22c55e";

                return (
                  <div
                    key={`${current}-${next}-${index}`}
                    style={{
                      padding: 18,

                      background:
                        "#0b1220",

                      border:
                        "1px solid #1e293b",

                      borderRadius: 14,
                    }}
                  >
                    <div
                      style={{
                        display:
                          "flex",

                        justifyContent:
                          "space-between",

                        alignItems:
                          "center",
                      }}
                    >
                      <span
                        style={{
                          color:
                            "#64748b",

                          fontSize: 11,

                          fontWeight: 900,
                        }}
                      >
                        PREDICTION{" "}
                        {index + 1}
                      </span>

                      <span
                        style={badge(
                          riskColor
                        )}
                      >
                        {risk}
                      </span>
                    </div>

                    <div
                      style={{
                        marginTop: 17,

                        display:
                          "flex",

                        alignItems:
                          "center",

                        gap: 10,

                        flexWrap:
                          "wrap",
                      }}
                    >
                      <span
                        style={badge(
                          "#64748b"
                        )}
                      >
                        {titleCase(
                          current
                        )}
                      </span>

                      <span
                        style={{
                          color:
                            "#38bdf8",
                        }}
                      >
                        →
                      </span>

                      <span
                        style={badge(
                          "#38bdf8"
                        )}
                      >
                        {titleCase(
                          next
                        )}
                      </span>
                    </div>

                    <div
                      style={{
                        marginTop: 17,

                        fontSize: 31,

                        fontWeight:
                          1000,

                        color:
                          "#38bdf8",
                      }}
                    >
                      {confidence.toFixed(
                        2
                      )}
                      %
                    </div>

                    <div
                      style={{
                        color:
                          "#64748b",

                        fontSize: 10,

                        fontWeight: 800,
                      }}
                    >
                      CONFIDENCE
                    </div>

                    <div
                      style={{
                        height: 6,

                        background:
                          "#1e293b",

                        borderRadius:
                          99,

                        marginTop: 9,

                        overflow:
                          "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${Math.min(
                            confidence,
                            100
                          )}%`,

                          height:
                            "100%",

                          background:
                            "#38bdf8",
                        }}
                      />
                    </div>

                    <div
                      style={{
                        marginTop: 17,

                        paddingTop: 14,

                        borderTop:
                          "1px solid #1e293b",
                      }}
                    >
                      <div
                        style={{
                          color:
                            "#64748b",

                          fontSize: 10,

                          fontWeight: 900,
                        }}
                      >
                        PREDICTED MITRE
                        TECHNIQUE
                      </div>

                      <div
                        style={{
                          marginTop: 7,

                          display:
                            "flex",

                          gap: 8,

                          flexWrap:
                            "wrap",

                          alignItems:
                            "center",
                        }}
                      >
                        <span
                          style={badge(
                            "#a78bfa"
                          )}
                        >
                          {
                            nextMitre.technique_id
                          }
                        </span>

                        <span
                          style={{
                            color:
                              "#cbd5e1",

                            fontSize: 12,
                          }}
                        >
                          {
                            nextMitre.technique
                          }
                        </span>
                      </div>

                      <div
                        style={{
                          marginTop: 7,

                          color:
                            "#94a3b8",

                          fontSize: 11,
                        }}
                      >
                        Tactic:{" "}
                        <strong>
                          {
                            nextMitre.tactic
                          }
                        </strong>
                      </div>
                    </div>

                    <div
                      style={{
                        marginTop: 12,

                        color:
                          "#64748b",

                        fontSize: 11,
                      }}
                    >
                      Current action
                      technique:{" "}
                      <strong
                        style={{
                          color:
                            "#cbd5e1",
                        }}
                      >
                        {
                          currentMitre.technique_id
                        }
                      </strong>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </section>

        {/* =================================================
            MITRE
        ================================================= */}

        <section
          style={{
            ...card,
            marginBottom: 24,
          }}
        >
          <div
            style={
              sectionTitle
            }
          >
            MITRE ATT&CK Mapping
          </div>

          <div
            style={
              sectionSubtitle
            }
          >
            Security events mapped
            to adversary techniques
            and tactics.
          </div>

          <div
            style={{
              display:
                "grid",

              gridTemplateColumns:
                "repeat(auto-fit,minmax(280px,1fr))",

              gap: 12,
            }}
          >
            {mitre.map(
              (
                mapping,
                index
              ) => {
                const m =
                  mapping.mitre ||
                  {};

                return (
                  <div
                    key={`${mapping.event_id}-${index}`}
                    style={{
                      padding: 16,

                      borderRadius: 13,

                      background:
                        "#0b1220",

                      border:
                        "1px solid #1e293b",
                    }}
                  >
                    <div
                      style={{
                        display:
                          "flex",

                        justifyContent:
                          "space-between",

                        gap: 8,
                      }}
                    >
                      <span
                        style={badge(
                          "#a78bfa"
                        )}
                      >
                        {
                          m.technique_id ||
                          "N/A"
                        }
                      </span>

                      <span
                        style={badge(
                          "#22c55e"
                        )}
                      >
                        {
                          m.tactic ||
                          "Unknown"
                        }
                      </span>
                    </div>

                    <div
                      style={{
                        marginTop: 12,

                        fontWeight: 800,
                      }}
                    >
                      {
                        m.technique ||
                        "Unknown Technique"
                      }
                    </div>

                    <div
                      style={{
                        marginTop: 7,

                        color:
                          "#64748b",

                        fontSize: 11,
                      }}
                    >
                      {titleCase(
                        mapping.event_type
                      )}

                      {" • "}

                      {
                        mapping.attacker_id
                      }

                      {" • "}

                      {
                        mapping.host
                      }
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </section>

        {/* =================================================
            DECEPTION
        ================================================= */}

        <section
          style={{
            ...card,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              display:
                "flex",

              justifyContent:
                "space-between",

              alignItems:
                "center",

              flexWrap:
                "wrap",

              gap: 10,
            }}
          >
            <div>
              <div
                style={
                  sectionTitle
                }
              >
                Autonomous
                Deception Engine
              </div>

              <div
                style={
                  sectionSubtitle
                }
              >
                Defensive responses
                automatically
                generated from
                suspicious attacker
                behavior.
              </div>
            </div>

            <span
              style={badge(
                deception.active
                  ? "#22c55e"
                  : "#64748b"
              )}
            >
              {deception.active
                ? "ACTIVE"
                : "INACTIVE"}
            </span>
          </div>

          <div
            style={{
              display:
                "grid",

              gridTemplateColumns:
                "repeat(auto-fit,minmax(280px,1fr))",

              gap: 12,
            }}
          >
            {(
              deception.actions ||
              []
            ).map(
              (
                action,
                index
              ) => (
                <div
                  key={`${action.attacker_id}-${index}`}
                  style={{
                    padding: 15,

                    borderRadius: 12,

                    background:
                      "rgba(239,68,68,.06)",

                    border:
                      "1px solid rgba(239,68,68,.2)",
                  }}
                >
                  <div
                    style={{
                      display:
                        "flex",

                      justifyContent:
                        "space-between",

                      gap: 8,
                    }}
                  >
                    <strong>
                      {
                        action.attacker_id
                      }
                    </strong>

                    <span
                      style={badge(
                        "#ef4444"
                      )}
                    >
                      TRIGGERED
                    </span>
                  </div>

                  <div
                    style={{
                      marginTop: 10,

                      color:
                        "#fca5a5",

                      fontSize: 12,
                    }}
                  >
                    {titleCase(
                      action.event_type
                    )}
                  </div>

                  <div
                    style={{
                      marginTop: 8,

                      fontFamily:
                        "ui-monospace, SFMono-Regular, Menlo, monospace",

                      fontSize: 11,

                      color:
                        "#cbd5e1",
                    }}
                  >
                    {
                      action.response
                    }
                  </div>

                  <div
                    style={{
                      marginTop: 7,

                      color:
                        "#64748b",

                      fontSize: 11,
                    }}
                  >
                    {
                      action.message
                    }
                  </div>
                </div>
              )
            )}
          </div>
        </section>

        {/* =================================================
            SOC CONSOLE
        ================================================= */}

        <section
          style={{
            ...card,
            marginBottom: 24,
          }}
        >
          <div
            style={
              sectionTitle
            }
          >
            SOC Event Console
          </div>

          <div
            style={
              sectionSubtitle
            }
          >
            Live security event
            stream.
          </div>

          <div
            style={{
              overflowX:
                "auto",

              border:
                "1px solid #1e293b",

              borderRadius: 12,
            }}
          >
            <table
              style={{
                width: "100%",

                borderCollapse:
                  "collapse",

                minWidth: 900,
              }}
            >
              <thead>
                <tr
                  style={{
                    background:
                      "#0b1220",

                    color:
                      "#64748b",

                    fontSize: 10,

                    textAlign:
                      "left",
                  }}
                >
                  {[
                    "EVENT",
                    "ATTACKER",
                    "TYPE",
                    "SEVERITY",
                    "HOST",
                    "SOURCE IP",
                    "MITRE",
                    "TIME",
                  ].map(
                    (header) => (
                      <th
                        key={
                          header
                        }
                        style={{
                          padding: 13,

                          borderBottom:
                            "1px solid #1e293b",
                        }}
                      >
                        {header}
                      </th>
                    )
                  )}
                </tr>
              </thead>

              <tbody>
                {filteredEvents.map(
                  (
                    event,
                    index
                  ) => {
                    const m =
                      getMitreForEvent(
                        event,
                        mitre
                      );

                    const color =
                      severityColor(
                        event.severity
                      );

                    return (
                      <tr
                        key={`${event.event_id}-${index}`}
                        style={{
                          borderBottom:
                            "1px solid #172033",
                        }}
                      >
                        <td
                          style={{
                            padding: 12,

                            color:
                              "#64748b",

                            fontSize: 11,
                          }}
                        >
                          {event.event_id ||
                            event.id}
                        </td>

                        <td
                          style={{
                            padding: 12,

                            fontWeight:
                              800,
                          }}
                        >
                          {
                            event.attacker_id
                          }
                        </td>

                        <td
                          style={{
                            padding: 12,

                            color:
                              "#cbd5e1",
                          }}
                        >
                          {titleCase(
                            event.event_type
                          )}
                        </td>

                        <td
                          style={{
                            padding: 12,
                          }}
                        >
                          <span
                            style={badge(
                              color
                            )}
                          >
                            {String(
                              event.severity ||
                                "low"
                            ).toUpperCase()}
                          </span>
                        </td>

                        <td
                          style={{
                            padding: 12,

                            color:
                              "#94a3b8",
                          }}
                        >
                          {
                            event.host
                          }
                        </td>

                        <td
                          style={{
                            padding: 12,

                            color:
                              "#94a3b8",

                            fontFamily:
                              "ui-monospace, monospace",

                            fontSize: 11,
                          }}
                        >
                          {
                            event.source_ip
                          }
                        </td>

                        <td
                          style={{
                            padding: 12,
                          }}
                        >
                          <span
                            style={{
                              color:
                                "#a78bfa",

                              fontWeight:
                                800,

                              fontSize: 11,
                            }}
                          >
                            {
                              m.technique_id
                            }
                          </span>
                        </td>

                        <td
                          style={{
                            padding: 12,

                            color:
                              "#64748b",

                            fontSize: 10,
                          }}
                        >
                          {
                            event.timestamp
                          }
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* =================================================
            PIPELINE
        ================================================= */}

        <section
          style={{
            ...card,
            marginBottom: 24,
          }}
        >
          <div
            style={
              sectionTitle
            }
          >
            Threat Intelligence
            Pipeline
          </div>

          <div
            style={
              sectionSubtitle
            }
          >
            ATTACK DNA X
            autonomous security
            architecture.
          </div>

          <div
            style={{
              display:
                "grid",

              gridTemplateColumns:
                "repeat(auto-fit,minmax(150px,1fr))",

              gap: 8,

              alignItems:
                "center",
            }}
          >
            {[
              "Security Events",
              "Collector",
              "Attacker DNA",
              "Attack Graph",
              "MITRE ATT&CK",
              "AI Prediction",
              "Deception",
              "SOC Dashboard",
            ].map(
              (
                stage,
                index
              ) => (
                <React.Fragment
                  key={stage}
                >
                  <div
                    style={{
                      padding: 15,

                      textAlign:
                        "center",

                      borderRadius: 12,

                      background:
                        "#0b1220",

                      border:
                        "1px solid #263244",

                      fontSize: 12,

                      fontWeight:
                        800,
                    }}
                  >
                    <div
                      style={{
                        color:
                          "#38bdf8",

                        fontSize: 10,

                        marginBottom: 5,
                      }}
                    >
                      STEP{" "}
                      {index + 1}
                    </div>

                    {stage}
                  </div>

                  {index <
                    7 && (
                    <div
                      style={{
                        textAlign:
                          "center",

                        color:
                          "#334155",

                        fontWeight:
                          900,
                      }}
                    >
                      →
                    </div>
                  )}
                </React.Fragment>
              )
            )}
          </div>
        </section>

        {/* =================================================
            FOOTER
        ================================================= */}

        <footer
          style={{
            textAlign:
              "center",

            padding:
              "20px 0",

            color:
              "#475569",

            fontSize: 11,
          }}
        >
          ATTACK DNA X •
          Autonomous Threat
          Intelligence Engine
          <br />
          Security Events →
          Attacker DNA → Attack
          Graph → MITRE → AI
          Prediction → Deception
          → SOC
        </footer>
      </main>
    </div>
  );
}