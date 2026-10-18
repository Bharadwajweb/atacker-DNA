from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, Request
from fastapi.middleware.cors import CORSMiddleware

import json
import asyncio
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any

from collector import collect_event
from deception import analyze_event, analyze_events
from genomics import perform_cyber_blast, APT_GENOMES
from rule_generator import generate_rules_bundle
from scenarios import SCENARIOS, get_scenario_events_with_timestamps
from pathologist import generate_pathologist_briefing
from stix_export import generate_stix_bundle
from copilot import query_copilot
from honeyshell import process_honeyshell_command


# ============================================================
# ATTACK DNA X
# Autonomous Hacker Attribution & Prediction Engine
# ============================================================

app = FastAPI(
    title="ATTACK DNA X",
    description="Autonomous Hacker Attribution & Prediction Engine",
    version="1.0.0"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# WEBSOCKET CONNECTION MANAGER
# ============================================================

class ConnectionManager:
    def __init__(self):
        self.active_connections = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(message))
            except Exception:
                pass

manager = ConnectionManager()


# ============================================================
# PATHS
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = PROJECT_ROOT / "data"

EVENTS_FILE = DATA_DIR / "events.json"
FINGERPRINTS_FILE = DATA_DIR / "fingerprints.json"
GRAPH_FILE = DATA_DIR / "attack_graph.json"
MITRE_FILE = DATA_DIR / "mitre_mapping.json"
PREDICTION_FILE = DATA_DIR / "prediction.json"


# ============================================================
# JSON HELPERS WITH IN-MEMORY FAST CACHE
# ============================================================

_DATA_CACHE = {}
_BLAST_CACHE = {"key": None, "result": None}

def get_cached_cyber_blast(events: list) -> dict:
    if not events:
        return perform_cyber_blast(events)
    cache_key = (len(events), events[-1].get("event_id"), events[0].get("event_id"))
    if _BLAST_CACHE["key"] == cache_key and _BLAST_CACHE["result"] is not None:
        return _BLAST_CACHE["result"]
    result = perform_cyber_blast(events)
    _BLAST_CACHE["key"] = cache_key
    _BLAST_CACHE["result"] = result
    return result

def load_json(filename: str, force_reload: bool = False):
    if not force_reload and filename in _DATA_CACHE:
        return _DATA_CACHE[filename]

    file_path = DATA_DIR / filename
    if not file_path.exists():
        return {}

    try:
        with open(file_path, "r", encoding="utf-8") as file:
            data = json.load(file)
            _DATA_CACHE[filename] = data
            return data
    except Exception as e:
        print(f"Error loading {filename}: {e}")
        return {}


def save_json(filename: str, data):
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    _DATA_CACHE[filename] = data

    file_path = DATA_DIR / filename
    try:
        with open(file_path, "w", encoding="utf-8") as file:
            json.dump(data, file, indent=2)
    except Exception as e:
        print(f"Error saving {filename}: {e}")
        raise


# ============================================================
# PIPELINE REGENERATION
# ============================================================

def regenerate_pipeline():

    events_data = load_json("events.json")
    events = events_data.get("events", [])

    # --------------------------------------------------------
    # ATTACKER DNA
    # --------------------------------------------------------

    attackers = {}

    for event in events:

        attacker_id = event.get("attacker_id", "UNKNOWN")

        if attacker_id not in attackers:
            attackers[attacker_id] = {
                "attacker_id": attacker_id,
                "total_events": 0,
                "event_types": [],
                "source_ips": [],
                "hosts": [],
                "high_severity_events": 0,
                "risk_score": 0
            }

        attacker = attackers[attacker_id]
        attacker["total_events"] += 1

        event_type = event.get("event_type", "unknown")
        if event_type not in attacker["event_types"]:
            attacker["event_types"].append(event_type)

        source_ip = event.get("source_ip", "0.0.0.0")
        if source_ip not in attacker["source_ips"]:
            attacker["source_ips"].append(source_ip)

        host = event.get("host", "UNKNOWN")
        if host not in attacker["hosts"]:
            attacker["hosts"].append(host)

        severity = str(event.get("severity", "medium")).lower()
        if severity in ["high", "critical"]:
            attacker["high_severity_events"] += 1

        risk_values = {
            "low": 10,
            "medium": 20,
            "high": 35,
            "critical": 50
        }

        attacker["risk_score"] += risk_values.get(severity, 20)

    fingerprints = list(attackers.values())

    for attacker in fingerprints:
        if attacker["risk_score"] > 100:
            attacker["risk_score"] = 100

    save_json("fingerprints.json", {"fingerprints": fingerprints})

    # --------------------------------------------------------
    # ATTACK GRAPH
    # --------------------------------------------------------

    nodes = []
    edges = []
    previous_node = None

    for index, event in enumerate(events):

        event_id = str(event.get("event_id", index))

        node = {
            "id": event_id,
            "label": event.get("event_type", "unknown"),
            "attacker_id": event.get("attacker_id", "UNKNOWN"),
            "host": event.get("host", "UNKNOWN"),
            "severity": event.get("severity", "medium"),
            "timestamp": event.get("timestamp")
        }

        nodes.append(node)

        if previous_node is not None:
            edges.append({
                "id": f"{previous_node}-{event_id}",
                "source": previous_node,
                "target": event_id
            })

        previous_node = event_id

    save_json("attack_graph.json", {"nodes": nodes, "edges": edges})

    # --------------------------------------------------------
    # MITRE ATT&CK MAPPING
    # --------------------------------------------------------

    mitre_rules = {
        "failed_login": {
            "technique_id": "T1110",
            "technique": "Brute Force",
            "tactic": "Credential Access"
        },
        "successful_login": {
            "technique_id": "T1078",
            "technique": "Valid Accounts",
            "tactic": "Initial Access"
        },
        "process_created": {
            "technique_id": "T1059",
            "technique": "Command and Scripting Interpreter",
            "tactic": "Execution"
        },
        "powershell_execution": {
            "technique_id": "T1059.001",
            "technique": "PowerShell",
            "tactic": "Execution"
        },
        "credential_access": {
            "technique_id": "T1003",
            "technique": "OS Credential Dumping",
            "tactic": "Credential Access"
        },
        "privilege_escalation": {
            "technique_id": "T1068",
            "technique": "Exploitation for Privilege Escalation",
            "tactic": "Privilege Escalation"
        },
        "lateral_movement": {
            "technique_id": "T1021",
            "technique": "Remote Services",
            "tactic": "Lateral Movement"
        },
        "data_access": {
            "technique_id": "T1005",
            "technique": "Data from Local System",
            "tactic": "Collection"
        }
    }

    mappings = []

    for event in events:
        event_type = event.get("event_type", "unknown")
        mapping = mitre_rules.get(event_type, {
            "technique_id": "UNKNOWN",
            "technique": "Unknown",
            "tactic": "Unknown"
        })
        mappings.append({**event, "mitre": mapping})

    save_json("mitre_mapping.json", {"mappings": mappings})

    # --------------------------------------------------------
    # AI NEXT-ACTION PREDICTION
    # --------------------------------------------------------

    transitions = {}

    for index in range(len(events) - 1):
        current = events[index].get("event_type", "unknown")
        next_action = events[index + 1].get("event_type", "unknown")

        if current not in transitions:
            transitions[current] = {}

        if next_action not in transitions[current]:
            transitions[current][next_action] = 0

        transitions[current][next_action] += 1

    predictions = []

    for current_action, next_actions in transitions.items():
        if not next_actions:
            continue

        predicted_action = max(next_actions, key=next_actions.get)
        total = sum(next_actions.values())
        count = next_actions[predicted_action]
        confidence = round((count / total) * 100, 2)

        predictions.append({
            "current_action": current_action,
            "predicted_next_action": predicted_action,
            "confidence": confidence
        })

    save_json("prediction.json", {"predictions": predictions})

    # --------------------------------------------------------
    # DECEPTION
    # --------------------------------------------------------

    deception = analyze_events(events)

    return {
        "events": len(events),
        "attackers": len(fingerprints),
        "graph_nodes": len(nodes),
        "graph_edges": len(edges),
        "mitre_events": len(mappings),
        "predictions": len(predictions),
        "deception_events": len(deception)
    }


# ============================================================
# HOME
# ============================================================

@app.get("/")
def home():
    return {
        "system": "ATTACK DNA X",
        "status": "online",
        "version": "1.0.0"
    }


# ============================================================
# HEALTH
# ============================================================

@app.get("/health")
def health():
    return {
        "status": "online",
        "system": "ATTACK DNA X"
    }


# ============================================================
# EVENTS
# ============================================================

@app.get("/events")
def get_events():
    return load_json("events.json")


# ============================================================
# ATTACKER DNA
# ============================================================

@app.get("/attackers")
def get_attackers():
    data = load_json("fingerprints.json")
    return data.get("fingerprints", [])


# ============================================================
# ATTACK GRAPH
# ============================================================

@app.get("/graph")
def get_attack_graph():
    return load_json("attack_graph.json")


# ============================================================
# MITRE ATT&CK
# ============================================================

@app.get("/mitre")
def get_mitre_mapping():
    data = load_json("mitre_mapping.json")
    return data.get("mappings", [])


# ============================================================
# AI PREDICTIONS
# ============================================================

@app.get("/predictions")
def get_predictions():
    data = load_json("prediction.json")
    return data.get("predictions", [])


# ============================================================
# DECEPTION
# ============================================================

@app.get("/deception")
def get_deception():
    events_data = load_json("events.json")
    events = events_data.get("events", [])
    deception = analyze_events(events)
    return {
        "active": len(deception) > 0,
        "events": len(deception),
        "actions": deception
    }


# ============================================================
# WEBSOCKET ENDPOINT
# ============================================================

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)


# ============================================================
# REAL-TIME EVENT INGESTION
# ============================================================

@app.post("/ingest")
async def ingest_event(event: Dict[str, Any]):

    result = collect_event(event)

    if not result["accepted"]:
        raise HTTPException(
            status_code=400,
            detail=result["message"]
        )

    normalized_event = result["event"]

    events_data = load_json("events.json")
    events = events_data.get("events", [])

    new_event_id = normalized_event.get("event_id")

    for existing_event in events:
        if str(existing_event.get("event_id")) == str(new_event_id):
            raise HTTPException(
                status_code=409,
                detail=f"Event ID {new_event_id} already exists"
            )

    events.append(normalized_event)
    save_json("events.json", {"events": events})

    pipeline = regenerate_pipeline()

    deception_result = analyze_event(normalized_event)

    # Broadcast to all connected WebSocket clients
    await manager.broadcast({
        "type": "new_event",
        "event": normalized_event,
        "pipeline": pipeline,
        "deception": deception_result
    })

    return {
        "success": True,
        "message": "Security event ingested successfully",
        "event": normalized_event,
        "deception": deception_result,
        "pipeline": pipeline
    }


# ============================================================
# COMPLETE DASHBOARD API
# ============================================================

@app.get("/dashboard")
def dashboard():

    events_data = load_json("events.json")
    fingerprints_data = load_json("fingerprints.json")
    graph_data = load_json("attack_graph.json")
    mitre_data = load_json("mitre_mapping.json")
    predictions_data = load_json("prediction.json")

    events = events_data.get("events", [])
    attackers = fingerprints_data.get("fingerprints", [])
    nodes = graph_data.get("nodes", [])
    edges = graph_data.get("edges", [])
    mitre = mitre_data.get("mappings", [])
    predictions = predictions_data.get("predictions", [])
    deception = analyze_events(events)

    # Calculate overall Cyber-BLAST alignment across all events (cached for high performance)
    blast_result = get_cached_cyber_blast(events)

    return {
        "system": "ATTACK DNA X",
        "summary": {
            "events": len(events),
            "attackers": len(attackers),
            "graph_nodes": len(nodes),
            "graph_edges": len(edges),
            "mitre_events": len(mitre),
            "predictions": len(predictions),
            "deception_events": len(deception),
            "top_attribution": blast_result.get("top_match", {}).get("name", "Unknown"),
            "attribution_score": blast_result.get("top_match", {}).get("match_percentage", 0)
        },
        "events": events,
        "attackers": attackers,
        "graph": {
            "nodes": nodes,
            "edges": edges,
            "total_nodes": len(nodes),
            "total_edges": len(edges),
            "node_data": nodes,
            "edge_data": edges
        },
        "mitre": mitre,
        "predictions": predictions,
        "deception": {
            "active": len(deception) > 0,
            "events": len(deception),
            "actions": deception
        },
        "blast": blast_result,
        "scenarios": [
            {"id": s["id"], "title": s["title"], "description": s["description"], "danger": s["danger"]}
            for s in SCENARIOS.values()
        ]
    }


# ============================================================
# CYBER-BLAST SEQUENCE ALIGNMENT ENDPOINT
# ============================================================

@app.get("/blast")
def get_cyber_blast(attacker_id: str = None):
    events_data = load_json("events.json")
    all_events = events_data.get("events", [])

    if attacker_id and attacker_id != "ALL":
        target_events = [e for e in all_events if e.get("attacker_id") == attacker_id]
    else:
        target_events = all_events

    blast_analysis = perform_cyber_blast(target_events)
    return {
        "attacker_id": attacker_id or "ALL",
        "analysis": blast_analysis
    }


# ============================================================
# AUTOMATED RULE GENERATOR ENDPOINT (SIGMA / YARA / SNORT)
# ============================================================

@app.get("/rules/{attacker_id}")
def get_attacker_rules(attacker_id: str):
    events_data = load_json("events.json")
    all_events = events_data.get("events", [])
    
    if attacker_id == "ALL":
        target_events = all_events
    else:
        target_events = [e for e in all_events if e.get("attacker_id") == attacker_id]

    if not target_events:
        target_events = all_events[:5] if all_events else []

    rules = generate_rules_bundle(attacker_id, target_events)
    return {
        "attacker_id": attacker_id,
        "rules": rules
    }


# ============================================================
# AI THREAT PATHOLOGIST CLINICAL BRIEFING
# ============================================================

@app.get("/pathologist/{attacker_id}")
def get_pathologist_report(attacker_id: str):
    events_data = load_json("events.json")
    all_events = events_data.get("events", [])

    if attacker_id and attacker_id != "ALL":
        target_events = [e for e in all_events if e.get("attacker_id") == attacker_id]
    else:
        target_events = all_events

    report = generate_pathologist_briefing(attacker_id or "GLOBAL", target_events)
    return report


# ============================================================
# SIMULATION SCENARIO RUNNER
# ============================================================

@app.get("/scenarios")
def list_scenarios():
    return [
        {
            "id": s["id"],
            "title": s["title"],
            "description": s["description"],
            "danger": s["danger"],
            "target": s["target"],
            "event_count": len(s["events"])
        }
        for s in SCENARIOS.values()
    ]


@app.post("/simulate/{scenario_id}")
async def trigger_simulation(scenario_id: str):
    scenario = SCENARIOS.get(scenario_id)
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")

    new_events = get_scenario_events_with_timestamps(scenario_id)
    events_data = load_json("events.json")
    events = events_data.get("events", [])

    # Prepend or append new simulation events
    events.extend(new_events)
    save_json("events.json", {"events": events})

    pipeline = regenerate_pipeline()
    blast_result = perform_cyber_blast(new_events)

    # Broadcast simulation event to active WebSockets
    await manager.broadcast({
        "type": "simulation_trigger",
        "scenario": scenario["title"],
        "new_events_count": len(new_events),
        "pipeline": pipeline,
        "blast": blast_result
    })

    return {
        "success": True,
        "message": f"Simulation scenario '{scenario['title']}' executed successfully",
        "events_added": len(new_events),
        "pipeline": pipeline,
        "blast": blast_result
    }


# ============================================================
# LOG DROPZONE INGESTION (JSON / LOG / TEXT)
# ============================================================

@app.post("/ingest/log")
async def ingest_raw_log(payload: Dict[str, Any]):
    log_text = payload.get("log_text", "")
    attacker_id = payload.get("attacker_id", "ANON-INGEST")

    if not log_text:
        raise HTTPException(status_code=400, detail="Empty log content")

    lines = [line.strip() for line in log_text.splitlines() if line.strip()]
    events_data = load_json("events.json")
    events = events_data.get("events", [])

    added = []

    for idx, line in enumerate(lines[:50]):  # cap at 50 per batch
        event_type = "process_created"
        low = line.lower()
        if "failed" in low or "4625" in low or "denied" in low:
            event_type = "failed_login"
        elif "powershell" in low or "pwsh" in low:
            event_type = "powershell_execution"
        elif "lsass" in low or "mimikatz" in low or "dump" in low:
            event_type = "credential_access"
        elif "escalat" in low or "system" in low or "uac" in low:
            event_type = "privilege_escalation"
        elif "lateral" in low or "smb" in low or "psexec" in low:
            event_type = "lateral_movement"
        elif "login" in low or "4624" in low:
            event_type = "successful_login"

        ev = {
            "event_id": f"INGEST-{abs(hash(line)) % 100000:05d}",
            "attacker_id": attacker_id,
            "event_type": event_type,
            "severity": "HIGH" if "critical" in low or "high" in low else "MEDIUM",
            "source_ip": "10.0.99.12",
            "user": "ingest_user",
            "host": "TARGET-NODE",
            "details": line[:180],
            "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
        }
        events.append(ev)
        added.append(ev)

    save_json("events.json", {"events": events})
    pipeline = regenerate_pipeline()

    await manager.broadcast({
        "type": "log_ingested",
        "count": len(added),
        "pipeline": pipeline
    })

    return {
        "success": True,
        "ingested_count": len(added),
        "pipeline": pipeline
    }


# ============================================================
# STIX 2.1 THREAT INTEL BUNDLE EXPORT
# ============================================================

@app.get("/export/stix/{attacker_id}")
def export_stix(attacker_id: str):
    events_data = load_json("events.json")
    all_events = events_data.get("events", [])
    
    if attacker_id != "ALL":
        target_events = [e for e in all_events if e.get("attacker_id") == attacker_id]
    else:
        target_events = all_events

    blast_result = perform_cyber_blast(target_events)
    bundle = generate_stix_bundle(attacker_id, target_events, blast_result)
    return bundle


# ============================================================
# LIVE HONEYPOT DECEPTION TRIPWIRE ENDPOINT
# ============================================================

@app.api_route("/trap/{trap_type}", methods=["GET", "POST"])
async def trigger_honeypot(trap_type: str, request: Request):
    client_ip = request.client.host if request.client else "127.0.0.1"
    user_agent = request.headers.get("user-agent", "Unknown-Scanner")

    events_data = load_json("events.json")
    events = events_data.get("events", [])

    trap_event = {
        "event_id": f"TRAP-{int(time.time() * 1000) % 100000:05d}",
        "attacker_id": f"PROBE-{client_ip.replace('.', '_')[-8:]}",
        "event_type": "credential_access" if "cred" in trap_type or "admin" in trap_type else "lateral_movement",
        "severity": "CRITICAL",
        "source_ip": client_ip,
        "user": "canary_trap_service",
        "host": "HONEYPOT-DECOY-TRAP",
        "details": f"Honeypot tripwire [{trap_type.upper()}] touched by {client_ip} (UA: {user_agent[:60]})",
        "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    }

    events.append(trap_event)
    save_json("events.json", {"events": events})
    pipeline = regenerate_pipeline()

    # Broadcast live alert to all dashboard WebSockets
    await manager.broadcast({
        "type": "honeytoken_tripped",
        "message": f"🚨 HONEYPOT TRIPPED! Decoy [{trap_type}] accessed from {client_ip}",
        "event": trap_event,
        "pipeline": pipeline
    })

    return {
        "status": "decoy_response",
        "notice": "Authentication challenge failed. Access denied.",
        "simulated_token": f"canary_token_revoked_{trap_type}"
    }


# ============================================================
# SYSTEM DATA RESET TO CLEAN BASELINE
# ============================================================

@app.post("/reset")
async def reset_data():
    sample_scenario = get_scenario_events_with_timestamps("APT29_ESPIONAGE")
    save_json("events.json", {"events": sample_scenario})
    pipeline = regenerate_pipeline()
    blast_result = perform_cyber_blast(sample_scenario)

    await manager.broadcast({
        "type": "system_reset",
        "message": "System restored to clean baseline state",
        "pipeline": pipeline
    })

    return {
        "success": True,
        "message": "System data reset to baseline",
        "pipeline": pipeline
    }


# ============================================================
# AUTONOMOUS AI COPILOT QUERY ENDPOINT
# ============================================================

@app.post("/copilot/query")
def copilot_query(payload: Dict[str, Any]):
    prompt = payload.get("prompt", "")
    attacker_id = payload.get("attacker_id", "ALL")

    events_data = load_json("events.json")
    all_events = events_data.get("events", [])
    
    if attacker_id != "ALL":
        target_events = [e for e in all_events if e.get("attacker_id") == attacker_id]
    else:
        target_events = all_events

    blast_result = perform_cyber_blast(target_events)
    response = query_copilot(prompt, attacker_id, target_events, blast_result)
    return response


# ============================================================
# INTERACTIVE HONEYSHELL CLI EXECUTION
# ============================================================

@app.post("/honeyshell/execute")
async def execute_honeyshell_command(payload: Dict[str, Any]):
    cmd = payload.get("command", "")
    attacker_id = payload.get("attacker_id", "SHELL-INTRUDER")

    if not cmd.strip():
        raise HTTPException(status_code=400, detail="Empty command")

    output, event = process_honeyshell_command(cmd, attacker_id)

    events_data = load_json("events.json")
    events = events_data.get("events", [])
    events.append(event)
    save_json("events.json", {"events": events})

    pipeline = regenerate_pipeline()
    blast_result = perform_cyber_blast(events)

    await manager.broadcast({
        "type": "honeyshell_action",
        "command": cmd,
        "event": event,
        "pipeline": pipeline,
        "blast": blast_result
    })

    return {
        "command": cmd,
        "output": output,
        "event": event,
        "pipeline": pipeline
    }


# ============================================================
# SURGICAL ENTERPRISE IMMUNIZATION PROTOCOL
# ============================================================

@app.post("/immunize")
async def execute_immunization(payload: Dict[str, Any] = None):
    events_data = load_json("events.json")
    events = events_data.get("events", [])

    compromised_hosts = list(set(e.get("host", "ENDPOINT-01") for e in events if e.get("host")))
    compromised_users = list(set(e.get("user", "admin") for e in events if e.get("user")))

    isolation_ledger = [
        {
            "target": host,
            "action": "NETWORK_ISOLATION_EDR_ENGAGED",
            "status": "SEVERED",
            "interface": "eth0 / vEthernet"
        }
        for host in compromised_hosts
    ]

    revocation_ledger = [
        {
            "user": user,
            "action": "KERBEROS_TGT_INVALIDATION",
            "status": "REVOKED",
            "realm": "CORP.ENTERPRISE.LOCAL"
        }
        for user in compromised_users
    ]

    await manager.broadcast({
        "type": "immunization_executed",
        "message": f"SURGICAL IMMUNIZATION COMPLETED: {len(compromised_hosts)} hosts isolated, {len(compromised_users)} tokens revoked.",
        "isolated_hosts": compromised_hosts
    })

    return {
        "success": True,
        "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "isolated_hosts_count": len(compromised_hosts),
        "revoked_tokens_count": len(compromised_users),
        "isolation_ledger": isolation_ledger,
        "revocation_ledger": revocation_ledger
    }

