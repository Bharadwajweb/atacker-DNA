import React, { useState, useEffect, useMemo, useCallback } from "react";
import Header from "./components/Header";
import GenomeHelix3D from "./components/GenomeHelix3D";
import CyberBlastPanel from "./components/CyberBlastPanel";
import SimulationStudio from "./components/SimulationStudio";
import AttackReplayScrubber from "./components/AttackReplayScrubber";
import AttackGraphCanvas from "./components/AttackGraphCanvas";
import MitreHeatmap from "./components/MitreHeatmap";
import RuleSynthesizer from "./components/RuleSynthesizer";
import DeceptionGrid from "./components/DeceptionGrid";
import PathologistReport from "./components/PathologistReport";
import LogDropzone from "./components/LogDropzone";
import ThreatRadar from "./components/ThreatRadar";
import HexDissector from "./components/HexDissector";
import ThreatGeoMap from "./components/ThreatGeoMap";
import HoneyShell from "./components/HoneyShell";
import CopilotDrawer from "./components/CopilotDrawer";
import ExecutiveDossierModal from "./components/ExecutiveDossierModal";
import ImmunizeModal from "./components/ImmunizeModal";
import AuthGate from "./components/AuthGate";
import { playAlertChime, playTacticalClick, speakTacticalAlert } from "./utils/audio";
import { Shield, Dna, LayoutGrid, Radar, Network, Sparkles, Keyboard, X } from "lucide-react";

const API_BASE = "http://127.0.0.1:8000";
const WS_BASE = "ws://127.0.0.1:8000/ws";

export default function App() {
  const [authSession, setAuthSession] = useState(() => {
    try {
      const stored = localStorage.getItem("attacker_dna_auth");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("attacker_dna_theme") || "matrix";
    } catch {
      return "matrix";
    }
  });

  const [dashboardData, setDashboardData] = useState(null);
  const [selectedAttacker, setSelectedAttacker] = useState("ALL");
  const [replayIndex, setReplayIndex] = useState(0);
  const [scanlines, setScanlines] = useState(false);
  const [activeToast, setActiveToast] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [activeDeckTab, setActiveDeckTab] = useState("ALL");
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [isImmunizeOpen, setIsImmunizeOpen] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("attacker_dna_theme", theme);
    } catch {
      // ignore
    }
  }, [theme]);

  // Global Tactical Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)) return;

      if (e.key === "1") { playTacticalClick(); setActiveDeckTab("ALL"); }
      else if (e.key === "2") { playTacticalClick(); setActiveDeckTab("GENOME"); }
      else if (e.key === "3") { playTacticalClick(); setActiveDeckTab("ATTRIBUTION"); }
      else if (e.key === "4") { playTacticalClick(); setActiveDeckTab("TOPOLOGY"); }
      else if (e.key === "5") { playTacticalClick(); setActiveDeckTab("DEFENSE"); }
      else if (e.key === "6") { playTacticalClick(); setActiveDeckTab("WAR_GAME"); }
      else if (e.key === "t" || e.key === "T") {
        playTacticalClick();
        const themes = ["matrix", "tokyo", "solaris", "arctic"];
        setTheme(curr => themes[(themes.indexOf(curr) + 1) % themes.length]);
      }
      else if (e.key === "c" || e.key === "C") {
        playTacticalClick();
        setIsCopilotOpen(prev => !prev);
      }
      else if (e.key === "d" || e.key === "D") {
        playTacticalClick();
        setIsDossierOpen(prev => !prev);
      }
      else if (e.key === "i" || e.key === "I") {
        playAlertChime();
        setIsImmunizeOpen(prev => !prev);
      }
      else if (e.key === "m" || e.key === "M") {
        setScanlines(prev => !prev);
      }
      else if (e.key === "?") {
        playTacticalClick();
        setShowShortcuts(prev => !prev);
      }
      else if (e.key === "Escape") {
        setIsCopilotOpen(false);
        setIsDossierOpen(false);
        setIsImmunizeOpen(false);
        setShowShortcuts(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Fetch complete dashboard state from backend
  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/dashboard`);
      const data = await res.json();
      setDashboardData(data);
      if (data.events) {
        setReplayIndex(data.events.length - 1);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/dashboard`);
        const data = await res.json();
        if (active) {
          setDashboardData(data);
          if (data.events) {
            setReplayIndex(data.events.length - 1);
          }
        }
      } catch (err) {
        console.error("Initial dashboard fetch error:", err);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // WebSocket Live Ingestion Connection with Voice Announcer
  useEffect(() => {
    let ws;
    try {
      ws = new WebSocket(WS_BASE);

      ws.onopen = () => {
        setWsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          playAlertChime();
          const alertText = msg.scenario || msg.message || "Live adversary telemetry received";
          setActiveToast(alertText);

          if (msg.scenario) {
            speakTacticalAlert(`Adversary breach scenario launched: ${msg.scenario}`);
          } else if (msg.type === "honeytoken_tripped") {
            speakTacticalAlert("Alert: Honeytoken tripwire accessed by adversary.");
          } else if (msg.type === "immunization_executed") {
            speakTacticalAlert("Surgical enterprise containment and network isolation executed.");
          }

          setTimeout(() => setActiveToast(null), 4000);
          fetchDashboard();
        } catch {
          // ignore malformed ws messages
        }
      };

      ws.onclose = () => {
        setWsConnected(false);
      };
      ws.onerror = () => {
        setWsConnected(false);
      };
    } catch {
      // connection attempt failed
    }

    return () => {
      if (ws) ws.close();
    };
  }, [fetchDashboard]);

  // Automated 1-Click Guided Presentation Mode
  const handleRunAutoDemo = useCallback(async () => {
    speakTacticalAlert("Initiating Attacker DNA automated threat sequence and attribution demonstration.");
    setActiveToast("Automated Live Demo Mode Activated");
    setActiveDeckTab("ALL");

    try {
      // Step 1: Launch Lazarus scenario
      await fetch(`${API_BASE}/simulate/LAZARUS_HEIST`, { method: "POST" });
      await fetchDashboard();

      // Step 2: Highlight attribution after 3.5s
      setTimeout(async () => {
        speakTacticalAlert("Smith-Waterman sequence homology aligned. Threat attributed to Lazarus Group.");
        setActiveToast("Adversary Fingerprinted: Lazarus Group (HIDDEN COBRA)");

        // Step 3: Trip Honeypot Decoy after another 3.5s
        setTimeout(async () => {
          await fetch(`${API_BASE}/trap/canary_credentials`, { method: "POST" });
          await fetchDashboard();

          // Step 4: Show Executive Dossier after another 2.5s
          setTimeout(() => {
            speakTacticalAlert("Forensic Intelligence Dossier ready for executive review.");
            setIsDossierOpen(true);
          }, 2500);
        }, 3500);
      }, 3500);
    } catch (e) {
      console.error("Auto demo error:", e);
    }
  }, [fetchDashboard]);

  // Filter events based on selectedAttacker and replay scrubber index
  const allEvents = useMemo(() => dashboardData?.events || [], [dashboardData?.events]);
  const totalEventsCount = allEvents.length;

  const scrubbedEvents = useMemo(() => {
    if (allEvents.length === 0) return [];
    const sliced = allEvents.slice(0, Math.min(replayIndex + 1, allEvents.length));
    if (selectedAttacker && selectedAttacker !== "ALL") {
      return sliced.filter(e => e.attacker_id === selectedAttacker);
    }
    return sliced;
  }, [allEvents, replayIndex, selectedAttacker]);

  const attackersList = dashboardData?.attackers || [];

  return (
    <div style={{ minHeight: "100vh", position: "relative", color: "#f8fafc" }}>
      {/* Background Cyber Grid */}
      <div className="cyber-canvas-bg" />

      {/* Dynamic Cyber Radar Sweep Beam */}
      <div className="radar-sweep-beam" />

      {/* Retro CRT Scanlines Overlay Toggle */}
      {scanlines && <div className="scanlines" />}

      {/* Real-Time WebSocket Toast Notification */}
      {activeToast && (
        <div
          style={{
            position: "fixed",
            bottom: 84,
            right: 24,
            zIndex: 9999,
            padding: "14px 20px",
            background: "var(--bg-card)",
            border: "1px solid var(--border-glow)",
            boxShadow: "0 0 25px var(--cyan-glow)",
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            gap: 12,
            animation: "slideIn 0.3s ease"
          }}
        >
          <span className="pulse-indicator" style={{ background: "var(--cyan-neon)" }} />
          <div>
            <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--cyan-neon)", fontWeight: 700 }}>
              LIVE INGESTION BROADCAST
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#ffffff", marginTop: 2 }}>
              {activeToast}
            </div>
          </div>
        </div>
      )}

      {/* Defense Clearance Biometric Authentication Gate */}
      {!authSession && (
        <AuthGate onAuthenticated={(session) => setAuthSession(session)} />
      )}

      {/* Top Tactical Navigation Header */}
      <Header
        attackers={attackersList}
        selectedAttacker={selectedAttacker}
        onSelectAttacker={setSelectedAttacker}
        stats={dashboardData?.summary || {}}
        scanlinesEnabled={scanlines}
        onToggleScanlines={() => setScanlines(!scanlines)}
        onRefresh={fetchDashboard}
        authSession={authSession}
        onLogout={() => {
          playTacticalClick();
          localStorage.removeItem("attacker_dna_auth");
          setAuthSession(null);
        }}
        onOpenCopilot={() => {
          playTacticalClick();
          setIsCopilotOpen(true);
        }}
        onOpenDossier={() => {
          playTacticalClick();
          setIsDossierOpen(true);
        }}
        onOpenImmunize={() => {
          playAlertChime();
          setIsImmunizeOpen(true);
        }}
        onRunAutoDemo={handleRunAutoDemo}
        currentTheme={theme}
        onSelectTheme={setTheme}
      />

      {/* Live SOC Telemetry Stream Ticker */}
      <section
        style={{
          background: "var(--bg-void)",
          borderBottom: "1px solid var(--border-subtle)",
          padding: "8px 24px",
          display: "flex",
          alignItems: "center",
          gap: 16,
          overflowX: "auto",
          fontSize: 11,
          fontFamily: "var(--font-mono)",
          position: "relative",
          zIndex: 50
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <span className="pulse-indicator" style={{ background: "var(--crimson-neon)" }} />
          <strong style={{ color: "var(--crimson-neon)", letterSpacing: "0.08em" }}>
            SOC TELEMETRY STREAM:
          </strong>
        </div>

        <div style={{ display: "flex", gap: 24, alignItems: "center", whiteSpace: "nowrap" }}>
          {allEvents.length === 0 ? (
            <span style={{ color: "#64748b" }}>Listening for adversary telemetry...</span>
          ) : (
            allEvents.slice(-6).reverse().map((ev, i) => (
              <div key={ev.event_id || i} style={{ display: "flex", alignItems: "center", gap: 6, color: "#94a3b8" }}>
                <span style={{ color: "var(--cyan-neon)" }}>
                  [{ev.timestamp ? ev.timestamp.slice(11, 19) : "LIVE"}]
                </span>
                <strong style={{ color: "#f8fafc" }}>{ev.attacker_id}</strong>
                <span>➔</span>
                <span style={{ color: "var(--amber-neon)" }}>{ev.event_type}</span>
                <span style={{ color: "#64748b" }}>({ev.host || "NODE"})</span>
                <span
                  className="cyber-badge"
                  style={{
                    fontSize: 9,
                    padding: "2px 6px",
                    background: ev.severity === "CRITICAL" ? "rgba(255,42,95,0.2)" : "rgba(0,255,157,0.15)",
                    color: ev.severity === "CRITICAL" ? "var(--crimson-neon)" : "var(--cyan-neon)"
                  }}
                >
                  {ev.severity || "INFO"}
                </span>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Main Content Dashboard Container */}
      <main style={{ maxWidth: 1680, margin: "0 auto", padding: "28px 24px 60px", display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Hero Mission Control Strip */}
        <section
          className="glass-panel hud-corner"
          style={{
            padding: "26px 32px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 20
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span className="pulse-indicator" style={{ background: "var(--emerald-neon)" }} />
              <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--emerald-neon)", fontWeight: 800 }}>
                CRISPR DEFENSE ACTIVE • {wsConnected ? "STREAMING WEBSOCKET ONLINE" : "TELEMETRY SYNCED"}
              </span>
            </div>
            <h1 style={{ fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 900, marginTop: 4, letterSpacing: "-0.03em", fontFamily: "var(--font-display)" }}>
              Adversary Genome Sequencing & Attribution Deck
            </h1>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 4, maxWidth: 880 }}>
              Decodes raw cybersecurity incidents into structured TTP codons, performs Smith-Waterman homology matching against nation-state threat actors, and binds synthetic CRISPR decoys to neutralize intrusions.
            </p>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <div
              style={{
                padding: "12px 20px",
                background: "var(--bg-void)",
                border: "1px solid var(--border-glow)",
                borderRadius: 10,
                textAlign: "center",
                boxShadow: "0 0 16px var(--cyan-glow)"
              }}
            >
              <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
                SYSTEM CONFIDENCE
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "var(--cyan-neon)", marginTop: 2, fontFamily: "var(--font-display)" }}>
                {dashboardData?.summary?.attribution_score || "94.2"}%
              </div>
            </div>

            <div
              style={{
                padding: "12px 20px",
                background: "var(--bg-void)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 10,
                textAlign: "center"
              }}
            >
              <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
                DECOY ASSETS
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "var(--violet-neon)", marginTop: 2, fontFamily: "var(--font-display)" }}>
                {dashboardData?.deception?.events || 4} ACTIVE
              </div>
            </div>
          </div>
        </section>

        {/* Deck Navigation Tabs */}
        <section style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
          {[
            { id: "ALL", label: "COMMAND DECK (ALL)", icon: LayoutGrid },
            { id: "GENOME", label: "3D HELIX & RADAR", icon: Dna },
            { id: "ATTRIBUTION", label: "CYBER-BLAST & GEO RADAR", icon: Radar },
            { id: "TOPOLOGY", label: "KILL-CHAIN & FORENSIC HEX", icon: Network },
            { id: "DEFENSE", label: "CRISPR DECEPTION & HONEYSHELL", icon: Shield },
            { id: "WAR_GAME", label: "WAR-GAME SIMULATION", icon: Sparkles }
          ].map(tab => {
            const isSelected = activeDeckTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  playTacticalClick();
                  setActiveDeckTab(tab.id);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 18px",
                  background: isSelected ? "rgba(0, 240, 255, 0.15)" : "rgba(8, 17, 34, 0.6)",
                  border: isSelected ? "1px solid var(--cyan-neon)" : "1px solid rgba(30, 58, 95, 0.5)",
                  borderRadius: 8,
                  color: isSelected ? "var(--cyan-neon)" : "#94a3b8",
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  whiteSpace: "nowrap"
                }}
              >
                <Icon size={14} /> {tab.label}
              </button>
            );
          })}
        </section>

        {/* 1. Attack Time-Machine Playback Scrubber (Always Visible or in Relevant Tabs) */}
        {(activeDeckTab === "ALL" || activeDeckTab === "GENOME" || activeDeckTab === "TOPOLOGY") && (
          <section>
            <AttackReplayScrubber
              totalEvents={totalEventsCount}
              currentIndex={replayIndex}
              onIndexChange={setReplayIndex}
            />
          </section>
        )}

        {/* 2. 3D Cyber-DNA Double Helix Visualizer & Threat Radar */}
        {(activeDeckTab === "ALL" || activeDeckTab === "GENOME") && (
          <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(460px, 1fr))", gap: 24 }}>
            <GenomeHelix3D
              events={scrubbedEvents}
              selectedAttacker={selectedAttacker}
            />
            <ThreatRadar
              attacker={attackersList.find(a => a.attacker_id === selectedAttacker) || {}}
              events={scrubbedEvents}
            />
          </section>
        )}

        {/* 3. Cyber-BLAST Attribution & Pathologist Report */}
        {(activeDeckTab === "ALL" || activeDeckTab === "ATTRIBUTION") && (
          <>
            <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(460px, 1fr))", gap: 24 }}>
              <CyberBlastPanel blastData={dashboardData?.blast} />
              <PathologistReport
                attackerId={selectedAttacker}
                apiBase={API_BASE}
              />
            </section>
            {/* Global Geopolitical Threat Trajectory Map */}
            <section>
              <ThreatGeoMap topMatchId={dashboardData?.blast?.top_match?.apt_id} />
            </section>
          </>
        )}

        {/* 4. Attack Graph, MITRE Heatmap & Forensic Hex Dissector */}
        {(activeDeckTab === "ALL" || activeDeckTab === "TOPOLOGY") && (
          <>
            <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(460px, 1fr))", gap: 24 }}>
              <AttackGraphCanvas
                graphData={dashboardData?.graph}
                events={scrubbedEvents}
              />
              <MitreHeatmap events={scrubbedEvents} />
            </section>
            <section>
              <HexDissector selectedEvent={scrubbedEvents[scrubbedEvents.length - 1]} />
            </section>
          </>
        )}

        {/* 5. Rule Synthesizer, CRISPR Deception Grid & HoneyShell Deception CLI */}
        {(activeDeckTab === "ALL" || activeDeckTab === "DEFENSE") && (
          <>
            <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(460px, 1fr))", gap: 24 }}>
              <RuleSynthesizer
                attackerId={selectedAttacker}
                apiBase={API_BASE}
              />
              <DeceptionGrid deceptionData={dashboardData?.deception} />
            </section>
            <section>
              <HoneyShell
                apiBase={API_BASE}
                onCommandExecuted={fetchDashboard}
              />
            </section>
          </>
        )}

        {/* 6. Live Breach Simulator Studio & Log Dropzone */}
        {(activeDeckTab === "ALL" || activeDeckTab === "WAR_GAME") && (
          <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(460px, 1fr))", gap: 24 }}>
            <SimulationStudio
              apiBase={API_BASE}
              onSimulationComplete={fetchDashboard}
            />
            <LogDropzone
              apiBase={API_BASE}
              onLogIngested={fetchDashboard}
            />
          </section>
        )}
      </main>

      {/* Floating Tactical AI Copilot FAB Button */}
      {!isCopilotOpen && (
        <button
          onClick={() => {
            playTacticalClick();
            setIsCopilotOpen(true);
          }}
          title="Open Autonomous AI Cyber Copilot"
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 999,
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 20px",
            background: "linear-gradient(135deg, rgba(8, 20, 44, 0.95), rgba(4, 9, 20, 0.98))",
            border: "1px solid var(--cyan-neon)",
            borderRadius: 30,
            boxShadow: "0 0 25px rgba(0, 240, 255, 0.4)",
            cursor: "pointer",
            color: "#ffffff",
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            fontWeight: 800,
            transition: "all 0.25s ease"
          }}
        >
          <span className="pulse-indicator" style={{ background: "var(--cyan-neon)" }} />
          <Sparkles size={15} style={{ color: "var(--cyan-neon)" }} />
          <span>AI COPILOT</span>
        </button>
      )}

      {/* Floating Tactical Shortcuts [?] Button */}
      <button
        onClick={() => {
          playTacticalClick();
          setShowShortcuts(true);
        }}
        title="View HUD Tactical Keyboard Shortcuts [?]"
        style={{
          position: "fixed",
          bottom: 24,
          right: isCopilotOpen ? 460 : 160,
          zIndex: 998,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "12px 16px",
          background: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          borderRadius: 30,
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.6)",
          cursor: "pointer",
          color: "var(--cyan-neon)",
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          fontWeight: 800,
          transition: "all 0.25s ease"
        }}
      >
        <Keyboard size={15} />
        <span>HOTKEYS [?]</span>
      </button>

      {/* HUD Keyboard Shortcuts Modal */}
      {showShortcuts && (
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
            padding: 24,
            animation: "fadeIn 0.2s ease"
          }}
          onClick={() => setShowShortcuts(false)}
        >
          <div
            className="glass-panel hud-corner"
            style={{
              maxWidth: 580,
              width: "100%",
              padding: 28,
              boxShadow: "0 0 45px var(--cyan-glow)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Keyboard size={20} style={{ color: "var(--cyan-neon)" }} />
                <h3 style={{ fontSize: 18, fontWeight: 900, fontFamily: "var(--font-display)", color: "#ffffff" }}>
                  TACTICAL HUD SHORTCUTS
                </h3>
              </div>
              <button
                onClick={() => setShowShortcuts(false)}
                style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontFamily: "var(--font-mono)", fontSize: 12 }}>
              {[
                { key: "1 - 6", desc: "Switch Command Deck Tabs" },
                { key: "T", desc: "Cycle Cyber Themes" },
                { key: "C", desc: "Toggle AI Copilot" },
                { key: "D", desc: "Executive Dossier" },
                { key: "I", desc: "Surgical Immunization" },
                { key: "M", desc: "Toggle CRT Scanlines" },
                { key: "ESC", desc: "Close Active Modal" },
                { key: "?", desc: "Toggle Hotkeys Help" }
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    background: "var(--bg-void)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: 8
                  }}
                >
                  <span style={{ color: "var(--text-secondary)" }}>{item.desc}</span>
                  <kbd
                    style={{
                      padding: "3px 8px",
                      background: "rgba(0, 255, 157, 0.15)",
                      border: "1px solid var(--border-glow)",
                      borderRadius: 4,
                      color: "var(--cyan-neon)",
                      fontWeight: 800
                    }}
                  >
                    {item.key}
                  </kbd>
                </div>
              ))}
            </div>

            <div style={{ textAlign: "center", marginTop: 20, fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
              Press [ESC] or click outside to dismiss
            </div>
          </div>
        </div>
      )}

      {/* Autonomous AI Cyber Copilot Drawer */}
      <CopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        attackerId={selectedAttacker}
        apiBase={API_BASE}
      />

      {/* Executive Threat Dossier Modal */}
      <ExecutiveDossierModal
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
        attackerId={selectedAttacker}
        blastData={dashboardData?.blast}
        events={scrubbedEvents}
      />

      {/* Surgical Enterprise Immunize Modal */}
      <ImmunizeModal
        isOpen={isImmunizeOpen}
        onClose={() => setIsImmunizeOpen(false)}
        apiBase={API_BASE}
      />
    </div>
  );
}