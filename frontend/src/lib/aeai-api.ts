// AEAI Backend API client
// Configure backend URL via VITE_AEAI_API_URL (defaults to http://localhost:8000)

export const AEAI_API_URL =
  (import.meta as any).env?.VITE_AEAI_API_URL || "http://localhost:8000";

export type VerifyResponse = {
  claim_id: string;
  status: string;
};

export type SubClaimResult = {
  sub_claim?: string;
  verdict?: string;
  confidence_score?: number;
  rounds_used?: number;
  reasoning?: string;
  unresolved_questions?: string[];
  debate_log?: any[];
};

export type VerdictResponse = {
  claim_id: string;
  claim_text: string;
  status: string;
  verdict?: string;
  confidence_score?: number;
  transcript?: string;
  sub_claims?: any[];
  corrected_claim?: string;
  concise_reasoning?: string;
  unresolved_questions?: string[];
  transparency_proof?: {
    index: number;
    entry_hash: string;
    prev_hash: string;
  };
};

export async function submitClaim(claim_text: string): Promise<VerifyResponse> {
  const res = await fetch(`${AEAI_API_URL}/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ claim_text }),
  });
  if (!res.ok) throw new Error(`Submit failed: ${res.status} ${res.statusText}`);
  return res.json();
}

export async function getVerdict(claim_id: string): Promise<VerdictResponse> {
  const res = await fetch(`${AEAI_API_URL}/verdict/${claim_id}`);
  if (!res.ok) throw new Error(`Verdict fetch failed: ${res.status}`);
  return res.json();
}

export async function pollVerdict(
  claim_id: string,
  opts: { intervalMs?: number; timeoutMs?: number; signal?: AbortSignal } = {},
): Promise<VerdictResponse> {
  const interval = opts.intervalMs ?? 3000;
  const timeout = opts.timeoutMs ?? 5 * 60 * 1000;
  const start = Date.now();
  while (true) {
    if (opts.signal?.aborted) throw new Error("Aborted");
    const v = await getVerdict(claim_id);
    if (v.status && v.status !== "IN_RESEARCH") return v;
    if (Date.now() - start > timeout) throw new Error("Timed out waiting for verdict");
    await new Promise((r) => setTimeout(r, interval));
  }
}

export type EvidenceItem = {
  source_url?: string;
  domain?: string;
  quote_snippet?: string;
  epistemic_tier?: number;
  coi_flag?: boolean;
};

export type DebatePacket = {
  argument_summary?: string;
  evidence_items?: EvidenceItem[];
};

export type DebateRound = {
  round?: number;
  prosecutor_packet?: string; // JSON string
  defender_packet?: string;   // JSON string
};

export function parsePacket(s?: string): DebatePacket {
  if (!s) return {};
  try { return JSON.parse(s); } catch { return { argument_summary: s }; }
}

export type SciEntry = { domain: string; score: number; appearances: number };
export type SciResponse = { sources: SciEntry[] };

export async function getSci(): Promise<SciResponse> {
  const res = await fetch(`${AEAI_API_URL}/sci`);
  if (!res.ok) throw new Error(`SCI fetch failed: ${res.status}`);
  return res.json();
}
