import * as React from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { getVerdict } from '../lib/api';
import {
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Link as LinkIcon,
  MessageSquare,
  ShieldAlert,
  Gavel,
} from 'lucide-react';

export const Route = createFileRoute('/verdict/$id')({
  component: VerdictPage,
});

function VerdictPage() {
  const { id } = Route.useParams();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['verdict', id],
    queryFn: () => getVerdict(id),
    refetchInterval: (query) => {
      // Keep polling if status is IN_RESEARCH, otherwise stop.
      if (query.state.data?.status === 'IN_RESEARCH') return 3000;
      return false;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-6" />
        <h2 className="text-2xl font-semibold text-slate-800">Initializing AEAI Verification...</h2>
        <p className="text-slate-500 mt-2 max-w-md text-center">
          Our adversarial agents are currently debating the claim, cross-referencing evidence, and formulating an epistemic score. This usually takes 30-60 seconds.
        </p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <AlertCircle className="w-12 h-12 text-red-500 mb-6" />
        <h2 className="text-2xl font-semibold text-slate-800">Verification Error</h2>
        <p className="text-slate-500 mt-2">Failed to retrieve the verdict. The claim might not exist.</p>
        <Link to="/" className="mt-6 text-blue-600 hover:underline flex items-center gap-2">
          <ArrowLeft size={16} /> Return to Home
        </Link>
      </div>
    );
  }

  const isResearching = data.status === 'IN_RESEARCH';

  if (isResearching) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col items-center text-center">
          <div className="relative mb-8">
            <div className="w-16 h-16 border-4 border-blue-100 rounded-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <div className="absolute top-0 right-0 -mr-2 -mt-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center shadow-md animate-pulse">
              <ShieldAlert className="text-white w-3 h-3" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Agents actively debating...</h2>
          <p className="text-slate-500 mb-6">
            <strong>Claim:</strong> "{data.claim_text}"
          </p>
          <div className="w-full bg-slate-100 rounded-full h-2 mb-4 overflow-hidden">
            <div className="bg-blue-600 h-2 rounded-full animate-[pulse_2s_ease-in-out_infinite] w-full origin-left scale-x-100"></div>
          </div>
          <p className="text-sm text-slate-400">
            Fetching cross-references, analyzing source bias, and adjudicating.
          </p>
        </div>
      </div>
    );
  }

  // Finished State
  const isVerified = data.verdict === 'VERIFIED';
  const isRefuted = data.verdict === 'REFUTED';
  const isDisputed = data.verdict === 'DISPUTED';

  const verdictColor = isVerified
    ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
    : isRefuted
      ? 'text-red-600 bg-red-50 border-red-200'
      : isDisputed
        ? 'text-amber-600 bg-amber-50 border-amber-200'
        : 'text-slate-600 bg-slate-50 border-slate-200';

  const VerdictIcon = isVerified ? CheckCircle2 : isRefuted ? XCircle : AlertCircle;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link to="/" className="text-slate-500 hover:text-slate-800 flex items-center gap-2 w-fit font-medium transition-colors">
          <ArrowLeft size={16} /> Submit another claim
        </Link>

        {/* Hero Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-8 sm:p-10 border-b border-slate-100">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
              "{data.claim_text}"
            </h1>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Verdict */}
            <div className={`p-8 sm:p-10 flex flex-col justify-center border-b md:border-b-0 md:border-r border-slate-100 ${verdictColor}`}>
              <div className="flex items-center gap-3 mb-2">
                <VerdictIcon size={32} />
                <span className="text-sm font-bold tracking-widest uppercase opacity-80">Final Verdict</span>
              </div>
              <div className="text-5xl font-black uppercase tracking-tight">
                {data.verdict}
              </div>
            </div>
            
            {/* Confidence Score */}
            <div className="p-8 sm:p-10 flex flex-col justify-center bg-slate-50">
              <span className="text-sm font-bold text-slate-500 tracking-widest uppercase mb-2">Epistemic Confidence</span>
              <div className="flex items-end gap-2">
                <span className="text-5xl font-black text-slate-900">
                  {Math.round((data.confidence_score || 0) * 100)}
                </span>
                <span className="text-2xl font-bold text-slate-400 mb-1">%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 mt-4">
                <div 
                  className={`h-2 rounded-full ${isVerified ? 'bg-emerald-500' : isRefuted ? 'bg-red-500' : 'bg-amber-500'}`}
                  style={{ width: `${(data.confidence_score || 0) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Transparency Ledger */}
        {data.transparency_proof && (
          <div className="bg-slate-900 rounded-2xl shadow-sm border border-slate-800 p-6 sm:p-8 text-slate-300">
            <div className="flex items-center gap-2 mb-4 text-slate-400">
              <LinkIcon size={18} />
              <h3 className="font-semibold uppercase tracking-wider text-sm">Transparency Ledger Proof</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-sm">
              <div>
                <span className="block text-slate-500 mb-1 text-xs uppercase">Block Index</span>
                <span className="text-slate-100 bg-slate-800 px-3 py-1.5 rounded-lg inline-block">
                  #{data.transparency_proof.index}
                </span>
              </div>
              <div>
                <span className="block text-slate-500 mb-1 text-xs uppercase">Proof Hash (SHA-256)</span>
                <span className="text-blue-400 bg-blue-900/20 border border-blue-800/30 px-3 py-1.5 rounded-lg block truncate" title={data.transparency_proof.hash}>
                  {data.transparency_proof.hash}
                </span>
              </div>
            </div>
            <p className="mt-4 text-xs text-slate-500">
              This verdict and its underlying transcript have been cryptographically anchored. 
            </p>
          </div>
        )}

        {/* Transcript / Sub-claims */}
        {data.sub_claims && data.sub_claims.length > 0 && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 px-2">
              <MessageSquare size={20} className="text-blue-600" />
              Debate Transcripts
            </h3>
            
            {data.sub_claims.map((sc, idx) => (
              <div key={idx} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Sub-claim {idx + 1}</span>
                      <h4 className="text-lg font-semibold text-slate-900">"{sc.sub_claim}"</h4>
                    </div>
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shrink-0">
                      <span className="text-sm font-medium text-slate-600">Score:</span>
                      <span className="font-bold text-slate-900">{Math.round((sc.confidence_score || 0) * 100)}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 space-y-8">
                  {/* We render rounds dynamically */}
                  {sc.debate_log && sc.debate_log.map((round: any, rIdx: number) => (
                    <div key={rIdx} className="space-y-6">
                      {/* Prosecutor Attack */}
                      {round.prosecutor_packet && (
                        <div className="flex gap-4">
                          <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                            <ShieldAlert size={20} />
                          </div>
                          <div className="flex-1 bg-red-50/50 border border-red-100 rounded-2xl rounded-tl-none p-5 text-slate-700">
                            <h5 className="font-bold text-red-800 mb-2 text-sm uppercase tracking-wide">Prosecutor (Attack)</h5>
                            <div className="prose prose-sm max-w-none text-slate-600" dangerouslySetInnerHTML={{ __html: round.prosecutor_packet }} />
                          </div>
                        </div>
                      )}
                      
                      {/* Defender Defense */}
                      {round.defender_packet && (
                        <div className="flex gap-4 flex-row-reverse">
                          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                            <ShieldAlert size={20} />
                          </div>
                          <div className="flex-1 bg-emerald-50/50 border border-emerald-100 rounded-2xl rounded-tr-none p-5 text-slate-700">
                            <h5 className="font-bold text-emerald-800 mb-2 text-sm uppercase tracking-wide text-right">Defender (Defense)</h5>
                            <div className="prose prose-sm max-w-none text-slate-600" dangerouslySetInnerHTML={{ __html: round.defender_packet }} />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Adjudicator Reasoning */}
                  {sc.reasoning && (
                    <div className="flex gap-4 mt-8 pt-8 border-t border-slate-100">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                        <Gavel size={20} />
                      </div>
                      <div className="flex-1 bg-blue-50 border border-blue-100 rounded-2xl p-6 text-slate-800">
                        <h5 className="font-bold text-blue-800 mb-3 text-sm uppercase tracking-wide">Adjudicator Reasoning</h5>
                        <p className="whitespace-pre-wrap">{sc.reasoning}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
