import os
import json
from typing import Dict, TypedDict, Annotated, Sequence, List, Optional
from langchain_core.messages import BaseMessage, HumanMessage, SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph import StateGraph, END
import requests
from .prompts import (
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
    claim: str
    round: int
    max_rounds: int
    prosecutor_attack: str
    defender_defense: str
    prior_attacks: List[str]
    prior_defenses: List[str]
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
        try:
            parsed = json.loads(item)
            summary = parsed.get("argument_summary", "No summary.")
        except json.JSONDecodeError:
            summary = item
        parts.append(f"--- Round {i} {label} ---\n{summary}")
    return "YOUR PRIOR ARGUMENTS (do NOT repeat these):\n" + "\n\n".join(parts)


def _get_entity_biases_str() -> str:
    try:
        conn = db.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT name, bias_score, known_cois FROM entities")
        rows = cursor.fetchall()
        conn.close()
        if not rows:
            return "No known entity biases recorded yet."
        parts = []
        for r in rows:
            parts.append(f"- {r[0]}: Bias Score = {r[1]}, Known COIs: {r[2]}")
        return "\n".join(parts)
    except Exception as e:
        return f"Error retrieving biases: {e}"

# --- Nodes ---

def prosecutor_node(state: AgentState):
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
        entity_biases=_get_entity_biases_str()
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

        for eval_obj in source_evals:
            domain = eval_obj.get("domain")
            is_reliable = eval_obj.get("is_reliable", False)
            if domain:
                try:
                    db.update_sci(domain, is_reliable)
                    print(f"  [SCI Update] {domain}: {'reliable' if is_reliable else 'unreliable'}")
                except Exception as db_e:
                    print(f"  [SCI Error] Failed to update SCI for {domain}: {db_e}")

        if current_round >= max_rounds and verdict == "NEEDS_MORE_ROUNDS":
            verdict = "DISPUTED"

        print(f"  [Adjudicator R{current_round}] Verdict={verdict}, Confidence={confidence:.2f}")

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
        return "done"


def increment_round_node(state: AgentState):
    return {"round": state["round"] + 1}


# --- Graph Construction ---

def build_graph():
    workflow = StateGraph(AgentState)

    workflow.add_node("prosecutor", prosecutor_node)
    workflow.add_node("defender", defender_node)
    workflow.add_node("adjudicator", adjudicator_node)
    workflow.add_node("increment_round", increment_round_node)

    workflow.set_entry_point("prosecutor")
    workflow.add_edge("prosecutor", "defender")
    workflow.add_edge("defender", "adjudicator")

    workflow.add_conditional_edges(
        "adjudicator",
        loop_or_finalize,
        {"next_round": "increment_round", "done": END},
    )
    workflow.add_edge("increment_round", "prosecutor")

    return workflow.compile()

avc_graph = build_graph()

def run_avc(claim_text: str, max_rounds: int = 3):
    """
    Run the Adversarial Validation Cycle for a single claim.
    """
    print(f"\n[AVC Started] Claim: '{claim_text}'")
    
    initial_state = {
        "claim": claim_text,
        "round": 1,
        "max_rounds": max_rounds,
        "prosecutor_attack": "",
        "defender_defense": "",
        "prior_attacks": [],
        "prior_defenses": [],
        "verdict": "",
        "confidence_score": 0.0,
        "reasoning": "",
        "unresolved_questions": [],
    }
    
    final_state = avc_graph.invoke(initial_state)
    
    return {
        "claim": final_state["claim"],
        "verdict": final_state["verdict"],
        "confidence_score": final_state["confidence_score"],
        "reasoning": final_state["reasoning"],
        "unresolved_questions": final_state.get("unresolved_questions", []),
        "rounds_used": final_state["round"],
        "prior_attacks": final_state["prior_attacks"],
        "prior_defenses": final_state["prior_defenses"]
    }
