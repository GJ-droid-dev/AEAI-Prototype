import { useEffect, useState } from "react";
import { getSci, type SciEntry } from "@/lib/aeai-api";

export function SciDashboard() {
  const [data, setData] = useState<SciEntry[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await getSci();
      setData(r.sources || []);
    } catch (e: any) {
      setError(e?.message || "Failed to load SCI");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const sorted = data ? [...data].sort((a, b) => b.score - a.score) : [];
  const maxScore = sorted[0]?.score || 1;

  return (
    <div className="sci-dashboard">
      <div className="sci-head">
        <div>
          <h2 className="sci-title">Source Credibility Index</h2>
          <p className="sci-sub">
            Per-domain trust score, learned across every claim the network has processed.
            Positive evaluations add 0.1; conflict-of-interest flags subtract 0.2.
          </p>
        </div>
        <button className="btn-ghost" onClick={load} disabled={loading}>
          {loading ? "Refreshing…" : "↻ Refresh"}
        </button>
      </div>

      {error && <div className="verify-error">⛔ {error}</div>}
      {loading && !data && <div className="sci-status">Loading…</div>}
      {data && sorted.length === 0 && (
        <div className="sci-status">No sources tracked yet. Submit a claim to populate the index.</div>
      )}

      {sorted.length > 0 && (
        <table className="sci-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Domain</th>
              <th>Score</th>
              <th>Appearances</th>
              <th>Trust</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((s, i) => {
              const pct = Math.max(0, Math.min(100, (s.score / Math.max(maxScore, 0.001)) * 100));
              const tone =
                s.score >= 0.5 ? "sci-good" : s.score >= 0 ? "sci-mid" : "sci-bad";
              return (
                <tr key={s.domain}>
                  <td className="sci-rank">{i + 1}</td>
                  <td className="sci-domain">{s.domain}</td>
                  <td className={"sci-score " + tone}>{s.score.toFixed(2)}</td>
                  <td>{s.appearances}</td>
                  <td className="sci-bar-cell">
                    <div className="sci-bar">
                      <div className={"sci-bar-fill " + tone} style={{ width: `${pct}%` }} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
