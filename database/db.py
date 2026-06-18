import sqlite3
import os
import json

DB_PATH = os.path.join(os.path.dirname(__file__), "aeai_dag.db")

def get_connection():
    return sqlite3.connect(DB_PATH)

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS claims (
        id TEXT PRIMARY KEY,
        claim_text TEXT NOT NULL,
        status TEXT NOT NULL,
        confidence_score REAL,
        transcript TEXT,
        sub_claims TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    # Migration: add sub_claims column if it doesn't exist (for existing DBs)
    try:
        cursor.execute("ALTER TABLE claims ADD COLUMN sub_claims TEXT")
    except sqlite3.OperationalError:
        pass  # Column already exists

    # Source Credibility Index table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS source_credibility (
        domain TEXT PRIMARY KEY,
        score REAL NOT NULL,
        appearances INTEGER NOT NULL DEFAULT 1
    )
    """)
    
    conn.commit()
    conn.close()

def insert_claim(claim_id: str, claim_text: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO claims (id, claim_text, status) VALUES (?, ?, ?)",
        (claim_id, claim_text, "IN_RESEARCH")
    )
    conn.commit()
    conn.close()

def update_claim_verdict(claim_id: str, status: str, confidence_score: float, transcript: str, sub_claims_json: str = None):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE claims SET status = ?, confidence_score = ?, transcript = ?, sub_claims = ? WHERE id = ?",
        (status, confidence_score, transcript, sub_claims_json, claim_id)
    )
    conn.commit()
    conn.close()

def get_claim(claim_id: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM claims WHERE id = ?", (claim_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return {
            "id": row[0],
            "claim_text": row[1],
            "status": row[2],
            "confidence_score": row[3],
            "transcript": row[4],
            "sub_claims": row[5],
            "created_at": row[6] if len(row) > 6 else None
        }
    return None

def update_sci(domain: str, is_reliable: bool):
    """Adjusts the credibility score of a domain. Positive evaluation adds 0.1, negative subtracts 0.2."""
    if not domain:
        return
        
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT score, appearances FROM source_credibility WHERE domain = ?", (domain,))
    row = cursor.fetchone()
    
    if row:
        current_score, appearances = row
        new_score = current_score + 0.1 if is_reliable else current_score - 0.2
        # Bound score between 0.0 and 1.0
        new_score = max(0.0, min(1.0, new_score))
        cursor.execute(
            "UPDATE source_credibility SET score = ?, appearances = ? WHERE domain = ?",
            (new_score, appearances + 1, domain)
        )
    else:
        # Starting score is 1.0, immediately applying the modifier
        initial_score = 1.0 + 0.1 if is_reliable else 1.0 - 0.2
        initial_score = max(0.0, min(1.0, initial_score))
        cursor.execute(
            "INSERT INTO source_credibility (domain, score, appearances) VALUES (?, ?, ?)",
            (domain, initial_score, 1)
        )
        
    conn.commit()
    conn.close()

def get_all_sci():
    """Returns all domains and their credibility scores."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT domain, score, appearances FROM source_credibility ORDER BY score DESC")
    rows = cursor.fetchall()
    conn.close()
    
    return [{"domain": r[0], "score": r[1], "appearances": r[2]} for r in rows]

if __name__ == "__main__":
    init_db()
