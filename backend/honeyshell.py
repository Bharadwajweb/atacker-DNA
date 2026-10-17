"""
ATTACKER DNA - Virtual Honeypot Shell Sandbox Engine
Provides realistic deceptive command execution, simulated command outputs,
and instant DNA codon sequencing for live terminal interaction.
"""

from typing import Dict, Any, Tuple


COMMAND_HANDLERS = {
    "whoami": {
        "event_type": "successful_login",
        "severity": "LOW",
        "output": "corp\\svc_backup_admin\nPrivileges: SeSecurityPrivilege, SeBackupPrivilege, SeRestorePrivilege"
    },
    "ipconfig": {
        "event_type": "process_created",
        "severity": "LOW",
        "output": """Windows IP Configuration

Ethernet adapter vEthernet (Core-Corp):
   IPv4 Address. . . . . . . . . . . : 10.0.1.25
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . : 10.0.1.1
   DNS Servers . . . . . . . . . . . : 10.0.1.10 (DC-PRIMARY)"""
    },
    "net user": {
        "event_type": "process_created",
        "severity": "MEDIUM",
        "output": """User accounts for \\\\DC-PRIMARY

-------------------------------------------------------------------------------
Administrator            Guest                    krbtgt                   
svc_backup_admin         lead_eng_smith           canary_trap_account      
The command completed successfully."""
    },
    "mimikatz": {
        "event_type": "credential_access",
        "severity": "CRITICAL",
        "output": """.#####.   mimikatz 2.2.0 (x64) # release build
.## ^ ##.  "A La Vie, A L'Amour" - (oe.eo)
## / \\ ##  /* * * http://blog.gentilkiwi.com/mimikatz * * */
## \\ / ##  Privilege '20' OK
'## v ##'  Authentication ID: 0;291882
 '#####'   msv :
            * Username : Administrator
            * Domain   : CORP
            * NTLM     : e02c5025450c18e186b40b42c629ec80 [CANARY_TRAP_HASH]"""
    },
    "powershell": {
        "event_type": "powershell_execution",
        "severity": "HIGH",
        "output": "Windows PowerShell\nCopyright (C) Microsoft Corporation. All rights reserved.\nPS C:\\Users\\svc_backup_admin> [AMSI Telemetry Hook Primed]"
    },
    "vssadmin": {
        "event_type": "privilege_escalation",
        "severity": "CRITICAL",
        "output": "vssadmin 1.1 - Volume Shadow Copy Service administrative command-line tool\n(C) Microsoft Corporation. All rights reserved.\n[CRISPR Alert] Deletion of shadow copies blocked by policy filter."
    },
    "ls": {
        "event_type": "data_access",
        "severity": "LOW",
        "output": "Mode                LastWriteTime         Length Name\n----                -------------         ------ ----\nd-----        10/16/2026  09:15 AM                Confidential_Patents\n-a----        10/16/2026  09:30 AM          42010 passkeys_backup.kdbx\n-a----        10/16/2026  09:35 AM         105820 customer_records.csv"
    },
    "dir": {
        "event_type": "data_access",
        "severity": "LOW",
        "output": " Volume in drive C has no label.\n Directory of C:\\Users\\svc_backup_admin\n\n10/16/2026  09:15 AM    <DIR>          Confidential_Patents\n10/16/2026  09:30 AM            42,010 passkeys_backup.kdbx\n10/16/2026  09:35 AM           105,820 customer_records.csv"
    }
}


def process_honeyshell_command(cmd_raw: str, attacker_id: str = "PROBE_SHELL") -> Tuple[str, Dict[str, Any]]:
    """
    Evaluates shell command in honey-sandbox, returns formatted terminal output
    and the corresponding synthetic security event to inject into the DNA pipeline.
    """
    clean_cmd = cmd_raw.strip()
    cmd_lower = clean_cmd.lower()

    matched_handler = None
    for trigger, handler in COMMAND_HANDLERS.items():
        if trigger in cmd_lower:
            matched_handler = handler
            break

    if not matched_handler:
        # Generic shell behavior
        event_type = "process_created"
        severity = "LOW"
        output = f"{clean_cmd}: command executed (PID: 8842, Exit: 0)"
    else:
        event_type = matched_handler["event_type"]
        severity = matched_handler["severity"]
        output = matched_handler["output"]

    event = {
        "event_id": f"SHELL-{abs(hash(clean_cmd)) % 100000:05d}",
        "attacker_id": attacker_id,
        "event_type": event_type,
        "severity": severity,
        "source_ip": "10.0.1.99",
        "user": "svc_backup_admin",
        "host": "DECOY-HONEY-SHELL",
        "details": f"Honeyshell CLI: '{clean_cmd}'",
        "timestamp": "2026-10-16T10:48:00Z"
    }

    return output, event
