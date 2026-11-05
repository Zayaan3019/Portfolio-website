import type { Evidence, Lens, LensId, Role, Source } from "./types";

export const SITE_URL = "https://zayaan-portfolio2026.vercel.app";
export const GITHUB_USER = "Zayaan3019";

export const PROFILE = {
  name: "Mohamed Zayaan S",
  shortName: "Zayaan",
  role: "ML and software engineer",
  intro:
    "I build machine-learning and software systems, then measure them until the numbers hold up. Final year at IIT Madras, graduating May 2027.",
  degree: "B.Tech in Civil Engineering with a minor in Computer Science",
  school: "Indian Institute of Technology Madras",
  cgpa: "8.46 / 10",
  years: "2023 – 2027",
  email: "ce23b092@smail.iitm.ac.in",
  links: {
    github: `https://github.com/${GITHUB_USER}`,
    linkedin: "https://www.linkedin.com/in/mohamed-zayaan-s/",
    codeforces: "https://codeforces.com/profile/Zayaan30_",
    resume: "https://drive.google.com/file/d/1aarBTHwfhVeHV14wBM_KzrPw_gpyjCZg/view?usp=sharing",
    arxiv: "https://arxiv.org/abs/2509.06705",
  },
};

export function sourceUrl(s: Source): string {
  const base = `https://github.com/${GITHUB_USER}/${s.repo}`;
  if (!s.path) return base;
  return `${base}/blob/main/${s.path}${s.line ? `#L${s.line}` : ""}`;
}

export function sourceText(s: Source): string {
  if (s.label) return s.label;
  if (!s.path) return s.repo;
  return `${s.repo}/${s.path}${s.line ? `:${s.line}` : ""}`;
}

/**
 * Headline evidence. Each claim points at the file that produces or records it,
 * on the default branch of a public repository.
 */
export const EVIDENCE: Evidence[] = [
  {
    id: "kv",
    figure: "5.96e-8",
    claim: "Maximum deviation between KV-cache decoding and a full forward pass in my GPT implementation, across batch sizes and lengths.",
    project: "nanolm",
    source: { repo: "NanoLM", path: "tests/test_model.py", line: 356 },
  },
  {
    id: "er",
    figure: "0.989",
    claim: "Leaderboard macro F0.5 resolving 12.5 million business records across three countries and nine scripts.",
    project: "amazon-ml",
    source: { repo: "AZ_ML_Challenge", path: "README.md", line: 3 },
  },
  {
    id: "bootstrap",
    figure: "10,000",
    claim: "Paired-bootstrap resamples behind every regression verdict in my LLM-eval gate, which refuses to judge rather than guess.",
    project: "ai-evals",
    source: { repo: "AI-Evals", path: "platform/src/agentlens_platform/stats.py", line: 42 },
  },
  {
    id: "onnx",
    figure: "4.04 ms",
    claim: "p99 DeepLOB inference on CPU through ONNX Runtime, inside the market maker's 5 ms budget.",
    project: "amme",
    source: { repo: "AMME", path: "docs/RESULTS.md", line: 311 },
  },
  {
    id: "vpin",
    figure: "99.3%",
    claim: "Share of updates on which the textbook VPIN threshold fired. I replaced it with a self-calibrating gate.",
    project: "amme",
    source: { repo: "AMME", path: "docs/RESULTS.md", line: 487 },
  },
  {
    id: "cpu",
    figure: "−41%",
    claim: "Agent CPU at 10 Hz after replacing psutil with a native C /proc collector (8.24% to 4.84%).",
    project: "systemlens",
    source: { repo: "SystemLens", path: "README.md", line: 116 },
  },
  {
    id: "posix",
    figure: "4,111",
    claim: "POSIX conformance cases passed by a FUSE filesystem I wrote from scratch, measured with pjdfstest.",
    project: "distributed-file-sync",
    source: { repo: "Distributed_File_Sync", path: "README.md", line: 501 },
  },
  {
    id: "rag",
    figure: "0.90",
    claim: "Recall@5 for point-in-time-safe hybrid retrieval with cross-encoder reranking over real SEC filings.",
    project: "chronicle",
    source: { repo: "Chronicle", path: "README.md", line: 136 },
  },
  {
    id: "vit",
    figure: "83.68%",
    claim: "Top-1 on CIFAR-10 for a Vision Transformer built without torchvision, with tests that assert numerics and gradients.",
    project: "nanovision",
    source: { repo: "NanoVision", path: "RESULTS.md", line: 20 },
  },
  {
    id: "null",
    figure: "53.43%",
    claim: "ARIMA's directional accuracy, which beat my hybrid deep model's 49.24% over 1,574 walk-forward predictions. I published it.",
    project: "neuro-econometric",
    source: { repo: "Neuro-Econometric-Forecaster", path: "MODEL_EVALUATION_REPORT.md", line: 16 },
  },
  {
    id: "rls",
    figure: "0 rows",
    claim: "Another tenant's data returned by a SELECT with no WHERE clause, because row-level security is the only filter.",
    project: "finguru",
    source: { repo: "FinMitr_demo", path: "tests/test_rls_isolation.py", line: 127 },
  },
  {
    id: "lob",
    figure: "+7.9 pts",
    claim: "DeepLOB test accuracy over the majority-class baseline on order-book data.",
    project: "amme",
    source: { repo: "AMME", path: "artifacts/deeplob_metrics.json" },
  },
  {
    id: "leak",
    figure: "0.0014",
    claim: "F0.5 contributed by features a leakage audit flagged, so the 0.075 lead they sat in was not leakage.",
    project: "amazon-ml",
    source: { repo: "AZ_ML_Challenge", path: "README.md", line: 193 },
  },
  {
    id: "int8",
    figure: "< 1%",
    claim: "INT8 relative error against FP16 in my inference runtime, after fixing an asymmetric quantisation bug.",
    project: "volt-infer",
    source: { repo: "Volt-Infer", path: "tests/test_quantization.py", line: 47 },
  },
];

export const LENSES: Lens[] = [
  {
    id: "ml",
    label: "ML engineering",
    role: "machine-learning engineer",
    pitch: "Models built from first principles, shipped with tests that check numerics rather than shapes, and evaluated with statistics that can say no.",
    startHere: ["nanolm", "amazon-ml", "ai-evals"],
    evidence: ["kv", "er", "bootstrap", "vit", "onnx", "int8"],
    lab: "kv-cache",
  },
  {
    id: "research",
    label: "Applied science",
    role: "applied or research scientist",
    pitch: "A sole-author paper, from-scratch reimplementations of ViT, CLIP and GPT, and a habit of auditing my own evaluations before anyone else does.",
    startHere: ["nanolm", "nanovision", "neuro-econometric"],
    evidence: ["kv", "vit", "null", "er", "leak", "bootstrap"],
    lab: "kv-cache",
  },
  {
    id: "swe",
    label: "Software engineering",
    role: "software engineer",
    pitch: "Filesystems, protocols, native collectors and multi-tenant backends where the safety rules are enforced by structure, not by convention.",
    startHere: ["distributed-file-sync", "finguru", "ai-evals"],
    evidence: ["posix", "cpu", "rls", "bootstrap", "onnx", "rag"],
    lab: "merkle",
  },
  {
    id: "ds",
    label: "Data science",
    role: "data scientist",
    pitch: "Entity resolution at 12.5 million records, calibrated risk models, and the discipline to report a negative result when the baseline wins.",
    startHere: ["amazon-ml", "neuro-econometric", "amex-codestreet"],
    evidence: ["er", "leak", "null", "bootstrap", "vpin", "rag"],
    lab: "bootstrap",
  },
  {
    id: "quant",
    label: "Quant research",
    role: "quantitative researcher",
    pitch: "A live market maker with a latency-budgeted model, research tooling that corrects for overfitting, and retrieval that cannot see the future.",
    startHere: ["amme", "arbitron", "chronicle"],
    evidence: ["vpin", "onnx", "lob", "null", "rag", "cpu"],
    lab: "market-making",
  },
];

export const DEFAULT_EVIDENCE = ["kv", "er", "bootstrap", "onnx", "posix", "null"];
export const DEFAULT_START = ["nanolm", "amazon-ml", "amme"];

export const lensById = (id: string): Lens | undefined => LENSES.find((l) => l.id === (id as LensId));

export const EXPERIENCE: Role[] = [
  {
    org: "London Stock Exchange Group",
    title: "Machine Learning Intern",
    start: "2026-05",
    end: "2026-07",
    points: [
      "Architected a Salesignal classification pipeline from scratch, automating Snowflake ingestion into a live feature store.",
      "Integrated a Neo4j knowledge graph linking account, product and ticket entities as features, cutting false positives by 20%.",
      "Engineered AWS Bedrock batch-LLM workflows over 5 million rows, distilling feedback and telemetry into model features.",
      "Worked on the streaming quality-analytics plane of the real-time market-data platform: flagging price anomalies and rolling-volatility outliers and validating every tick within a 50 ms budget, cutting analyst alert volume by about 45%.",
    ],
    tags: ["Snowflake", "Neo4j", "AWS Bedrock", "Feature stores"],
  },
  {
    org: "Mavvrik",
    title: "Software Engineering Intern",
    start: "2025-12",
    end: "2026-03",
    points: [
      "Architected a core MCP server over stdio and SSE transports with GraphQL APIs, for modular multi-agent tool orchestration.",
      "Added OAuth2 and API-key authentication and a SHA-256 hash-chained audit log for enterprise compliance.",
      "Built Pydantic-validated MCP tools for granular cloud-spend analysis behind real-time drill-down dashboards.",
    ],
    tags: ["MCP", "GraphQL", "OAuth2", "Pydantic"],
  },
  {
    org: "CeRAI, IIT Madras",
    title: "AI Research Intern",
    start: "2025-07",
    end: "2025-12",
    points: [
      "Built classifiers to detect harmful socio-cultural bias in Indian-language LLM outputs, and studied fairness and safety protocols against stereotype propagation.",
    ],
    tags: ["LLM safety", "Fairness"],
  },
  {
    org: "Advanced Geometric Computing Lab, IIT Madras",
    title: "Deep Learning Research Intern",
    start: "2025-04",
    end: "2025-09",
    supervisor: "Prof. Ramanathan M",
    points: [
      "Architected skeletal-prior attention models that extract robust 1D curve skeletons from noisy 3D point clouds.",
      "Improved pose-estimation accuracy with a transformer-based hybrid algorithm for spectral denoising of point clouds.",
      "Worked on cross-source alignment of unstructured, low-overlap point clouds with differentiable skeletal models. This work led to the Cortex-Synth paper.",
    ],
    tags: ["Geometric deep learning", "3D vision", "Transformers"],
  },
  {
    org: "SPIRE Lab, IISc Bangalore",
    title: "Research Intern",
    start: "2024-11",
    end: "2025-01",
    supervisor: "Prof. Prasanta Kumar Ghosh",
    points: [
      "Engineered an audio preprocessing pipeline with PCHIP interpolation, choosing it over resampling and zero-padding by lowest reconstruction error, and cut computational overhead by 40% through early frequency filtering.",
    ],
    tags: ["Speech", "Signal processing"],
  },
  {
    org: "FinMitr",
    title: "Founding Engineer",
    start: "2024-06",
    end: "2025-03",
    points: [
      "Led AI/ML development of the FinGuru financial-advisor platform: LLM-driven insights, ML transaction categorisation and anomaly detection, alongside product and operations.",
    ],
    tags: ["LLMs", "Fintech"],
  },
];

export const PUBLICATIONS = [
  {
    title: "Cortex-Synth: Differentiable Topology-Aware 3D Skeleton Synthesis with Hierarchical Graph Attention",
    venue: "14th Computing Conference (SAI), London, 2026. Springer, Lecture Notes in Networks and Systems.",
    note: "Sole author.",
    summary:
      "Synthesises 3D skeleton geometry and topology with a hierarchical graph-attention mechanism for multi-scale refinement and a differentiable spectral topology objective based on Laplacian eigendecomposition.",
    links: [
      { label: "arXiv:2509.06705", href: "https://arxiv.org/abs/2509.06705" },
      { label: "Code", href: `https://github.com/${GITHUB_USER}/Cortex-Synth` },
    ],
  },
];

export const PATENTS = [
  {
    title: "Hybrid TD3-ACO based Swarm Robotic System for Intelligent Warehouse Automation",
    status: "Patent application under review. Co-inventor.",
    summary:
      "Combines Twin-Delayed DDPG with Ant Colony Optimisation into a hybrid multi-agent reinforcement-learning method for decentralised coordination of mobile robots in dynamic warehouses.",
  },
];

export const RECOGNITION = [
  { what: "Top 6 finalist of 11,500 teams", where: "American Express CodeStreet 2026", slug: "amex-codestreet" },
  { what: "175th of 90,000 registrations (top 0.2%)", where: "Amazon ML Challenge 2026", slug: "amazon-ml" },
  { what: "Specialist, maximum rating 1423", where: "Codeforces", href: "https://codeforces.com/profile/Zayaan30_" },
  { what: "500+ problems solved", where: "LeetCode, Codeforces, CodeChef, GeeksforGeeks" },
];

export const SKILLS: { area: string; items: string }[] = [
  { area: "Languages", items: "Python, C++, C, Java, TypeScript, SQL" },
  { area: "Machine learning", items: "PyTorch, TensorFlow, LightGBM, XGBoost, scikit-learn, Hugging Face, ONNX Runtime" },
  { area: "LLM systems", items: "RAG, agents, LangGraph, MCP, evaluation, OpenTelemetry" },
  { area: "Systems and data", items: "FastAPI, PostgreSQL, ClickHouse, Redis Streams, TimescaleDB, Snowflake, Neo4j" },
  { area: "Infrastructure", items: "AWS (EC2, ECS, Lambda, S3, SageMaker, Bedrock), Docker, Kubernetes, Terraform, GitHub Actions" },
];
