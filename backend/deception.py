from datetime import datetime


DECEPTION_RULES = {
    "failed_login": {
        "response": "decoy_login_target",
        "message": "Suspicious authentication activity detected"
    },
    "credential_access": {
        "response": "decoy_credentials",
        "message": "Credential access activity detected"
    },
    "powershell_execution": {
        "response": "decoy_powershell_environment",
        "message": "Suspicious PowerShell activity detected"
    },
    "privilege_escalation": {
        "response": "decoy_privileged_resource",
        "message": "Privilege escalation activity detected"
    },
    "lateral_movement": {
        "response": "decoy_network_host",
        "message": "Lateral movement activity detected"
    },
    "data_access": {
        "response": "decoy_data_store",
        "message": "Suspicious data access detected"
    }
}


def analyze_event(event):
    """
    Analyze a synthetic security event and determine
    whether the deception engine should respond.
    """

    event_type = event.get("event_type", "").lower()

    if event_type not in DECEPTION_RULES:
        return {
            "deception_triggered": False,
            "event_type": event_type
        }

    rule = DECEPTION_RULES[event_type]

    return {
        "deception_triggered": True,
        "event_type": event_type,
        "response": rule["response"],
        "message": rule["message"],
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }


def analyze_events(events):
    """
    Analyze a collection of synthetic security events.
    """

    results = []

    for event in events:
        result = analyze_event(event)

        if result["deception_triggered"]:
            result["attacker_id"] = event.get(
                "attacker_id",
                "UNKNOWN"
            )

            results.append(result)

    return results