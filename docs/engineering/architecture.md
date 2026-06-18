# Architecture

## System Shape

AEAI is a Python backend application with a REST API. There is no frontend in the prototype. The system runs locally on a single machine.

```
┌─────────────────────────────────────────────────────────┐
│                    Consumer (curl / Swagger UI)          │
│                   http://localhost:8000/docs              │
└──────────────────────────┬──────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                  FastAPI Server (main.py)                │
│                                                         │
│  POST /verify  ──►  Background Task                     │
│  GET /verdict/{id}  ──►  SQLite Lookup + Merkle Proof   │
│  GET /  ──►  Redirect to /docs                          │
└──────────┬──────────────┬──────────────┬───────────────┘
           │              │              │
           ▼              ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────────┐
│ agents/      │ │ database/    │ │ ledger/          │
│  graph.py    │ │  db.py       │ │  merkle.py       │
│  prompts.py  │ │  aeai_dag.db │ │  transparency_   │
│              │ │              │ │  log.json        │
└──────┬───────┘ └──────────────┘ └──────────────────┘
       │
       │  LangGraph State Machine
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│              Adversarial Validation Cycle (AVC)          │
│                                                         │
│  ┌────────────┐    ┌────────────┐    ┌──────────────┐  │
│  │ Prosecutor │───►│  Defender   │───►│ Adjudicator  │  │
│  │  (Attack)  │    │  (Defend)  │    │   (Judge)    │  │
│  └─────┬──────┘    └─────┬──────┘    └──────┬───────┘  │
│        │                 │                  │           │
│        ▼                 ▼                  ▼           │
│   Serper.dev API    Serper.dev API    JSON Verdict      │
│   (3 results)       (3 results)      + Confidence      │
└─────────────────────────────────────────────────────────┘
```

## Components

### 1. API Server — `main.py`
- **Framework:** FastAPI with Uvicorn
- **Responsibilities:** Receives claims, spawns background tasks, serves verdicts
- **Endpoints:** `POST /verify`, `GET /verdict/{id}`, `GET /` (redirect to docs)

### 2. Agent Orchestration — `agents/graph.py`
- **Framework:** LangGraph (StateGraph)
- **LLM:** Google Gemini 3.5 Flash via `langchain-google-genai`
- **Flow:** Linear pipeline — Prosecutor → Defender → Adjudicator → END
- **Search:** Serper.dev API (Google search), 3 results per query

### 3. Agent Prompts — `agents/prompts.py`
- System prompts encoding AVC behavioral rules for each agent
- Prosecutor: adversarial-by-default, evidence-only, no steelman
- Defender: best-evidence, scope normalization, must model limitations
- Adjudicator: confidence ceiling, evidence-only, records ≠ reality

### 4. Database — `database/db.py`
- **Engine:** SQLite
- **Schema:** Single `claims` table (id, claim_text, status, confidence_score, transcript, created_at)
- **Role:** Stores claim state and verdict results

### 5. Transparency Ledger — `ledger/merkle.py`
- **Structure:** Append-only hash chain (simplified Merkle tree)
- **Storage:** Local JSON file (`transparency_log.json`)
- **Hashing:** SHA-256 with deterministic JSON serialization
- **Proof:** Returns inclusion proof (index, entry hash, previous hash)

## Third-Party Services

| Service | Purpose | Auth |
|---|---|---|
| Google Gemini API | LLM for all 3 agents | `GOOGLE_API_KEY` env var |
| Serper.dev | Google search results for evidence gathering | `SERPER_API_KEY` env var |

## Key Data Flows

1. **Submit Claim:** Consumer → `POST /verify` → Insert into SQLite (status=IN_RESEARCH) → Spawn background task → Return claim_id immediately
2. **Background Processing:** Run LangGraph AVC (Prosecutor → Defender → Adjudicator) → Append verdict to Merkle log → Update SQLite with verdict + transcript
3. **Poll Verdict:** Consumer → `GET /verdict/{id}` → Read from SQLite → Attach Merkle inclusion proof → Return full result

## What Is NOT Built Yet (Production Scope)

- No multi-round AVC loop (currently single-pass)
- No claim decomposition agent
- No dependency resolver / DAG traversal
- No multi-validator consensus
- No IPFS evidence storage
- No SCI (Source Credibility Index) tracking
- No Entity Bias Engine
- No federated node communication
- No frontend UI
