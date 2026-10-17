"""
ATTACKER DNA - Dynamic Breach Simulation Scenarios
Provides realistic cyber kill-chain event feeds for on-demand
interactive attack simulation and live DNA sequencing.
"""

from datetime import datetime, timedelta
from typing import List, Dict, Any


SCENARIOS = {
    "APT29_ESPIONAGE": {
        "id": "APT29_ESPIONAGE",
        "title": "APT29 (Cozy Bear) Stealth Cloud Espionage",
        "description": "State-sponsored cyber espionage targeting Azure AD tokens, LSASS memory, and silent exfiltration.",
        "danger": "CRITICAL",
        "target": "Defense Contractor Enterprise Infrastructure",
        "attacker_id": "APT-COZY-29",
        "events": [
            {
                "event_id": "SIM-29-01",
                "attacker_id": "APT-COZY-29",
                "event_type": "failed_login",
                "severity": "LOW",
                "source_ip": "185.220.101.5",
                "user": "service_backup",
                "host": "AUTH-SRV-01",
                "details": "Brute force spray detected against Kerberos port 88",
                "time_offset_seconds": 0
            },
            {
                "event_id": "SIM-29-02",
                "attacker_id": "APT-COZY-29",
                "event_type": "successful_login",
                "severity": "MEDIUM",
                "source_ip": "185.220.101.5",
                "user": "service_backup",
                "host": "AUTH-SRV-01",
                "details": "Valid authentication established via compromised service credential",
                "time_offset_seconds": 15
            },
            {
                "event_id": "SIM-29-03",
                "attacker_id": "APT-COZY-29",
                "event_type": "powershell_execution",
                "severity": "HIGH",
                "source_ip": "185.220.101.5",
                "user": "service_backup",
                "host": "AUTH-SRV-01",
                "details": "PowerShell invoked with -NoP -NonI -W Hidden -Enc (Cobalt Strike stager)",
                "time_offset_seconds": 32
            },
            {
                "event_id": "SIM-29-04",
                "attacker_id": "APT-COZY-29",
                "event_type": "privilege_escalation",
                "severity": "CRITICAL",
                "source_ip": "185.220.101.5",
                "user": "SYSTEM",
                "host": "AUTH-SRV-01",
                "details": "SeDebugPrivilege enabled via token impersonation vulnerability",
                "time_offset_seconds": 48
            },
            {
                "event_id": "SIM-29-05",
                "attacker_id": "APT-COZY-29",
                "event_type": "credential_access",
                "severity": "CRITICAL",
                "source_ip": "185.220.101.5",
                "user": "SYSTEM",
                "host": "AUTH-SRV-01",
                "details": "MiniDumpWriteDump called on lsass.exe process handle",
                "time_offset_seconds": 65
            },
            {
                "event_id": "SIM-29-06",
                "attacker_id": "APT-COZY-29",
                "event_type": "lateral_movement",
                "severity": "HIGH",
                "source_ip": "10.0.1.20",
                "user": "SYSTEM",
                "host": "CORP-FINANCE-02",
                "details": "SMB pipe established to remote administration share C$",
                "time_offset_seconds": 82
            },
            {
                "event_id": "SIM-29-07",
                "attacker_id": "APT-COZY-29",
                "event_type": "data_access",
                "severity": "HIGH",
                "source_ip": "10.0.1.20",
                "user": "SYSTEM",
                "host": "CORP-FINANCE-02",
                "details": "Classified strategic financial spreadsheets accessed and encrypted in memory",
                "time_offset_seconds": 105
            }
        ]
    },
    "LOCKBIT_RANSOMWARE": {
        "id": "LOCKBIT_RANSOMWARE",
        "title": "LockBit 3.0 High-Velocity Ransomware Strike",
        "description": "Rapid automated intrusion: Defender termination, Volume Shadow Copy purge, multi-threaded encryptor deployment.",
        "danger": "EMERGENCY",
        "target": "Healthcare Network & Core Database Cluster",
        "attacker_id": "LOCKBIT-3-OP",
        "events": [
            {
                "event_id": "SIM-LB-01",
                "attacker_id": "LOCKBIT-3-OP",
                "event_type": "successful_login",
                "severity": "HIGH",
                "source_ip": "91.240.118.17",
                "user": "domain_admin",
                "host": "DC-PRIMARY",
                "details": "RDP session initiated using stolen enterprise admin credentials",
                "time_offset_seconds": 0
            },
            {
                "event_id": "SIM-LB-02",
                "attacker_id": "LOCKBIT-3-OP",
                "event_type": "privilege_escalation",
                "severity": "CRITICAL",
                "source_ip": "91.240.118.17",
                "user": "domain_admin",
                "host": "DC-PRIMARY",
                "details": "Active Directory Group Policy Object (GPO) modified for domain-wide push",
                "time_offset_seconds": 18
            },
            {
                "event_id": "SIM-LB-03",
                "attacker_id": "LOCKBIT-3-OP",
                "event_type": "powershell_execution",
                "severity": "CRITICAL",
                "source_ip": "91.240.118.17",
                "user": "SYSTEM",
                "host": "DC-PRIMARY",
                "details": "vssadmin delete shadows /all /quiet & bcdedit /set {default} recoveryenabled No",
                "time_offset_seconds": 35
            },
            {
                "event_id": "SIM-LB-04",
                "attacker_id": "LOCKBIT-3-OP",
                "event_type": "process_created",
                "severity": "CRITICAL",
                "source_ip": "91.240.118.17",
                "user": "SYSTEM",
                "host": "MED-RECORD-SRV",
                "details": "LockBit3_payload.exe executed with multi-threading and anti-debugging hooks",
                "time_offset_seconds": 55
            },
            {
                "event_id": "SIM-LB-05",
                "attacker_id": "LOCKBIT-3-OP",
                "event_type": "data_access",
                "severity": "CRITICAL",
                "source_ip": "91.240.118.17",
                "user": "SYSTEM",
                "host": "MED-RECORD-SRV",
                "details": "Mass file rename detected with .lockbit extension",
                "time_offset_seconds": 75
            }
        ]
    },
    "INSIDER_EXFIL": {
        "id": "INSIDER_EXFIL",
        "title": "Disgruntled Privileged Insider Exfiltration",
        "description": "Abuse of legitimate administrative privileges to harvest proprietary IP, disable audit logging, and stage cloud transfer.",
        "danger": "HIGH",
        "target": "Aerospace R&D Patent Repository",
        "attacker_id": "INSIDER-ROGUE-07",
        "events": [
            {
                "event_id": "SIM-IN-01",
                "attacker_id": "INSIDER-ROGUE-07",
                "event_type": "successful_login",
                "severity": "MEDIUM",
                "source_ip": "10.0.4.55",
                "user": "lead_engineer_smith",
                "host": "WORKSTATION-ENG-44",
                "details": "After-hours interactive login (02:47 AM local time)",
                "time_offset_seconds": 0
            },
            {
                "event_id": "SIM-IN-02",
                "attacker_id": "INSIDER-ROGUE-07",
                "event_type": "process_created",
                "severity": "MEDIUM",
                "source_ip": "10.0.4.55",
                "user": "lead_engineer_smith",
                "host": "WORKSTATION-ENG-44",
                "details": "7-Zip command line utility used with AES-256 encryption password flag",
                "time_offset_seconds": 22
            },
            {
                "event_id": "SIM-IN-03",
                "attacker_id": "INSIDER-ROGUE-07",
                "event_type": "data_access",
                "severity": "HIGH",
                "source_ip": "10.0.4.55",
                "user": "lead_engineer_smith",
                "host": "FILE-REPO-PATENTS",
                "details": "Bulk read of 4,200 CAD blueprints and propulsion telemetry files",
                "time_offset_seconds": 45
            },
            {
                "event_id": "SIM-IN-04",
                "attacker_id": "INSIDER-ROGUE-07",
                "event_type": "powershell_execution",
                "severity": "CRITICAL",
                "source_ip": "10.0.4.55",
                "user": "lead_engineer_smith",
                "host": "WORKSTATION-ENG-44",
                "details": "Wevtutil cl Security (Clearing security event audit log)",
                "time_offset_seconds": 70
            }
        ]
    },
    "LAZARUS_HEIST": {
        "id": "LAZARUS_HEIST",
        "title": "Lazarus Group (HIDDEN COBRA) Crypto-Bridge Heist",
        "description": "DPRK state-nexus financial strike using trojanized developer dependencies, memory scraping, and ledger tampering.",
        "danger": "CRITICAL",
        "target": "DeFi Sovereign Node & Cryptographic Key Store",
        "attacker_id": "APT-LAZARUS-38",
        "events": [
            {
                "event_id": "SIM-LZ-01",
                "attacker_id": "APT-LAZARUS-38",
                "event_type": "process_created",
                "severity": "MEDIUM",
                "source_ip": "175.45.178.2",
                "user": "node_deployer",
                "host": "BUILD-SRV-09",
                "details": "Trojanized npm postinstall script spawned hidden bash execution thread",
                "time_offset_seconds": 0
            },
            {
                "event_id": "SIM-LZ-02",
                "attacker_id": "APT-LAZARUS-38",
                "event_type": "powershell_execution",
                "severity": "HIGH",
                "source_ip": "175.45.178.2",
                "user": "node_deployer",
                "host": "BUILD-SRV-09",
                "details": "PowerShell reflective DLL injection loaded custom wiper payload",
                "time_offset_seconds": 18
            },
            {
                "event_id": "SIM-LZ-03",
                "attacker_id": "APT-LAZARUS-38",
                "event_type": "failed_login",
                "severity": "MEDIUM",
                "source_ip": "175.45.178.2",
                "user": "vault_keeper",
                "host": "VAULT-SIGNER-01",
                "details": "Repeated challenge failures on ECDSA hardware security module interface",
                "time_offset_seconds": 35
            },
            {
                "event_id": "SIM-LZ-04",
                "attacker_id": "APT-LAZARUS-38",
                "event_type": "credential_access",
                "severity": "CRITICAL",
                "source_ip": "175.45.178.2",
                "user": "SYSTEM",
                "host": "VAULT-SIGNER-01",
                "details": "Heap inspection extracted decrypted Ed25519 signing keys from memory",
                "time_offset_seconds": 52
            },
            {
                "event_id": "SIM-LZ-05",
                "attacker_id": "APT-LAZARUS-38",
                "event_type": "privilege_escalation",
                "severity": "CRITICAL",
                "source_ip": "175.45.178.2",
                "user": "SYSTEM",
                "host": "VAULT-SIGNER-01",
                "details": "CVE-2024-38077 Windows Remote Desktop Licensing service exploit executed",
                "time_offset_seconds": 68
            },
            {
                "event_id": "SIM-LZ-06",
                "attacker_id": "APT-LAZARUS-38",
                "event_type": "data_access",
                "severity": "HIGH",
                "source_ip": "175.45.178.2",
                "user": "SYSTEM",
                "host": "VAULT-SIGNER-01",
                "details": "Unauthorized cryptographic transaction payload transmitted to external C2 relay",
                "time_offset_seconds": 85
            }
        ]
    }
}


def get_scenario_events_with_timestamps(scenario_id: str) -> List[Dict[str, Any]]:
    """Generate scenario events with fresh real-time timestamps."""
    scenario = SCENARIOS.get(scenario_id)
    if not scenario:
        return []

    base_time = datetime.utcnow()
    prepared = []

    for ev in scenario["events"]:
        event_copy = dict(ev)
        offset = ev.get("time_offset_seconds", 0)
        event_time = base_time + timedelta(seconds=offset)
        event_copy["timestamp"] = event_time.isoformat() + "Z"
        prepared.append(event_copy)

    return prepared
