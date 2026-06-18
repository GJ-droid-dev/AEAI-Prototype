import hashlib
import json
import os
from datetime import datetime

LOG_PATH = os.path.join(os.path.dirname(__file__), "transparency_log.json")

def _load_log():
    if not os.path.exists(LOG_PATH):
        return []
    with open(LOG_PATH, "r", encoding="utf-8") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return []

def _save_log(log_data):
    with open(LOG_PATH, "w", encoding="utf-8") as f:
        json.dump(log_data, f, indent=2, ensure_ascii=False)

def hash_payload(payload: dict) -> str:
    # Sort keys to ensure deterministic hashing
    payload_str = json.dumps(payload, sort_keys=True)
    return hashlib.sha256(payload_str.encode("utf-8")).hexdigest()

def append_to_log(claim_id: str, verdict: str, confidence: float, transcript: str, ipfs_cid: str = None):
    log_data = _load_log()
    
    # Previous hash
    prev_hash = "GENESIS"
    if log_data:
        prev_hash = log_data[-1]["hash"]
        
    payload = {
        "claim_id": claim_id,
        "verdict": verdict,
        "confidence": confidence,
        "transcript_hash": hash_payload({"transcript": transcript}),
        "ipfs_cid": ipfs_cid,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    # Hash the payload + previous hash to simulate a chain
    current_hash = hash_payload({
        "prev_hash": prev_hash,
        "payload": payload
    })
    
    entry = {
        "hash": current_hash,
        "prev_hash": prev_hash,
        "payload": payload
    }
    
    log_data.append(entry)
    _save_log(log_data)
    
    return current_hash

def get_inclusion_proof(claim_id: str):
    log_data = _load_log()
    for i, entry in enumerate(log_data):
        if entry["payload"]["claim_id"] == claim_id:
            # Simple proof: return the entry and its index.
            # In a real Merkle tree, this would return the branch hashes.
            return {
                "index": i,
                "entry_hash": entry["hash"],
                "prev_hash": entry["prev_hash"]
            }
    return None
