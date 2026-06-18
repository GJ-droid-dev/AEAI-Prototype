# Evals

## Phase 1 — Core AVC Prototype

Written before Phase 1 began. All tests are manual (no pytest yet).

### Test 1: Server Starts Successfully
**Scenario:** Run `.\run.ps1` from `prototype/` directory.
**Expected:** Uvicorn starts, prints "Uvicorn running on http://0.0.0.0:8000".
**Pass/Fail Criteria:** Server must start without import errors or crashes.
**Result:** PASS — server starts correctly with Gemini 3.5 Flash.

### Test 2: Submit a Clearly False Claim
**Scenario:** `POST /verify` with `{"claim_text": "The Earth is flat."}`
**Expected:** Returns `claim_id` and `IN_RESEARCH` status immediately. After ~30 seconds, `GET /verdict/{id}` returns REFUTED with confidence > 0.8.
**Pass/Fail Criteria:** Verdict must be REFUTED. Confidence must be > 0.5. Transcript must contain cited evidence.
**Result:** PASS — returned REFUTED with confidence 1.0, full debate transcript with cited sources.

### Test 3: Submit a Subjective/Moral Claim
**Scenario:** `POST /verify` with `{"claim_text": "Murderers should be executed"}`
**Expected:** Returns INCONCLUSIVE or DISPUTED. System should not pretend to verify normative claims.
**Pass/Fail Criteria:** Verdict must NOT be VERIFIED. Reasoning must acknowledge the normative nature.
**Result:** PASS — returned INCONCLUSIVE at 0.85 confidence with reasoning explaining reliance on moral frameworks.

### Test 4: Transparency Log Integrity
**Scenario:** Submit two claims sequentially. Check `transparency_log.json`.
**Expected:** Log contains two entries. Second entry's `prev_hash` matches first entry's `hash`. Both have SHA-256 hashes.
**Pass/Fail Criteria:** Hash chain must be valid. No entry can exist without a `prev_hash` pointing to the previous entry (or GENESIS for the first).
**Result:** PASS — verified hash chain with GENESIS → entry 1 → entry 2.

### Test 5: Verdict Endpoint Returns Merkle Proof
**Scenario:** `GET /verdict/{id}` for a completed claim.
**Expected:** Response includes `transparency_proof` with `index`, `entry_hash`, and `prev_hash`.
**Pass/Fail Criteria:** `transparency_proof` must be present and non-null for completed claims.
**Result:** PASS — proof returned with correct index and hash values.

### Test 6: Error Recovery
**Scenario:** Submit a claim when the LLM model name is invalid.
**Expected:** Claim status updates to ERROR. Transcript field contains the error message.
**Pass/Fail Criteria:** Server must not crash. Error must be stored in the database, not lost.
**Result:** PASS — error message stored in transcript field, server remained operational.

---

## Phase 2 — Multi-Round AVC (COMPLETE)

### Test 7: Claim Decomposition
**Scenario:** Submit "Vaccines cause autism and the government is hiding it."
**Expected:** System decomposes into at least 2 sub-claims: "Vaccines cause autism" and "The government is hiding evidence that vaccines cause autism." Each debated independently.
**Pass/Fail Criteria:** Sub-claims must be individually resolved. Parent claim verdict must reflect the weakest sub-claim.
**Result:** PASS — System decomposed the claim and debated each sub-claim independently.

### Test 8: Multi-Round Loop
**Scenario:** Submit a genuinely ambiguous claim where evidence is split.
**Expected:** Adjudicator returns confidence below threshold on first round. System loops back for a second round of Prosecutor/Defender debate with new search queries.
**Pass/Fail Criteria:** Round counter must increment. New evidence must be gathered in subsequent rounds. Loop must terminate (max rounds or evidence exhaustion).
**Result:** PASS — Multi-round loops correctly trigger when confidence is below the threshold and stop at `max_rounds`.

### Test 9: DISPUTED Verdict
**Scenario:** Submit a claim where available evidence is genuinely insufficient.
**Expected:** After max rounds, system returns DISPUTED (not INCONCLUSIVE or ERROR).
**Pass/Fail Criteria:** DISPUTED must be a valid, committed verdict with a full PoV.
**Result:** PASS — The adjudicator can correctly output DISPUTED if the maximum number of rounds is reached and evidence remains insufficient.

---

## Phase 3 — Model Separation (Not Yet Started)

### Test 10: Model Family Verification
**Scenario:** Inspect the model names used by Prosecutor/Defender vs. Adjudicator.
**Expected:** They must be from different model families (e.g., Gemini Flash vs. Gemini Pro, or DeepSeek vs. Qwen).
**Pass/Fail Criteria:** Model names must differ. Same model for Prosecutor + Defender is acceptable; same model for Adjudicator is not.

### Test 11: Structured Attack/Defense Packets
**Scenario:** Submit a claim and inspect the raw output of Prosecutor and Defender nodes.
**Expected:** Output matches the structured JSON schema (citations, tier assessments, COI flags).
**Pass/Fail Criteria:** JSON must parse. Required fields must be present.
