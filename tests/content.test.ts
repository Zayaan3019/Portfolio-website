import { describe, expect, it } from "vitest";
import { PROJECTS } from "@/content/projects";
import { DEFAULT_EVIDENCE, DEFAULT_START, EVIDENCE, LENSES, sourceUrl } from "@/content/site";
import type { Source } from "@/content/types";

/** Public repositories the site is allowed to cite. */
const REPOS = new Set([
  "AMME", "NanoLM", "NanoVision", "SystemLens", "Chronicle", "AI-Evals", "Distributed_File_Sync",
  "FinMitr_demo", "Arbitron", "Neuro-Econometric-Forecaster", "HydroGraph", "Volt-Infer", "ChatRoom",
  "AZ_ML_Challenge", "Cortex-Synth",
]);

const allSources = (): Source[] => [
  ...EVIDENCE.map((e) => e.source),
  ...PROJECTS.flatMap((p) => [
    ...p.findings.flatMap((f) => (f.source ? [f.source] : [])),
    ...p.results.flatMap((r) => (r.source ? [r.source] : [])),
  ]),
];

describe("content integrity", () => {
  it("project slugs are unique and URL-safe", () => {
    const slugs = PROJECTS.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of slugs) expect(s).toMatch(/^[a-z0-9-]+$/);
  });

  it("every project is complete enough to render a case study", () => {
    for (const p of PROJECTS) {
      expect(p.summary.length, p.slug).toBeGreaterThan(0);
      expect(p.problem.length, p.slug).toBeGreaterThan(0);
      expect(p.pipeline.length, p.slug).toBeGreaterThan(0);
      expect(p.decisions.length, p.slug).toBeGreaterThan(0);
      expect(p.results.length, p.slug).toBeGreaterThan(0);
      if (p.repo) expect(REPOS.has(p.repo), p.slug).toBe(true);
    }
  });

  it("evidence points at real projects and unique ids", () => {
    const ids = EVIDENCE.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const e of EVIDENCE) expect(PROJECTS.some((p) => p.slug === e.project), e.id).toBe(true);
  });

  it("every lens references existing evidence and projects, and every project is relevant to some lens", () => {
    const evidenceIds = new Set(EVIDENCE.map((e) => e.id));
    const slugs = new Set(PROJECTS.map((p) => p.slug));
    for (const id of DEFAULT_EVIDENCE) expect(evidenceIds.has(id)).toBe(true);
    for (const s of DEFAULT_START) expect(slugs.has(s)).toBe(true);
    for (const l of LENSES) {
      for (const id of l.evidence) expect(evidenceIds.has(id), `${l.id}:${id}`).toBe(true);
      for (const s of l.startHere) expect(slugs.has(s), `${l.id}:${s}`).toBe(true);
      expect(l.evidence.length).toBeGreaterThanOrEqual(5);
    }
    for (const p of PROJECTS) expect(Math.max(...Object.values(p.relevance)), p.slug).toBeGreaterThan(0);
  });

  it("every citation is a well-formed link into an allowed public repository", () => {
    for (const s of allSources()) {
      expect(REPOS.has(s.repo), s.repo).toBe(true);
      const url = sourceUrl(s);
      expect(url).toMatch(/^https:\/\/github\.com\/Zayaan3019\/[\w.-]+(\/blob\/main\/[\w./-]+(#L\d+)?)?$/);
    }
  });

  it("figures are short enough to sit in the evidence column", () => {
    for (const e of EVIDENCE) expect(e.figure.length, e.id).toBeLessThanOrEqual(9);
  });
});
