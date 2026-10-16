from datetime import datetime
from typing import Dict, Any


# ============================================================
# REQUIRED SECURITY EVENT FIELDS
# ============================================================

REQUIRED_FIELDS = [
    "event_id",
    "attacker_id",
    "event_type",
    "source_ip",
    "host",
    "severity",
]


# ============================================================
# VALIDATE EVENT
# ============================================================

def validate_event(event: Dict[str, Any]) -> bool:

    for field in REQUIRED_FIELDS:

        if field not in event:
            return False

    return True


# ============================================================
# NORMALIZE EVENT
# ============================================================

def normalize_event(
    event: Dict[str, Any]
) -> Dict[str, Any]:

    normalized = {

        "event_id": event.get(
            "event_id"
        ),

        "attacker_id": event.get(
            "attacker_id",
            "UNKNOWN"
        ),

        "timestamp": event.get(
            "timestamp",
            datetime.utcnow().isoformat()
        ),

        "event_type": str(
            event.get(
                "event_type",
                "unknown"
            )
        ).lower(),

        "source_ip": event.get(
            "source_ip",
            "0.0.0.0"
        ),

        "host": event.get(
            "host",
            "UNKNOWN"
        ),

        "severity": str(
            event.get(
                "severity",
                "medium"
            )
        ).lower()
    }

    return normalized


# ============================================================
# COLLECT EVENT
# ============================================================

def collect_event(
    event: Dict[str, Any]
) -> Dict[str, Any]:

    # Validate incoming event

    if not validate_event(event):

        return {

            "accepted": False,

            "message": "Invalid security event",

            "event": event
        }

    # Normalize event

    normalized = normalize_event(
        event
    )

    return {

        "accepted": True,

        "message": "Security event collected successfully",

        "event": normalized
    }