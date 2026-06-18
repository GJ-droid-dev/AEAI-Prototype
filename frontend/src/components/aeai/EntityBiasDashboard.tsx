import { useEffect, useState } from "react";
import { getEntities, type EntityEntry } from "@/lib/aeai-api";

export function EntityBiasDashboard() {
  const [data, setData] = useState<EntityEntry[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await getEntities();
      setData(r.entities || []);
    } catch (e: any) {
      setError(e?.message || "Failed to load Entity Biases");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const sorted = data ? [...data].sort((a, b) => b.bias_score - a.bias_score) : [];

  return (
    <div className="sci-dashboard">
      <div className="sci-head">
        <div>
          <h2 className="sci-title">Entity Bias Engine</h2>
          <p className="sci-sub">
            Tracks institutional biases and Conflicts of Interest (COIs). The Adjudicator uses this 
            index to automatically penalize arguments that rely on highly biased or conflicted sources.
          </p>
        </div>
        <button className="btn-ghost" onClick={load} disabled={loading}>
          {loading ? "Refreshing…" : "↻ Refresh"}
        </button>
      </div>

      {error && <div className="verify-error">⛔ {error}</div>}
      {loading && !data && <div className="sci-status">Loading…</div>}
      {data && sorted.length === 0 && (
        <div className="sci-status">No entity biases tracked yet. The database is clean.</div>
      )}

      {sorted.length > 0 && (
        <table className="sci-table">
          <thead>
            <tr>
              <th>Entity Name</th>
              <th>Bias Penalty Score</th>
              <th>Known Conflicts of Interest (COIs)</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((s, i) => {
              const tone =
                s.bias_score > 0.5 ? "sci-bad" : s.bias_score > 0 ? "sci-mid" : "sci-good";
              return (
                <tr key={s.name}>
                  <td className="sci-domain" style={{ color: "#fff", fontWeight: "bold" }}>{s.name}</td>
                  <td className={"sci-score " + tone}>
                    {s.bias_score > 0 ? `-${s.bias_score.toFixed(2)}` : Math.abs(s.bias_score).toFixed(2)}
                  </td>
                  <td style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem" }}>
                    {s.known_cois || "None"}
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
