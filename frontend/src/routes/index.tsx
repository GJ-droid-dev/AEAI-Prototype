import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  LAYERS,
  EXAMPLE_CLAIM,
  CLAIM_STATES,
  CONNECTIONS,
  FINAL_VERDICT,
} from "@/lib/aeai-data";
import {
  submitClaim,
  pollVerdict,
  AEAI_API_URL,
  type VerdictResponse,
} from "@/lib/aeai-api";
import { DebateViewer, EvidenceTable } from "@/components/aeai/DebateViewer";
import { SciDashboard } from "@/components/aeai/SciDashboard";

export const Route = createFileRoute("/")({
  component: AEAI,
});

type ScreenId = "hero" | "walk" | "verdict" | "map" | "sci";

function AEAI() {
  const [screen, setScreen] = useState<ScreenId>("hero");
  const [prevScreen, setPrevScreen] = useState<ScreenId>("hero");
  const [step, setStep] = useState(0);
  const [mapTab, setMapTab] = useState<"flow" | "grid">("flow");
  const [expandedNode, setExpandedNode] = useState<string | null>(null);

  // Particle canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let W = 0, H = 0, raf = 0;
    type P = { x: number; y: number; r: number; dx: number; dy: number; op: number; col: string };
    let particles: P[] = [];

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    const mk = (): P => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.4 + 0.3,
      dx: (Math.random() - 0.5) * 0.2,
      dy: (Math.random() - 0.5) * 0.2,
      op: Math.random() * 0.35 + 0.05,
      col: Math.random() > 0.6 ? "124,58,237" : Math.random() > 0.5 ? "37,99,235" : "8,145,178",
    });
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 85) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(124,58,237,${0.04 * (1 - d / 85)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.col},${p.op})`;
        ctx.fill();
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0 || p.x > W) p.dx *= -1;
        if (p.y < 0 || p.y > H) p.dy *= -1;
      });
      raf = requestAnimationFrame(draw);
    };
    resize();
    particles = Array.from({ length: 110 }, mk);
    draw();
    const onResize = () => resize();
    const onVis = () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else draw();
    };
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  // Scroll reset
  const screenRefs: Record<ScreenId, React.RefObject<HTMLDivElement | null>> = {
    hero: useRef<HTMLDivElement | null>(null),
    walk: useRef<HTMLDivElement | null>(null),
    verdict: useRef<HTMLDivElement | null>(null),
    map: useRef<HTMLDivElement | null>(null),
    sci: useRef<HTMLDivElement | null>(null),
  };
  useEffect(() => {
    screenRefs[screen].current?.scrollTo({ top: 0 });
  }, [screen, step]);

  const showScreen = (s: ScreenId) => {
    setPrevScreen(screen);
    setScreen(s);
  };
  const restart = () => {
    setStep(0);
    setScreen("hero");
  };
  const start = () => {
    setStep(0);
    showScreen("walk");
  };
  const showMap = () => {
    setExpandedNode(null);
    showScreen("map");
  };

  return (
    <>
      <canvas id="bgCanvas" ref={canvasRef} aria-hidden="true" />

      <nav className="navbar" role="navigation">
        <div className="nav-logo" onClick={restart} style={{ cursor: "pointer" }} aria-label="Home">
          <span className="nav-logo-mark">⚖</span>
          <span className="nav-logo-text">AEAI</span>
          <span className="nav-logo-sub">Adversarial Epistemic AI Network</span>
        </div>
        <div className="nav-links">
          <button className="nav-link" onClick={() => showScreen("sci")} aria-label="Source Credibility Index">
            SCI
          </button>
          <button className="nav-link" onClick={showMap} aria-label="Open full architecture map">
            Architecture Map
          </button>
        </div>
      </nav>

      <HeroScreen
        active={screen === "hero"}
        scrollRef={screenRefs.hero}
        onStart={start}
      />
      <WalkScreen
        active={screen === "walk"}
        scrollRef={screenRefs.walk}
        step={step}
        setStep={setStep}
        onSeeVerdict={() => showScreen("verdict")}
        onShowMap={showMap}
      />
      <VerdictScreen
        active={screen === "verdict"}
        scrollRef={screenRefs.verdict}
        onShowMap={showMap}
        onRestart={restart}
      />
      <MapScreen
        active={screen === "map"}
        scrollRef={screenRefs.map}
        tab={mapTab}
        setTab={setMapTab}
        expandedNode={expandedNode}
        setExpandedNode={setExpandedNode}
        onBack={() => setScreen(prevScreen === "map" ? "hero" : prevScreen)}
        onRestart={restart}
      />
      <SciScreen
        active={screen === "sci"}
        scrollRef={screenRefs.sci}
        onBack={() => setScreen(prevScreen === "sci" ? "hero" : prevScreen)}
        onRestart={restart}
      />
    </>
  );
}

// ═════════════════════════════════════════════════════════════
// SCI SCREEN
// ═════════════════════════════════════════════════════════════
function SciScreen({
  active,
  scrollRef,
  onBack,
  onRestart,
}: {
  active: boolean;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  onBack: () => void;
  onRestart: () => void;
}) {
  return (
    <div
      ref={scrollRef}
      id="screen-sci"
      className={`screen${active ? " screen-active" : ""}`}
      role="main"
    >
      <div className="map-view">
        <SciDashboard />
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// HERO
// ═════════════════════════════════════════════════════════════
function HeroScreen({
  active,
  scrollRef,
  onStart,
}: {
  active: boolean;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  onStart: () => void;
}) {
  return (
    <div
      ref={scrollRef}
      id="screen-hero"
      className={`screen${active ? " screen-active" : ""}`}
      role="main"
    >
      <div className="hero-wrap">
        <VerifyPanel onStart={onStart} />
      </div>

      <section id="how-it-works" className="hiw-section" aria-labelledby="hiw-title">
        <div className="hiw-header">
          <div className="hero-eyebrow">
            <span className="eyebrow-dot"></span>
            How it works
          </div>
          <h2 id="hiw-title" className="hero-title">
            Follow a single claim
            <br />
            through <span className="grad-text">14 layers of truth</span>
          </h2>
          <p className="hero-body">
            Understand how the 14 layers dissect a claim and create verdicts based on grounded research.
          </p>
        </div>

        <div className="hero-wrap">
          <div className="hero-left">
            <div className="hero-claim-preview">
              <div className="claim-preview-label">The claim we'll follow:</div>
              <blockquote className="claim-preview-text">{EXAMPLE_CLAIM}</blockquote>
            </div>

            <div className="hero-meta">
              <div className="meta-item">
                <span className="meta-num">14</span>
                <span className="meta-label">Processing layers</span>
              </div>
              <div className="meta-divider"></div>
              <div className="meta-item">
                <span className="meta-num">3</span>
                <span className="meta-label">AI agents in debate</span>
              </div>
            </div>

            <button className="btn-cta" onClick={onStart}>
              <span>Start the Walkthrough</span>
              <ArrowRight />
            </button>
          </div>

          <div className="hero-right" aria-hidden="true">
            <div className="layer-stack layer-stack-scrollable">
              {LAYERS.map((layer: any, i: number) => (
                <div
                  key={layer.id}
                  className="layer-stack-item"
                  style={{ borderLeftColor: layer.color, animationDelay: `${i * 0.1}s` }}
                >
                  <span className="lsi-icon">{layer.icon}</span>
                  <span className="lsi-id" style={{ color: layer.color }}>
                    {layer.id}
                  </span>
                  <span className="lsi-name">{layer.name}</span>
                  <span className="lsi-dot" style={{ background: layer.color }}></span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// VERIFY PANEL — calls the FastAPI backend (/verify, /verdict/{id})
// ═════════════════════════════════════════════════════════════
function VerifyPanel({ onStart }: { onStart: () => void }) {
  const [claimText, setClaimText] = useState(EXAMPLE_CLAIM);
  const [submitting, setSubmitting] = useState(false);
  const [claimId, setClaimId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");
  const [verdict, setVerdict] = useState<VerdictResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const reset = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setClaimId(null);
    setStatus("");
    setVerdict(null);
    setError(null);
    setSubmitting(false);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimText.trim() || submitting) return;
    setError(null);
    setVerdict(null);
    setSubmitting(true);
    setStatus("Submitting claim…");
    try {
      const r = await submitClaim(claimText.trim());
      setClaimId(r.claim_id);
      setStatus("IN_RESEARCH — agents are debating…");
      const ac = new AbortController();
      abortRef.current = ac;
      const v = await pollVerdict(r.claim_id, { intervalMs: 3000, signal: ac.signal });
      setVerdict(v);
      setStatus(v.status || "");
    } catch (err: any) {
      setError(err?.message || "Something went wrong reaching the AEAI backend.");
    } finally {
      setSubmitting(false);
    }
  };

  const verdictKey = (verdict?.verdict || verdict?.status || "").toLowerCase();
  const verdictIcon =
    verdictKey === "verified" ? "✅" :
    verdictKey === "disputed" ? "⚠️" :
    verdictKey === "refuted" || verdictKey === "false" ? "❌" :
    verdictKey === "error" ? "⛔" : "•";

  return (
    <div className="verify-panel">
      <div className="hero-eyebrow">
        <span className="eyebrow-dot"></span>
        Live verification
      </div>
      <h1 className="hero-title">
        Submit a claim. Get a <span className="grad-text">grounded verdict.</span>
      </h1>
      <p className="hero-body">
        Send any claim through the AEAI prototype. Adversarial agents debate it,
        a judge scores the evidence, and the verdict is anchored in a transparency ledger.
      </p>

      <form className="verify-form" onSubmit={onSubmit}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", fontSize: "0.9rem", background: "rgba(124,58,237,0.1)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(124,58,237,0.3)" }}>
          <p style={{ margin: 0, lineHeight: 1.5, color: "var(--txt-1)" }}>
            This prototype currently uses 4/14 layers to validate claims: 
            <br/>
            <strong>1. Claim Decomposition &nbsp; 2. Adversarial Prosecution &nbsp; 3. Adversarial Defense &nbsp; 4. Adjudicator Scoring</strong>
          </p>
          <button type="button" className="btn-ghost" style={{ flexShrink: 0, marginLeft: "16px" }} onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}>
            See more ↓
          </button>
        </div>

        <label htmlFor="claim-input" className="verify-label">Your claim</label>
        <textarea
          id="claim-input"
          className="verify-textarea"
          rows={3}
          maxLength={1000}
          placeholder="e.g. A major pharmaceutical company hid evidence of serious side effects in its top-selling drug."
          value={claimText}
          onChange={(e) => setClaimText(e.target.value)}
          disabled={submitting}
        />
        <div className="verify-actions">
          <button type="submit" className="btn-cta" disabled={submitting || !claimText.trim()}>
            <span>{submitting ? "Verifying…" : "Verify Claim"}</span>
            {!submitting && <ArrowRight />}
          </button>
          {(verdict || error || claimId) && (
            <button type="button" className="btn-ghost" onClick={reset} disabled={submitting && !verdict}>
              ↺ Reset
            </button>
          )}
        </div>
      </form>

      {error && <div className="verify-error">⛔ {error}</div>}

      {(submitting || claimId || verdict) && (
        <div className="verify-result">
          {claimId && (
            <div className="verify-meta-row">
              <span className="verify-meta-key">Claim ID</span>
              <span className="verify-meta-val mono">{claimId}</span>
            </div>
          )}
          {status && !verdict && (
            <div className="verify-status">
              <span className="verify-spinner" aria-hidden="true"></span>
              {status}
            </div>
          )}

          {verdict && (
            <>
              <div className="verify-verdict-head">
                <div className="verify-verdict-icon">{verdictIcon}</div>
                <div>
                  <div className={`verdict-state verdict-${verdictKey || "unknown"}`}>
                    {verdict.verdict || verdict.status}
                  </div>
                  {typeof verdict.confidence_score === "number" && (
                    <div className="verdict-confidence">
                      Confidence: {(verdict.confidence_score * 100).toFixed(0)}% ({verdict.confidence_score.toFixed(2)} / 1.00)
                    </div>
                  )}
                </div>
              </div>

              {verdict.corrected_claim && (
                <div className="verify-synthesis">
                  <div className="verify-section-title">Result</div>
                  <div className="verify-synthesis-text"><strong>{verdict.corrected_claim}</strong></div>
                  
                  {verdict.concise_reasoning && (
                    <>
                      <div className="verify-section-title" style={{marginTop: "1.5rem"}}>Why?</div>
                      <div className="verify-synthesis-text">{verdict.concise_reasoning}</div>
                    </>
                  )}

                  {verdict.unresolved_questions && verdict.unresolved_questions.length > 0 && (
                    <>
                      <div className="verify-section-title" style={{marginTop: "1.5rem"}}>Unresolved Questions</div>
                      <ul className="verify-unresolved">
                        {verdict.unresolved_questions.map((q, qi) => <li key={qi}>{q}</li>)}
                      </ul>
                    </>
                  )}
                </div>
              )}

              {verdict.sub_claims && verdict.sub_claims.length > 0 && (
                <details className="verify-subclaims-container">
                  <summary className="verify-section-title" style={{cursor: "pointer", display: "inline-block", padding: "8px 0"}}>
                    View detailed sub-claim breakdown ▾
                  </summary>
                  <div className="verify-subclaims">
                    {verdict.sub_claims.map((sc, i) => (
                      <div key={i} className="verify-subclaim">
                        <div className="verify-subclaim-head">
                          <span className="verify-subclaim-num">#{i + 1}</span>
                          <span className="verify-subclaim-text">{sc.sub_claim}</span>
                        </div>
                        <div className="verify-subclaim-meta">
                          <span className={`csc-badge badge-${(sc.verdict || "").toLowerCase() === "verified" ? "green" : (sc.verdict || "").toLowerCase() === "disputed" ? "orange" : "blue"}`}>
                            {sc.verdict || "—"}
                          </span>
                          {typeof sc.confidence_score === "number" && (
                            <span className="verify-subclaim-conf">
                              {(sc.confidence_score * 100).toFixed(0)}%
                            </span>
                          )}
                          {sc.rounds_used && (
                            <span className="verify-subclaim-rounds">
                              {sc.rounds_used} round{sc.rounds_used > 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                        {sc.reasoning && (
                          <details className="verify-subclaim-detail">
                            <summary>⚖ Judge's reasoning</summary>
                            <div className="verify-subclaim-reason">{sc.reasoning}</div>
                          </details>
                        )}
                        {sc.unresolved_questions && sc.unresolved_questions.length > 0 && (
                          <details className="verify-subclaim-detail">
                            <summary>❓ Unresolved questions ({sc.unresolved_questions.length})</summary>
                            <ul className="verify-unresolved">
                              {sc.unresolved_questions.map((q, qi) => <li key={qi}>{q}</li>)}
                            </ul>
                          </details>
                        )}
                        {sc.debate_log && sc.debate_log.length > 0 && (
                          <details className="verify-subclaim-detail" open>
                            <summary>⚔ Debate ({sc.debate_log.length} round{sc.debate_log.length > 1 ? "s" : ""})</summary>
                            <DebateViewer sub={sc} />
                          </details>
                        )}
                      </div>
                    ))}
                  </div>
                </details>
              )}

              {verdict.sub_claims && verdict.sub_claims.some((s) => (s.debate_log || []).length > 0) && (
                <div className="verify-evidence">
                  <div className="verify-section-title">All evidence collected</div>
                  <EvidenceTable subClaims={verdict.sub_claims} />
                </div>
              )}

              {verdict.transparency_proof && (
                <div className="verify-proof">
                  <div className="verify-section-title">Transparency proof</div>
                  <div className="verify-meta-row">
                    <span className="verify-meta-key">Entry #</span>
                    <span className="verify-meta-val mono">{verdict.transparency_proof.index}</span>
                  </div>
                  <div className="verify-meta-row">
                    <span className="verify-meta-key">Hash</span>
                    <span className="verify-meta-val mono verify-hash">{verdict.transparency_proof.entry_hash}</span>
                  </div>
                  <div className="verify-meta-row">
                    <span className="verify-meta-key">Prev</span>
                    <span className="verify-meta-val mono verify-hash">{verdict.transparency_proof.prev_hash}</span>
                  </div>
                </div>
              )}

              {verdict.transcript && (
                <details className="verify-transcript">
                  <summary>Full transcript</summary>
                  <pre>{verdict.transcript}</pre>
                </details>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// WALKTHROUGH
// ═════════════════════════════════════════════════════════════
function WalkScreen({
  active,
  scrollRef,
  step,
  setStep,
  onSeeVerdict,
  onShowMap,
}: {
  active: boolean;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  step: number;
  setStep: (i: number) => void;
  onSeeVerdict: () => void;
  onShowMap: () => void;
}) {
  const state: any = CLAIM_STATES[step];
  const layer: any = LAYERS.find((l: any) => l.id === state.layerId);
  const pct = ((step + 1) / CLAIM_STATES.length) * 100;
  const isLast = step >= CLAIM_STATES.length - 1;

  return (
    <div
      ref={scrollRef}
      id="screen-walk"
      className={`screen${active ? " screen-active" : ""}`}
      role="main"
    >
      <div className="walk-progress" role="progressbar">
        <div className="progress-rail">
          {CLAIM_STATES.map((s: any, i: number) => {
            const cls =
              "pr-dot" + (i === step ? " pr-active" : i < step ? " pr-done" : "");
            const name = LAYERS.find((l: any) => l.id === s.layerId)?.name || "";
            return (
              <div
                key={i}
                className={cls}
                title={name}
                aria-label={`Layer ${i + 1}: ${name}`}
                onClick={() => setStep(i)}
              />
            );
          })}
        </div>
        <div className="progress-label-row">
          <span className="progress-layer-label">
            {layer.icon} {layer.id} — {layer.name}
          </span>
          <span className="progress-count">
            {step + 1} / {CLAIM_STATES.length}
          </span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${pct}%` }}></div>
        </div>
      </div>

      <div className="walk-body">
        <div className="walk-panel-left">
          <div
            className="layer-id-pill"
            style={{
              color: layer.color,
              borderColor: layer.color + "55",
              background: layer.color + "18",
            }}
          >
            {layer.id} — {layer.tier}
          </div>
          <h2 className="layer-name">{layer.name}</h2>
          <p className="layer-tagline">{layer.tagline}</p>
          <p className="layer-desc">{layer.desc}</p>
          <div className="layer-facts">
            {layer.facts.map((fact: string, i: number) => (
              <div
                key={i}
                className="fact-item"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <span className="fact-dot" style={{ background: layer.color }}></span>
                <span>{fact}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="walk-panel-right">
          <div className="claim-state-header">
            <div
              className="stage-badge"
              style={{
                background: state.stageColor + "20",
                color: state.stageColor,
                borderColor: state.stageColor + "50",
              }}
            >
              {state.stage}
            </div>
            <span className="claim-state-title">{state.what}</span>
          </div>
          <ClaimCard key={step} state={state} layer={layer} />
        </div>
      </div>

      <div className="walk-nav" role="navigation">
        <button
          className="walk-nav-btn"
          disabled={step === 0}
          onClick={() => setStep(Math.max(0, step - 1))}
        >
          <ArrowLeft /> Previous
        </button>
        <button className="walk-nav-center" onClick={onShowMap}>
          <GridIcon /> Full Map
        </button>
        <button
          className="walk-nav-btn walk-nav-next"
          onClick={() => (isLast ? onSeeVerdict() : setStep(step + 1))}
        >
          {isLast ? "See Verdict" : "Next"} <ArrowRight />
        </button>
      </div>
    </div>
  );
}

function ClaimCard({ state, layer }: { state: any; layer: any }) {
  const c = state.claimCard;
  return (
    <div className="claim-state-card" style={{ borderTop: `3px solid ${layer.color}` }}>
      <div className="csc-header">{c.label}</div>

      {c.treeMode && (
        <div className="csc-tree">
          {c.tree.map((node: any, i: number) => {
            const branch =
              "  ".repeat(node.depth) +
              (node.depth === 0 ? "" : node.depth === 1 ? "├─ " : "│  ├─ ");
            return (
              <div key={i} className="tree-node">
                <span className="tree-branch">{branch}</span>
                <span className={node.depth === 0 ? "tree-root" : ""}>{node.label}</span>
              </div>
            );
          })}
        </div>
      )}

      {c.queueMode && (
        <div className="csc-queue">
          {c.items.map((item: any, i: number) => (
            <div key={i} className="queue-row">
              {item.rank ? (
                <div className="queue-rank">{item.rank}</div>
              ) : (
                <div
                  className="queue-rank"
                  style={{ background: "rgba(124,58,237,0.08)", color: "var(--txt-3)" }}
                >
                  —
                </div>
              )}
              <span className="queue-label">{item.label}</span>
              <div className="queue-meta">
                <span>{item.reuse}</span>
                <span>{item.priority}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {c.avcMode && (
        <div className="csc-avc">
          <div className="avc-agent avc-prosecutor">
            <div className="avc-label">⚔ PROSECUTOR</div>
            {c.prosecutor}
          </div>
          <div className="avc-agent avc-defender">
            <div className="avc-label">🛡 DEFENDER</div>
            {c.defender}
          </div>
          <div className="avc-adjudicator">
            <div>
              <div className="adj-label">⚖ ADJUDICATOR SCORE</div>
              <div className="adj-score">{c.adjudicator.score}</div>
            </div>
            <div className="adj-note">{c.adjudicator.label}</div>
          </div>
        </div>
      )}

      {c.formulaMode && (
        <div className="csc-formula">
          {c.steps.map((step: any, i: number) => (
            <div
              key={i}
              className={"formula-row" + (step.highlight ? " highlight" : "")}
            >
              <span className="formula-label">{step.label}</span>
              {step.badge ? (
                <span className={`csc-badge badge-${step.badge}`}>{step.val}</span>
              ) : (
                <span className="formula-val">{step.val}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {!c.treeMode && !c.queueMode && !c.avcMode && !c.formulaMode && (
        <div>
          {c.fields.map((field: any, i: number) => (
            <div key={i} className="csc-field">
              <span className="csc-key">{field.key}</span>
              {field.badge ? (
                <span className={`csc-badge badge-${field.badge}`}>{field.val}</span>
              ) : (
                <span className={`csc-val${field.mono ? " mono" : ""}`}>{field.val}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// VERDICT
// ═════════════════════════════════════════════════════════════
function VerdictScreen({
  active,
  scrollRef,
  onShowMap,
  onRestart,
}: {
  active: boolean;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  onShowMap: () => void;
  onRestart: () => void;
}) {
  const v: any = FINAL_VERDICT;
  const icon = v.state === "VERIFIED" ? "✅" : v.state === "DISPUTED" ? "⚠️" : "❌";
  return (
    <div
      ref={scrollRef}
      id="screen-verdict"
      className={`screen${active ? " screen-active" : ""}`}
      role="main"
    >
      <div className="verdict-wrap">
        <div className="verdict-icon">{icon}</div>
        <div className={`verdict-state verdict-${v.state.toLowerCase()}`}>{v.state}</div>
        <div className="verdict-confidence">Confidence Score: {v.confidence} / 1.00</div>

        <div className="verdict-claim-echo">
          <span className="vce-label">Claim:</span>
          <span className="vce-text">{EXAMPLE_CLAIM}</span>
        </div>

        <div className="verdict-breakdown">
          <h3 className="breakdown-title">Layers that shaped this verdict</h3>
          <div className="breakdown-list">
            {v.key_layers.map((kl: any) => {
              const layer: any = LAYERS.find((l: any) => l.id === kl.id);
              return (
                <div key={kl.id} className="breakdown-item">
                  <span className="bd-id" style={{ color: layer.color }}>
                    {layer.id}
                  </span>
                  <div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "var(--txt-1)",
                        marginBottom: 3,
                      }}
                    >
                      {layer.name}
                    </div>
                    <div className="bd-note">{kl.note}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="verdict-caveat">
          <InfoIcon />
          <span>
            Confidence is capped at <strong>{v.ceiling} ({v.tier})</strong> — the T_weight of the
            weakest dependency in the chain (Tier 4 institutional record). AEAI cannot produce
            higher confidence than the quality of its weakest evidence.
          </span>
        </div>

        <div className="verdict-actions">
          <button className="btn-cta" onClick={onShowMap}>
            <span>Explore Architecture Map</span>
            <ArrowRight />
          </button>
          <button className="btn-ghost" onClick={onRestart}>
            ↺ Start over
          </button>
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// MAP
// ═════════════════════════════════════════════════════════════
function MapScreen({
  active,
  scrollRef,
  tab,
  setTab,
  expandedNode,
  setExpandedNode,
  onBack,
  onRestart,
}: {
  active: boolean;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  tab: "flow" | "grid";
  setTab: (t: "flow" | "grid") => void;
  expandedNode: string | null;
  setExpandedNode: (id: string | null) => void;
  onBack: () => void;
  onRestart: () => void;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ W: 900, H: 960 });
  useEffect(() => {
    if (!active || tab !== "flow") return;
    const update = () => {
      const w = Math.max(wrapRef.current?.offsetWidth || 0, 900);
      setSize({ W: w, H: 960 });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [active, tab]);

  const scaleX = size.W / 900;
  const scaleY = size.H / 900;
  const pos: Record<string, { x: number; y: number }> = {};
  (LAYERS as any[]).forEach((l) => {
    pos[l.id] = { x: l.x * scaleX, y: l.y * scaleY };
  });

  const expandedLayer: any = expandedNode
    ? (LAYERS as any[]).find((l) => l.id === expandedNode)
    : null;

  return (
    <div
      ref={scrollRef}
      id="screen-map"
      className={`screen${active ? " screen-active" : ""}`}
      role="main"
    >
      <div className="map-header">
        <button className="btn-ghost" onClick={onBack}>
          ← Back
        </button>
        <h2 className="map-title">AEAI — Full Architecture Map</h2>
        <button className="btn-ghost" onClick={onRestart}>
          ↺ Restart
        </button>
      </div>

      <div className="map-tabs" role="tablist">
        <button
          className={"map-tab" + (tab === "flow" ? " map-tab-active" : "")}
          onClick={() => setTab("flow")}
        >
          <FlowIcon /> Flowchart
        </button>
        <button
          className={"map-tab" + (tab === "grid" ? " map-tab-active" : "")}
          onClick={() => setTab("grid")}
        >
          <GridIcon /> Grid View
        </button>
      </div>

      {tab === "flow" && (
        <div className="map-view">
          <div className="flowchart-hint">Click any node to expand details</div>
          <div className="flowchart-wrap" ref={wrapRef} style={{ height: size.H }}>
            <svg
              className="flowchart-svg"
              viewBox={`0 0 ${size.W} ${size.H}`}
              aria-label="AEAI architecture flowchart"
            >
              {(CONNECTIONS as any[]).map((conn, i) => {
                const from = pos[conn.from];
                const to = pos[conn.to];
                if (!from || !to) return null;
                const layerFrom: any = (LAYERS as any[]).find((l) => l.id === conn.from);
                const dx = to.x - from.x;
                const dy = to.y - from.y;
                const mx = from.x + dx * 0.5;
                const d = `M ${from.x} ${from.y} C ${mx} ${from.y}, ${mx} ${to.y}, ${to.x} ${to.y}`;
                const color = layerFrom?.color || "#7c3aed";
                const arrow = !conn.dashed
                  ? (() => {
                      const angle = Math.atan2(
                        to.y - (from.y + dy * 0.8),
                        to.x - (from.x + dx * 0.8),
                      );
                      const ax = to.x - 30 * Math.cos(angle);
                      const ay = to.y - 30 * Math.sin(angle);
                      const a = `M ${to.x} ${to.y} L ${ax - 6 * Math.sin(angle)} ${ay + 6 * Math.cos(angle)} L ${ax + 6 * Math.sin(angle)} ${ay - 6 * Math.cos(angle)} Z`;
                      return <path key={`a${i}`} d={a} fill={color} opacity="0.45" />;
                    })()
                  : null;
                return (
                  <g key={i}>
                    <path
                      d={d}
                      className={`fc-path ${conn.dashed ? "fc-path-dashed" : "fc-path-solid"}`}
                      stroke={color}
                    />
                    {arrow}
                  </g>
                );
              })}
            </svg>
            <div className="flowchart-nodes">
              {(LAYERS as any[]).map((layer) => {
                const p = pos[layer.id];
                const isActive = expandedNode === layer.id;
                return (
                  <div
                    key={layer.id}
                    className={"fc-node" + (isActive ? " fc-active" : "")}
                    style={{ left: p.x, top: p.y }}
                    role="button"
                    tabIndex={0}
                    onClick={() =>
                      setExpandedNode(expandedNode === layer.id ? null : layer.id)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ")
                        setExpandedNode(expandedNode === layer.id ? null : layer.id);
                    }}
                    aria-label={`${layer.id}: ${layer.name}`}
                  >
                    <div
                      className="fc-circle"
                      style={{
                        borderColor: layer.color,
                        background: layer.color + "18",
                        color: layer.color,
                      }}
                    >
                      <span className="fc-circle-icon">{layer.icon}</span>
                      <span className="fc-id">{layer.id}</span>
                    </div>
                    <div className="fc-name">{layer.name}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {expandedLayer && (
            <div className="flowchart-detail-panel">
              <button
                className="fdp-close"
                onClick={() => setExpandedNode(null)}
                aria-label="Close"
              >
                ×
              </button>
              <div className="fdp-header">
                <span className="fdp-icon">{expandedLayer.icon}</span>
                <div>
                  <div className="fdp-id" style={{ color: expandedLayer.color }}>
                    {expandedLayer.id} — {expandedLayer.tier}
                  </div>
                  <div className="fdp-name">{expandedLayer.name}</div>
                </div>
              </div>
              <div className="fdp-tagline">{expandedLayer.tagline}</div>
              <div className="fdp-desc">{expandedLayer.desc}</div>
              <div className="fdp-facts">
                {expandedLayer.facts.map((f: string, i: number) => (
                  <div key={i} className="fdp-fact">
                    <span
                      className="fdp-fact-dot"
                      style={{ background: expandedLayer.color }}
                    ></span>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "grid" && (
        <div className="map-view">
          <div className="layer-grid">
            {(LAYERS as any[]).map((layer, i) => (
              <div
                key={layer.id}
                className="layer-grid-card card-vis"
                style={{
                  borderLeftColor: layer.color,
                  transitionDelay: `${i * 0.04}s`,
                }}
              >
                <div
                  className="lgc-head"
                  style={{ borderBottom: `1px solid ${layer.color}22` }}
                >
                  <span className="lgc-icon">{layer.icon}</span>
                  <span className="lgc-id" style={{ color: layer.color }}>
                    {layer.id}
                  </span>
                  <span className="lgc-name">{layer.name}</span>
                  <span className="lgc-tier">{layer.tier}</span>
                </div>
                <div className="lgc-tagline">{layer.tagline}</div>
                <div className="lgc-desc">
                  {layer.shortDesc || layer.desc.substring(0, 120) + "…"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// ICONS
// ═════════════════════════════════════════════════════════════
function ArrowRight() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}
function ArrowLeft() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}
function GridIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}
function FlowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="5" cy="12" r="2" />
      <circle cx="19" cy="12" r="2" />
      <circle cx="12" cy="5" r="2" />
      <path d="M7 12h5M14 12h3M12 7v5" />
    </svg>
  );
}
function InfoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4M12 16h.01" />
    </svg>
  );
}
