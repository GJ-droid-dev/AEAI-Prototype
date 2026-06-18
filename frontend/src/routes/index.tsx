import * as React from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { submitClaim } from '../lib/api';
import { Search, ShieldAlert, FileText, Bot } from 'lucide-react';
import { toast } from 'sonner';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  const [claim, setClaim] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claim.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await submitClaim(claim);
      navigate({ to: '/verdict/$id', params: { id: response.claim_id } });
    } catch (error) {
      console.error(error);
      toast.error('Failed to submit claim to the network.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-3xl flex flex-col items-center space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center space-x-2 bg-slate-200/50 text-slate-700 px-3 py-1 rounded-full text-sm font-medium mb-4 border border-slate-300">
            <ShieldAlert size={16} />
            <span>Adversarial Epistemic AI Prototype</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight">
            Verify the Unverifiable
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
            Submit a complex claim. Our multi-agent system will debate, cross-examine, and score it with rigorous epistemic standards.
          </p>
        </div>

        {/* Prototype Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 w-full max-w-xl text-center">
          <p className="text-sm text-blue-800 font-medium">
            <strong>Note:</strong> This prototype currently implements <strong>4 out of the 14 layers</strong> of the full AEAI architecture (Data Ingestion, Adversarial Validation, Epistemic Scoring, and Transparency Ledger).
          </p>
        </div>

        {/* Search / Submit Input */}
        <form onSubmit={handleSubmit} className="w-full relative shadow-sm hover:shadow-md transition-shadow rounded-2xl group">
          <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
            <Search size={24} />
          </div>
          <input
            type="text"
            className="w-full bg-white border-2 border-slate-200 text-slate-900 rounded-2xl py-6 pl-16 pr-32 text-lg sm:text-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder-slate-400"
            placeholder="What claim should AEAI investigate?"
            value={claim}
            onChange={(e) => setClaim(e.target.value)}
            disabled={isSubmitting}
          />
          <button
            type="submit"
            disabled={isSubmitting || !claim.trim()}
            className="absolute inset-y-2 right-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Investigate'
            )}
          </button>
        </form>

        {/* Features / Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full pt-8 border-t border-slate-200">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
              <Bot size={24} />
            </div>
            <h3 className="font-semibold text-slate-900">Multi-Agent Debate</h3>
            <p className="text-sm text-slate-500">Claims are actively attacked and defended by autonomous AI agents.</p>
          </div>
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
              <ShieldAlert size={24} />
            </div>
            <h3 className="font-semibold text-slate-900">Epistemic Scoring</h3>
            <p className="text-sm text-slate-500">Every verdict comes with a confidence score based on the strength of evidence.</p>
          </div>
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
              <FileText size={24} />
            </div>
            <h3 className="font-semibold text-slate-900">Transparency Ledger</h3>
            <p className="text-sm text-slate-500">All transcripts and reasoning are cryptographically anchored for public review.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
