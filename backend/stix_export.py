"""
ATTACKER DNA - STIX 2.1 Threat Intelligence Bundle Generator
Converts observed attacker genome, TTP codons, and attribution into
standardized STIX 2.1 (OASIS Open) JSON format for MISP, OpenCTI, and SIEM ingestion.
"""

import uuid
from datetime import datetime
from typing import List, Dict, Any


def generate_stix_bundle(attacker_id: str, events: List[Dict[str, Any]], blast_data: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Generate an OASIS STIX 2.1 compliant bundle JSON.
    """
    now_iso = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.000Z")
    bundle_id = f"bundle--{uuid.uuid4()}"

    top_match = blast_data.get("top_match") if blast_data else None
    actor_name = top_match.get("name") if top_match else f"Unidentified Threat Actor [{attacker_id}]"

    objects = []

    # 1. Threat Actor SDO
    threat_actor_id = f"threat-actor--{uuid.uuid4()}"
    objects.append({
        "type": "threat-actor",
        "spec_version": "2.1",
        "id": threat_actor_id,
        "created": now_iso,
        "modified": now_iso,
        "name": actor_name,
        "description": f"Cyber-Genomic behavioral profile derived from {len(events)} observed TTP codons.",
        "threat_actor_types": ["nation-state" if "APT" in actor_name else "cybercrime-syndicate"],
        "confidence": int(top_match.get("match_percentage", 80)) if top_match else 70,
        "external_references": [
            {
                "source_name": "attacker-dna",
                "description": f"Attacker DNA Profiler - ID {attacker_id}"
            }
        ]
    })

    # 2. Indicators & Observed Data SDOs
    unique_actions = list(set(e.get("event_type", "unknown") for e in events))
    for action in unique_actions[:6]:
        indicator_id = f"indicator--{uuid.uuid4()}"
        pattern = f"[process:name = '{action}']"
        objects.append({
            "type": "indicator",
            "spec_version": "2.1",
            "id": indicator_id,
            "created": now_iso,
            "modified": now_iso,
            "name": f"Behavioral Codon: {action}",
            "pattern": pattern,
            "pattern_type": "stix",
            "valid_from": now_iso,
            "indicator_types": ["malicious-activity"]
        })

        # Relationship SDO (threat-actor -> uses -> indicator)
        objects.append({
            "type": "relationship",
            "spec_version": "2.1",
            "id": f"relationship--{uuid.uuid4()}",
            "created": now_iso,
            "modified": now_iso,
            "relationship_type": "indicates",
            "source_ref": indicator_id,
            "target_ref": threat_actor_id
        })

    # 3. Target Identity SDO (Victim Organization)
    identity_id = f"identity--{uuid.uuid4()}"
    objects.append({
        "type": "identity",
        "spec_version": "2.1",
        "id": identity_id,
        "created": now_iso,
        "modified": now_iso,
        "name": "Target Enterprise Infrastructure",
        "identity_class": "organization"
    })

    return {
        "type": "bundle",
        "id": bundle_id,
        "objects": objects
    }
