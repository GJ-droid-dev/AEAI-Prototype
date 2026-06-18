# Federated Architecture (Non-Blockchain Design)

## Overview

AEAI is engineered to be an uncapturable, permissionless truth-verification engine. Originally conceived as a blockchain-based (Web3) protocol using token economics, AEAI has evolved into a **Federated Transparency Network**. 

This document outlines the architectural patterns used to achieve immutability, decentralized consensus, and censorship resistance without the need for a token, staking, or a blockchain ledger.

## 1. Transparency Logs (Replacing the Blockchain Ledger)

The core requirement of AEAI is that **history cannot be rewritten**. Once a claim is verified, disputed, or refuted, the verdict and its evidence must remain permanently auditable.

Instead of a blockchain, AEAI uses **Cryptographic Transparency Logs** (similar to Certificate Transparency or Sigstore's Rekor).

- **Append-Only Merkle Trees:** Every finalized verdict is cryptographically signed and appended to a globally distributed Merkle tree.
- **Cryptographic Inclusion Proofs:** Anyone can request an inclusion proof to verify that a specific verdict exists in the log and has not been altered.
- **Independent Monitors:** Third-party auditors (watchdogs, universities, investigative journalists) continuously fetch tree heads. If a federated node attempts to silently drop or modify a past verdict, the hash chain breaks, and the fraud is mathematically proven instantly.

## 2. Federated Web of Trust (Replacing Token Economics)

A decentralized truth engine cannot be owned by a single company. Web3 solves this through anonymous, permissionless token staking. AEAI's federated model solves this through **institutional reputation**.

- **Federated Nodes:** The network is operated by a consortium of independent entities—such as academic institutions, open-source foundations, and investigative NGOs.
- **Reputation as Stake:** Instead of staking AVT tokens, these entities stake their institutional reputation.
- **Consensus:** A verdict requires a supermajority of the active federated nodes to cryptographically sign the result.
- **Fraud Proofs:** If a node signs a verdict that mathematically contradicts the deterministic outputs of the open-source epistemic framework, a "Fraud Proof" is generated. The malicious node is automatically ignored by the rest of the network and evicted from the consortium.

## 3. Persistent Content Storage (Replacing Arweave)

Every verdict includes a Proof of Verification (PoV) containing the full Adversarial Validation Cycle (AVC) transcripts and evidence bundles.

- **IPFS (InterPlanetary File System):** Evidence bundles are hashed to generate a Content Identifier (CID).
- **Institutional Pinning:** To ensure permanence without paying Web3 storage fees, consortium members mandate "pinning" of these CIDs on their own infrastructure.
- **Resilience:** Secondary backups are mirrored to the Internet Archive and Torrent networks, ensuring that even if the primary federation goes offline, the evidence remains accessible.

## 4. Volunteer Distributed Compute (Replacing Proof of Verification Mining)

The Adversarial Validation Cycle (AVC) requires massive GPU compute to run the LLM agents. 

- **BOINC-Style Volunteer Compute:** Similar to Folding@Home, individuals worldwide can donate idle GPU compute to AEAI.
- **Work Delegation:** Volunteer nodes request "work units" (claim validations) from trusted federated nodes.
- **Verification:** To prevent volunteers from submitting poisoned inference results, work units are redundantly assigned. The federated nodes act as aggregators and verifiers, signing the final PoV only when cross-volunteer consistency is achieved.

## 5. Standard-Body Governance (Replacing the DAO)

The epistemic rules, formula weights, and code updates are governed by a transparent, multi-stakeholder body.

- **The AEAI Consortium:** Modeled after the W3C, IETF, or Linux Foundation.
- **Constitutional Updates:** Changes to the protocol require public proposals, peer review, and a supermajority consensus among the steering committee members.
- **No Token Concentration:** Eliminates the risk of a single wealthy entity buying 51% of governance tokens to alter the rules of truth.

---

## The Inversion: Web3 vs. Federation

| Feature | Web3 Architecture | Federated Architecture |
|---|---|---|
| **Immutability** | Solana Smart Contracts | Merkle Transparency Logs |
| **Data Storage** | Arweave (Paid, permanent) | IPFS + Institutional Pinning |
| **Validators** | Anonymous, token-staked | Known institutions, reputation-staked |
| **Compute** | Mining for Token Rewards | Volunteer Donation (Folding@Home style) |
| **Governance** | Token-weighted DAO | Open Standards Consortium |
| **Capture Threat** | 51% capital accumulation attack | Multi-institutional collusion |
