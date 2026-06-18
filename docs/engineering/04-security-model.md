# Security Model (Federated Architecture)

## The Core Directive

The primary security objective of AEAI is **verdict integrity**: every committed verdict reflects the honest output of an adversarial validation process that no single party could control, corrupt, or suppress.

In the federated architecture, security relies on **Web of Trust, Cryptographic Auditability, and Multi-Institutional Consensus** rather than token staking.

## Threat Model (Five Adversary Classes)

### 1 — The Suppressor
- **Goal:** Wants to prevent a claim from being validated or remove a VERIFIED verdict from the system.
- **Attack Vector:** DDoS attacks against validators, legal injunctions, or state-level censorship.
- **Mitigation:**
  - **Merkle Transparency Logs:** Once a verdict is finalized, it is appended to a cryptographic log. Attempting to delete it breaks the hash chain, exposing the tampering mathematically.
  - **Decentralized Storage:** Evidence bundles are pinned across multiple jurisdictions (e.g., Internet Archive, universities in different countries) and backed by Torrent swarms.

### 2 — The Fabricator
- **Goal:** Wants a false claim to receive VERIFIED status.
- **Attack Vector:** Submitting false evidence, forging documents, or overwhelming the queue with repetitive false claims.
- **Mitigation:**
  - **Adversarial-by-Default:** The Prosecutor agent's sole mandate is to destroy incoming claims.
  - **Source Credibility Index (SCI):** Known unreliable sources are automatically penalized in the confidence formula.

### 3 — The Federation Cartel
- **Goal:** Coordinates institutional validators to dominate consensus and force through false verdicts.
- **Attack Vector:** Bribing or compromising a supermajority of the active federated nodes.
- **Mitigation:**
  - **Web of Trust Diversity:** The consortium is designed to require cross-domain consensus (e.g., an NGO, a public university, and an open-source foundation must all agree).
  - **Public Auditability (Fraud Proofs):** Because the Adjudicator's logic is open-source and deterministic given the evidence bundle, any third party can re-run the pipeline. If the cartel signs a verdict that contradicts the deterministic outcome, anyone can publish a Fraud Proof, instantly destroying the cartel's institutional reputation.

### 4 — The Infrastructure Attacker
- **Goal:** Hack the servers running the LLM agents or the Transparency Log.
- **Attack Vector:** Zero-days, lateral movement, or supply chain attacks on container images.
- **Mitigation:**
  - **Log Immutability:** Even if a node is fully compromised, it cannot alter past verdicts without invalidating the Merkle tree.
  - **Supermajority Requirement:** A hacked node can output garbage, but it cannot finalize a verdict without the rest of the uncompromised federation signing off.

### 5 — The Epistemic Manipulator
- **Goal:** Corrupts the evidence corpus rather than the AEAI pipeline itself.
- **Attack Vector:** P-hacking scientific studies, coordinated media disinformation campaigns, or creating fake journals (citation rings).
- **Mitigation:**
  - **Conflict of Interest (COI) Engine:** AEAI tracks institutional funding and cross-citations. High COI concentration artificially lowers the T_weight of the evidence.
  - **Entity Bias Engine:** Tracks the gap between an entity's claims and their verified actions, heavily discounting evidence from actors with high divergence scores.
