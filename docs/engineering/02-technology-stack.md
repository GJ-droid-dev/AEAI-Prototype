# Technology Stack (Federated Architecture)

## Overview

The AEAI technology stack is designed to prioritize **verifiability, immutability, and decentralization** without relying on blockchain or Web3 components. It relies on standard web technologies, federated node architecture, cryptographic transparency logs, and self-hosted AI models.

## 1. Consensus & Ledger

| Component | Technology | Rationale |
|---|---|---|
| **Transparency Log** | Merkle Trees (Trillian / Rekor style) | Provides an append-only, tamper-evident ledger for verdicts. Hash chains ensure history cannot be rewritten without detection. Zero transaction fees. |
| **Identity & Trust** | Web of Trust (PKI) | Validators are known institutional entities that sign their Proof of Verification (PoV) with public/private key pairs. Replaces anonymous token staking. |
| **Consensus Engine** | Federated Supermajority | A verdict requires cryptographic signatures from a supermajority of assigned federation members before inclusion in the log. |

## 2. Storage & Evidence

| Component | Technology | Rationale |
|---|---|---|
| **Evidence Bundles** | IPFS (InterPlanetary File System) | Content-addressing ensures that evidence cited in a verdict cannot be altered without changing the CID. |
| **Permanent Pinning** | Institutional Pinning Servers | Replaces Arweave. Consortium members and watchdogs (e.g., Internet Archive) mandate pinning of PoV CIDs on their own infrastructure. |
| **Primary Database** | PostgreSQL + Apache AGE (graph) | AGE adds graph traversal to Postgres for managing the Knowledge DAG and dependency resolution. |
| **Vector Search** | pgvector → Qdrant | Used for semantic gating and retrieving evidence from the corpus. pgvector handles early scale; Qdrant at 50M+ nodes. |

## 3. Compute & AI Inference

| Component | Technology | Rationale |
|---|---|---|
| **LLM Agents (Core)** | DeepSeek V3 (via vLLM) | Prosecutor and Defender agents. Self-hosting eliminates API costs and reliance on centralized providers (OpenAI/Anthropic). |
| **Reasoning Agent** | DeepSeek R1 | Used for Claim Decomposition and Confidence Delta classification. |
| **Adjudicator** | Qwen3.5 or Mistral | Uses a different model family from the Prosecutor/Defender to prevent shared model biases. |
| **Distributed Compute** | BOINC / Volunteer Compute | Replaces token mining. The public can donate idle GPU compute to trusted institutional nodes to process the adversarial debate. |
| **Infrastructure** | Hetzner / Contabo Bare Metal | GPU bare metal is 3–5× cheaper than AWS/GCP, significantly lowering the barrier for institutions to run a validator node. |

## 4. Orchestration & API

| Component | Technology | Rationale |
|---|---|---|
| **Agent Orchestration**| Python + LangGraph | Manages the Adversarial Validation Cycle loop, state passing, and multi-agent debate coordination. |
| **API Server** | Node.js + Fastify | Consumer-facing Output API for tier-gated access, rate limiting, and webhook delivery. |
| **Cache & Queue** | Redis + BullMQ | Manages the Research Queue (L4) and distributed task delegation across volunteer workers. |
| **Containerization** | K3s → Kubernetes | Ensures reproducible deployments across federated nodes. |

## Cost Reduction Strategy

By eliminating blockchain transaction costs (Solana) and decentralized storage fees (Arweave), the protocol's operating cost is driven entirely by **GPU inference**. 

- Self-hosting open-weight models drops API costs to $0.
- Bare metal hosting minimizes hardware amortization costs.
- Volunteer distributed compute offloads the inference burden from the core federation to the public, similar to Folding@Home.
