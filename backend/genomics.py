"""
ATTACKER DNA - Cyber-Genomics & BLAST Alignment Engine
Aligns observed cyber threat telemetry against known APT threat actor genomes
using the Smith-Waterman local sequence alignment algorithm.
"""

from typing import List, Dict, Any, Tuple
from collections import Counter


# ============================================================
# APT THREAT ACTOR GENOMIC PROFILES
# Standardized TTP sequences representing adversary DNA
# ============================================================

APT_GENOMES = {
    "APT29_COZY_BEAR": {
        "name": "APT29 (Cozy Bear / SVR)",
        "origin": "Russian Federation",
        "primary_objective": "Espionage & Intelligence Gathering",
        "motus_operandi": "Stealthy credential harvesting, Living-off-the-Land, cloud infrastructure abuse",
        "genome_sequence": [
            "failed_login",
            "successful_login",
            "powershell_execution",
            "privilege_escalation",
            "credential_access",
            "lateral_movement",
            "data_access"
        ],
        "signature_codon": "PS_TOKEN_LSASS",
        "danger_level": "CRITICAL"
    },
    "APT28_FANCY_BEAR": {
        "name": "APT28 (Fancy Bear / GRU)",
        "origin": "Russian Federation",
        "primary_objective": "Military & Political Disruption",
        "motus_operandi": "Zero-day exploitation, credential scraping, rapid lateral movement, X-Agent C2",
        "genome_sequence": [
            "failed_login",
            "process_created",
            "powershell_execution",
            "credential_access",
            "lateral_movement",
            "data_access"
        ],
        "signature_codon": "EXPLOIT_XAGENT",
        "danger_level": "CRITICAL"
    },
    "LOCKBIT_3_CARTEL": {
        "name": "LockBit 3.0 (Black)",
        "origin": "Transnational Cybercrime Syndicate",
        "primary_objective": "Extortion & Double-Extortion Ransomware",
        "motus_operandi": "High-velocity defense evasion, service termination, volume shadow copy wipe, multi-threaded encryption",
        "genome_sequence": [
            "successful_login",
            "privilege_escalation",
            "powershell_execution",
            "process_created",
            "data_access",
            "lateral_movement"
        ],
        "signature_codon": "SHADOW_TERMINATE_ENCRYPT",
        "danger_level": "EMERGENCY"
    },
    "LAZARUS_GROUP": {
        "name": "Lazarus Group (HIDDEN COBRA)",
        "origin": "Democratic People's Republic of Korea",
        "primary_objective": "Financial Espionage & Cryptocurrency Theft",
        "motus_operandi": "Social engineering, trojanized applications, crypto-wallet memory scraping, custom wiper payloads",
        "genome_sequence": [
            "process_created",
            "powershell_execution",
            "failed_login",
            "credential_access",
            "privilege_escalation",
            "data_access"
        ],
        "signature_codon": "CRYPTO_MEMORY_WIPER",
        "danger_level": "CRITICAL"
    },
    "FIN7_CARBANAK": {
        "name": "FIN7 (Carbanak / Sangria)",
        "origin": "Financially Motivated Syndicate",
        "primary_objective": "Point-of-Sale (POS) & Payment Processor Fraud",
        "motus_operandi": "Obfuscated PowerShell stagers, memory scraping, carbanak backdoor, long dwell time",
        "genome_sequence": [
            "failed_login",
            "successful_login",
            "process_created",
            "powershell_execution",
            "credential_access",
            "data_access"
        ],
        "signature_codon": "POS_MEMORY_BACKDOOR",
        "danger_level": "HIGH"
    }
}


# ============================================================
# CODON TRANSLATION TABLE (Cyber Nucleotides -> Functional Codons)
# ============================================================

EVENT_TO_BASE = {
    "failed_login": "F",
    "successful_login": "S",
    "process_created": "P",
    "powershell_execution": "X",
    "credential_access": "C",
    "privilege_escalation": "E",
    "lateral_movement": "L",
    "data_access": "D",
    "network_connection": "N",
    "file_access": "A"
}

BASE_TO_EVENT = {v: k for k, v in EVENT_TO_BASE.items()}


def sequence_to_bases(sequence: List[str]) -> str:
    """Translate high-level event sequence into a compact genomic base string."""
    return "".join(EVENT_TO_BASE.get(evt, "?") for evt in sequence)


# ============================================================
# SMITH-WATERMAN LOCAL ALIGNMENT ALGORITHM
# Calculates optimal local genomic alignment between two sequences
# ============================================================

def smith_waterman(
    seq1: List[str],
    seq2: List[str],
    match_score: int = 3,
    mismatch_penalty: int = -2,
    gap_penalty: int = -2
) -> Dict[str, Any]:
    """
    Perform biological local sequence alignment (Smith-Waterman).
    seq1: observed live sequence
    seq2: reference threat actor sequence
    """
    n, m = len(seq1), len(seq2)
    if n == 0 or m == 0:
        return {
            "score": 0,
            "match_ratio": 0.0,
            "aligned_seq1": [],
            "aligned_seq2": [],
            "mutations": []
        }

    # Initialize scoring matrix and traceback matrix
    H = [[0] * (m + 1) for _ in range(n + 1)]
    trace = [[0] * (m + 1) for _ in range(n + 1)]

    max_score = 0
    max_pos = (0, 0)

    # Fill matrix
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            is_match = (seq1[i - 1] == seq2[j - 1])
            score_diag = H[i - 1][j - 1] + (match_score if is_match else mismatch_penalty)
            score_up = H[i - 1][j] + gap_penalty
            score_left = H[i][j - 1] + gap_penalty

            cell_val = max(0, score_diag, score_up, score_left)
            H[i][j] = cell_val

            if cell_val == score_diag and cell_val > 0:
                trace[i][j] = 1  # Diagonal
            elif cell_val == score_up and cell_val > 0:
                trace[i][j] = 2  # Up (deletion in seq2)
            elif cell_val == score_left and cell_val > 0:
                trace[i][j] = 3  # Left (insertion in seq2)

            if cell_val > max_score:
                max_score = cell_val
                max_pos = (i, j)

    # Traceback
    align1 = []
    align2 = []
    mutations = []

    curr_i, curr_j = max_pos
    while curr_i > 0 and curr_j > 0 and H[curr_i][curr_j] > 0:
        step = trace[curr_i][curr_j]
        if step == 1:
            val1 = seq1[curr_i - 1]
            val2 = seq2[curr_j - 1]
            align1.append(val1)
            align2.append(val2)
            if val1 != val2:
                mutations.append({
                    "position": curr_i - 1,
                    "observed": val1,
                    "expected": val2,
                    "type": "MUTATION_SUBSTITUTION"
                })
            curr_i -= 1
            curr_j -= 1
        elif step == 2:
            val1 = seq1[curr_i - 1]
            align1.append(val1)
            align2.append("— GAP —")
            mutations.append({
                "position": curr_i - 1,
                "observed": val1,
                "expected": None,
                "type": "INSERTION_NOVEL_TACTIC"
            })
            curr_i -= 1
        elif step == 3:
            val2 = seq2[curr_j - 1]
            align1.append("— GAP —")
            align2.append(val2)
            mutations.append({
                "position": curr_i,
                "observed": None,
                "expected": val2,
                "type": "DELETION_EVADED_TACTIC"
            })
            curr_j -= 1
        else:
            break

    align1.reverse()
    align2.reverse()

    # Calculate normalized match percentage
    max_possible_score = max(n, m) * match_score
    match_ratio = round((max_score / max_possible_score) * 100, 1) if max_possible_score > 0 else 0.0
    match_ratio = min(match_ratio, 99.4)  # Natural biological ceiling

    return {
        "score": max_score,
        "match_percentage": match_ratio,
        "aligned_observed": align1,
        "aligned_reference": align2,
        "mutations": mutations
    }


# ============================================================
# CYBER-BLAST MATCHING CONTROLLER
# ============================================================

def perform_cyber_blast(observed_events: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Takes an array of security events for an attacker and performs BLAST alignment
    against all known threat actor genomes in the database.
    """
    if not observed_events:
        return {
            "top_match": None,
            "rankings": [],
            "observed_genome_string": "",
            "unique_codons": 0
        }

    # Sort events by timestamp
    sorted_events = sorted(observed_events, key=lambda x: x.get("timestamp", ""))
    observed_seq = [e.get("event_type", "") for e in sorted_events]
    observed_genome_string = sequence_to_bases(observed_seq)

    rankings = []

    for apt_id, apt_meta in APT_GENOMES.items():
        ref_seq = apt_meta["genome_sequence"]
        alignment = smith_waterman(observed_seq, ref_seq)

        rankings.append({
            "apt_id": apt_id,
            "name": apt_meta["name"],
            "origin": apt_meta["origin"],
            "primary_objective": apt_meta["primary_objective"],
            "motus_operandi": apt_meta["motus_operandi"],
            "danger_level": apt_meta["danger_level"],
            "signature_codon": apt_meta["signature_codon"],
            "reference_genome_string": sequence_to_bases(ref_seq),
            "match_percentage": alignment["match_percentage"],
            "alignment_score": alignment["score"],
            "aligned_observed": alignment["aligned_observed"],
            "aligned_reference": alignment["aligned_reference"],
            "mutations": alignment["mutations"]
        })

    # Sort by match percentage descending
    rankings.sort(key=lambda x: x["match_percentage"], reverse=True)

    return {
        "top_match": rankings[0] if rankings else None,
        "rankings": rankings,
        "observed_genome_string": observed_genome_string,
        "total_observed_bases": len(observed_seq),
        "unique_codons": len(set(observed_seq))
    }
