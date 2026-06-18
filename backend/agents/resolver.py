import os
from langchain_google_genai import ChatGoogleGenerativeAI
from pydantic import BaseModel, Field
from typing import List

class AxiomExtraction(BaseModel):
    is_atomic: bool = Field(description="Is this claim fundamentally atomic/indivisible, requiring no further breakdown?")
    axioms: List[str] = Field(description="If not atomic, list the fundamental sub-claims/dependencies required to prove it. If atomic, leave empty.")

llm = ChatGoogleGenerativeAI(
    model="gemini-3.5-flash",
    temperature=0,
    api_key=os.environ.get("GEMINI_API_KEY")
)

def resolve_claim_dag(claim_id: str, claim_text: str, max_depth=3, current_depth=0) -> List[str]:
    """
    Recursively breaks down a claim into a DAG of atomic axioms.
    Stores the nodes and edges in the database.
    Returns a list of atomic (leaf) claim IDs.
    """
    from database import db
    import uuid

    # Ensure the claim itself is in the DB
    existing = db.get_claim(claim_id)
    if not existing:
        db.insert_claim(claim_id, claim_text)

    if current_depth >= max_depth:
        return [claim_id]

    prompt = f"""
    You are an Epistemic Dependency Resolver.
    Analyze this claim: "{claim_text}"
    Is it an atomic (Tier 0) fact that cannot be further broken down?
    If not, decompose it into the core atomic assertions that must be true for the whole claim to hold.
    """
    
    try:
        llm_json = llm.with_structured_output(AxiomExtraction)
        result = llm_json.invoke(prompt)
    except Exception as e:
        print(f"[{claim_id}] Resolver LLM Error: {e}")
        return [claim_id]

    if result.is_atomic or not result.axioms:
        return [claim_id]

    atomic_leaves = []
    for axiom_text in result.axioms:
        child_id = str(uuid.uuid4())
        db.insert_claim(child_id, axiom_text)
        db.add_claim_edge(claim_id, child_id)
        
        # Recurse
        leaves = resolve_claim_dag(child_id, axiom_text, max_depth, current_depth + 1)
        atomic_leaves.extend(leaves)

    return list(set(atomic_leaves))

