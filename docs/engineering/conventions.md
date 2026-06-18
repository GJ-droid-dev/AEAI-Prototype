# Conventions

## Folder Structure

```
AEAIsinBlockchain/
├── problemStatement.md
├── architecture.md
├── implementationPlan.md
├── conventions.md          ← this file
├── edgecases.md
├── evals.md
├── decisions.md
├── AEAI_PRD.md
├── context.md
├── Protoype_plan.md
│
└── prototype/
    ├── main.py             ← FastAPI server, entrypoint
    ├── requirements.txt
    ├── run.ps1             ← Sets env vars and starts server
    │
    ├── agents/
    │   ├── __init__.py
    │   ├── graph.py        ← LangGraph state machine + agent nodes
    │   └── prompts.py      ← System prompts for all 3 agents
    │
    ├── database/
    │   ├── __init__.py
    │   ├── db.py           ← SQLite CRUD operations
    │   └── aeai_dag.db     ← auto-generated at runtime
    │
    └── ledger/
        ├── __init__.py
        ├── merkle.py       ← Transparency log hash chain
        └── transparency_log.json  ← auto-generated at runtime
```

## Naming Conventions

- **Files:** `snake_case.py` for Python, `camelCase.md` for project documentation
- **Classes:** `PascalCase` (e.g., `AgentState`, `ClaimRequest`)
- **Functions:** `snake_case` (e.g., `prosecutor_node`, `search_tool`)
- **Constants:** `UPPER_SNAKE_CASE` (e.g., `PROSECUTOR_PROMPT`, `DB_PATH`)
- **Claim IDs:** UUID v4 strings (e.g., `f8f98258-85cd-4cb5-ade4-a86742d94ef9`)

## Libraries — Use These

| Purpose | Library | Why |
|---|---|---|
| API server | FastAPI + Uvicorn | Async-capable, auto-generates OpenAPI docs |
| LLM orchestration | LangGraph + LangChain | State machine with typed state, handles agent flow |
| LLM provider | langchain-google-genai | Direct Gemini API access |
| Web search | requests + Serper.dev API | Simple HTTP calls, no heavy SDK |
| Database | sqlite3 (stdlib) | Zero dependencies, file-based, good enough for prototype |
| Hashing | hashlib (stdlib) | SHA-256, deterministic, no external deps |

## Libraries — Do NOT Use

- **DuckDuckGo search SDK** — removed; replaced by Serper.dev
- **OpenAI SDK** — we use Gemini, not GPT
- **SQLAlchemy** — overkill for a single-table prototype
- **TailwindCSS / React** — no frontend in prototype scope

## Error Handling Patterns

- All LLM calls wrapped in try/except. Failures write `ERROR` status to SQLite with the exception message as the transcript.
- Search failures return a descriptive error string (e.g., "Search error: ...") that gets passed to the LLM as context — the agent must work with whatever evidence it has.
- Gemini responses may return content as a `list` instead of `str`. Always use the `extract_text()` helper in `graph.py` to normalize.

## Environment Variables

| Variable | Required | Purpose |
|---|---|---|
| `GOOGLE_API_KEY` | Yes | Authenticates with Google Gemini API |
| `SERPER_API_KEY` | Yes | Authenticates with Serper.dev search API |

Set them in PowerShell before running, or use `run.ps1` which does it automatically.

## Patterns to Avoid

- **Never instantiate the LLM inside a node function** — use the module-level `llm` instance (except for `llm_json` in the Adjudicator, which needs `response_mime_type`).
- **Never edit pre-existing files outside `AEAIsinBlockchain/`** — all new work goes in this folder.
- **Never return partial/provisional verdicts** — a claim is either IN_RESEARCH, VERIFIED, REFUTED, INCONCLUSIVE, or ERROR. Nothing in between.
- **Never use `response.content` directly** — always pass through `extract_text()` first, because Gemini 3.x models may return list-of-dicts instead of strings.
