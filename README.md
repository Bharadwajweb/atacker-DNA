# 🧬 ATTACKER DNA X
> **Autonomous Adversary Genomic Profiling, Cyber-BLAST Attribution & CRISPR Deception Platform**

---

## 🌟 Executive Overview

**Attacker DNA X** is a next-generation cyber-threat intelligence and deception engineering platform. It treats an attacker's Tactics, Techniques, and Procedures (TTPs), toolchains, timing cadences, and memory artifacts as a digital **genetic code** (Cyber-Genome):

```
[FailedLogin: F] ➔ [SuccessLogin: S] ➔ [PowerShell: X] ➔ [PrivEsc: E] ➔ [LSASS Dump: C] ➔ [LateralMove: L]
                                 └── Genome Sequence: F-S-X-E-C-L ──┘
```

---

## 🚀 Key Architectural Innovations

### 1. 🧬 3D Interactive Cyber-DNA Double Helix (`GenomeHelix3D.jsx`)
* Hardware-accelerated 3D projection on HTML5 Canvas with 60 FPS animation.
* **Strand A (Left)**: Attacker TTP Codons (`F`, `S`, `P`, `X`, `C`, `E`, `L`, `D`) with glowing bioluminescent nucleotide spheres.
* **Strand B (Right)**: Active **MITRE D3FEND / CRISPR Decoys** (Canary tokens, honeypots, quarantine hooks).
* **Rungs**: Dynamic hydrogen bond resonance with live particle pulses.
* Full 360° mouse rotation, speed controls, zoom, and interactive codon dissection.

### 2. 🎯 Cyber-BLAST Sequence Homology Engine (`genomics.py` & `CyberBlastPanel.jsx`)
* Implements the biological **Smith-Waterman local sequence alignment algorithm** applied to cyber threat sequences.
* Compares live breach telemetry against reference nation-state and cybercrime threat syndicates:
  * 🇷🇺 **APT29 (Cozy Bear / SVR)**
  * 🇷🇺 **APT28 (Fancy Bear / GRU)**
  * ☠️ **LockBit 3.0 (Ransomware Cartel)**
  * 🇰🇵 **Lazarus Group (HIDDEN COBRA)**
  * 💳 **FIN7 (Carbanak Syndicate)**
* Detects and highlights **Genomic Mutations** (`MUTATION_SUBSTITUTION`, `INSERTION_NOVEL_TACTIC`, `DELETION_EVADED_TACTIC`) in real time.

### 3. ⏱️ Attack Replay Time-Machine (`AttackReplayScrubber.jsx`)
* Interactive chronological playback scrubber: **Play**, **Pause**, **Rewind**, and **Step Forward**.
* Variable playback speed (**1X**, **2X**, **5X**).
* Scrubbing filters all dashboard graphs, metrics, and the 3D helix up to that exact step in the attack timeline.

### 4. ⚡ Live Breach Simulator Studio (`scenarios.py` & `SimulationStudio.jsx`)
* One-click execution of pre-configured cyber-range intrusion scenarios:
  1. *APT29 Stealth Cloud Espionage*
  2. *LockBit 3.0 Ransomware Velocity Strike*
  3. *Disgruntled Privileged Insider Exfiltration*
* Synthesizes realistic logs, regenerates pipelines, updates threat scores, and broadcasts over WebSockets.

### 5. 🛡️ CRISPR Deception & Honeytoken Grid (`deception.py` & `DeceptionGrid.jsx`)
* Injects synthetic decoy assets (Canary AD Domain Admins in LSASS, poisoned SQL databases, fake AWS IAM secrets) targeted to the predicted next step of the attacker's trajectory.
* Tracks trap triggers and decoy hits in real time.

### 6. 📄 Automated Genetic Rule Synthesizer (`rule_generator.py` & `RuleSynthesizer.jsx`)
* Automatically compiles decoded adversary codons into ready-to-deploy defensive rules:
  * **Sigma Rules (YAML)** for SIEM ingestion (Splunk, Microsoft Sentinel).
  * **YARA Memory Signatures** for host endpoint memory scans.
  * **Snort / Suricata IDS Rules** for network perimeter blocking.
* Instant copy-to-clipboard and one-click file download.

### 7. 🩺 AI Threat Pathologist Clinical Briefing (`pathologist.py` & `PathologistReport.jsx`)
* Clinical forensic debriefing with risk levels (`EMERGENCY`, `CRITICAL`, `ELEVATED`).
* Automated 4-Phase Containment Playbook:
  1. Surgical Isolation
  2. Credential Revocation
  3. CRISPR Deception Binding
  4. Immunological Hardening

### 8. 📥 Live Log Dropzone Ingestion (`LogDropzone.jsx`)
* Drag-and-drop or paste raw Sysmon, Windows Event Logs (EVTX), Mimikatz dumps, or Suricata JSON alerts.
* Parses atomic system events and sequences DNA on the fly.

### 9. 🔊 Tactical Web Audio Synthesizer (`utils/audio.js`)
* Procedural, zero-dependency sci-fi tactical audio feedback for clicks, scans, alert chimes, and scenario execution.
* Toggleable with a single click in the top bar.

---

## 🛠️ Project Structure

```
d:\atacker-DNA/
├── backend/
│   ├── main.py              # FastAPI core with WebSocket & REST endpoints
│   ├── genomics.py          # Smith-Waterman Cyber-BLAST alignment engine
│   ├── rule_generator.py    # Sigma, YARA & Snort rule synthesis
│   ├── scenarios.py         # Dynamic breach simulation scenarios
│   ├── pathologist.py       # Clinical forensic AI briefing & playbooks
│   ├── copilot.py           # Autonomous AI Cyber Copilot reasoning engine
│   ├── honeyshell.py        # Sandboxed deception CLI emulator
│   ├── stix_export.py       # OASIS STIX 2.1 Threat Intel exporter
│   ├── collector.py         # Event ingestion normalization
│   ├── deception.py         # Deception rule evaluation
│   ├── fingerprint.py       # Behavioral sequence extraction & risk scoring
│   ├── predictor.py         # Markov & ML transition predictions
│   ├── attack_graph.py      # NetworkX DAG attack graph builder
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx                 # Tactical HUD bar with live pulse & modal triggers
│   │   │   ├── GenomeHelix3D.jsx          # 3D interactive double helix visualizer
│   │   │   ├── AttackReplayScrubber.jsx   # Interactive time-machine playback scrubber
│   │   │   ├── CyberBlastPanel.jsx        # Smith-Waterman adversary attribution panel
│   │   │   ├── ThreatGeoMap.jsx           # Global geopolitical C2 ballistic trajectory radar
│   │   │   ├── ThreatRadar.jsx            # Hexagonal tactical dimension profiling
│   │   │   ├── AttackGraphCanvas.jsx      # ReactFlow lateral movement DAG
│   │   │   ├── MitreHeatmap.jsx           # MITRE ATT&CK Matrix v15 coverage heatmap
│   │   │   ├── HexDissector.jsx           # Low-level memory & payload hex dissector
│   │   │   ├── DeceptionGrid.jsx          # CRISPR honeytoken defense grid
│   │   │   ├── HoneyShell.jsx             # Interactive adversary deception sandbox terminal
│   │   │   ├── RuleSynthesizer.jsx        # Sigma / YARA / Snort instant compiler
│   │   │   ├── PathologistReport.jsx      # AI Clinical Forensic Briefing & Playbook
│   │   │   ├── SimulationStudio.jsx       # One-click breach simulation scenarios
│   │   │   ├── LogDropzone.jsx            # Drag-and-drop raw log sequencer
│   │   │   ├── CopilotDrawer.jsx          # Autonomous AI Cyber Copilot drawer
│   │   │   ├── ExecutiveDossierModal.jsx  # Printable C-Level Executive Threat Dossier
│   │   │   └── ImmunizeModal.jsx          # Surgical 4-phase enterprise containment lockdown
│   │   ├── utils/
│   │   │   └── audio.js                   # Web Audio API sci-fi synthesizer
│   │   ├── App.jsx                        # Modular command deck dashboard
│   │   ├── index.css                      # Full-viewport cyber styling & neon glow tokens
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
└── data/                                  # Telemetry & graph persistence
```

---

## ⚡ Quick Start

### 1. Launch Backend API
```bash
cd backend
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation will be live at: `http://127.0.0.1:8000/docs`

### 2. Launch Frontend Command HUD
```bash
cd frontend
npm run dev
```
Dashboard will be live at: `http://localhost:5173/`

---

## 📡 Key REST & WebSocket Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/dashboard` | Returns unified state (events, graph, blast, deception, stats) |
| `GET` | `/blast?attacker_id=...` | Runs Smith-Waterman alignment against known APT genomes |
| `GET` | `/rules/{attacker_id}` | Compiles Sigma, YARA, and Snort detection rules |
| `GET` | `/pathologist/{attacker_id}` | AI clinical forensic debriefing and containment playbook |
| `POST` | `/copilot/query` | Autonomous AI Cyber Copilot response and surgical script synthesis |
| `POST` | `/honeyshell/execute` | Live command execution in sandbox honey-environment |
| `POST` | `/immunize` | Executes surgical 4-phase enterprise isolation & revocation |
| `GET` | `/export/stix/{attacker_id}` | Generates compliant OASIS STIX 2.1 Threat Intel JSON bundle |
| `POST` | `/trap/{trap_type}` | Live honeypot tripwire alert trigger |
| `GET` | `/scenarios` | Lists available breach simulation scenarios |
| `POST` | `/simulate/{scenario_id}` | Executes scenario and streams events over WebSockets |
| `POST` | `/ingest/log` | Ingests and parses raw log text (Sysmon, Suricata, PCAP) |
| `POST` | `/reset` | Restores database to clean baseline scenario state |
| `WS` | `/ws` | Real-time WebSocket feed for live adversary telemetry |
