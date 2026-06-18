from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
import uuid
import json

from database import db
from agents import graph
from ledger import merkle
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="AEAI Prototype API", description="Adversarial Epistemic AI Network Prototype — Phase 2")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow frontend to call backend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database
db.init_db()

class ClaimRequest(BaseModel):
    claim_text: str

class VerificationResponse(BaseModel):
    claim_id: str
    status: str

@app.get("/")
def read_root():
    """Redirects to the Swagger UI for easy API testing."""
    return RedirectResponse(url="/docs")

def _format_transcript(result: dict) -> str:
    """Format the full multi-round, multi-subclaim transcript for storage."""
    sub_claim_results = result.get("sub_claim_results", [])
    
    if not sub_claim_results:
        # Fallback for edge cases
        return f"--- PROSECUTOR ---\n{result.get('prosecutor_attack', '')}\n\n--- DEFENDER ---\n{result.get('defender_defense', '')}\n\n--- ADJUDICATOR ---\n{result.get('reasoning', '')}"
        
    def format_packet(packet_str: str) -> str:
        try:
            parsed = json.loads(packet_str)
            summary = parsed.get("argument_summary", "")
            evidence = parsed.get("evidence_items", [])
            lines = [summary, "\nEvidence:"]
            for e in evidence:
                lines.append(f"  - [{e.get('domain', 'Unknown')}] (Tier {e.get('epistemic_tier', '?')}): {e.get('quote_snippet', '')} | COI: {e.get('coi_flag', False)}")
            return "\n".join(lines)
        except Exception:
            return packet_str
    
    parts = []
    parts.append(f"ORIGINAL CLAIM: {result.get('original_claim', '')}")
    parts.append(f"SUB-CLAIMS: {len(sub_claim_results)}")
    parts.append("=" * 60)
    
    for i, sc in enumerate(sub_claim_results, 1):
        parts.append(f"\n{'='*60}")
        parts.append(f"SUB-CLAIM {i}: {sc.get('sub_claim', '')}")
        parts.append(f"VERDICT: {sc.get('verdict', '')} (confidence: {sc.get('confidence_score', 0):.2f})")
        parts.append(f"ROUNDS USED: {sc.get('rounds_used', 1)}")
        parts.append("-" * 40)
        
        debate_log = sc.get("debate_log", [])
        for rd in debate_log:
            round_num = rd.get("round", "?")
            parts.append(f"\n--- PROSECUTOR (Round {round_num}) ---")
            parts.append(format_packet(rd.get("prosecutor_packet", "{}")))
            parts.append(f"\n--- DEFENDER (Round {round_num}) ---")
            parts.append(format_packet(rd.get("defender_packet", "{}")))
        
        parts.append(f"\n--- ADJUDICATOR ---")
        parts.append(sc.get("reasoning", "(no reasoning)"))
        
        unresolved = sc.get("unresolved_questions", [])
        if unresolved:
            parts.append(f"\nUNRESOLVED QUESTIONS:")
            for q in unresolved:
                parts.append(f"  - {q}")
    
    parts.append(f"\n{'='*60}")
    parts.append(f"AGGREGATE VERDICT: {result.get('verdict', '')} (confidence: {result.get('confidence_score', 0):.2f})")
    
    return "\n".join(parts)

def process_claim_background(claim_id: str, claim_text: str):
    try:
        # Run the multi-agent graph
        print(f"[{claim_id}] Starting Adversarial Validation Cycle for: {claim_text}")
        result = graph.run_avc(claim_text)
        
        verdict = result.get("verdict", "ERROR")
        confidence = result.get("confidence_score", 0.0)
        
        # Format the full transcript
        transcript = _format_transcript(result)
        
        # Serialize sub-claim results as JSON
        sub_claims_json = json.dumps(result.get("sub_claim_results", []), default=str)
        
        # Append to transparency log
        merkle_root = merkle.append_to_log(claim_id, verdict, confidence, transcript)
        print(f"[{claim_id}] Committed to Transparency Log. Root: {merkle_root}")
        
        # Update database
        db.update_claim_verdict(claim_id, verdict, confidence, transcript, sub_claims_json)
        
    except Exception as e:
        print(f"[{claim_id}] Error during processing: {str(e)}")
        db.update_claim_verdict(claim_id, "ERROR", 0.0, str(e))

@app.post("/verify", response_model=VerificationResponse)
def submit_claim(request: ClaimRequest, background_tasks: BackgroundTasks):
    claim_id = str(uuid.uuid4())
    
    # Store initial state
    db.insert_claim(claim_id, request.claim_text)
    
    # Queue background processing
    background_tasks.add_task(process_claim_background, claim_id, request.claim_text)
    
    return VerificationResponse(claim_id=claim_id, status="IN_RESEARCH")

@app.get("/verdict/{claim_id}")
def get_verdict(claim_id: str):
    claim_data = db.get_claim(claim_id)
    if not claim_data:
        raise HTTPException(status_code=404, detail="Claim not found")
        
    response = {
        "claim_id": claim_id,
        "claim_text": claim_data["claim_text"],
        "status": claim_data["status"]
    }
    
    if claim_data["status"] not in ["IN_RESEARCH"]:
        response["verdict"] = claim_data["status"]
        response["confidence_score"] = claim_data["confidence_score"]
        response["transcript"] = claim_data["transcript"]
        
        # Include sub-claim breakdown if available
        if claim_data.get("sub_claims"):
            try:
                response["sub_claims"] = json.loads(claim_data["sub_claims"])
            except (json.JSONDecodeError, TypeError):
                pass
        
        # Get inclusion proof from log
        proof = merkle.get_inclusion_proof(claim_id)
        if proof:
            response["transparency_proof"] = proof
            
    return response

@app.get("/sci")
def get_sci_data():
    """Returns the Source Credibility Index tracking data."""
    try:
        return {"sources": db.get_all_sci()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
