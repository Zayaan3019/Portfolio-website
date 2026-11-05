export type LensId = "ml" | "research" | "swe" | "ds" | "quant";
export type LensOrAll = LensId | "all";

export interface Lens {
  id: LensId;
  label: string; // shown in the picker
  role: string; // used in sentences: "for a {role} role"
  pitch: string; // one sentence, shown under the intro when the lens is active
  startHere: string[]; // project slugs, in reading order
  evidence: string[]; // evidence ids, in priority order
  lab: LabId;
}

export type LabId = "kv-cache" | "market-making" | "bootstrap" | "merkle";

/** A pointer to the exact file (and line) in a public repository that backs a claim. */
export interface Source {
  repo: string;
  path?: string;
  line?: number;
  label?: string; // override the displayed text
}

export interface Evidence {
  id: string;
  figure: string; // the number, as displayed
  claim: string; // one sentence; the figure is not repeated inside it
  project: string; // project slug
  source: Source;
}

export interface Decision {
  choice: string;
  over: string;
  because: string;
}

export interface Finding {
  title: string;
  body: string;
  source?: Source;
}

export interface Project {
  slug: string;
  title: string;
  kind: "project" | "competition";
  tagline: string; // one line for the index
  headline: { figure: string; label: string }; // the single number for the index row
  year: string;
  stack: string[];
  repo?: string; // GitHub repo name under the profile
  relevance: Record<LensId, 0 | 1 | 2 | 3>;
  summary: string[]; // paragraphs
  problem: string[]; // why the obvious approach fails
  pipeline: { name: string; detail: string }[]; // the system, in data-flow order
  decisions: Decision[];
  findings: Finding[]; // what measurement caught
  results: { figure: string; label: string; source?: Source }[];
  team?: string;
  lab?: LabId;
}

export interface Role {
  org: string;
  title: string;
  start: string; // ISO yyyy-mm
  end: string;
  where?: string;
  supervisor?: string;
  points: string[];
  tags: string[];
}
