# Decisions

**Gemini over OpenAI/Anthropic for prototype LLM.**
User has active Gemini API access with Gemini 3.5 Flash available. Avoids additional API key management and cost. Can switch to self-hosted DeepSeek/Qwen in production.

**Serper.dev over DuckDuckGo search SDK.**
DuckDuckGo SDK was unreliable and had scraping-based limitations. Serper.dev provides a proper API with structured JSON responses and Google-quality search results.

**SQLite over PostgreSQL for prototype database.**
Single-file database with zero setup. No connection strings, no Docker, no migrations. Good enough for a local prototype. Will migrate to PostgreSQL + Apache AGE for production (graph traversal needed for DAG).

**FastAPI over Node.js/Fastify for prototype API.**
The agent orchestration is in Python (LangGraph), so keeping the API in Python avoids a cross-language bridge. Production spec calls for Node.js + Fastify, but for prototype, single-language stack is simpler.

**LangGraph over raw function calls for agent orchestration.**
LangGraph provides typed state, explicit edges, and a compilable graph — making the Prosecutor → Defender → Adjudicator flow declarative and debuggable. Raw function calls would work but give no visibility into state transitions.

**Single-pass AVC over multi-round loop for Phase 1.**
Multi-round adds complexity (round tracking, loop termination, evidence deduplication). Single-pass proves the debate mechanism works. Multi-round is Phase 2.

**Same model for all three agents in Phase 1.**
The AVC spec requires different model families for Adjudicator vs. Prosecutor/Defender. In Phase 1, we use Gemini 3.5 Flash for all three to reduce complexity. Model separation is Phase 3.

**Append-only JSON file over a real Merkle tree library.**
A proper Merkle tree (like Trillian/Rekor) is production infrastructure. For prototype, a hash-chained JSON file proves the concept: each entry hashes the previous entry's hash + current payload. Tamper detection works the same way.

**Background tasks (FastAPI) over Celery/Redis for async processing.**
FastAPI's built-in `BackgroundTasks` avoids external dependencies (Redis, Celery worker processes). Sufficient for a single-user prototype. Will need a proper task queue for production.

**`extract_text()` helper over raw `response.content` access.**
Gemini 3.x models return content as a list of dicts instead of a string. The helper normalizes both formats. This prevents runtime crashes and must be used everywhere we read LLM output.

**`run.ps1` script over manual env var setup.**
Environment variables set in PowerShell are lost when the terminal closes. The run script sets them every time, eliminating a recurring user error.

**`/docs` redirect on root URL over a custom landing page.**
No frontend is in scope. Redirecting `/` to the Swagger UI gives users an immediate interactive testing interface without building any HTML.

**INCONCLUSIVE over DISPUTED for Phase 1 verdict.**
The AVC spec defines DISPUTED as "AVC completed but threshold not reachable." Phase 1 has no threshold logic or multi-round exhaustion, so INCONCLUSIVE is used as the catch-all for ambiguous results. DISPUTED will be properly implemented in Phase 2.

**3 search results per query over 10+.**
Minimizes Serper.dev API usage during development and testing. Will increase to 10+ in Phase 2 when evidence depth matters more.
