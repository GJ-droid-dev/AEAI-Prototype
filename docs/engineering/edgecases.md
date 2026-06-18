# Edge Cases

## Anticipated

### 1. Empty LLM Response
**Scenario:** Gemini returns an empty string or empty list for the Prosecutor or Defender.
**Observed:** Yes — the "Sun is Round" claim returned empty Prosecutor and Defender arguments, causing the Adjudicator to mark it INCONCLUSIVE with reasoning "Both failed to provide any arguments."
**Mitigation (current):** The Adjudicator sees the empty transcript and correctly reports the gap. No false verdict is produced.
**Mitigation (future):** Detect empty responses and retry the LLM call up to 2 times before proceeding.

### 2. Gemini Content Returns List Instead of String
**Scenario:** Gemini 3.x models return `response.content` as a Python list of dicts `[{'type': 'text', 'text': '...'}]` instead of a plain string.
**Observed:** Yes — caused `json.loads()` to fail with "the JSON object must be str, bytes or bytearray, not list".
**Mitigation (current):** `extract_text()` helper normalizes both formats. Applied to all three agent nodes.

### 3. Model Not Found (404)
**Scenario:** The Gemini model name is invalid or not available on the user's API key.
**Observed:** Yes — `gemini-1.5-pro` and `gemini-1.5-pro-latest` both returned 404 NOT_FOUND. Only `gemini-3.5-flash` worked.
**Mitigation (current):** Updated model name to `gemini-3.5-flash`. Error is caught and stored in the transcript field.

### 4. API Key Not Set
**Scenario:** User runs the server without setting `GOOGLE_API_KEY` or `SERPER_API_KEY`.
**Observed:** Yes — Pydantic ValidationError thrown at module import time for missing Gemini key.
**Mitigation (current):** `run.ps1` script sets both env vars automatically. `search_tool()` returns a descriptive error string if `SERPER_API_KEY` is missing.

### 5. Subjective/Moral Claims
**Scenario:** User submits a non-empirical claim like "Murderers should be executed."
**Observed:** Yes — returned INCONCLUSIVE at 0.85 confidence. The Adjudicator correctly identified that the claim relies on moral frameworks rather than empirical evidence.
**Expected behavior:** INCONCLUSIVE or DISPUTED is the correct verdict for normative claims. The system should never produce VERIFIED or REFUTED for pure value judgments.

### 6. Serper API Rate Limiting
**Scenario:** Too many search requests exhaust the free tier or hit rate limits.
**Observed:** Not yet.
**Mitigation:** `search_tool()` catches all exceptions and returns an error string. The agent will still generate a response, but with weaker evidence. Future: add retry with exponential backoff.

### 7. SQLite Concurrent Writes
**Scenario:** Multiple background tasks write to SQLite simultaneously.
**Observed:** Not yet — but will occur under load.
**Mitigation (future):** Use connection pooling or switch to PostgreSQL for production.

---

## Discovered During Build

### 8. PowerShell `curl` Alias
**Scenario:** User runs `curl` commands from PowerShell. PowerShell aliases `curl` to `Invoke-WebRequest`, which uses completely different syntax.
**Observed:** Yes — `-H "Content-Type: application/json"` failed with "Cannot bind parameter 'Headers'".
**Mitigation:** Documentation now uses `Invoke-RestMethod` with PowerShell-native syntax. Swagger UI at `/docs` recommended as the primary testing interface.

### 9. Wrong Working Directory
**Scenario:** User runs `py -3.11 main.py` from the parent directory instead of `prototype/`.
**Observed:** Yes — "can't open file 'main.py': No such file or directory".
**Mitigation:** `run.ps1` is placed inside `prototype/` and must be run from there. Documentation updated.

### 10. Environment Variables Lost on Terminal Restart
**Scenario:** User sets `$env:GOOGLE_API_KEY` in one PowerShell session, closes it, opens a new one — key is gone.
**Observed:** Yes — led to repeated Pydantic ValidationErrors.
**Mitigation:** `run.ps1` sets both keys every time it runs, eliminating the problem.
