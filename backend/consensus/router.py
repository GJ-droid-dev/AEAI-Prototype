from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import db
from ledger import merkle
import json

router = APIRouter(prefix="/p2p", tags=["p2p"])

class GossipPayload(BaseModel):
    claim_id: str
    verdict: str
    confidence: float
    ipfs_cid: str
    merkle_proof: dict

@router.post("/gossip")
def receive_gossip(payload: GossipPayload):
    """
    Endpoint for receiving verified claims from other nodes in the AEAI Federation.
    """
    # In a real system, we would verify the merkle_proof against the global state root
    # and fetch the IPFS CID to validate the evidence.
    
    # Store the federated consensus
    db.update_claim_verdict(
        claim_id=payload.claim_id,
        verdict=payload.verdict,
        confidence_score=payload.confidence,
        transcript=f"Received via P2P Federation. Evidence CID: {payload.ipfs_cid}",
        sub_claims="[]"
    )
    
    return {"status": "accepted"}

class PollRequest(BaseModel):
    claim_text: str

@router.post("/poll")
def poll_adjudicator(request: PollRequest):
    """
    Endpoint where a peer asks THIS node to independently run its Adversarial Validation Cycle
    on a claim and return our verdict, for multi-node consensus.
    """
    from agents.graph import run_avc
    try:
        # We run our own local AVC to verify the claim
        result = run_avc(request.claim_text)
        return {
            "verdict": result.get("verdict", "ERROR"),
            "confidence": result.get("confidence_score", 0.0),
            "reasoning": result.get("reasoning", "")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
