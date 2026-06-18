# AI Product Requirements Document

**Product Name:** AEAI (Adversarial Epistemic AI Network)
**1-line description:** A federated, uncapturable truth-verification engine that uses adversarial LLM debate and cryptographic transparency logs to compute and preserve the objective confidence of claims.

**Version:** 1.0
**Status:** In Development
**Launching on:** [Research Pending: Target Date]

**Contacts:**
- **Product Manager:** [Research Pending]
- **Engineering Lead:** [Research Pending]
- **Design Lead:** [Research Pending]

**Resources:** 
- [VISION.md](file:///c:/Users/jangr/Documents/AEAI/AEAI-Core/VISION.md)
- [Federated Architecture](file:///c:/Users/jangr/Documents/AEAI/AEAIsinBlockchain/architecture/05-federated-architecture.md)
- [Context](file:///c:/Users/jangr/Documents/AEAI/AEAIsinBlockchain/context.md)

---

## 1. Executive Summary & Context

**Purpose:** This product requirement document describes building AEAI, a federated truth verification network integrated with multi-agent LLM adversarial validation and cryptographic transparency logs. It answers the critical need for a bias-resistant knowledge engine, is aligned with the vision that "one truth exists," and leverages our unique competitive edge—an architecture that mathematically prevents institutional capture.

### Problem Definition
Every institution that claims to produce truth (courts, governments, media) is operated by humans with incentives, creating bias and distorting records. Existing information systems treat these institutional records as ground truth, concentrating the power to determine truth in entities vulnerable to capture. This results in degraded public truth and dangerous information asymmetry. It is urgent to solve this now because the proliferation of AI-generated content and institutional erosion is rapidly destroying baseline consensus reality.

### Goals
* Ensure every finalized claim is cryptographically anchored to an immutable transparency log (Merkle tree).
* Compute a non-provisional confidence score for every claim by exhausting the Adversarial Validation Cycle (AVC).
* Eliminate single-entity ownership through a federated Web of Trust and Consortium Governance.
* Success criteria: [Research Pending: Specific measurable metrics, e.g., number of federated nodes bootstrapped, claims processed per hour].

### Non-Goals
* Producing opinions or moral scores.
* Providing "provisional" or partial answers.
* Predicting the future.
* Taking ideological sides.
* Prioritizing speed over accuracy.

---

## 2. Market Opportunity

**Purpose:** Summarize the market landscape and potential for value creation.
* **Growth Stage / CAGR:** [Research Pending: Quantitative data on the fact-checking/epistemic tech market].
* **Market Potential:** As trust in centralized media and search engines declines, there is immense value in an objective, uncapturable oracle for truth.
* **TAM:** [Research Pending].

---

## 3. Strategic Alignment

**Purpose:** Articulate alignment with vision, strategy, and objectives.
* **Vision Alignment:** Perfectly aligns with the core AEAI manifesto: "One truth exists at any point in time" and "Records are not reality."
* **Company Objectives:** Supports the goal of replacing the broken, centralized fact-checking paradigm with an open-source, mathematically bounded confidence machine.
* **Competencies:** Leverages self-hosted, state-of-the-art open-weights models (DeepSeek V3, Qwen) to bypass API costs and censorship layers of centralized AI providers.

---

## 4. Customer & User Needs

### Understanding the Target Audience
* **User Segment:** Information consumers, investigative journalists, scientific researchers, risk analysts, and open-source intelligence (OSINT) professionals.
* **Segment Size:** [Research Pending: Exact quantitative sizing of the early-adopter TAM].
* **Unmet Needs:** Users suffer when "a court said so" is conflated with "it is true." They need a system that separates institutional records from empirical reality.

### Validation of the Problem
* **Insights from Data:** [Research Pending: Specific surveys, analytics, or time-spent metrics from target personas].
* **Anecdotes:** The gap between institutional record and reality is measurable (e.g., a court convicting a person later exonerated by DNA). Existing systems fail to natively represent this divergence.
* **Constraints:** Must operate without a central token economy, relying entirely on donated compute (BOINC-style) and institutional federation to prevent capital capture.

---

## 5. Value Proposition & Messaging

* **Problems Addressed:** Bias in fact-checking, provisional/lazy answers from search engines, and the memory-holing of inconvenient truths.
* **Key Capabilities:** Multi-agent adversarial debate (Prosecutor vs. Defender), Entity Bias Engine, and Dual-Node representation (Institutional vs. Empirical).
* **Customer Outcomes:** Users receive an exact, exhaustive, and fully auditable Proof of Verification (PoV) rather than a "best guess."
* **Messaging:** "AEAI calculates, cites, and preserves the chain of evidence. Nothing more. Nothing less."

---

## 6. Competitive Advantage

* **Defensibility:** Unlike fact-checkers that rely on human editors, AEAI uses an uncapturable, decentralized pipeline. 
* **The Inversion:** Competitors optimize for *speed of answer* at the cost of accuracy. AEAI optimizes for *thoroughness*. 
* **Cost Structure:** Self-hosting open-weight models and using volunteer compute gives AEAI a massive cost advantage over systems reliant on expensive proprietary LLM APIs.
* **Trustless Architecture:** Competitors ask users to trust their brand. AEAI requires zero trust; users can mathematically verify the transparency log and Arweave/IPFS evidence bundle.

---

## 7. Product Scope and Use Cases (The Solution)

### Key Capabilities
* **Data Ingestion (L1):** Receives raw claims in any supported format.
* **Dependency Resolver (L3):** Maps the complete dependency chain down to logical/physical axioms with no artificial depth limit.
* **Adversarial Validation Cycle (L5):** Prosecutor agent attacks the claim, Defender agent supports it, and a stateless Adjudicator evaluates the exchange based on evidence.
* **Epistemic Framework (L6):** Calculates confidence bounded by the weakest dependency (Epistemic Pyramid).
* **Transparency Ledger (L7):** Commits finalized verdicts to an append-only Merkle tree.

### High-Risk Assumptions & Tests
* **Assumption 1:** Institutions will stake their reputation to join the Federation.
  * **Test:** [Research Pending: Early outreach to target NGOs/universities].
* **Assumption 2:** The public will donate sufficient idle GPU compute.
  * **Test:** [Research Pending: BOINC/Folding@Home style client prototype testing].
* **Assumption 3:** The LLM agents will not collude or hallucinate evidence during debate.
  * **Test:** Run Adjudicator on a separate model family (e.g., Qwen vs DeepSeek) to prevent shared biases.

---

## 8. Non-Functional Requirements

### 8.1 General Requirements
* **Immutability:** Past verdicts cannot be altered or deleted. The system must use a cryptographically secure Transparency Log.
* **Decentralization:** No single entity can hold a kill switch or dominate consensus.
* **Scale / Load:** [Research Pending: Expected claims per second, API request limits].
* **Uptime:** Achieved via federated redundancy and IPFS pinning.

### 8.2 AI-Specific Requirements (LLMs)
* **Adversarial Mandate:** The Prosecutor agent must be relentlessly adversarial, citing hard evidence to destroy claims. Unsourced assertions must be automatically discarded.
* **Stateless Adjudication:** The Adjudicator must have no prior context of the debate and must score based strictly on Source Reliability, Logical Coherence, and Cross-Verification Depth.
* **Model Separation:** Different LLM families must be used for different roles to prevent monoculture bias.
* **Measurement:** [Research Pending: Exact F1 thresholds or hallucination targets before mainnet launch].

---

## 9. Go-to-Market Approach & Launch Readiness

### Go-to-Market Approach
* **Phase 1 (Cold Start):** Focus on the Genesis Seed layer—resolving foundational Tier 0/1/2 nodes sourced from Wikidata, OpenAlex, and NIST.
* **Phase 2 (Science/Empirical):** Focus on scientific claims where the dependency tree relies on objective data.
* **Phase 3 (Political/Economic):** Expand to complex entity tracking and institutional claims once the foundational graph is dense.
* **Customer Acquisition:** [Research Pending: Strategy for acquiring API consumers in Tier 2-4].

### Launch Readiness
* **Key Milestones:** [Research Pending: Dates for Testnet, Consensus Module completion, Genesis Block].
* **Launch Checklist:** [Research Pending: Specific operational checks].

---

## 10. Open Questions & Decisions Taken

### Decisions Taken
* **Dropped Blockchain:** Removed Solana, Arweave, and the AVT token to prevent financialization and 51% capital attacks. Replaced with Transparency Logs, IPFS, and a Federated Web of Trust.
* **No Depth Limit:** Removed arbitrary depth limits on dependency chains; they must resolve to the axiom layer.
* **Dual-Node Model:** Institutional records and empirical reality are stored as separate nodes.

### Open Questions (Research Pending)
1. **Federated Node Sourcing:** Who will be the first 5-10 trusted institutions to form the genesis consortium?
2. **Compute Bottleneck:** If volunteer compute is insufficient at launch, what is the fallback funding for bare-metal Hetzner/Contabo GPU instances?
3. **IPFS Pinning Costs:** How will the storage of permanent evidence bundles be funded if not via Web3 tokens?
4. **Specific Market Metrics:** What are the exact TAM and CAGR figures for the target market segments?
