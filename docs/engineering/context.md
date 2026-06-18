
# AEAI-Core Context

## What AEAI-Core Is

AEAI-Core is the protocol specification for an adversarial epistemic AI network. A claim enters as an unverified assertion and exits as a cryptographically anchored, adversarially validated verdict — or does not exit at all. There is no partial result. The pipeline runs to completion or the consumer waits.

The protocol's primary security objective is **verdict integrity**: every committed verdict reflects the honest output of an adversarial validation process that no single party could control, corrupt, or suppress. All other concerns are subordinate to this.

---

## Repository Structure

```
AEAI-Core/
├── README.md
├── VISION.md
├── MANIFESTO.md
├── GLOSSARY.md
├── ROADMAP.md
├── CHANGELOG.md
├── CONTRIBUTING.md
│
├── architecture/
│   ├── 00-system-overview.md
│   ├── 01-design-principles.md
│   ├── 02-technology-stack.md
│   ├── 03-data-flow.md
│   └── 04-security-model.md
│
├── layers/                         # L0–L13: the 14 processing layers
│   ├── L0-axiom-registry.md
│   ├── L1-data-ingestion.md
│   ├── L2-semantic-gate.md
│   ├── L3-dependency-resolver.md
│   ├── L4-research-queue.md
│   ├── L5-adversarial-validation.md
│   ├── L6-epistemic-framework.md
│   ├── L7-transparency-ledger.md
│   ├── L8-knowledge-dag.md
│   ├── L9-staleness-engine.md
│   ├── L10-source-credibility.md
│   ├── L11-confidence-delta-engine.md
│   ├── L12-entity-bias-engine.md
│   └── L13-output-api.md
│
├── epistemics/
│   ├── epistemic-pyramid.md
│   ├── confidence-formula.md
│   ├── institutional-vs-empirical.md
│   ├── axiom-promotion-criteria.md
│   ├── one-truth-principle.md
│   └── disputed-vs-unresolvable.md
│
├── consensus/
│   ├── proof-of-verification.md
│   ├── validator-node-spec.md
│   ├── federated-incentives.md
│   ├── consortium-governance.md
│   ├── completeness-incentive.md
│   └── multi-node-validation.md
│
├── compute/
│   ├── agent-architecture.md
│   ├── distributed-inference.md
│   ├── validator-hardware-guide.md
│   └── scaling-model.md
│
├── bootstrapping/
│   ├── genesis-seed-sources.md
│   ├── phase-rollout-plan.md
│   ├── reuse-scoring.md
│   ├── shared-subtree-dedup.md
│   └── coverage-map.md
│
├── api/
│   ├── overview.md
│   ├── status-codes.md
│   ├── flag-badge-reference.md
│   ├── error-codes.md
│   └── endpoints/
│       ├── POST-verify.md
│       ├── GET-verdict.md
│       ├── GET-compare.md
│       ├── GET-entity.md
│       ├── GET-source.md
│       ├── GET-timeline.md
│       └── GET-audit.md
│
├── workflows/
│   ├── new-claim-flow.md
│   ├── cache-hit-flow.md
│   ├── new-source-discovery-flow.md
│   ├── court-verdict-flow.md
│   ├── stale-topic-flow.md
│   ├── axiom-promotion-flow.md
│   ├── circular-dependency-flow.md
│   ├── validator-onboarding-flow.md
│   └── incident-response-flow.md
│
├── data-models/
│   ├── axiom-node.schema.json
│   ├── topic-node.schema.json
│   ├── evidence-bundle.schema.json
│   ├── research-queue-item.schema.json
│   ├── source-registry.schema.json
│   ├── transparency-log-record.schema.json
│   ├── entity-registry.schema.json
│   ├── api-response.schema.json
│   ├── deployment-config.schema.json
│   ├── deployment-record.schema.json
│   ├── monitoring-config.schema.json
│   ├── alert-record.schema.json
│   ├── incident-record.schema.json
│   ├── post-incident-report.schema.json
│   ├── recovery-record.schema.json
│   └── backup-config.schema.json
│
├── ops/
│   ├── deployment-guide.md
│   ├── monitoring.md
│   ├── incident-response.md
│   ├── backup-recovery.md
│   ├── security-policy.md
│   ├── release-management.md
│   ├── sla.md
│   ├── data-retention.md
│   └── validator-enrollment.md
│
├── open-source/
│   ├── licence-model.md
│   ├── governance-model.md
│   ├── axiom-submission-process.md
│   ├── validator-onboarding.md
│   ├── bug-reporting.md
│   └── responsible-disclosure.md
│
├── brand/
│   └── brand-guidelines.md
│
└── research/
    ├── prior-art.md
    ├── open-problems.md
    ├── design-decisions.md
    └── case-studies/
        ├── pharma-adverse-events.md
        ├── political-bias-example.md
        └── court-verdict-overturn.md
```

---

## The 14 Layers (L0–L13)

| Layer | Name | Role |
|---|---|---|
| L0 | Axiom Registry | Terminal nodes of all dependency chains. Tier 0 (logical/mathematical) and Tier 1 (physical constants). Challenge-forbidden, write-once, permanent. |
| L1 | Data Ingestion | Entry point. Receives raw claims and sources in any supported format or language. Extracts structured representation. Does not validate. |
| L2 | Semantic Gate | Checks whether an incoming claim semantically matches an existing verified node (cache hit). Prevents duplicate validation. |
| L3 | Dependency Resolver | Maps the dependency chain for a claim — all sub-claims that must be true for the root claim to be true. Terminates at axiom nodes. |
| L4 | Research Queue | Manages the ordered queue of claims awaiting validation. Handles priority, scheduling, and routing. |
| L5 | Adversarial Validation | The core AVC (Adversarial Validation Cycle) loop: Prosecutor vs Defender, adjudicated by the Adjudicator agent. Multi-round, tier-assigned. |
| L6 | Epistemic Framework | Applies the confidence formula to AVC output. Computes confidence scores using epistemic dimension weights. Assigns verdicts. |
| L7 | Transparency Ledger | Commits finalized verdicts and Proof-of-Verification records to an append-only transparency log (Merkle Tree). Immutable post-commit. |
| L8 | Knowledge DAG | The directed acyclic graph of all committed claim nodes. Manages edges, dependency propagation, and cascade recomputation. |
| L9 | Staleness Engine | Monitors TTLs. Detects when a node's confidence has drifted due to new evidence or dependency change. Triggers revalidation. |
| L10 | Source Credibility | Manages the Source Credibility Index (SCI). Tracks citation history, COI relationships, and domain reputation per source. |
| L11 | Confidence Delta Engine | Detects material shifts in confidence (threshold: \|new − old\| > 0.35 per tier contribution). Triggers forensic investigation classifying cause as: (A) Deliberate Suppression, (B) Institutional Error, (C) Systemic Bias, or (D) Temporal Limitation. Results stored as hypothesis nodes with individual confidence scores — not verdicts. AEAI does not accuse; it stores structured hypotheses. |
| L12 | Entity Bias Engine | Tracks named entity Credibility Index (CI) and Bias Baseline Values (BBV). Applies entity-level modifiers to confidence scoring. |
| L13 | Output API | The consumer-facing API layer. Tier-gated access, rate limiting, webhook delivery, and audit trail. |

---

## The Adversarial Validation Cycle (AVC)

The AVC is the core mechanism of AEAI-Core. Every claim that is not a cache hit runs through it.

- **Claim Decomposition agent** — breaks a raw claim into atomic sub-claims. Complex compound claims are never validated as units.
- **Prosecutor agent** — mandated to destroy the claim. Adversarial by design, regardless of who submitted the claim. All arguments must be source-cited; unsourced assertions are automatically discarded.
- **Defender agent** — mandated to defend the claim using the available evidence corpus. All arguments must be source-cited.
- **Adjudicator agent** — stateless instance with no prior context of the debate. Evaluates the exchange across five axes: Source Reliability, Cross-Verification Depth, Temporal Consistency, Logical Coherence, Entity Track Record Penalty.
- **Loop** — if Adjudicator confidence < threshold, the claim re-enters the loop for additional rounds. **No cap on the number of loops.** A claim that exhausts all available evidence without crossing the threshold is stored as DISPUTED — this is still a complete, valid output.
- **Multi-node** — multiple independent validator nodes run the same AVC in parallel. A supermajority consensus is required before the verdict is committed.

---

## The Epistemic Pyramid (Claim Tiers)

All knowledge is assigned an Epistemic Tier (0–6) representing its distance from axiomatic certainty. A claim's maximum possible confidence is bounded by the T_weight of its **weakest** dependency in the chain.

| Tier | Class | T_weight | Examples |
|---|---|---|---|
| 0 | Logical / mathematical axioms | 1.00 | Law of non-contradiction, axioms of arithmetic |
| 1 | Physical constants / empirical absolutes | 0.99 | Speed of light, H₂O molecular formula |
| 2 | Reproducible empirical observations | 0.95 | Multi-replicated experiments, consistent cross-lab results |
| 3 | Scientific consensus | 0.88 | Evolution, quantum mechanics, anthropogenic climate change |
| 4 | Institutional records | 0.65 | Court verdicts, legislation, regulatory approvals, census data |
| 5 | Corroborated media / reports | 0.50 | Multi-outlet verified events, official press releases |
| 6 | Single-source claims | 0.25 | Individual testimony, single news reports, anonymous reports |

**Note on Tier 4**: Institutional records always use the dual-node model — "the court found X guilty" (confidence ~0.99 that the record exists) is stored separately from "X actually committed the act" (scored by AVC from forensic/witness evidence, may be 0.34). The system never conflates these.

---

## Verdict States

Only three states are ever exposed through the API:

| State | Meaning |
|---|---|
| VERIFIED | Claim survived full AVC. Confidence at or above threshold. |
| DISPUTED | AVC completed but confidence threshold not reachable with current evidence. Full debate log stored. This is a complete, honest answer. |
| REFUTED | Claim did not survive AVC. Evidence supports the negative. |

Two states are **internal pipeline only — never returned to consumers**:

| State | Meaning |
|---|---|
| IN_RESEARCH | Claim is actively being processed. API returns this status with estimated completion time. No confidence band. No partial answer. |
| QUEUED | Claim is in the research queue, not yet started. |

Provisional results do not exist in AEAI. A claim is either fully resolved or still being determined. There is no in-between state served externally.

---

## Confidence Formula

The confidence score for a claim is a function of:
- **Epistemic dimension scores** (weighted by domain-specific governed parameters)
- **T_weight** of the weakest dependency in the chain (confidence ceiling)
- **Cold start modifier** (reduces confidence for thin-corpus domains)
- **Entity CI modifier** (reflects entity credibility and bias signals)
- **COI modifier** (adjusts for conflict-of-interest concentration in evidence)

Formula weights are governed parameters, reviewable by DAO vote each governance cycle.

---

## Design Principles (10 Core Principles)

1. **No provisional results** — The pipeline runs to completion or the consumer waits. No partial confidence is ever served externally.
2. **Adversarial by default** — Every claim is assumed false at submission. The Prosecutor's mandate is to destroy it.
3. **Immutability over convenience** — Nothing is deleted. Overturned verdicts create new superseding blocks; original blocks are preserved permanently.
4. **Records are not reality** — Institutional records (Tier 4) are never treated as ground truth. Always stored with a separate empirical confidence node.
5. **Confidence has a ceiling** — A claim's maximum confidence is bounded by the T_weight of its weakest dependency. Mathematically enforced, not subjective.
6. **Sources are accountable** — SCI is earned through validated citation history. Sources whose reported confidence diverges from independently verified confidence are flagged as forensic events.
7. **The system must be owned by no one** — Open-source protocol, federated web of trust, standard-body governance.
8. **Depth has no artificial ceiling** — Dependency chains are resolved to their natural floor (the axiom layer) with no imposed depth limit. The depth limit was removed because it produced false confidence.
9. **Speed is not a feature** — Thoroughness is. Validators are rewarded per complete research run, not per fast one. Cutting corners is economically irrational.
10. **The cold start is outlasted, not shortcut** — The absence of verified nodes early on is resolved by completing thorough research in priority order. Never by accepting lower-quality answers.

---

## Dual-Node Architecture

For claims involving an institutional position (court verdict, regulatory approval, official declaration) alongside an empirical position, the protocol stores **two linked nodes**:
- **Institutional node** — what the institution has formally decided.
- **Empirical node** — what the evidence independently supports.

These may diverge. Divergence is flagged and surfaced to consumers. The protocol records the divergence; it does not resolve it.

---

## Proof of Verification (PoV)

Every committed verdict carries a PoV package:
- The full AVC exchange transcript.
- All evidence bundle CIDs (content-addressed on IPFS).
- All formula inputs and computed scores.
- The cryptographic signatures of every validator in the majority.
- The transparency log inclusion proof (Merkle branch).

PoV is immutable post-commit. Independent verification requires no trust in AEAI — only access to the public transparency logs and the IPFS content network.

---

## Research Queue and Dependency Resolution

**Queue priority** affects only *when* a claim is researched — never *how thoroughly*:
- **Reuse potential** — how many other claims depend on this node's resolution (highest weight)
- **Requester stake** — more staked AVT = higher queue position
- **Domain phase** — Phase 1/2/3 domain priorities
- **Dependency of in-flight claims** — automatically fast-tracked

**Dependency resolution rules:**
- Full DAG is built with **no depth limit** before any AVC begins.
- Resolution proceeds **bottom-up**: deepest, most foundational nodes first.
- Every node must reach VERIFIED/DISPUTED/REFUTED before the layer above it runs.
- **Axiom floor termination**: every chain eventually reaches a Tier 0/1 node already on-chain — this terminates recursion naturally.
- **Cycle breaking**: circular dependencies are quarantined; an independent evidence agent attempts external resolution. If unresolvable, both nodes are stored as DISPUTED with a documented reason — still a complete output.
- **Shared subtree deduplication**: if the same dependency appears in multiple branches of one research run, it is resolved exactly once and the result is shared (memoisation). Prevents redundant validator compute.

---

## Consensus and Validator Economy

- **Validator Nodes** — independent operators (universities, NGOs, institutions) running the AVC pipeline.
- **Reputation Staking** — validators stake their institutional reputation to participate. No financial tokens are required.
- **Cryptographic Fraud Proofs** — misbehaviour (coordination, shortcutting, dishonest verdicts) results in cryptographic fraud proofs and automatic eviction from the federation.
- **Supermajority threshold** — a verdict requires supermajority consensus across the assigned validator set before being appended to the log.
- **Volunteer Compute** — validators can aggregate donated GPU compute (BOINC-style) from the public to process the pipeline securely.

---

## The Web of Trust

- Replaces token economics.
- Validators are known, verifiable entities rather than anonymous token-holders.
- Nodes cross-verify each other's outputs.
- Ensures no single entity can capture the network, as trust is distributed across multiple independent institutions.

---

## Governance (Consortium)

- Protocol parameters are governed by a multi-stakeholder standard body (the AEAI Consortium).
- Parameter changes require a supermajority consensus among the steering committee.
- No single organization can unilaterally alter the rules or halt the network.
- Axiom promotions require 75% consensus from the Consortium for ratification.

---

## Threat Model (Five Adversary Classes)

| Class | Description |
|---|---|
| 1 — The Suppressor | Wants to prevent or remove a VERIFIED verdict. Mitigated by blockchain immutability and validator decentralisation. |
| 2 — The Fabricator | Wants a false claim to receive VERIFIED status. Mitigated by adversarial-by-default Prosecutor and multi-validator consensus. |
| 3 — The Federation Cartel | Coordinates institutional validators to dominate consensus. Mitigated by Web of Trust distribution and public auditability. |
| 4 — The Infrastructure Attacker | Conventional attacker. Past verdicts protected by Transparency Log immutability; future pipeline protected by standard infra security. |
| 5 — The Epistemic Manipulator | Corrupts the evidence corpus rather than the pipeline. Mitigated by SCI decay, citation ring detection, and COI flagging. |

---

## Data Flows (11 Flows in data-flow.md)

1. **New Claim** — Novel claim, no existing node. The primary flow.
2. **Cache Hit** — Semantically matches existing verified node; cached verdict served.
3. **New Source Discovery** — New data source enters; assessed for impact on existing verdicts.
4. **Institutional Record** — Dual-node model applied for institutional vs empirical positions.
5. **Staleness and Delta Re-Validation** — TTL-expired or dependency-shifted node revalidated.
6. **Axiom Promotion** — Tier 2/3 node elevated to permanent axiom. Highest-scrutiny operation.
7. **Cold Start / Genesis Seed Loading** — New domain instance built from empty knowledge graph.
8. **Multi-Language Routing** — Claims in Hindi, Tamil, or other supported languages routed through language-specific pipeline.
9. **Validator Consensus** — Parallel AVC runs aggregated into supermajority verdict before appending to the Transparency Log.
10. **Webhook and Subscriber Notification** — Material state changes pushed to all eligible subscribers.
11. **API Authentication and Rate Limiting** — Every inbound request authenticated, tier-resolved, rate-limited before pipeline resources are consumed.

---

## Source Credibility Index (SCI)

- Assigned to every registered source.
- Earned through validated citation history — not assigned by reputation.
- Decays when a source consistently supports claims that are subsequently REFUTED.
- COI (conflict of interest) relationships are tracked and applied automatically at citation time.
- COI flags cannot be suppressed and are surfaced in every affected verdict.

---

## API Consumer Tiers

| Tier | Access Level |
|---|---|
| 1 — Public | Verdict summaries. No PoV detail. |
| 2 — Registered | Full verdict with confidence score and flags. |
| 3 — Professional | Full verdict with formula inputs and source list. |
| 4 — Institutional | Full PoV evidence bundle access. Full audit trail. |

---

## Tech Stack

| Component | Technology | Notes |
|---|---|---|
| LLM agents (Prosecutor, Defender, Adjudicator) | DeepSeek V3 (self-hosted via vLLM) | $0.14/$0.28 per MTok; at validator scale, API cost → $0 |
| Reasoning agent (Claim Decomposition, Delta) | DeepSeek R1 (self-hosted) | Reasoning-optimised |
| Adjudicator (separate model family) | Qwen3.5 or Mistral (self-hosted) | Different family prevents shared bias with Prosecutor/Defender |
| Vector search | pgvector → Qdrant (at 50M+ nodes) | pgvector first; Qdrant when scale demands it |
| Transparency Log | Merkle Tree (Rekor/Trillian style) | Append-only verifiable logs; zero transaction fees |
| Evidence bundle storage | IPFS + Institutional Pinning | Permanent storage via federated pinning and torrent backups |
| Primary database | PostgreSQL + Apache AGE (graph) + pgvector | AGE adds graph traversal to existing Postgres |
| Cache / queue | Redis + BullMQ | Self-hosted |
| API server | Node.js + Fastify | |
| Agent orchestration | Python + LangGraph | |
| Inference serving | vLLM (self-hosted) | |
| Infrastructure | Hetzner / Contabo bare metal | 3–5× cheaper than AWS/GCP for GPU bare metal |
| Container orchestration | K3s (early stage) → Kubernetes | |
| Smart contracts | Solana Programs (Rust / Anchor) | |

**Cost reduction logic**: self-hosting LLMs eliminates API bills; Transparency Logs eliminate blockchain write costs entirely; Hetzner/Contabo minimises compute costs. As the network grows, infrastructure cost shifts to federated institutions and volunteer compute donors.

---

## Key Cross-References

| Topic | Document |
|---|---|
| Security model | `AEAI-Core/architecture/04-security-model.md` |
| Technology stack | `AEAI-Core/architecture/02-technology-stack.md` |
| Full data flow | `AEAI-Core/architecture/03-data-flow.md` |
| Confidence formula | `AEAI-Core/epistemics/confidence-formula.md` |
| Epistemic pyramid | `AEAI-Core/epistemics/epistemic-pyramid.md` |
| Dual-node model | `AEAI-Core/epistemics/institutional-vs-empirical.md` |
| Axiom promotion | `AEAI-Core/epistemics/axiom-promotion-criteria.md` |
| Adversarial validation | `AEAI-Core/layers/L5-adversarial-validation.md` |
| Proof of Verification | `AEAI-Core/consensus/proof-of-verification.md` |
| Validator node spec | `AEAI-Core/consensus/validator-node-spec.md` |
| Federated incentives | `AEAI-Core/consensus/federated-incentives.md` |
| Consortium governance | `AEAI-Core/consensus/consortium-governance.md` |
| Incident response | `AEAI-Core/ops/incident-response.md` |
| Backup and recovery | `AEAI-Core/ops/backup-recovery.md` |
| Open problems | `AEAI-Core/research/open-problems.md` |
| Prior art | `AEAI-Core/research/prior-art.md` |
