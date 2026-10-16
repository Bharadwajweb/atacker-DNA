import json
from pathlib import Path
from collections import Counter


def load_events():
    project_root = Path(__file__).resolve().parent.parent
    events_file = project_root / "data" / "events.json"

    with open(events_file, "r", encoding="utf-8") as file:
        data = json.load(file)

    return data["events"]


def build_fingerprint(events):

    attackers = {}

    for event in events:

        attacker_id = event["attacker_id"]

        if attacker_id not in attackers:
            attackers[attacker_id] = []

        attackers[attacker_id].append(event)

    fingerprints = []

    for attacker_id, attacker_events in attackers.items():

        event_types = [
            event["event_type"]
            for event in attacker_events
        ]

        source_ips = [
            event["source_ip"]
            for event in attacker_events
        ]

        users = [
            event["user"]
            for event in attacker_events
        ]

        hosts = [
            event["host"]
            for event in attacker_events
        ]

        severities = [
            event["severity"]
            for event in attacker_events
        ]

        event_counter = Counter(event_types)

        fingerprint = {
            "attacker_id": attacker_id,

            "total_events": len(attacker_events),

            "event_types": dict(event_counter),

            "most_common_action": (
                event_counter.most_common(1)[0][0]
                if event_counter
                else None
            ),

            "source_ips": list(set(source_ips)),

            "users_targeted": list(set(users)),

            "hosts_targeted": list(set(hosts)),

            "severity_profile": dict(
                Counter(severities)
            ),

            "behavioral_sequence": event_types,

            "risk_score": calculate_risk_score(
                attacker_events
            ),
        }

        fingerprints.append(fingerprint)

    return fingerprints


def calculate_risk_score(events):

    score = 0

    weights = {
        "failed_login": 1,
        "successful_login": 2,
        "process_created": 2,
        "powershell_execution": 3,
        "file_access": 2,
        "network_connection": 2,
        "credential_access": 5,
        "privilege_escalation": 5,
        "lateral_movement": 5,
        "data_access": 4,
    }

    for event in events:
        score += weights.get(
            event["event_type"],
            1
        )

    return min(score, 100)


def save_fingerprints(fingerprints):

    project_root = Path(__file__).resolve().parent.parent

    output_file = (
        project_root
        / "data"
        / "fingerprints.json"
    )

    with open(
        output_file,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            {
                "fingerprints": fingerprints
            },
            file,
            indent=4
        )

    print(
        f"Saved fingerprints to: {output_file}"
    )


if __name__ == "__main__":

    events = load_events()

    fingerprints = build_fingerprint(events)

    save_fingerprints(fingerprints)

    print()
    print("=" * 50)
    print("ATTACKER DNA ANALYSIS")
    print("=" * 50)

    for fingerprint in fingerprints:

        print()
        print(
            f"Attacker: "
            f"{fingerprint['attacker_id']}"
        )

        print(
            f"Events: "
            f"{fingerprint['total_events']}"
        )

        print(
            f"Main Action: "
            f"{fingerprint['most_common_action']}"
        )

        print(
            f"Risk Score: "
            f"{fingerprint['risk_score']}/100"
        )

        print(
            f"Hosts: "
            f"{', '.join(fingerprint['hosts_targeted'])}"
        )