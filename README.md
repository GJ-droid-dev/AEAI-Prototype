# AEAI Prototype - Phase 2

This is the backend prototype for the **Adversarial Epistemic AI (AEAI)** Network. It implements a multi-agent adversarial framework designed to process, debate, and verify complex claims with rigorous epistemic scoring and transparency.

## Architecture

The prototype contains the following core modules:
- **`main.py`**: A FastAPI application providing the API endpoints for claim submission, background processing orchestration, and verdict retrieval.
- **`agents/`**: Contains the adversarial multi-agent debate logic. A claim is dynamically broken into sub-claims, which are then debated by a Prosecutor and Defender, and scored by a stateless Adjudicator.
- **`database/`**: Handles local storage of claim states, multi-round debate transcripts, and tracking of the Source Credibility Index (SCI).
- **`ledger/`**: Implements an append-only transparency ledger (Merkle tree structure) to permanently anchor verified verdicts and their proof-of-verification transcripts.

## Running the Prototype

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Start the FastAPI server:
   ```powershell
   ./run.ps1
   # or manually via:
   # uvicorn main:app --host 0.0.0.0 --port 8000
   ```
3. Open a browser and navigate to `http://localhost:8000/docs` to interact with the API via the Swagger UI.
