# How AEAI Works: A Simple Walkthrough

This document explains the step-by-step journey of a claim through the AEAI system, written in plain English.

## The Example Claim

**"A major pharmaceutical company hid evidence of serious side effects in its top-selling drug."**

---

## The Step-by-Step Journey

### 1. Receiving the Claim (Data Ingestion)
The system receives the statement just as a person would say it. It then organizes the words into a clear format it can work with, identifying the key players (like the company and the drug). At this stage, it doesn't try to decide if the claim is true or false; it just listens and records it.

### 2. Checking the Memory (Semantic Gate)
Before doing any hard work, the system checks its memory to see if someone has already asked about this exact claim. If the claim has already been investigated and verified, it can provide the answer immediately. In our example, this is a new claim, so it moves forward.

### 3. Breaking it Down (Dependency Resolver)
To prove the main claim, the system breaks it down into smaller, simpler facts that must be true first. For example, before we can prove the company "hid evidence," we first have to prove that "the drug exists," "side effects actually happened," and "the company had access to that information." 

### 4. Setting Priorities (Research Queue)
The system decides which of these smaller facts to investigate first. It prioritizes the facts that are most foundational or that might be useful for other claims in the future. Proving that the drug was officially approved is put at the top of the list.

### 5. The Debate (Adversarial Validation)
This is the heart of the system. AI agents debate the claim like lawyers in a courtroom. One agent (the Prosecutor) tries to tear the claim apart and prove it wrong. Another agent (the Defender) uses documents and evidence to defend it. A neutral judge watches the debate and gives it a score based on how strong the evidence is.

### 6. Scoring the Truth (Epistemic Framework)
The system calculates a final confidence score. It follows a strict rule: a chain of evidence is only as strong as its weakest link. Even if some evidence is excellent, if one critical piece relies on a less reliable source, the final score is capped to reflect that weakness.

### 7. The Permanent Record (Transparency Ledger)
Once a decision is reached, the result and all the evidence used to make it are written into a public, permanent record. This record cannot be edited or deleted by anyone. This ensures that anyone can audit the system's work and see exactly how it reached its conclusion.

### 8. Connecting the Dots (Knowledge Graph)
The newly verified claim is added to a massive, growing web of knowledge. It is connected to all the smaller facts that supported it. If any of those supporting facts ever change in the future, the system knows exactly which claims need to be updated.

### 9. Checking Reputations (Source Credibility)
The system evaluates the reputation of the sources that provided evidence. Trust is earned, not given. If a source (like a scientific journal or a government report) has a history of being accurate, its evidence carries more weight. If a source has a conflict of interest—like the pharmaceutical company providing its own safety study—that evidence is trusted less.

### 10. Identifying Bias (Entity Bias Engine)
The system looks at the history of the organizations involved to see if they have a track record of bias (for example, a history of only citing favorable studies). If a history of bias is detected, the system slightly lowers the confidence score to account for it.

### 11. Investigating Sudden Changes (Confidence Delta)
If new evidence comes out later that drastically changes the system's confidence in a claim, it triggers a special investigation. It tries to figure out *why* the truth changed—was evidence deliberately hidden, was it a simple mistake, or has science simply progressed over time?

### 12. Expiration Dates (Staleness Engine)
Facts can change over time. The system assigns an "expiration date" to the claim based on the type of evidence used. When the time is up, or if new related evidence is discovered, the system automatically schedules the claim to be re-investigated to make sure it is still true.

### 13. The Foundation (Axiom Registry)
Every chain of reasoning in the system must ultimately trace back to undeniable, universal facts—like basic laws of math and physics. This ensures the entire system is built on a rock-solid foundation that cannot be challenged.

### 14. Delivering the Answer (Output)
Finally, the system shares its verdict. Depending on who is asking, it might provide a simple summary (for the general public) or the complete bundle of evidence and debate transcripts (for researchers or journalists). It never guesses; it only provides an answer when it has fully resolved the claim.

---

## The Final Verdict

- **Result:** Verified
- **Confidence Level:** Moderate (The system is fairly confident, but recognizes limitations in the available evidence).

**Why this decision was reached:**
- The AI agents had a strong debate, but the final score was limited by the quality of the weakest piece of essential evidence.
- The system discovered a conflict of interest because the company provided its own safety study, which lowered trust.
- The company was flagged for having a historical bias in how it reports data.
- The final decision, along with all this reasoning, was permanently recorded for anyone to verify.
