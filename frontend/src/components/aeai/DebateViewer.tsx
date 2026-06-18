import { useState } from "react";
import {
  parsePacket,
  type DebateRound,
  type EvidenceItem,
  type SubClaimResult,
} from "@/lib/aeai-api";

const tierLabel: Record<number, string> = {
  0: "Axiom",
  1: "Mathematical",
  2: "Reproducible Empirical",
  3: "Single-Study Empirical",
  4: "Institutional Record",
  5: "News / Media",
  6: "Hearsay",
};

function tierClass(t?: number) {
  if (t == null) return "tier-unknown";
  if (t <= 2) return "tier-strong";
  if (t <= 4) return "tier-mid";
  return "tier-weak";
}

export function EvidenceList({ items }: { items?: EvidenceItem[] }) {
  if (!items || items.length === 0) {
    return <div className="ev-empty">No evidence items.</div>;
  }
  return (
    <ul className="ev-list">
      {items.map((e, i) => (
        <li key={i} className="ev-item">
          <div className="ev-row">
            <span className={`ev-tier ${tierClass(e.epistemic_tier)}`}>
              T{e.epistemic_tier ?? "?"}
            </span>
            <span className="ev-domain">{e.domain || "unknown"}</span>
            {e.coi_flag && <span className="ev-coi">⚠ COI</span>}
            {e.source_url && (
              <a
                href={e.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="ev-link"
              >
                source ↗
              </a>
            )}
          </div>
          {e.quote_snippet && <div className="ev-quote">"{e.quote_snippet}"</div>}
          {e.epistemic_tier != null && (
            <div className="ev-tier-label">
              {tierLabel[e.epistemic_tier] || `Tier ${e.epistemic_tier}`}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

export function DebateViewer({ sub }: { sub: SubClaimResult }) {
  const rounds: DebateRound[] = sub.debate_log || [];
  const [open, setOpen] = useState(0);

  if (rounds.length === 0) return null;

  return (
    <div className="debate-viewer">
      <div className="debate-tabs" role="tablist">
        {rounds.map((r, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={open === i}
            className={"debate-tab" + (open === i ? " debate-tab-active" : "")}
            onClick={() => setOpen(i)}
          >
            Round {r.round ?? i + 1}
          </button>
        ))}
      </div>

      {rounds.map((r, i) => {
        if (i !== open) return null;
        const pros = parsePacket(r.prosecutor_packet);
        const def = parsePacket(r.defender_packet);
        return (
          <div key={i} className="debate-round">
            <div className="debate-side debate-prosecutor">
              <div className="debate-side-label">⚔ Prosecutor</div>
              {pros.argument_summary && (
                <p className="debate-arg">{pros.argument_summary}</p>
              )}
              <EvidenceList items={pros.evidence_items} />
            </div>
            <div className="debate-side debate-defender">
              <div className="debate-side-label">🛡 Defender</div>
              {def.argument_summary && (
                <p className="debate-arg">{def.argument_summary}</p>
              )}
              <EvidenceList items={def.evidence_items} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function EvidenceTable({ subClaims }: { subClaims: SubClaimResult[] }) {
  type Row = EvidenceItem & { sub: string; side: "Prosecutor" | "Defender"; round: number };
  const rows: Row[] = [];
  subClaims.forEach((sc) => {
    (sc.debate_log || []).forEach((r: DebateRound) => {
      const pros = parsePacket(r.prosecutor_packet);
      const def = parsePacket(r.defender_packet);
      (pros.evidence_items || []).forEach((e) =>
        rows.push({ ...e, sub: sc.sub_claim || "", side: "Prosecutor", round: r.round ?? 0 }),
      );
      (def.evidence_items || []).forEach((e) =>
        rows.push({ ...e, sub: sc.sub_claim || "", side: "Defender", round: r.round ?? 0 }),
      );
    });
  });

  const [sortKey, setSortKey] = useState<"tier" | "domain" | "coi">("tier");
  const sorted = [...rows].sort((a, b) => {
    if (sortKey === "tier") return (a.epistemic_tier ?? 99) - (b.epistemic_tier ?? 99);
    if (sortKey === "domain") return (a.domain || "").localeCompare(b.domain || "");
    return Number(b.coi_flag) - Number(a.coi_flag);
  });

  if (rows.length === 0) return <div className="ev-empty">No evidence collected.</div>;

  return (
    <div className="ev-table-wrap">
      <table className="ev-table">
        <thead>
          <tr>
            <th onClick={() => setSortKey("tier")} className={sortKey === "tier" ? "sorted" : ""}>
              Tier ▾
            </th>
            <th onClick={() => setSortKey("domain")} className={sortKey === "domain" ? "sorted" : ""}>
              Domain ▾
            </th>
            <th onClick={() => setSortKey("coi")} className={sortKey === "coi" ? "sorted" : ""}>
              COI ▾
            </th>
            <th>Side</th>
            <th>Round</th>
            <th>Quote</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((r, i) => (
            <tr key={i}>
              <td>
                <span className={`ev-tier ${tierClass(r.epistemic_tier)}`}>
                  T{r.epistemic_tier ?? "?"}
                </span>
              </td>
              <td className="ev-table-domain">
                {r.source_url ? (
                  <a href={r.source_url} target="_blank" rel="noopener noreferrer">
                    {r.domain || "—"}
                  </a>
                ) : (
                  r.domain || "—"
                )}
              </td>
              <td>{r.coi_flag ? <span className="ev-coi">⚠</span> : "—"}</td>
              <td>{r.side}</td>
              <td>{r.round || "—"}</td>
              <td className="ev-table-quote">{r.quote_snippet || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
