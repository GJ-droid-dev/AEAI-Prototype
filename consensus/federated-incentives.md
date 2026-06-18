# Federated Incentives (Replacing Token Economics)

## The Problem with Web3 Tokens in Epistemics

Originally, AEAI considered using a cryptographic token (AVT) to incentivize decentralized compute and consensus. However, injecting financial speculation into a system designed to determine objective truth introduces critical vulnerabilities:
1. **Capital Capture:** Wealthy entities can buy a supermajority of tokens, effectively purchasing the power to determine truth.
2. **Financialization of Truth:** Validators might optimize for token yield rather than thoroughness, attempting to shortcut the adversarial process.

## The Federated Reputation Economy

To solve this, AEAI operates on a **Web of Trust** built around institutional reputation, public funding, and volunteer compute.

### 1. The Validators (Federated Nodes)

Validators are known, independent entities (e.g., academic institutions, investigative journalism NGOs, open-source foundations). 

- **Reputation as Stake:** Instead of staking financial capital, they stake their public reputation.
- **The Slashing Mechanism:** If a validator signs a false Proof of Verification (PoV), any third party can cryptographically prove the fraud using the deterministic open-source logic. The fraudulent validator's signature is instantly invalidated by the network, and they face severe public reputational ruin.

### 2. Compute Incentives (Volunteer and Grant-Based)

Running the LLM agents requires massive GPU compute. How is this funded without a token?

1. **Volunteer Donated Compute (The BOINC Model):**
   - Similar to Folding@Home, individuals can install the AEAI Worker client.
   - The client requests "work units" from trusted institutional nodes.
   - The public donates their idle gaming GPUs or datacenter cycles to the pursuit of objective truth.

2. **Institutional Grants and Public Funding:**
   - Because AEAI provides an invaluable public good (an uncapturable truth engine), universities and NGOs can secure research grants to run aggregator nodes.
   - Zero API costs (via self-hosted open-weight LLMs) mean grant money goes entirely to bare-metal hardware amortization.

### 3. The Completeness Incentive

How do we ensure that difficult, highly contentious claims are processed instead of being ignored?
- The Research Queue (L4) routing is governed by the Consortium.
- Nodes are contractually or institutionally mandated to process their assigned queues.
- Failure to process assigned work units degrades a node's "Liveliness Score" within the federation, eventually leading to removal from the active consensus set.
