import os
import json
from typing import Dict, TypedDict, Annotated, Sequence, List, Optional
from langchain_core.messages import BaseMessage, HumanMessage, SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph import StateGraph, END
import requests
from .prompts import (
    DECOMPOSITION_PROMPT,
    PROSECUTOR_PROMPT,
    DEFENDER_PROMPT,
    ADJUDICATOR_PROMPT,
)
from database import db

# --- Constants ---
MAX_ROUNDS = 3
CONFIDENCE_THRESHOLD = 0.7
SEARCH_RESULTS_PER_QUERY = 10

# --- State Definition ---
class AgentState(TypedDict):
    # Original claim
    original_claim: str
    # Decomposed sub-claims
    sub_claims: List[str]
    current_sub_claim_index: int
    sub_claim_results: List[dict]
    # Current AVC round state
    claim: str  # The active sub-claim being debated
    round: int
    max_rounds: int
    prosecutor_attack: str # Now stores JSON string
    defender_defense: str # Now stores JSON string
    prior_attacks: List[str] # List of JSON strings
    prior_defenses: List[str] # List of JSON strings
    # Verdict
    verdict: str
    confidence_score: float
    reasoning: str
    unresolved_questions: List[str]

# --- LLM Instances ---
llm = ChatGoogleGenerativeAI(model="gemini-3.5-flash", temperature=0)
llm_json = ChatGoogleGenerativeAI(
    model="gemini-3.5-flash",
    temperature=0,
    model_kwargs={"response_mime_type": "application/json"},
)

# --- Helpers ---
def extract_text(content) -> str:
    """Helper to extract text from LangChain response.content which might be a list or a string."""
    if isinstance(content, str):
        return content
    elif isinstance(content, list):
        return "".join(
            [c.get("text", "") for c in content if isinstance(c, dict) and "text" in c]
        )
    return str(content)


def search_tool(query: str) -> str:
    """Simple wrapper for Serper.dev search API to be used by agents."""
    api_key = os.environ.get("SERPER_API_KEY")
    if not api_key:
        return "Search error: SERPER_API_KEY environment variable not set."

    url = "https://google.serper.dev/search"
    payload = json.dumps({"q": query, "num": SEARCH_RESULTS_PER_QUERY})
    headers = {"X-API-KEY": api_key, "Content-Type": "application/json"}

    try:
        response = requests.request("POST", url, headers=headers, data=payload)
        response.raise_for_status()
        results = response.json().get("organic", [])
        if not results:
            return "No results found."

        return "\n".join(
            [
                f"- [{r.get('title', 'Untitled')}]({r.get('link', '')}): {r.get('snippet', '')}"
                for r in results
            ]
        )
    except Exception as e:
        return f"Search error: {str(e)}"


def _build_prior_context(label: str, prior_items: List[str]) -> str:
    """Build a prior-rounds context string for the prompt."""
    if not prior_items:
        return ""
    parts = []
    for i, item in enumerate(prior_items, 1):
        # We assume item is a JSON string of the structured packet
        try:
            parsed = json.loads(item)
            summary = parsed.get("argument_summary", "No summary.")
        except json.JSONDecodeError:
            summary = item # fallback
        parts.append(f"--- Round {i} {label} ---\n{summary}")
    return "YOUR PRIOR ARGUMENTS (do NOT repeat these):\n" + "\n\n".join(parts)


# --- Nodes ---

def decompose_node(state: AgentState):
    """Decompose a compound claim into atomic sub-claims."""
    claim = state["original_claim"]
    prompt = DECOMPOSITION_PROMPT.format(claim=claim)
    messages = [HumanMessage(content=prompt)]

    response = llm_json.invoke(messages)
    content_str = extract_text(response.content)

    try:
        sub_claims = json.loads(content_str)
        if isinstance(sub_claims, list) and len(sub_claims) > 0:
            sub_claims = [str(sc) for sc in sub_claims]
        else:
            sub_claims = [claim]
    except Exception:
        sub_claims = [claim]

    print(f"  [Decompose] Broke into {len(sub_claims)} sub-claim(s): {sub_claims}")
    return {
        "sub_claims": sub_claims,
        "current_sub_claim_index": 0,
        "sub_claim_results": [],
    }


def select_subclaim_node(state: AgentState):
    """Pick the next unresolved sub-claim and reset AVC state for it."""
    idx = state["current_sub_claim_index"]
    sub_claims = state["sub_claims"]

    if idx >= len(sub_claims):
        return {}

    active_claim = sub_claims[idx]
    print(f"  [Select] Starting sub-claim {idx + 1}/{len(sub_claims)}: {active_claim}")
    return {
        "claim": active_claim,
        "round": 1,
        "prosecutor_attack": "",
        "defender_defense": "",
        "prior_attacks": [],
        "prior_defenses": [],
        "verdict": "",
        "confidence_score": 0.0,
        "reasoning": "",
        "unresolved_questions": [],
    }


def prosecutor_node(state: AgentState):
    """Prosecutor attacks the claim with dual search queries and outputs JSON."""
    claim = state["claim"]
    current_round = state["round"]
    prior_attacks = state.get("prior_attacks", [])

    search_query_1 = f"evidence refuting {claim}"
    search_query_2 = f"flaws problems with studies supporting {claim}"
    evidence_1 = search_tool(search_query_1)
    evidence_2 = search_tool(search_query_2)
    combined_evidence = f"SEARCH 1 (counter-evidence):\n{evidence_1}\n\nSEARCH 2 (methodology flaws):\n{evidence_2}"

    prior_context = _build_prior_context("Prosecutor Attack", prior_attacks)

    prompt = PROSECUTOR_PROMPT.format(
        claim=claim,
        round=current_round,
        prior_context=prior_context,
    )
    messages = [
        SystemMessage(content=prompt),
        HumanMessage(
            content=f"Here is the search evidence I found:\n{combined_evidence}\n\nNow write your structured attack for Round {current_round}."
        ),
    ]

    response = llm_json.invoke(messages)
    attack_json = extract_text(response.content)
    print(f"  [Prosecutor R{current_round}] Attack generated ({len(attack_json)} chars)")
    return {"prosecutor_attack": attack_json}


def defender_node(state: AgentState):
    """Defender defends the claim with dual search queries and outputs JSON."""
    claim = state["claim"]
    attack = state["prosecutor_attack"]
    current_round = state["round"]
    prior_defenses = state.get("prior_defenses", [])

    search_query_1 = f"evidence supporting {claim}"
    search_query_2 = f"meta-analysis systematic review {claim}"
    evidence_1 = search_tool(search_query_1)
    evidence_2 = search_tool(search_query_2)
    combined_evidence = f"SEARCH 1 (supporting evidence):\n{evidence_1}\n\nSEARCH 2 (meta-analyses):\n{evidence_2}"

    prior_context = _build_prior_context("Defender Defense", prior_defenses)

    prompt = DEFENDER_PROMPT.format(
        claim=claim,
        prosecutor_attack=attack,
        round=current_round,
        prior_context=prior_context,
    )
    messages = [
        SystemMessage(content=prompt),
        HumanMessage(
            content=f"Here is the search evidence I found:\n{combined_evidence}\n\nNow write your structured defense for Round {current_round}."
        ),
    ]

    response = llm_json.invoke(messages)
    defense_json = extract_text(response.content)
    print(f"  [Defender R{current_round}] Defense generated ({len(defense_json)} chars)")
    return {"defender_defense": defense_json}


def adjudicator_node(state: AgentState):
    """Adjudicator evaluates the structured packets and decides: final verdict or loop. Updates SCI."""
    claim = state["claim"]
    attack = state["prosecutor_attack"]
    defense = state["defender_defense"]
    current_round = state["round"]
    max_rounds = state["max_rounds"]
    prior_attacks = state.get("prior_attacks", [])
    prior_defenses = state.get("prior_defenses", [])

    prompt = ADJUDICATOR_PROMPT.format(
        claim=claim,
        prosecutor_attack=attack,
        defender_defense=defense,
        round=current_round,
        max_rounds=max_rounds,
    )

    messages = [HumanMessage(content=prompt)]
    response = llm_json.invoke(messages)
    content_str = extract_text(response.content)

    try:
        result = json.loads(content_str)
        verdict = result.get("verdict", "DISPUTED")
        confidence = float(result.get("confidence_score", 0.0))
        reasoning = result.get("reasoning", "")
        unresolved = result.get("unresolved_questions", [])
        source_evals = result.get("source_evaluations", [])

        # Update Source Credibility Index (SCI) based on Adjudicator's evaluations
        for eval_obj in source_evals:
            domain = eval_obj.get("domain")
            is_reliable = eval_obj.get("is_reliable", False)
            if domain:
                try:
                    db.update_sci(domain, is_reliable)
                    print(f"  [SCI Update] {domain}: {'reliable' if is_reliable else 'unreliable'}")
                except Exception as db_e:
                    print(f"  [SCI Error] Failed to update SCI for {domain}: {db_e}")

        # Force final verdict on last round
        if current_round >= max_rounds and verdict == "NEEDS_MORE_ROUNDS":
            verdict = "DISPUTED"

        print(
            f"  [Adjudicator R{current_round}] Verdict={verdict}, Confidence={confidence:.2f}"
        )

        new_prior_attacks = list(prior_attacks) + [attack]
        new_prior_defenses = list(prior_defenses) + [defense]

        return {
            "verdict": verdict,
            "confidence_score": confidence,
            "reasoning": reasoning,
            "unresolved_questions": unresolved if isinstance(unresolved, list) else [],
            "prior_attacks": new_prior_attacks,
            "prior_defenses": new_prior_defenses,
        }
    except Exception as e:
        print(f"  [Adjudicator R{current_round}] Parse error: {e}")
        return {
            "verdict": "ERROR",
            "confidence_score": 0.0,
            "reasoning": f"Failed to parse JSON: {str(e)}\nResponse: {content_str}",
            "unresolved_questions": [],
            "prior_attacks": list(prior_attacks) + [attack],
            "prior_defenses": list(prior_defenses) + [defense],
        }


def loop_or_finalize(state: AgentState):
    verdict = state["verdict"]
    current_round = state["round"]
    max_rounds = state["max_rounds"]

    if verdict == "NEEDS_MORE_ROUNDS" and current_round < max_rounds:
        return "next_round"
    else:
        return "subclaim_done"


def increment_round_node(state: AgentState):
    return {"round": state["round"] + 1}


def store_subclaim_result_node(state: AgentState):
    """Store the completed sub-claim result and advance the index."""
    result = {
        "sub_claim": state["claim"],
        "verdict": state["verdict"],
        "confidence_score": state["confidence_score"],
        "reasoning": state["reasoning"],
        "rounds_used": state["round"],
        "unresolved_questions": state.get("unresolved_questions", []),
        "debate_log": [
            {
                "round": i + 1,
                "prosecutor_packet": state["prior_attacks"][i] if i < len(state.get("prior_attacks", [])) else "{}",
                "defender_packet": state["prior_defenses"][i] if i < len(state.get("prior_defenses", [])) else "{}",
            }
            for i in range(state["round"])
        ],
    }

    new_results = list(state.get("sub_claim_results", [])) + [result]
    new_index = state["current_sub_claim_index"] + 1

    print(
        f"  [Store] Sub-claim '{state['claim'][:50]}...' → {state['verdict']} ({state['confidence_score']:.2f})"
    )
    return {
        "sub_claim_results": new_results,
        "current_sub_claim_index": new_index,
    }


def all_subclaims_done(state: AgentState):
    idx = state["current_sub_claim_index"]
    total = len(state["sub_claims"])
    if idx >= total:
        return "aggregate"
    else:
        return "next_subclaim"


def aggregate_node(state: AgentState):
    """Combine all sub-claim results into a final verdict."""
    results = state["sub_claim_results"]

    if not results:
        return {
            "verdict": "ERROR",
            "confidence_score": 0.0,
            "reasoning": "No sub-claim results to aggregate.",
        }

    verdicts = [r["verdict"] for r in results]
    confidences = [r["confidence_score"] for r in results]

    if "ERROR" in verdicts:
        final_verdict = "ERROR"
    elif "DISPUTED" in verdicts:
        final_verdict = "DISPUTED"
    elif "REFUTED" in verdicts:
        final_verdict = "REFUTED"
    else:
        final_verdict = "VERIFIED"

    final_confidence = min(confidences)

    reasoning_parts = []
    for r in results:
        reasoning_parts.append(
            f"Sub-claim: \"{r['sub_claim']}\"\n"
            f"  Verdict: {r['verdict']} (confidence: {r['confidence_score']:.2f}, rounds: {r['rounds_used']})\n"
            f"  Reasoning: {r['reasoning']}"
        )
    aggregate_reasoning = (
        f"AGGREGATE VERDICT: {final_verdict} (confidence: {final_confidence:.2f})\n"
        f"Based on {len(results)} sub-claim(s):\n\n"
        + "\n\n".join(reasoning_parts)
    )

    print(
        f"  [Aggregate] Final: {final_verdict} ({final_confidence:.2f}) from {len(results)} sub-claims"
    )
    return {
        "verdict": final_verdict,
        "confidence_score": final_confidence,
        "reasoning": aggregate_reasoning,
    }


# --- Graph Construction ---

def build_graph():
    workflow = StateGraph(AgentState)

    workflow.add_node("decompose", decompose_node)
    workflow.add_node("select_subclaim", select_subclaim_node)
    workflow.add_node("prosecutor", prosecutor_node)
    workflow.add_node("defender", defender_node)
    workflow.add_node("adjudicator", adjudicator_node)
    workflow.add_node("increment_round", increment_round_node)
    workflow.add_node("store_subclaim_result", store_subclaim_result_node)
    workflow.add_node("aggregate", aggregate_node)

    workflow.set_entry_point("decompose")
    workflow.add_edge("decompose", "select_subclaim")
    workflow.add_edge("select_subclaim", "prosecutor")
    workflow.add_edge("prosecutor", "defender")
    workflow.add_edge("defender", "adjudicator")

    workflow.add_conditional_edges(
        "adjudicator",
        loop_or_finalize,
        {
            "next_round": "increment_round",
            "subclaim_done": "store_subclaim_result",
        },
    )

    workflow.add_edge("increment_round", "prosecutor")

    workflow.add_conditional_edges(
        "store_subclaim_result",
        all_subclaims_done,
        {
            "next_subclaim": "select_subclaim",
            "aggregate": "aggregate",
        },
    )

    workflow.add_edge("aggregate", END)

    return workflow.compile()


# --- Public API ---

def run_avc(claim: str):
    graph = build_graph()
    initial_state = {
        "original_claim": claim,
        "sub_claims": [],
        "current_sub_claim_index": 0,
        "sub_claim_results": [],
        "claim": claim,
        "round": 1,
        "max_rounds": MAX_ROUNDS,
        "prosecutor_attack": "",
        "defender_defense": "",
        "prior_attacks": [],
        "prior_defenses": [],
        "verdict": "",
        "confidence_score": 0.0,
        "reasoning": "",
        "unresolved_questions": [],
    }

    result = graph.invoke(initial_state)
    return result
