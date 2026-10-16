import json
from pathlib import Path


MITRE_MAPPING = {

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


def load_events():

    project_root = Path(__file__).resolve().parent.parent

    events_file = (
        project_root
        / "data"
        / "events.json"
    )

    with open(
        events_file,
        "r",
        encoding="utf-8"
    ) as file:

        data = json.load(file)

    return data["events"]


def map_events(events):

    mapped_events = []

    for event in events:

        event_type = event["event_type"]

        mapping = MITRE_MAPPING.get(
            event_type
        )

        if mapping:

            mapped_event = {
                "event_id": event["event_id"],
                "attacker_id": event["attacker_id"],
                "timestamp": event["timestamp"],
                "event_type": event_type,
                "source_ip": event["source_ip"],
                "host": event["host"],
                "severity": event["severity"],
                "mitre": mapping
            }

            mapped_events.append(
                mapped_event
            )

    return mapped_events


def save_mitre_data(mapped_events):

    project_root = Path(__file__).resolve().parent.parent

    output_file = (
        project_root
        / "data"
        / "mitre_mapping.json"
    )

    with open(
        output_file,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            {
                "mappings": mapped_events
            },
            file,
            indent=4
        )

    print(
        f"Saved MITRE mapping to: {output_file}"
    )


if __name__ == "__main__":

    events = load_events()

    mapped_events = map_events(events)

    save_mitre_data(mapped_events)

    print()
    print("=" * 55)
    print("MITRE ATT&CK ANALYSIS")
    print("=" * 55)

    print(
        f"Events mapped: {len(mapped_events)}"
    )

    print()

    for event in mapped_events[:15]:

        mitre = event["mitre"]

        print(
            f"{event['attacker_id']} | "
            f"{event['event_type']} | "
            f"{mitre['technique_id']} | "
            f"{mitre['technique']}"
        )