# Mohamed Zayaan S: portfolio

Live at **https://zayaan-portfolio2026.vercel.app**.

A portfolio built around one rule: every headline number links to the file and line in a public repository that produces or records it.

## What is on the site

- **Role lens.** Five reader profiles (ML engineering, applied science, software engineering, data science, quant research) re-rank the results, the work and the featured experiment. Each lens has its own address, for example `/?for=quant`, so a different link can go with each application.
- **Measured results.** Short claims with a source link to the exact file and line on GitHub.
- **Case studies** at `/work/<slug>`, statically generated: why the obvious approach fails, the system in data-flow order, decisions and trade-offs, what measurement caught, and results.
- **Lab** at `/lab`: four experiments that run in the browser.
  - *KV-cache equivalence*: float32 causal attention computed as a full pass and as cached decoding, with injectable bugs and measured operation counts.
  - *Avellaneda–Stoikov market making*: reproduces the inventory-versus-symmetric comparison from Section 4 of the 2008 paper, plus an informed-flow regime and a flow-imbalance gate.
  - *Paired-bootstrap regression gate*: the AI-Evals gate on a simulated eval set, compared with an unpaired bootstrap.
  - *Merkle delta sync*: real SHA-256 in the browser, fixed-size and content-defined chunking, with verified reconstruction.

## Engineering

- Next.js App Router with React Server Components. Content pages are static; interactive parts are small client islands, and each experiment is its own lazily loaded chunk.
- No UI or animation libraries. One stylesheet of design tokens, light and dark themes with no flash, IBM Plex type.
- The lens and theme are read with `useSyncExternalStore`, so URL state, back/forward navigation and hydration stay consistent.
- Simulation output renders only on the client, which avoids hydration mismatches from engine-specific floating point.
- Generated Open Graph images per page, sitemap, robots, JSON-LD `Person` data, canonical URLs, and security headers.
- Accessibility: skip link, labelled controls, text alternatives for every chart, visible focus, and reduced motion respected.

## Tests

`tests/sim.test.ts` checks the simulation math:

- The Avellaneda–Stoikov closed forms, and the paper's finding that inventory control cuts P&L and inventory variance (average spread 1.49, as in Table 1).
- That the bootstrap gate detects real regressions and improvements, keeps false alarms near the nominal rate, refuses tiny eval sets, and that pairing narrows the interval.
- That cached decoding matches the full pass to float32 rounding, and that both injected bugs are caught.
- That Merkle sync reconstructs files exactly, and that content-defined chunking survives insertions where fixed-size chunking does not.

`tests/content.test.ts` checks content integrity: unique slugs, complete case studies, lenses that reference real items, and citations that only point into allowed public repositories.

```bash
npm ci
npm run check   # typecheck, lint, tests, production build
npm run dev
```

CI runs the same checks on every push and pull request (`.github/workflows/ci.yml`).

## Editing content

All copy lives in `content/`. `projects.ts` holds the case studies, and `site.ts` holds the profile, evidence, lenses and experience. Citations use `{ repo, path, line }` and are turned into GitHub links by `sourceUrl`.
