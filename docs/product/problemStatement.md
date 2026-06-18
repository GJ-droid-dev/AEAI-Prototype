# Problem Statement

## What We're Building

AEAI is a truth-verification engine. You give it a claim — any claim — and it tells you how confident you should be that the claim is true, backed by a full evidence trail anyone can audit.

It does this by running a structured adversarial debate between AI agents. One agent (the Prosecutor) tries to destroy the claim. Another agent (the Defender) tries to defend it. A third agent (the Adjudicator) watches the debate and scores the result based solely on the quality of the evidence presented.

The final verdict, the full debate transcript, and every piece of evidence are then locked into a tamper-proof transparency log so no one can alter history.

## Who It's For

- **Journalists and researchers** who need to verify claims before publishing and want a rigorous, auditable process — not a Google search.
- **OSINT professionals** who need to separate institutional records ("the court ruled X") from empirical reality ("the evidence actually shows Y").
- **Information consumers** exhausted by biased fact-checkers and want math-backed confidence scores instead of editorial opinions.

## The Core Problem

Every institution that claims to produce truth — courts, governments, media, fact-checkers — is operated by humans with incentives. These incentives create bias. Existing systems treat institutional records as ground truth, concentrating the power to determine "what is true" in entities vulnerable to capture.

The result: when a court convicts someone later exonerated by DNA, the "truth" in the system is wrong until a human manually corrects it. When a regulator approves a drug later found to be harmful, the institutional record stays "true" long after reality has diverged.

AEAI fixes this by separating what an institution said from what the evidence actually shows, and by making the entire verification process adversarial, auditable, and owned by no one.

## What Success Looks Like

1. A user submits the claim "The Earth is flat." The system returns REFUTED with high confidence, a full debate transcript, and cited sources — all locked into an immutable log.
2. A user submits a controversial claim. The system either resolves it with evidence or honestly returns DISPUTED — never a half-baked guess.
3. No single person, company, or government can alter a past verdict or shut down the system.
4. Every verdict can be independently verified by anyone with access to the public transparency log. Zero trust required.

## What This Is NOT

- It is not an opinion engine. It does not produce moral judgments.
- It is not a prediction engine. It does not forecast the future.
- It is not fast. It prioritizes thoroughness over speed. If the answer takes hours, it takes hours.
- It does not give partial answers. A claim is either fully resolved or still being researched.
