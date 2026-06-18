# Implementation Plan

## Phase 1 — Core AVC Prototype (COMPLETE)

**Goal:** Prove the adversarial debate mechanism works end-to-end on a single machine.

**Scope:**
- [x] FastAPI server with `POST /verify` and `GET /verdict/{id}`
- [x] LangGraph state machine: Prosecutor → Defender → Adjudicator (single pass)
- [x] Serper.dev search integration for live evidence gathering
- [x] SQLite database for claim storage
- [x] Append-only Merkle hash chain for transparency log
- [x] Gemini 3.5 Flash as the LLM for all agents
- [x] Agent prompts aligned with AVC spec (evidence-only, adversarial-by-default, confidence ceiling)

**Test:** Submit "The Earth is flat." → Expect REFUTED with cited evidence and a Merkle inclusion proof.

---

## Phase 2 — Multi-Round AVC + Claim Decomposition

**Goal:** Support iterative debate rounds and break complex claims into atomic sub-claims before validation.

**Scope:**
- [ ] Add a Claim Decomposition agent that breaks compound claims into atomic sub-claims
- [ ] Implement multi-round AVC: if Adjudicator confidence < threshold, loop back for additional Prosecutor/Defender rounds
- [ ] Add round tracking to the AgentState (round counter, prior arguments)
- [ ] Track evidence per-source with basic tier classification (empirical vs. institutional)
- [ ] Add DISPUTED as a valid verdict (when evidence is exhausted but threshold not reached)
- [ ] Increase search depth from 3 to 10 results per query
- [ ] Add a second search query per agent (e.g., Prosecutor searches for both "evidence refuting X" and "flaws in studies supporting X")

**Test:** Submit a compound claim like "Vaccines cause autism and the government is hiding it." → Expect decomposition into sub-claims, each debated independently, with REFUTED on both.

---

## Phase 3 — Model Separation + Structured Output

**Goal:** Use different LLM families for Prosecutor/Defender vs. Adjudicator to prevent shared bias. Enforce structured JSON output.

**Scope:**
- [ ] Prosecutor + Defender: Gemini 3.5 Flash (or self-hosted DeepSeek V3 when available)
- [ ] Adjudicator: Switch to a different model family (e.g., Gemini 3.1 Pro, or self-hosted Qwen/Mistral)
- [ ] Enforce structured attack/defense packets (JSON schema with citations, tier assessments, COI flags)
- [ ] Add basic Source Credibility Index (SCI) tracking per source URL
- [ ] Add confidence ceiling enforcement in the Adjudicator (bounded by weakest evidence tier)
- [ ] Persist full structured debate packets (not just transcript strings) to the database

**Test:** Verify that the Adjudicator's model family differs from Prosecutor/Defender. Verify structured JSON output matches the attack/defense packet schemas from the AVC spec.

---

## Future Phases (Out of Prototype Scope)

- Dependency Resolver (L3) — full DAG traversal with bottom-up resolution
- Staleness Engine (L9) — TTL-based revalidation triggers
- Entity Bias Engine (L12) — named entity CI and BBV tracking
- Multi-validator consensus — parallel AVC runs with supermajority
- IPFS evidence bundle storage
- Federation protocol — node-to-node communication
- Frontend UI / Dashboard
