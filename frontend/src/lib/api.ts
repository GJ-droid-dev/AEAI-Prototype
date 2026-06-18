const API_BASE_URL = 'http://localhost:8000';

export interface VerificationResponse {
  claim_id: string;
  status: string;
}

export interface VerdictResponse {
  claim_id: string;
  claim_text: string;
  status: string;
  verdict?: string;
  confidence_score?: number;
  transcript?: string;
  sub_claims?: any[];
  transparency_proof?: {
    index: number;
    hash: string;
    previous_hash: string;
  };
}

export const submitClaim = async (claimText: string): Promise<VerificationResponse> => {
  const response = await fetch(`${API_BASE_URL}/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ claim_text: claimText }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to submit claim');
  }
  
  return response.json();
};

export const getVerdict = async (claimId: string): Promise<VerdictResponse> => {
  const response = await fetch(`${API_BASE_URL}/verdict/${claimId}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch verdict');
  }
  
  return response.json();
};
