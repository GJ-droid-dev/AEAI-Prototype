// ============================================================
// AEAI DATA — 14 Layers + Claim State at Each Layer (Simplified)
// ============================================================

const LAYERS = [
  {
    id: "L0", name: "Axiom Registry", tagline: "The undeniable foundation",
    color: "#7c3aed", icon: "⚛️", tier: "Foundation",
    desc: "Every chain of reasoning in the system must ultimately trace back to undeniable, universal facts—like basic laws of math and physics. This ensures the entire system is built on a rock-solid foundation that cannot be challenged.",
    shortDesc: "Traces reasoning back to basic, undeniable facts.",
    facts: ["2 + 2 = 4 lives here — it cannot be challenged", "Universal laws of physics are recorded here", "These foundational facts can never be overturned", "All 14 layers ultimately trace back to these axioms"],
    x: 760, y: 180
  },
  {
    id: "L1", name: "Data Ingestion", tagline: "Receiving the claim",
    color: "#2563eb", icon: "📥", tier: "Entry",
    desc: "The system receives the statement just as a person would say it. It then organizes the words into a clear format it can work with, identifying the key players (like the company and the drug). At this stage, it doesn't try to decide if the claim is true or false; it just listens and records it.",
    shortDesc: "Receives the claim and organizes it into a clear format.",
    facts: ["Accepts claims in normal, everyday language", "Organizes the text so the system can understand it", "Does not judge whether the claim is true or false", "Gives the claim a unique ID to track its journey"],
    x: 120, y: 60
  },
  {
    id: "L2", name: "Semantic Gate", tagline: "Checking the memory",
    color: "#0891b2", icon: "🔍", tier: "Cache",
    desc: "Before doing any hard work, the system checks its memory to see if someone has already asked about this exact claim. If the claim has already been investigated and verified, it can provide the answer immediately. In our example, this is a new claim, so it moves forward.",
    shortDesc: "Checks if this exact claim has already been investigated.",
    facts: ["Searches past records for similar claims", "Saves time by reusing previous verified answers", "Prevents doing the same work twice", "Decides if a full investigation is needed"],
    x: 120, y: 180
  },
  {
    id: "L3", name: "Dependency Resolver", tagline: "Breaking it down",
    color: "#0284c7", icon: "🕸️", tier: "Graph",
    desc: "To prove the main claim, the system breaks it down into smaller, simpler facts that must be true first. For example, before we can prove the company 'hid evidence,' we first have to prove that 'the drug exists,' 'side effects actually happened,' and 'the company had access to that information.'",
    shortDesc: "Breaks the main claim down into smaller pieces that must be proven first.",
    facts: ["Breaks big claims into smaller, testable pieces", "Maps out exactly what needs to be proven", "Links related facts together", "Ensures foundational pieces are checked before the main claim"],
    x: 120, y: 300
  },
  {
    id: "L4", name: "Research Queue", tagline: "Setting priorities",
    color: "#0369a1", icon: "📋", tier: "Scheduling",
    desc: "The system decides which of these smaller facts to investigate first. It prioritizes the facts that are most foundational or that might be useful for other claims in the future. Proving that the drug was officially approved is put at the top of the list.",
    shortDesc: "Decides which smaller facts are most important to investigate first.",
    facts: ["Decides the order of investigation, not the quality", "Facts that many claims rely on are investigated first", "Keeps the investigation organized and efficient", "Ensures important foundational facts aren't delayed"],
    x: 120, y: 420
  },
  {
    id: "L5", name: "Adversarial Validation", tagline: "The debate",
    color: "#dc2626", icon: "⚔️", tier: "Core AVC",
    desc: "This is the heart of the system. AI agents debate the claim like lawyers in a courtroom. One agent (the Prosecutor) tries to tear the claim apart and prove it wrong. Another agent (the Defender) uses documents and evidence to defend it. A neutral judge watches the debate and gives it a score based on how strong the evidence is.",
    shortDesc: "AI agents debate the claim, with a neutral judge scoring the evidence.",
    facts: ["Prosecutor tries to prove the claim false", "Defender uses evidence to support the claim", "A neutral judge scores the debate", "Requires agreement before a final score is given"],
    x: 120, y: 540
  },
  {
    id: "L6", name: "Epistemic Framework", tagline: "Scoring the truth",
    color: "#ea580c", icon: "📐", tier: "Scoring",
    desc: "The system calculates a final confidence score. It follows a strict rule: a chain of evidence is only as strong as its weakest link. Even if some evidence is excellent, if one critical piece relies on a less reliable source, the final score is capped to reflect that weakness.",
    shortDesc: "Calculates a final score, limited by the weakest piece of evidence.",
    facts: ["Categories range from universal facts to single-source claims", "A claim is only as strong as its weakest supporting fact", "Adjusts scores based on the reliability of sources", "Ensures confidence scores are mathematically sound"],
    x: 120, y: 660
  },
  {
    id: "L7", name: "Transparency Ledger", tagline: "The permanent record",
    color: "#65a30d", icon: "🔒", tier: "Immutability",
    desc: "Once a decision is reached, the result and all the evidence used to make it are written into a public, permanent record. This record cannot be edited or deleted by anyone. This ensures that anyone can audit the system's work and see exactly how it reached its conclusion.",
    shortDesc: "Records the final decision permanently so anyone can check the work.",
    facts: ["Records are permanent and cannot be deleted", "Allows anyone to check how a decision was made", "Provides full public transparency", "Stores all evidence used in the investigation"],
    x: 120, y: 780
  },
  {
    id: "L8", name: "Knowledge Graph", tagline: "Connecting the dots",
    color: "#16a34a", icon: "🌐", tier: "Graph DB",
    desc: "The newly verified claim is added to a massive, growing web of knowledge. It is connected to all the smaller facts that supported it. If any of those supporting facts ever change in the future, the system knows exactly which claims need to be updated.",
    shortDesc: "Adds the verified claim to a growing web of truth.",
    facts: ["Every verified claim becomes part of a larger web", "When one fact updates, connected facts are also checked", "Allows the system to search for related topics easily", "Grows smarter with every new claim investigated"],
    x: 440, y: 780
  },
  {
    id: "L9", name: "Staleness Engine", tagline: "Expiration dates",
    color: "#ca8a04", icon: "⏱️", tier: "Monitoring",
    desc: "Facts can change over time. The system assigns an 'expiration date' to the claim based on the type of evidence used. When the time is up, or if new related evidence is discovered, the system automatically schedules the claim to be re-investigated to make sure it is still true.",
    shortDesc: "Checks if older claims are still true over time.",
    facts: ["Assigns an expiration date to every claim", "New evidence can trigger an early re-investigation", "Ensures the system's knowledge doesn't get outdated", "Automatically checks on old facts to verify them again"],
    x: 760, y: 780
  },
  {
    id: "L10", name: "Source Credibility", tagline: "Checking reputations",
    color: "#d97706", icon: "⭐", tier: "Reputation",
    desc: "The system evaluates the reputation of the sources that provided evidence. Trust is earned, not given. If a source (like a scientific journal or a government report) has a history of being accurate, its evidence carries more weight. If a source has a conflict of interest—like the pharmaceutical company providing its own safety study—that evidence is trusted less.",
    shortDesc: "Checks the reputation of the sources used for evidence.",
    facts: ["Trust in a source is earned through past accuracy", "Conflicts of interest are flagged and reduce trust", "Cannot hide conflicts of interest", "Detects if sources are falsely backing each other up"],
    x: 760, y: 540
  },
  {
    id: "L11", name: "Confidence Delta", tagline: "Investigating sudden changes",
    color: "#b45309", icon: "📊", tier: "Forensics",
    desc: "If new evidence comes out later that drastically changes the system's confidence in a claim, it triggers a special investigation. It tries to figure out *why* the truth changed—was evidence deliberately hidden, was it a simple mistake, or has science simply progressed over time?",
    shortDesc: "Investigates why a previously trusted claim's score changed.",
    facts: ["Triggers when a score changes significantly", "Categorizes why the change happened (e.g. hidden evidence, mistake)", "Never accuses, only presents possible reasons", "Keeps these investigations clearly labeled"],
    x: 760, y: 420
  },
  {
    id: "L12", name: "Entity Bias Engine", tagline: "Identifying bias",
    color: "#9333ea", icon: "🏛️", tier: "Bias",
    desc: "The system looks at the history of the organizations involved to see if they have a track record of bias (for example, a history of only citing favorable studies). If a history of bias is detected, the system slightly lowers the confidence score to account for it.",
    shortDesc: "Checks if organizations have a history of bias and adjusts scores.",
    facts: ["Tracks the history of all organizations involved", "Adjusts scores if an organization has a known bias", "Catches patterns like only citing favorable evidence", "Prevents biased organizations from inflating a score"],
    x: 760, y: 300
  },
  {
    id: "L13", name: "Output API", tagline: "Delivering the answer",
    color: "#0f766e", icon: "🌍", tier: "Output",
    desc: "Finally, the system shares its verdict. Depending on who is asking, it might provide a simple summary (for the general public) or the complete bundle of evidence and debate transcripts (for researchers or journalists). It never guesses; it only provides an answer when it has fully resolved the claim.",
    shortDesc: "Shares the final decision with the world.",
    facts: ["Provides different levels of detail depending on the user", "Only gives a verdict when it is completely finished", "Never guesses or provides half-answers", "Can alert users when an old claim's status changes"],
    x: 440, y: 60
  }
];

// ── The example claim that travels through all 14 layers ──────
const EXAMPLE_CLAIM = "A major pharmaceutical company hid evidence of serious side effects in its top-selling drug.";

// ── What happens to the claim at each layer ───────────────────
// Order: the display order for the walkthrough (L1 first, then L2...L13, L0 last as context)
const CLAIM_STATES = [
  {
    layerId: "L1",
    stage: "Claim Received",
    stageColor: "#2563eb",
    what: "The system organizes the words into a format it can work with.",
    claimCard: {
      label: "Organized Claim Details",
      fields: [
        { key: "claim_id", val: "CLM-20240617-8841", mono: true },
        { key: "language", val: "English" },
        { key: "key_players", val: "Pharma Company, Drug-X, FDA, Side Effects" },
        { key: "status", val: "RECEIVED", badge: "blue" },
        { key: "original_text", val: '"A major pharmaceutical company hid…"', mono: true, truncated: true }
      ]
    }
  },
  {
    layerId: "L2",
    stage: "Memory Check",
    stageColor: "#0891b2",
    what: "The system checks if it has already answered this exact question.",
    claimCard: {
      label: "Past Records Search",
      fields: [
        { key: "search_status", val: "Looking through memory…", animate: true },
        { key: "similarity_needed", val: "92% match required" },
        { key: "best_match_found", val: "61% match (not identical)" },
        { key: "result", val: "NEW CLAIM — No exact match found", badge: "orange" },
        { key: "next_step", val: "Starting full investigation" }
      ]
    }
  },
  {
    layerId: "L3",
    stage: "Pieces Identified",
    stageColor: "#0284c7",
    what: "The main claim is broken down into smaller pieces to prove.",
    claimCard: {
      label: "Map of Required Facts",
      treeMode: true,
      tree: [
        { label: "MAIN: \"Company hid evidence\"", depth: 0 },
        { label: "Company exists and makes Drug-X", depth: 1 },
        { label: "Drug-X was officially approved", depth: 1 },
        { label: "Side effects actually happened", depth: 1 },
        { label: "Evidence of side effects was recorded", depth: 2 },
        { label: "Company knew about this evidence", depth: 2 },
        { label: "Company did not share it with regulators", depth: 2 }
      ]
    }
  },
  {
    layerId: "L4",
    stage: "Priority Set",
    stageColor: "#0369a1",
    what: "The system decides the order in which to investigate the pieces.",
    claimCard: {
      label: "Investigation To-Do List",
      queueMode: true,
      items: [
        { rank: 1, label: "Drug-X was officially approved by FDA", reuse: "High importance", priority: "First" },
        { rank: 2, label: "Pharma Company exists and is registered", reuse: "High importance", priority: "Second" },
        { rank: 3, label: "Side effects actually happened to patients", reuse: "Medium importance", priority: "Third" },
        { rank: 4, label: "Evidence of side effects was recorded", reuse: "Medium importance", priority: "Fourth" },
        { rank: 5, label: "Evidence was kept from regulators", reuse: "Lower importance", priority: "Fifth" }
      ]
    }
  },
  {
    layerId: "L5",
    stage: "The Debate",
    stageColor: "#dc2626",
    what: "AI agents debate the claim, presenting arguments and evidence.",
    claimCard: {
      label: "Evidence Debate",
      avcMode: true,
      prosecutor: "There are no official studies showing they hid evidence. The people claiming this are former employees who might be biased.",
      defender: "A 2023 FDA inspection report found 3 missing side-effect reports. Multiple former employees told the same story independently.",
      adjudicator: { score: "71%", label: "Judge's Notes: Good cross-checking of facts. Source reliability is mixed. Logic is strong." }
    }
  },
  {
    layerId: "L6",
    stage: "Final Score",
    stageColor: "#ea580c",
    what: "The system calculates the final score based on the weakest link.",
    claimCard: {
      label: "Score Calculation",
      formulaMode: true,
      steps: [
        { label: "Initial Debate Score", val: "71%" },
        { label: "Weakest link category", val: "Institutional Record" },
        { label: "Score limit applied", val: "Capped at 46%" },
        { label: "Bonus: FDA report is reliable", val: "+6%" },
        { label: "Penalty: Company study is biased", val: "−4%" },
        { label: "Penalty: Company has history of bias", val: "−4%" },
        { label: "Final Confidence Score", val: "44%", highlight: true },
        { label: "Final Decision", val: "VERIFIED", badge: "green" }
      ]
    }
  },
  {
    layerId: "L7",
    stage: "Recorded Permanently",
    stageColor: "#65a30d",
    what: "The decision and evidence are saved in a permanent public record.",
    claimCard: {
      label: "Permanent Public Record",
      fields: [
        { key: "record_id", val: "Record #44821", mono: true },
        { key: "decision", val: "VERIFIED", badge: "green" },
        { key: "confidence", val: "44%" },
        { key: "evidence_link", val: "Public Document Link", mono: true },
        { key: "approvals", val: "Majority agreement reached" },
        { key: "date_recorded", val: "June 17, 2024", mono: true }
      ]
    }
  },
  {
    layerId: "L8",
    stage: "Added to Knowledge",
    stageColor: "#16a34a",
    what: "The verified claim connects to the main web of knowledge.",
    claimCard: {
      label: "Knowledge Web Connection",
      fields: [
        { key: "fact_id", val: "Fact #8841", mono: true },
        { key: "decision", val: "VERIFIED", badge: "green" },
        { key: "confidence", val: "44%" },
        { key: "connected_facts", val: "Linked to 5 supporting facts" },
        { key: "future_updates", val: "Will notify 3 related topics" },
        { key: "category", val: "Institutional Record" }
      ]
    }
  },
  {
    layerId: "L10",
    stage: "Sources Checked",
    stageColor: "#d97706",
    what: "The system checks if the sources of evidence can be trusted.",
    claimCard: {
      label: "Source Reliability Check",
      queueMode: true,
      items: [
        { rank: null, label: "FDA Inspection Report 2023", reuse: "Trust: High", priority: "Bias: None" },
        { rank: null, label: "Former Employee Statements", reuse: "Trust: Moderate", priority: "Bias: Possible" },
        { rank: null, label: "Medical Journal Article", reuse: "Trust: Good", priority: "Bias: None" },
        { rank: null, label: "PharmaCo's Own Safety Study", reuse: "Trust: Low", priority: "Bias: HIGH ⚠️" }
      ]
    }
  },
  {
    layerId: "L12",
    stage: "Bias Identified",
    stageColor: "#9333ea",
    what: "The system adjusts the score because of the company's past bias.",
    claimCard: {
      label: "Organization Bias Check — PharmaCo",
      fields: [
        { key: "organization", val: "PharmaCo", mono: true },
        { key: "general_trust", val: "Moderate" },
        { key: "past_behavior", val: "History of only citing favorable studies" },
        { key: "current_issues", val: "2 conflicts of interest found in evidence" },
        { key: "score_adjustment", val: "−4% penalty applied to final score" }
      ]
    }
  },
  {
    layerId: "L11",
    stage: "Monitoring Changes",
    stageColor: "#b45309",
    what: "The system is watching in case new evidence changes the score later.",
    claimCard: {
      label: "Investigation Watchlist",
      fields: [
        { key: "status", val: "WATCHING — No sudden changes yet", badge: "orange" },
        { key: "trigger_rule", val: "Alert if confidence score jumps significantly" },
        { key: "current_score", val: "44%" },
        { key: "action_if_triggered", val: "Investigate if evidence was hidden or mistakes made" }
      ]
    }
  },
  {
    layerId: "L9",
    stage: "Expiration Set",
    stageColor: "#ca8a04",
    what: "The system sets a date to re-check if this claim is still true.",
    claimCard: {
      label: "Expiration Date Scheduled",
      fields: [
        { key: "fact_id", val: "Fact #8841", mono: true },
        { key: "rule", val: "Check again in 90 days" },
        { key: "check_date", val: "September 17, 2024", mono: true },
        { key: "early_check", val: "Will check sooner if new evidence appears" },
        { key: "status", val: "MONITORING", badge: "blue" }
      ]
    }
  },
  {
    layerId: "L0",
    stage: "Basic Facts Confirmed",
    stageColor: "#7c3aed",
    what: "The claim is traced all the way back to undeniable basic facts.",
    claimCard: {
      label: "Foundation Facts",
      fields: [
        { key: "basic_law_1", val: "A document cannot say two opposite things", badge: "purple" },
        { key: "basic_law_2", val: "Physical harm to humans can be measured", badge: "purple" },
        { key: "status", val: "PERMANENT — Cannot be argued" },
        { key: "role", val: "The rock-solid foundation for this claim" }
      ]
    }
  },
  {
    layerId: "L13",
    stage: "Answer Delivered",
    stageColor: "#0f766e",
    what: "The system shares its final decision and the evidence.",
    claimCard: {
      label: "Final Answer Provided",
      fields: [
        { key: "decision", val: "✓ VERIFIED", badge: "green" },
        { key: "confidence", val: "44% out of 100%" },
        { key: "evidence_level", val: "Based on Institutional Records" },
        { key: "notes", val: "Conflict of interest and bias penalties applied." },
        { key: "public_view", val: "Summary and confidence score ✓" },
        { key: "researcher_view", val: "Full debate transcripts and all evidence ✓" }
      ]
    }
  }
];

// ── SVG Flowchart connections ─────────────────────────────────
const CONNECTIONS = [
  { from: "L1", to: "L2" },
  { from: "L2", to: "L3", label: "new claim" },
  { from: "L3", to: "L4" },
  { from: "L4", to: "L5" },
  { from: "L5", to: "L6" },
  { from: "L6", to: "L7" },
  { from: "L7", to: "L8" },
  { from: "L8", to: "L9" },
  { from: "L9", to: "L5", label: "check again", dashed: true },
  { from: "L10", to: "L6", label: "trust score", dashed: true },
  { from: "L8", to: "L10", dashed: true },
  { from: "L6", to: "L11", dashed: true },
  { from: "L11", to: "L12", dashed: true },
  { from: "L12", to: "L6", label: "bias penalty", dashed: true },
  { from: "L8", to: "L13" },
  { from: "L0", to: "L3", label: "basic facts", dashed: true },
  { from: "L2", to: "L13", label: "found in memory", dashed: true }
];

// Final verdict data for the verdict screen
const FINAL_VERDICT = {
  state: "VERIFIED",
  confidence: "44%",
  tier: "Based on Institutional Records",
  ceiling: "46%",
  key_layers: [
    { id: "L5", note: "Debate score: 71%" },
    { id: "L6", note: "Score limited by weakest piece of evidence" },
    { id: "L10", note: "Penalty applied for company conflict of interest" },
    { id: "L12", note: "Penalty applied for company's past bias" },
    { id: "L7", note: "Decision saved permanently to public record" }
  ]
};
