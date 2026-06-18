import requests

# Hardcoded list of peer URLs for the prototype
KNOWN_PEERS = [
    # "http://node2.aeai.network:8000",
    # "http://node3.aeai.network:8000"
]

def broadcast_gossip(claim_id: str, verdict: str, confidence: float, ipfs_cid: str):
    """
    Broadcasts a verified claim to all known peers in the federation.
    """
    payload = {
        "claim_id": claim_id,
        "verdict": verdict,
        "confidence": confidence,
        "ipfs_cid": ipfs_cid,
        "merkle_proof": {"mock": True} # Simplified for prototype
    }
    
    for peer in KNOWN_PEERS:
        try:
            url = f"{peer}/p2p/gossip"
            response = requests.post(url, json=payload, timeout=5)
            print(f"[P2P] Broadcast to {peer} -> Status {response.status_code}")
        except Exception as e:
            print(f"[P2P] Failed to broadcast to {peer}: {e}")

def request_multi_node_consensus(claim_text: str):
    """
    Asks peers to evaluate a claim to reach a Byzantine Fault Tolerant consensus.
    """
    verdicts = []
    for peer in KNOWN_PEERS:
        try:
            url = f"{peer}/p2p/poll"
            response = requests.post(url, json={"claim_text": claim_text}, timeout=30)
            if response.status_code == 200:
                verdicts.append(response.json())
                print(f"[P2P] Peer {peer} returned verdict: {verdicts[-1]['verdict']}")
        except Exception as e:
            print(f"[P2P] Failed to poll peer {peer}: {e}")
            
    return verdicts
