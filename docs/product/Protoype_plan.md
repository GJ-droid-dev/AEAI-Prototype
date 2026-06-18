# AEAI 1st Prototype Implementation Plan

## Goal Description
Define the architecture and execution strategy for the 1st Prototype of the AEAI Federated Network. The prototype will demonstrate the core Adversarial Validation Cycle (AVC) and Transparency Log on a local machine.

## Open Questions (To Resolve Before Execution)
1. **LLM Provider for Prototype:** For the MVP, do we want to use local open-weights models (via Ollama/vLLM) which take significant compute, or just use external APIs (OpenAI/Anthropic) temporarily to prove the multi-agent debate logic works?
2. **Evidence Corpus:** For the prototype, should the agents have internet access (via tools) to search for evidence, or should we provide a fixed mock "evidence database" (SQLite/JSON) for them to query?

## Prototype Scope

The 1st Prototype will be a standalone Python application that implements the following AEAI layers:

### 1. Agent Orchestration (L5 - Adversarial Validation)
- Use **LangGraph** (Python) to orchestrate the state machine.
- **Prosecutor Agent:** Receives the claim and searches for contradicting evidence.
- **Defender Agent:** Receives the claim and the Prosecutor's attack, and searches for supporting evidence.
- **Adjudicator Agent:** Evaluates the transcript and outputs a confidence score (0.0 to 1.0) based on Logical Coherence and Source Reliability.

### 2. Mock Epistemic Framework & DAG (L6 & L8)
- A simple local SQLite database (`aeai_dag.db`) to store parsed claims, their dependencies, and final verdicts.
- Hardcoded Epistemic Pyramid tiers (e.g., Tier 0 = 1.0, Tier 1 = 0.99) applied manually to the final score.

### 3. Simulated Transparency Ledger (L7)
- A lightweight Python Merkle Tree implementation.
- Every finalized verdict is hashed along with the previous tree head, creating an append-only `transparency_log.json` file on disk.

### 4. API & Interaction (L13)
- A basic **FastAPI** backend with two endpoints:
  - `POST /verify`: Submit a raw claim string. Returns an immediate "IN_RESEARCH" status.
  - `GET /verdict/{id}`: Poll for the completed verdict, PoV (transcript), and Merkle inclusion proof.

## Files to be Created (Once Execution Begins):
- `AEAIsinBlockchain/prototype/main.py` (FastAPI Server)
- `AEAIsinBlockchain/prototype/agents/graph.py` (LangGraph state machine)
- `AEAIsinBlockchain/prototype/agents/prompts.py` (System prompts)
- `AEAIsinBlockchain/prototype/ledger/merkle.py` (Transparency Log simulator)
- `AEAIsinBlockchain/prototype/database/db.py` (SQLite DAG interactions)

## Verification Plan
### Automated Tests
- Build simple `pytest` scripts to verify the Merkle root changes when a new verdict is appended.
- Unit test the LangGraph state transitions (ensure loop breaks when Adjudicator makes a decision).

### Manual Verification
- Start the FastAPI server locally.
- Use `curl` to submit a test claim: *"The Earth is flat."*
- Verify that the Adjudicator outputs `REFUTED` with a low confidence score, and that the transcript is correctly hashed into the local transparency log.
