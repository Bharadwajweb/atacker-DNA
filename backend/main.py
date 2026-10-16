from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

import json
import asyncio
from pathlib import Path
from typing import Dict, Any

from collector import collect_event
from deception import analyze_event, analyze_events


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
# JSON HELPERS
# ============================================================

def load_json(filename: str):
    file_path = DATA_DIR / filename

    if not file_path.exists():
        return {}

    try:
        with open(file_path, "r", encoding="utf-8") as file:
            return json.load(file)

    except Exception as e:
        print(f"Error loading {filename}: {e}")
        return {}


def save_json(filename: str, data):
    DATA_DIR.mkdir(parents=True, exist_ok=True)

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

    return {
        "system": "ATTACK DNA X",
        "summary": {
            "events": len(events),
            "attackers": len(attackers),
            "graph_nodes": len(nodes),
            "graph_edges": len(edges),
            "mitre_events": len(mitre),
            "predictions": len(predictions),
            "deception_events": len(deception)
        },
        "events": events,
        "attackers": attackers,
        "graph": {
            "nodes": len(nodes),
            "edges": len(edges),
            "node_data": nodes,
            "edge_data": edges
        },
        "mitre": mitre,
        "predictions": predictions,
        "deception": {
            "active": len(deception) > 0,
            "events": len(deception),
            "actions": deception
        }
    }