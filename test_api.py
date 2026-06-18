import requests
import time
import json

base_url = "http://localhost:8000"

claim = "Water boils at 100 degrees Celsius at sea level."
print(f"Submitting claim: {claim}")

try:
    res = requests.post(f"{base_url}/verify", json={"claim_text": claim})
    res.raise_for_status()
    data = res.json()
    claim_id = data["claim_id"]
    print(f"Got claim ID: {claim_id}")
    print("Waiting for background agents to finish debate and verification...")
    
    while True:
        poll_res = requests.get(f"{base_url}/verdict/{claim_id}")
        poll_data = poll_res.json()
        status = poll_data.get("status")
        
        if status != "IN_RESEARCH":
            print("\n" + "="*50)
            print("VERIFICATION COMPLETE")
            print("="*50)
            print(f"Status: {status}")
            print(f"Verdict: {poll_data.get('verdict')}")
            print(f"Confidence: {poll_data.get('confidence_score')}")
            
            if "transparency_proof" in poll_data:
                print(f"Ledger Root Hash: {poll_data['transparency_proof']['entry_hash']}")
                
            print("\n--- Summary ---")
            print(poll_data.get("transcript", "")[:500] + "...\n[Transcript truncated for display]")
            break
            
        print(".", end="", flush=True)
        time.sleep(3)
        
except Exception as e:
    print(f"\nError: {e}")
