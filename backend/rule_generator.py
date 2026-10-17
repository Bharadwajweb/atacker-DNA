"""
ATTACKER DNA - Automated Genetic Rule Synthesizer
Compiles observed attacker DNA sequences into production-ready
Sigma rules, YARA memory signatures, and Snort network rules.
"""

from datetime import datetime
from typing import List, Dict, Any


def generate_sigma_rule(attacker_id: str, events: List[Dict[str, Any]]) -> str:
    """Generate valid Sigma YAML detection rule from attacker sequence."""
    date_str = datetime.utcnow().strftime("%Y-%m-%d")
    unique_actions = list(set(e.get("event_type", "") for e in events))
    source_ips = list(set(e.get("source_ip", "") for e in events if e.get("source_ip")))
    hosts = list(set(e.get("host", "") for e in events if e.get("host")))

    actions_yaml = "\n".join([f"            - '{act}'" for act in unique_actions[:6]])
    ips_yaml = "\n".join([f"            - '{ip}'" for ip in source_ips[:5]]) if source_ips else "            - '10.0.0.0/8'"

    return f"""title: Attacker DNA Genome Detection - {attacker_id}
id: dna-{abs(hash(attacker_id)) % 1000000:06d}-sec
status: experimental
description: Auto-generated genetic signature for {attacker_id} based on observed cyber TTP codon sequence.
references:
    - https://attack.mitre.org/
author: Attacker DNA Autonomous Synthesis Engine
date: {date_str}
tags:
    - attack.execution
    - attack.credential_access
    - attack.lateral_movement
    - dna.automated_rule
logsource:
    category: process_creation
    product: windows
detection:
    selection_events:
        EventName:
{actions_yaml}
    selection_network:
        SourceIp:
{ips_yaml}
    condition: selection_events and selection_network
falsepositives:
    - Administrative maintenance scripts
    - Scheduled vulnerability scanning appliances
level: high
"""


def generate_yara_rule(attacker_id: str, events: List[Dict[str, Any]]) -> str:
    """Generate YARA memory scanning rule targeting attacker behavioral DNA."""
    rule_name = f"APT_DNA_{attacker_id.replace('-', '_')}"
    unique_actions = list(set(e.get("event_type", "") for e in events))

    strings_block = []
    condition_parts = []

    for idx, act in enumerate(unique_actions[:5], 1):
        str_id = f"$str_{idx}"
        strings_block.append(f'        {str_id} = "{act}" ascii wide nocase')
        condition_parts.append(str_id)

    # Add common commandline artifacts
    strings_block.append('        $cmd_ps = "powershell.exe -enc" ascii wide nocase')
    strings_block.append('        $cmd_wmi = "wmic process call create" ascii wide nocase')
    condition_parts.append("($cmd_ps or $cmd_wmi)")

    strings_str = "\n".join(strings_block)
    condition_str = " and ".join(condition_parts[:4])

    return f"""rule {rule_name} {{
    meta:
        description = "Automated Attacker DNA Memory Fingerprint for {attacker_id}"
        author = "Attacker DNA Engine"
        date = "{datetime.utcnow().strftime('%Y-%m-%d')}"
        severity = "HIGH"
        genome_type = "POLYMORPHIC_TTP_SEQUENCE"

    strings:
{strings_str}

    condition:
        uint16(0) == 0x5A4D and
        filesize < 25MB and
        ({condition_str})
}}"""


def generate_snort_rule(attacker_id: str, events: List[Dict[str, Any]]) -> str:
    """Generate Snort/Suricata network IDS detection rule."""
    sid = 3900000 + (abs(hash(attacker_id)) % 99999)
    return (
        f'alert tcp $HOME_NET any -> $EXTERNAL_NET any '
        f'(msg:"ATTACKER-DNA [Threat Actor {attacker_id} C2 Beaconing Detected]"; '
        f'flow:established,to_server; '
        f'content:"POST"; http_method; '
        f'content:"/api/telemetry"; http_uri; '
        f'classtype:trojan-activity; '
        f'sid:{sid}; rev:1; '
        f'metadata:created_at {datetime.utcnow().strftime("%Y_%m_%d")}, engine AttackerDNA;)'
    )


def generate_rules_bundle(attacker_id: str, events: List[Dict[str, Any]]) -> Dict[str, str]:
    """Generate bundle of all defensive rules for an attacker."""
    return {
        "sigma": generate_sigma_rule(attacker_id, events),
        "yara": generate_yara_rule(attacker_id, events),
        "snort": generate_snort_rule(attacker_id, events)
    }
