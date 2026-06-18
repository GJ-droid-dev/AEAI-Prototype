from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
import uuid
import json
from dotenv import load_dotenv
import os
load_dotenv()
if "GEMINI_API_KEY" in os.environ:
    os.environ["GOOGLE_API_KEY"] = os.environ["GEMINI_API_KEY"]

from database import db
from agents import graph
from ledger import merkle
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="AEAI Claim Verification API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from consensus.router import router as consensus_router
app.include_router(consensus_router)

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
    from agents.resolver import resolve_claim_dag
    try:
        print(f"[{claim_id}] Starting Epistemic Dependency Resolution for: {claim_text}")
        
        # 1. Resolve DAG down to atomic leaves
        leaf_ids = resolve_claim_dag(claim_id, claim_text)
        print(f"[{claim_id}] Decomposed into {len(leaf_ids)} atomic sub-claims.")
        
        sub_claim_results = []
        confidences = []
        verdicts = []
        
        # 2. Run AVC on each atomic leaf
        for leaf_id in leaf_ids:
            leaf_claim = db.get_claim(leaf_id)
            leaf_text = leaf_claim["claim_text"]
            
            print(f"[{claim_id}] Running AVC on leaf: {leaf_text}")
            result = graph.run_avc(leaf_text)
            
            sub_result = {
                "sub_claim": result["claim"],
                "verdict": result["verdict"],
                "confidence_score": result["confidence_score"],
                "reasoning": result["reasoning"],
                "rounds_used": result.get("rounds_used", 1),
                "unresolved_questions": result.get("unresolved_questions", []),
                "debate_log": [
                     {
                         "round": i + 1,
                         "prosecutor_packet": result["prior_attacks"][i] if i < len(result.get("prior_attacks", [])) else "{}",
                         "defender_packet": result["prior_defenses"][i] if i < len(result.get("prior_defenses", [])) else "{}"
                     }
                     for i in range(result.get("rounds_used", 1))
                ]
            }
            sub_claim_results.append(sub_result)
            confidences.append(result["confidence_score"])
            verdicts.append(result["verdict"])
            
        # 3. Aggregate
        if not sub_claim_results:
             final_verdict = "ERROR"
             final_confidence = 0.0
        elif "ERROR" in verdicts:
             final_verdict = "ERROR"
        elif "DISPUTED" in verdicts:
             final_verdict = "DISPUTED"
        elif "REFUTED" in verdicts:
             final_verdict = "REFUTED"
        else:
             final_verdict = "VERIFIED"
             
        final_confidence = min(confidences) if confidences else 0.0
        
        reasoning_parts = []
        for r in sub_claim_results:
            reasoning_parts.append(
                f"Sub-claim: \"{r['sub_claim']}\"\n"
                f"  Verdict: {r['verdict']} (confidence: {r['confidence_score']:.2f}, rounds: {r['rounds_used']})\n"
                f"  Reasoning: {r['reasoning']}"
            )
        aggregate_reasoning = (
            f"AGGREGATE VERDICT: {final_verdict} (confidence: {final_confidence:.2f})\n"
            f"Based on {len(sub_claim_results)} atomic axiom(s):\n\n"
            + "\n\n".join(reasoning_parts)
        )
        
        from langchain_google_genai import ChatGoogleGenerativeAI
        from langchain_core.messages import HumanMessage
        llm_json = ChatGoogleGenerativeAI(model="gemini-3.5-flash", temperature=0, model_kwargs={"response_mime_type": "application/json"})
        synth_prompt = f"""You are the final synthesizer.
The original claim was: "{claim_text}"
Here are the results of the adversarial validation cycle for the axioms:
{aggregate_reasoning}

Based on these results, please provide a JSON object with three fields:
1. "corrected_claim": A concise, modified version of the original claim that is factually accurate based on the research.
2. "concise_reasoning": An articulated, brief, and clear reason for this corrected claim based on the research.
3. "unresolved_questions": A list of any unresolved questions or nuances.
"""
        try:
            response = llm_json.invoke([HumanMessage(content=synth_prompt)])
            parsed = json.loads(response.content)
            corrected_claim = parsed.get("corrected_claim", claim_text)
            concise_reasoning = parsed.get("concise_reasoning", "")
            overall_unresolved = parsed.get("unresolved_questions", [])
        except Exception as e:
            corrected_claim = claim_text
            concise_reasoning = "Failed to synthesize final verdict."
            overall_unresolved = []

        sub_claims_json = json.dumps({
            "sub_claims": sub_claim_results,
            "corrected_claim": corrected_claim,
            "concise_reasoning": concise_reasoning,
            "unresolved_questions": overall_unresolved if isinstance(overall_unresolved, list) else []
        }, default=str)
        
        transcript = aggregate_reasoning
        
        # Upload evidence bundle to IPFS
        evidence_bundle = {
            "claim_id": claim_id,
            "claim_text": claim_text,
            "verdict": final_verdict,
            "confidence": final_confidence,
            "sub_claims": sub_claim_results,
            "corrected_claim": corrected_claim,
            "reasoning": concise_reasoning
        }
        from ledger.ipfs import pin_json_to_ipfs
        ipfs_cid = pin_json_to_ipfs(evidence_bundle)
        print(f"[{claim_id}] IPFS Evidence CID: {ipfs_cid}")
        
        # Append to transparency log
        merkle_root = merkle.append_to_log(claim_id, final_verdict, final_confidence, transcript, ipfs_cid=ipfs_cid)
        print(f"[{claim_id}] Committed to Transparency Log. Root: {merkle_root}")
        
        # Update database
        db.update_claim_verdict(claim_id, final_verdict, final_confidence, transcript, sub_claims_json)
        
        # P2P Federation Broadcast
        from consensus.peer import broadcast_gossip
        print(f"[{claim_id}] Broadcasting verification to P2P Federation...")
        broadcast_gossip(claim_id, final_verdict, final_confidence, ipfs_cid)
        
    except Exception as e:
        print(f"[{claim_id}] Error during processing: {str(e)}")
        import traceback
        traceback.print_exc()
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
                parsed = json.loads(claim_data["sub_claims"])
                if isinstance(parsed, list):
                    response["sub_claims"] = parsed
                else:
                    response["sub_claims"] = parsed.get("sub_claims", [])
                    response["corrected_claim"] = parsed.get("corrected_claim", "")
                    response["concise_reasoning"] = parsed.get("concise_reasoning", "")
                    response["unresolved_questions"] = parsed.get("unresolved_questions", [])
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

@app.get("/entities")
def get_entities_data():
    """Returns the Entity Bias Engine tracking data."""
    try:
        return {"entities": db.get_all_entities()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
