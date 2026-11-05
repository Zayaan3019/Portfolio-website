import type { Project } from "./types";

/**
 * Every project on the site. Order here is the default reading order; each lens
 * re-ranks by `relevance`. Figures are taken from the linked repositories.
 */
export const PROJECTS: Project[] = [
  {
    slug: "amme",
    title: "Adaptive Market Making Engine",
    kind: "project",
    tagline: "Eight-service live market maker with a neural drift signal served inside a 5 ms CPU budget.",
    headline: { figure: "4.04 ms", label: "p99 model inference" },
    year: "2026",
    stack: ["Python", "Redis Streams", "TimescaleDB", "PyTorch", "ONNX Runtime", "Docker"],
    repo: "AMME",
    relevance: { quant: 3, swe: 2, ml: 2, ds: 1, research: 1 },
    lab: "market-making",
    summary: [
      "AMME ingests live Level-2 order-book data from Binance, computes microstructure features (VPIN, order-flow imbalance, realised volatility), and quotes with the Avellaneda–Stoikov optimal-control solution. A DeepLOB network adds a short-horizon drift view, and every quote passes through a separate risk process before a queue-position-aware paper matching engine fills it.",
      "Every mechanism is judged by a paired ablation: five strategy arms, ten seeds, byte-identical market data within each seed, so path noise cancels and each component has to earn its place.",
    ],
    problem: [
      "A market maker loses money reliably in one way: adverse selection. Informed traders hit stale quotes just before the price moves, and the dealer is left holding inventory that is already worth less.",
      "A naive quoter, symmetric around the mid at a fixed width, has no inventory control, no toxicity awareness and no view on drift. Avellaneda–Stoikov handles the first analytically, VPIN targets the second and DeepLOB the third. The hard part is running all three together, live, inside a latency budget, with a risk layer that survives the strategy being wrong.",
    ],
    pipeline: [
      { name: "Ingest", detail: "Binance L2 snapshot-plus-diff resync, published to Redis Streams." },
      { name: "Features", detail: "VPIN over volume buckets, order-flow imbalance, realised volatility; ticks persisted to TimescaleDB." },
      { name: "Signal", detail: "DeepLOB (CNN, Inception, LSTM with additive attention, 146K parameters) served through ONNX Runtime." },
      { name: "Quote", detail: "Avellaneda–Stoikov reservation price and spread, skewed by the drift signal and widened by the toxicity gate." },
      { name: "Risk", detail: "A separate process: quadratic inventory skew, one-sided unwind near the limit, a latching breaker on volatility, VPIN, drawdown and notional. NaN fails closed." },
      { name: "Execution", detail: "Queue-position-aware paper matching engine. It subscribes only to risk decisions, so no quote can bypass risk." },
    ],
    decisions: [
      {
        choice: "Risk as its own service on its own stream",
        over: "Risk checks inside the strategy",
        because: "The execution service can only see risk-approved intents. The rule is enforced by topology, not by remembering to call a function.",
      },
      {
        choice: "ONNX Runtime for inference",
        over: "TorchScript",
        because: "2.2× lower p99 at equal lookback on CPU, which is what kept the model inside the 5 ms budget.",
      },
      {
        choice: "A self-calibrating toxicity threshold",
        over: "The textbook fixed VPIN cut-off",
        because: "The fixed threshold fired on 99.3% of updates on this venue, which made it a constant rather than a signal.",
      },
      {
        choice: "Paired, multi-seed ablation",
        over: "One long backtest per variant",
        because: "Identical market data per seed means differences between arms come from the strategy, not from luck.",
      },
    ],
    findings: [
      {
        title: "The textbook VPIN threshold was always on",
        body: "A fixed 0.35 threshold fired on 99.3% of updates. Replacing it with a rolling 90th-percentile gate turned it back into information.",
        source: { repo: "AMME", path: "docs/RESULTS.md", line: 487 },
      },
      {
        title: "The local clock was 677 ms ahead of the exchange",
        body: "Latency numbers were meaningless until exchange-versus-local clock skew was estimated and corrected.",
      },
      {
        title: "An over-fill bug in the matching engine flipped the ablation",
        body: "A through-fill did not draw down the aggressor's volume, so some quotes filled far beyond the available size. After the fix, the ablation's ranking changed. The simulator had been lying, not the strategy.",
      },
      {
        title: "The obvious venue was the worst one",
        body: "A venue screen showed BTCUSDT was the worst symbol for this strategy, which is the opposite of the usual default.",
        source: { repo: "AMME", path: "artifacts/venue_screen.md" },
      },
    ],
    results: [
      { figure: "4.04 ms", label: "p99 DeepLOB inference (ONNX Runtime, T=50) inside a 5 ms budget", source: { repo: "AMME", path: "docs/RESULTS.md", line: 311 } },
      { figure: "+7.9 pts", label: "test accuracy over the majority-class baseline (52.1% vs 44.3%)", source: { repo: "AMME", path: "artifacts/deeplob_metrics.json" } },
      { figure: "6.8×", label: "smaller loss than naive quoting on a real-data replay" },
      { figure: "268", label: "tests across services and the shared core" },
    ],
  },
  {
    slug: "nanolm",
    title: "NanoLM",
    kind: "project",
    tagline: "A GPT-style language model from first principles, tokenizer to KV-cache to DDP.",
    headline: { figure: "5.96e-8", label: "KV-cache max deviation" },
    year: "2026",
    stack: ["PyTorch", "DDP", "Flash Attention", "BPE"],
    repo: "NanoLM",
    relevance: { ml: 3, research: 3, swe: 1, ds: 1, quant: 0 },
    lab: "kv-cache",
    summary: [
      "A GPT-style autoregressive model built without a model library: a byte-level BPE tokenizer written from the algorithm, fused-QKV pre-norm blocks with Flash Attention, weight-tied embeddings, cosine learning rate with warmup, gradient accumulation, mixed precision, KV-cache inference and Distributed Data Parallel training. Configs scale from a 3.5M-parameter CPU model to a 345M GPT-2-medium replica.",
      "The claims worth defending are correctness proofs, not benchmark numbers. Cached decoding is verified equal to a full forward pass, and the DDP path is checked for the gradient-sync mistakes that make distributed training silently diverge.",
    ],
    problem: [
      "Transformer implementations rarely crash when they are wrong. A wrong position index in the KV cache, a mask off by one, or a loss that isn't divided by the accumulation steps all still produce text that looks like English.",
      "Each of these is a correctness question with a decidable answer, so the project is organised around tests that assert numerics rather than shapes.",
    ],
    pipeline: [
      { name: "Tokenize", detail: "Byte-level BPE trained from the algorithm, with adversarial UTF-8 round-trip tests." },
      { name: "Model", detail: "Pre-norm blocks, fused QKV projection, Flash Attention via scaled_dot_product_attention, tied input and output embeddings." },
      { name: "Train", detail: "Cosine schedule with warmup, loss-scaled gradient accumulation, mixed precision, checkpointing." },
      { name: "Distribute", detail: "DDP with gradient sync suppressed on accumulation micro-steps (no_sync), synced once per optimizer step." },
      { name: "Generate", detail: "KV-cache decoding with a sliding-window fallback past the context length." },
    ],
    decisions: [
      {
        choice: "Test the cache against the uncached model",
        over: "Reading generated samples",
        because: "Plausible text is not evidence. Logit equality across batch sizes and lengths is.",
      },
      {
        choice: "Divide each micro-batch loss by the accumulation steps",
        over: "Summing micro-batch losses",
        because: "Otherwise the effective learning rate silently scales with the accumulation factor.",
      },
      {
        choice: "no_sync() on every micro-step except the last",
        over: "Letting DDP all-reduce on each backward",
        because: "Syncing every micro-step wastes bandwidth and changes the effective batch semantics.",
      },
    ],
    findings: [
      {
        title: "Cached decoding equals the full forward pass",
        body: "Max absolute deviation is 5.96e-8 across batch sizes and sequence lengths: one float32 ulp in [0.5, 1), which is rounding, not a bug.",
        source: { repo: "NanoLM", path: "tests/test_model.py", line: 356 },
      },
      {
        title: "Flash Attention is checked against a naive reference",
        body: "The fused kernel's output is compared with an explicit softmax(QKᵀ/√d)V implementation, so a silent masking change would fail a test.",
        source: { repo: "NanoLM", path: "tests/test_model.py", line: 210 },
      },
      {
        title: "Scope is stated, not implied",
        body: "Configs and parameter-count tests reach 345M. The trained model is the small one. The README keeps those two claims separate.",
        source: { repo: "NanoLM", path: "README.md" },
      },
    ],
    results: [
      { figure: "5.96e-8", label: "max deviation, cached vs full forward pass", source: { repo: "NanoLM", path: "tests/test_model.py", line: 356 } },
      { figure: "345M", label: "largest config (GPT-2-medium), validated by parameter-count tests" },
      { figure: "130", label: "tests passing" },
    ],
  },
  {
    slug: "ai-evals",
    title: "AI-Evals",
    kind: "project",
    tagline: "Tracing, evaluation and a statistical CI gate for LLM agents.",
    headline: { figure: "10,000", label: "paired-bootstrap resamples per verdict" },
    year: "2026",
    stack: ["OpenTelemetry", "ClickHouse", "PostgreSQL", "FastAPI", "Terraform", "AWS"],
    repo: "AI-Evals",
    relevance: { ml: 3, swe: 3, ds: 2, research: 2, quant: 0 },
    lab: "bootstrap",
    summary: [
      "Three parts. A tracing SDK built on OpenTelemetry captures an agent's full decision tree as nested spans (LLM calls, tools, retrievals, sub-agents) with GenAI semantic conventions, versioned pricing in integer micro-USD, redaction before egress and a bounded export queue. A platform stores spans in ClickHouse and state in Postgres and runs a four-tier evaluator registry: deterministic, statistical, model-graded and human.",
      "The loop closes in CI. A production trace becomes a permanent eval case, runs produce paired results, a paired bootstrap tests for regression, and the gate blocks the pull request or refuses to judge.",
    ],
    problem: [
      "Agent quality is a statistical question, not a diff. The same prompt gives different outputs, and cases differ in difficulty far more than prompts differ in quality.",
      "Scores are bounded, often bimodal and skewed, so a t-test on 50 to 200 cases leans on an assumption that is usually wrong. And an LLM judge that passes everything scores 90% raw agreement on a 90%-pass dataset while carrying no information.",
    ],
    pipeline: [
      { name: "Trace", detail: "OTel spans with GenAI conventions, cost in integer micro-USD, redaction before export, sub-millisecond p50 overhead." },
      { name: "Store", detail: "Spans in ClickHouse ordered for tenant-scoped time queries; relational state in Postgres under row-level security." },
      { name: "Evaluate", detail: "Deterministic, statistical, model-graded and human evaluators; custom code runs in a sandbox." },
      { name: "Calibrate", detail: "Judges checked against human labels with Cohen's kappa, not raw agreement." },
      { name: "Gate", detail: "Paired bootstrap on per-case differences; verdict or an explicit refusal." },
    ],
    decisions: [
      {
        choice: "Paired bootstrap over cases",
        over: "A t-test on mean scores",
        because: "Keeping each case's two scores together cancels between-case variance and needs no normality assumption.",
      },
      {
        choice: "Three distinct refusals: INCOMPARABLE, INSUFFICIENT_DATA, ERROR_RATE",
        over: "Defaulting to pass",
        because: "\"We could not tell\" must never be read as \"it is fine\". Evaluator config hashes must match for runs to be compared.",
      },
      {
        choice: "Evaluator failures recorded as errors",
        over: "Scoring a failure as zero",
        because: "A crashed evaluator is not evidence that the model got worse.",
      },
    ],
    findings: [
      {
        title: "Row-level security was inert",
        body: "The application connected as a Postgres superuser, which bypasses RLS entirely. Caught by a tenancy test and fixed by connecting as a restricted role.",
      },
      {
        title: "Most of a 60-second request wasn't the model",
        body: "Tracing a real RAG service showed 57.7 s went to loading an embedding model and querying a vector store, and only 1.4 s to the model call.",
      },
    ],
    results: [
      { figure: "10,000", label: "default bootstrap resamples behind each verdict", source: { repo: "AI-Evals", path: "platform/src/agentlens_platform/stats.py", line: 42 } },
      { figure: "0.25 ms", label: "best-run p50 SDK overhead per span", source: { repo: "AI-Evals", path: "README.md", line: 54 } },
      { figure: "404", label: "tests across the SDK and platform" },
    ],
  },
  {
    slug: "amazon-ml",
    title: "Amazon ML Challenge: entity resolution",
    kind: "competition",
    tagline: "Matching 12.5 million noisy, multi-script business records with no shared identifiers.",
    headline: { figure: "0.989", label: "leaderboard macro F0.5" },
    year: "2026",
    stack: ["LightGBM", "CatBoost", "XLM-RoBERTa", "PyTorch", "Python"],
    repo: "AZ_ML_Challenge",
    team: "Team of four. 175th of 90,000 registrations.",
    relevance: { ml: 3, ds: 3, research: 2, swe: 1, quant: 1 },
    summary: [
      "Match each Source-1 business record to every Source-2 and Source-3 record for the same real business, across roughly 12.5 million records in three countries and nine Indian scripts. The metric is macro F0.5 per entity, singletons included.",
      "The core idea was to treat the noise as a generator to be inverted: learn and undo the corruption operators in the data (transliteration aliases, OCR digit swaps, inserted filler words, d/b/a wrappers, whole-name replacement) instead of hoping a similarity model absorbs them.",
    ],
    problem: [
      "Comparing every pair is impossible at this scale, so recall is decided by blocking before any model runs.",
      "France appears only in the test set, about 15% of it. A model that learns country-specific shortcuts fails exactly where the leaderboard is decided.",
      "Macro F0.5 is decided per entity, so one global threshold is the wrong decision rule.",
    ],
    pipeline: [
      { name: "Normalise", detail: "Nine-script Brahmic transliteration through one table with schwa deletion; OCR repair; d/b/a unwrapping." },
      { name: "Block", detail: "IDF-weighted multi-key blocking across 11 key families over name and address." },
      { name: "Prune", detail: "Out-of-fold LightGBM ranker producing an audited candidate set." },
      { name: "Match", detail: "About 150 pairwise features; LightGBM, lambdarank and CatBoost, plus a GPU cross-encoder (xlm-roberta-base) and a stacker, calibrated per source." },
      { name: "Decide", detail: "Bayes-optimal set selection maximising expected F0.5 per entity, under the verified constraint that each target record belongs to at most one entity." },
    ],
    decisions: [
      {
        choice: "Exact expected-F0.5 maximisation per entity",
        over: "A tuned global threshold",
        because: "The metric is per entity, and with at most 40 candidates the maximisation can be exact.",
      },
      {
        choice: "Leave-one-country-out validation",
        over: "A random split",
        because: "It is the only validation that resembles a test set containing an unseen country.",
      },
      {
        choice: "A paired-bootstrap acceptance gate for every version",
        over: "Accepting any validation gain",
        because: "Each version shipped only if the interval on the F0.5 difference excluded zero.",
      },
    ],
    findings: [
      {
        title: "A leakage audit on our own lead",
        body: "The learned-noise features had been fit on all training positives, validation included. Retraining without them gave 0.9710 against 0.9724, so the lead was not leakage.",
        source: { repo: "AZ_ML_Challenge", path: "README.md", line: 193 },
      },
      {
        title: "France was the swing country",
        body: "Decomposing the leaderboard by country showed validation tracked US and India closely, and that the gap to 0.98+ lay in label-free adaptation to France.",
        source: { repo: "AZ_ML_Challenge", path: "README.md", line: 195 },
      },
    ],
    results: [
      { figure: "0.989", label: "final leaderboard macro F0.5", source: { repo: "AZ_ML_Challenge", path: "README.md", line: 3 } },
      { figure: "0.86 → 0.989", label: "leaderboard progression across versions", source: { repo: "AZ_ML_Challenge", path: "README.md", line: 13 } },
      { figure: "Top 0.2%", label: "175th of 90,000 registrations" },
    ],
  },
  {
    slug: "chronicle",
    title: "Chronicle",
    kind: "project",
    tagline: "Financial research RAG that cannot see the future and blocks unsupported numbers.",
    headline: { figure: "0.90", label: "recall@5, hybrid + reranker" },
    year: "2026",
    stack: ["Python", "Chroma", "BM25", "Cross-encoder", "SEC EDGAR", "GDELT"],
    repo: "Chronicle",
    relevance: { ml: 2, quant: 2, swe: 2, ds: 1, research: 1 },
    summary: [
      "A multi-agent research pipeline over live SEC EDGAR filings and GDELT news, built around point-in-time correctness. Every chunk carries the filing's real acceptance time, and every retrieval filters on it before ranking, at both the dense and the sparse layer.",
      "Answers pass a deny-by-default guardrail: a deterministic numeric-claim verifier checks each figure against its cited source with unit and scale normalisation, a second point-in-time check runs on the final citations, retrieved text is scanned for prompt injection, and any failure, including the guardrail itself raising, blocks the answer.",
    ],
    problem: [
      "If the index holds the 2024 10-K, an answer about early 2023 looks better because it knows the future. Filtering after ranking is not enough: excluded documents have already shaped which ones reached the top-k.",
      "LLMs transpose digits and confuse $1.2B with $1.2M. In finance those numbers are the whole answer, and fluent prose hides the error.",
    ],
    pipeline: [
      { name: "Ingest", detail: "EDGAR filings with acceptanceDateTime as filed_at; amendments kept alongside originals." },
      { name: "Retrieve", detail: "BM25 and dense retrieval, both filtered to filed_at ≤ as_of before ranking; reciprocal-rank fusion." },
      { name: "Rerank", detail: "Cross-encoder over the fused candidates." },
      { name: "Reason", detail: "Query, reasoning and critic agents on separate rate-limit pools with Retry-After backoff." },
      { name: "Guard", detail: "Numeric-claim verifier, second point-in-time check, injection scan; fails closed." },
    ],
    decisions: [
      {
        choice: "Filter before ranking",
        over: "Rank, then drop future documents",
        because: "Post-hoc filtering still lets future documents influence the ranking.",
      },
      {
        choice: "A deterministic numeric verifier",
        over: "An LLM judging its own numbers",
        because: "Number checking has a correct answer, so it should not be probabilistic.",
      },
      {
        choice: "Block on guardrail exceptions",
        over: "Serving the answer when the check errors",
        because: "A check that fails open is decoration.",
      },
    ],
    findings: [
      {
        title: "Amendments are a point-in-time trap",
        body: "Between an original 10-K and its 10-K/A only the original may be visible; after the amendment, both. Tests pin each case at both retrieval layers.",
        source: { repo: "Chronicle", path: "tests/test_point_in_time.py", line: 121 },
      },
      {
        title: "Every retrieval stage had to earn its place",
        body: "BM25 alone reached 0.867 recall@5; fusion kept recall and raised nDCG; the cross-encoder raised both. Dense-only trailed on this question set.",
        source: { repo: "Chronicle", path: "README.md", line: 136 },
      },
    ],
    results: [
      { figure: "0.900", label: "recall@5 with hybrid fusion and reranking over 661 SEC chunks", source: { repo: "Chronicle", path: "README.md", line: 136 } },
      { figure: "0.664 → 0.781", label: "nDCG@5, BM25 to hybrid with cross-encoder", source: { repo: "Chronicle", path: "README.md", line: 133 } },
      { figure: "0", label: "point-in-time violations in a 200-trial randomized sweep" },
    ],
  },
  {
    slug: "nanovision",
    title: "NanoVision",
    kind: "project",
    tagline: "ViT and CLIP from scratch, with an evaluation-integrity audit.",
    headline: { figure: "83.68%", label: "ViT top-1, CIFAR-10" },
    year: "2026",
    stack: ["PyTorch", "ViT", "CLIP", "InfoNCE"],
    repo: "NanoVision",
    relevance: { ml: 3, research: 3, ds: 1, swe: 0, quant: 0 },
    summary: [
      "A Vision Transformer and CLIP built in pure PyTorch with no torchvision: patch embedding, pre-LN blocks, Flash Attention, DropPath, a byte-level text tokenizer, a retrieval index and a metrics suite. CLIP trains a symmetric InfoNCE objective with a learnable temperature clamped at ln(100), the paper's own convention.",
      "The audit mattered more than the models. The suite was rebuilt so that most tests assert closed-form numerics or gradients (checked against finite differences in float64), and a script classifies every test so the claim can be reproduced rather than asserted.",
    ],
    problem: [
      "Contrastive and retrieval metrics can be wrong in ways that flatter you. CIFAR-10 with template captions has only ten unique captions, so strict recall counts most correct retrievals as misses, while class-aware recall alone hides the convention.",
      "A test suite that only checks tensor shapes proves almost nothing: a transposed tensor or a gradient that doesn't flow passes a shape check.",
    ],
    pipeline: [
      { name: "Augment", detail: "In-house augmentation pipeline with its own tests." },
      { name: "Encode", detail: "Patch embedding and pre-LN transformer blocks; byte-level text encoder for CLIP." },
      { name: "Train", detail: "Cross-entropy for ViT; symmetric InfoNCE with a clamped learnable temperature for CLIP." },
      { name: "Evaluate", detail: "Top-1/top-5, zero-shot accuracy, and both strict and class-aware retrieval recall." },
    ],
    decisions: [
      {
        choice: "Report strict and class-aware recall together",
        over: "Picking the flattering one",
        because: "With repeated captions, each convention alone misleads.",
      },
      {
        choice: "Clamp the temperature at ln(100)",
        over: "An unconstrained learnable temperature",
        because: "Unclamped, it runs away and the loss degenerates while still decreasing.",
        },
      {
        choice: "gradcheck in float64",
        over: "Asserting output shapes",
        because: "Finite-difference gradient checks catch wiring errors that shapes cannot.",
      },
    ],
    findings: [
      {
        title: "A retrieval-evaluation bug",
        body: "Strict recall was being read as model failure. Splitting the metric into strict and class-aware recall showed the model was retrieving the right class.",
        source: { repo: "NanoVision", path: "README.md", line: 14 },
      },
      {
        title: "Test claims made reproducible",
        body: "An AST-based classifier labels every test, so the share asserting numerics or gradients rather than shapes is computed, not estimated.",
      },
    ],
    results: [
      { figure: "83.68%", label: "ViT top-1 on CIFAR-10 (98.86% top-5)", source: { repo: "NanoVision", path: "RESULTS.md", line: 20 } },
      { figure: "64.22%", label: "CLIP zero-shot top-1 on CIFAR-10", source: { repo: "NanoVision", path: "reports/clip_micro_train_log.txt" } },
      { figure: "146", label: "tests, 89% asserting numerics or gradients" },
    ],
  },
  {
    slug: "systemlens",
    title: "SystemLens",
    kind: "project",
    tagline: "A native C /proc collector that stops the monitor from becoming the load.",
    headline: { figure: "−41%", label: "agent CPU at 10 Hz" },
    year: "2026",
    stack: ["C", "Python", "FastAPI", "PostgreSQL"],
    repo: "SystemLens",
    relevance: { swe: 3, quant: 1, ml: 0, ds: 0, research: 0 },
    summary: [
      "A host observability agent and dashboard. The Python default, psutil, re-opens every /proc file on every sample. The native collector opens each source once, re-reads with pread at offset zero, allocates nothing after startup and parses integers by hand.",
      "The constraint that makes it a systems project is the fallback contract: two backends that must be indistinguishable to everything above them.",
    ],
    problem: [
      "An observability agent's overhead is a tax on the thing it measures. At 10 Hz, which you need to catch transient stalls that 1 Hz sampling aliases away, psutil's per-sample cost shows up in the numbers it reports.",
      "\"My C collector is faster\" is easy to claim and usually meaningless. Sampling windows, process counts and cache warmth will show whatever you want unless the comparison is built so it could come out the other way.",
    ],
    pipeline: [
      { name: "Open once", detail: "Persistent descriptors for every /proc and /sys source." },
      { name: "Sample", detail: "pread at offset 0 into preallocated buffers; hand-written integer parsing." },
      { name: "Fall back", detail: "Per-sensor fallback to Python with identical output, tested against golden /proc captures." },
      { name: "Serve", detail: "FastAPI dashboard and API; multi-tenant fleet schema on partitioned PostgreSQL with row-level security." },
    ],
    decisions: [
      {
        choice: "A paired harness alternating backends over five repetitions",
        over: "One benchmark run per backend",
        because: "Alternating cancels drift in machine load; repetitions expose variance.",
      },
      {
        choice: "Tenant binding with SET LOCAL inside a transaction",
        over: "A session-level setting",
        because: "The tenant cannot leak onto the next borrower of a pooled connection.",
      },
    ],
    findings: [
      {
        title: "Syscalls, not Python, were the cost",
        body: "Per-sample syscalls fell 51% and openat calls 84%: the overhead was the open-read-close cycle per file.",
      },
      {
        title: "Memory-clean under sanitizers",
        body: "AddressSanitizer, UndefinedBehaviorSanitizer and Valgrind runs are clean, with every allocation matched by a free. Counter wrap, PID races and PID reuse are handled explicitly.",
      },
    ],
    results: [
      { figure: "8.24% → 4.84%", label: "agent CPU at 10 Hz, psutil vs native", source: { repo: "SystemLens", path: "README.md", line: 116 } },
      { figure: "−51%", label: "syscalls per sample" },
      { figure: "133", label: "regression cases, including golden-file parsers" },
    ],
  },
  {
    slug: "distributed-file-sync",
    title: "Distributed File Sync",
    kind: "project",
    tagline: "Peer-to-peer sync with Merkle deltas, vector clocks, encryption and a FUSE mount.",
    headline: { figure: "4,111", label: "POSIX conformance cases passed" },
    year: "2026",
    stack: ["Python", "asyncio", "pyfuse3", "SQLite", "AES-256-GCM"],
    repo: "Distributed_File_Sync",
    relevance: { swe: 3, ml: 0, ds: 0, research: 0, quant: 0 },
    lab: "merkle",
    summary: [
      "A peer-to-peer file synchronisation engine with no central server. Files are cut into 4 KB chunks and hashed into a Merkle tree, so peers compare roots and move only the chunks that differ. Concurrent edits are detected with vector clocks and surfaced as visible conflict files, never silently merged.",
      "Connections are mutually authenticated by challenge-response over a pre-shared key and encrypted with AES-256-GCM using per-connection, per-direction keys. On Linux, the synced tree mounts as a real filesystem through FUSE.",
    ],
    problem: [
      "Re-sending a gigabyte because one byte changed is unacceptable, so you must find what changed without sending the file to find out.",
      "Without a central server there is no global order, and wall clocks drift and jump. Only causality tracking distinguishes \"B came after A\" from \"A and B edited concurrently\"; getting it wrong is silent data loss.",
      "A sync daemon writes network-supplied paths to disk. Without validation it is a remote file-write primitive.",
    ],
    pipeline: [
      { name: "Chunk", detail: "4 KB chunks, SHA-256 leaves, Merkle root per file." },
      { name: "Compare", detail: "Root comparison, then leaf hashes to find the differing chunks." },
      { name: "Order", detail: "Vector clocks over a crash-recoverable SQLite catalog; concurrent edits become conflict siblings." },
      { name: "Secure", detail: "PSK challenge-response, then AES-256-GCM with per-direction keys and counter nonces." },
      { name: "Mount", detail: "pyfuse3 filesystem with atomic rename and open-unlink semantics." },
    ],
    decisions: [
      {
        choice: "Surface conflicts as files",
        over: "Last-writer-wins",
        because: "Wall-clock order is not causal order, and last-writer-wins loses data silently.",
      },
      {
        choice: "Refuse to start without --psk",
        over: "Defaulting to an open node",
        because: "Insecure mode has to be an explicit choice (--allow-insecure), never an accident.",
      },
    ],
    findings: [
      {
        title: "The first audit found a remote-write primitive",
        body: "Path traversal allowed arbitrary file writes, there was no authentication and transport was cleartext. All three were fixed before anything else.",
        source: { repo: "Distributed_File_Sync", path: "docs/SECURITY_AUDIT.md" },
      },
      {
        title: "A real conformance suite, not my own expectations",
        body: "pjdfstest reports 4,111 of 8,798 POSIX cases passing. The remainder are mostly operations the mount deliberately does not implement, such as symlinks, hard links and device nodes.",
        source: { repo: "Distributed_File_Sync", path: "README.md", line: 501 },
      },
    ],
    results: [
      { figure: "4,111 / 8,798", label: "pjdfstest POSIX conformance cases", source: { repo: "Distributed_File_Sync", path: "README.md", line: 501 } },
      { figure: "290", label: "unit and integration tests passing (7 skipped)", source: { repo: "Distributed_File_Sync", path: "VERIFICATION.md", line: 220 } },
    ],
  },
  {
    slug: "finguru",
    title: "FinGuru",
    kind: "project",
    tagline: "A personal-finance API where tenant isolation and PII redaction are structural.",
    headline: { figure: "0", label: "foreign rows visible without a WHERE clause" },
    year: "2025",
    stack: ["FastAPI", "PostgreSQL RLS", "Argon2id", "Account Aggregator", "PyTorch"],
    repo: "FinMitr_demo",
    relevance: { swe: 3, ds: 1, ml: 1, research: 0, quant: 0 },
    summary: [
      "A personal-finance API for the Indian market. Bank data arrives through the RBI Account Aggregator framework, is stored in PostgreSQL under row-level security, is categorised by a fine-tuned transformer, and is explained by an LLM that never sees an account number.",
      "Handlers deliberately query transactions with no WHERE user_id. That is not an oversight: it is what makes row-level security load-bearing rather than decorative.",
    ],
    problem: [
      "One forgotten WHERE user_id exposes another person's bank transactions. Application-level filtering is correct only as long as every query author remembers it forever.",
      "Sending transaction narrations to an inference API is a disclosure outside the consent given. Narrations are also attacker-controlled text: a merchant name can carry a prompt injection.",
    ],
    pipeline: [
      { name: "Authenticate", detail: "Identity derived only from a verified JWT; Argon2id hashing; rotating refresh-token families." },
      { name: "Consent", detail: "ReBIT-spec Account Aggregator client (Setu, Finvu, OneMoney)." },
      { name: "Store", detail: "PostgreSQL with RLS enabled and forced on every tenant table; money as integer paise." },
      { name: "Redact", detail: "Accounts, cards, PAN and UPI IDs tokenised; an independent scan of the exact outgoing bytes raises rather than strips." },
      { name: "Explain", detail: "LLM insights over redacted data; ML categorisation and anomaly detection." },
    ],
    decisions: [
      {
        choice: "Row-level security as the only filter",
        over: "WHERE clauses in every handler",
        because: "A rule a human must remember will be forgotten at 2 a.m.",
      },
      {
        choice: "Fail closed on egress",
        over: "Best-effort stripping",
        because: "If the final scan finds PII, the request fails rather than leaking a partially redacted payload.",
      },
    ],
    findings: [
      {
        title: "An IDOR in the first version",
        body: "User identity came from a URL parameter. Deriving it from the verified token closed the hole; RLS made a repeat structurally impossible.",
      },
      {
        title: "Random splits flattered the categoriser",
        body: "F1 on a random split was 21.3% higher than on a temporal split, so the temporal split is the one reported.",
        source: { repo: "FinMitr_demo", path: "README.md", line: 139 },
      },
    ],
    results: [
      { figure: "0 rows", label: "of another tenant returned by an unfiltered SELECT", source: { repo: "FinMitr_demo", path: "tests/test_rls_isolation.py", line: 127 } },
      { figure: "Fail-closed", label: "PII egress check raises before any LLM call", source: { repo: "FinMitr_demo", path: "app/llm/redaction.py", line: 405 } },
    ],
  },
  {
    slug: "arbitron",
    title: "Arbitron",
    kind: "project",
    tagline: "An LLM quant-research agent wrapped in a statistical defence layer.",
    headline: { figure: "4.6×", label: "t-stat inflation removed" },
    year: "2026",
    stack: ["Python", "FastAPI", "React", "scikit-learn", "Llama 3.3"],
    repo: "Arbitron",
    relevance: { quant: 3, ds: 2, ml: 1, research: 1, swe: 1 },
    summary: [
      "An agent that runs quantitative research end to end: it ranks factor candidates, runs walk-forward backtests, optimises portfolios with Ledoit–Wolf shrinkage, and audits every result before reporting it.",
      "The agent is not trusted. The LLM plans and calls tools; it never produces numbers. Every number comes from deterministic Python, and every strategy must clear the Probabilistic and Deflated Sharpe ratios, the Probability of Backtest Overfitting, a drawdown gate and a regime-robustness check.",
    ],
    problem: [
      "Backtests overstate real performance for four distinct reasons, each needing its own correction: look-ahead bias, selection bias from trying many strategies, overlapping labels, and regime instability.",
      "A 21-day forward return computed daily means consecutive labels share 20 of 21 days. The effective sample is about N/21, so naive t-statistics are inflated by roughly √21 ≈ 4.6×.",
    ],
    pipeline: [
      { name: "Factors", detail: "13 factors with IC/ICIR and Fama–MacBeth regressions." },
      { name: "Backtest", detail: "Dollar-neutral quintile long-short with transaction costs." },
      { name: "Correct", detail: "Newey–West HAC standard errors for overlapping labels." },
      { name: "Audit", detail: "PSR, DSR against the persisted trial count, PBO via CSCV, drawdown and regime gates." },
      { name: "Regimes", detail: "Causal, forward-filtered HMM posteriors; never a smoother." },
    ],
    decisions: [
      {
        choice: "LLM for planning only",
        over: "LLM-reported results",
        because: "A language model should never be the source of a Sharpe ratio.",
      },
      {
        choice: "Forward-filtered regimes",
        over: "Smoothed HMM posteriors",
        because: "A smoother conditions on the future, which is look-ahead bias disguised as a feature.",
      },
    ],
    findings: [
      {
        title: "A dollar-neutral portfolio that wasn't",
        body: "An unconditional clip in the optimiser zeroed the short leg, so the \"dollar-neutral\" book was a levered long with weights summing to 1.4385. Found by checking the invariant, not the returns.",
      },
    ],
    results: [
      { figure: "√21", label: "overlap correction via Newey–West HAC" },
      { figure: "13", label: "factors under the audit layer" },
    ],
  },
  {
    slug: "neuro-econometric",
    title: "Neuro-Econometric Engine",
    kind: "project",
    tagline: "A hybrid deep-learning and econometric forecaster, and an honest negative result.",
    headline: { figure: "1,574", label: "walk-forward predictions" },
    year: "2026",
    stack: ["PyTorch", "statsmodels", "AWS Lambda", "Terraform"],
    repo: "Neuro-Econometric-Forecaster",
    relevance: { ds: 3, quant: 2, research: 2, ml: 2, swe: 1 },
    summary: [
      "A causally-masked Transformer-LSTM fused with ARDL and ARIMA baselines through a learned gating network, evaluated with a five-fold expanding-window walk-forward protocol on real data, with calibration checks, drift monitoring and significance tests.",
      "The result is reported as measured: on 1,574 walk-forward predictions the hybrid reached 49.24% directional accuracy against 53.43% for ARIMA, and the Diebold–Mariano test says the gap is real.",
    ],
    problem: [
      "Most published results in this space are wrong in systematic ways, and an audit of this codebase found the same ones: synthetic data mistaken for real, a scaler fit before the split, a placeholder statistical test that never ran, and a smoothed regime feature that sees the future.",
      "Each of those mistakes makes a model look better. None of them is exotic.",
    ],
    pipeline: [
      { name: "Data", detail: "Real market and macro series, with a loader audit." },
      { name: "Branches", detail: "Transformer-LSTM, ARDL with a Pesaran–Shin–Smith bounds test, rolling AR baselines." },
      { name: "Gate", detail: "A learned per-observation gate choosing which branch to trust." },
      { name: "Evaluate", detail: "Five-fold expanding-window walk-forward with retraining, Diebold–Mariano tests and calibration." },
      { name: "Deploy", detail: "Containerised AWS Lambda through Terraform, with OIDC-federated GitHub Actions." },
    ],
    decisions: [
      {
        choice: "Report the walk-forward number",
        over: "The better single split",
        because: "A single split scored 51.41%, but five retrained folds pooled are the honest estimate.",
      },
      {
        choice: "Perturbation test for causality",
        over: "Trusting the mask",
        because: "Changing future observations must leave past regime posteriors unchanged, and the test proves it.",
      },
    ],
    findings: [
      {
        title: "The model lost to ARIMA, and that is the finding",
        body: "Hybrid 49.24% vs ARIMA 53.43% directional accuracy on the same 1,574 predictions; Diebold–Mariano p = 4.8e-5.",
        source: { repo: "Neuro-Econometric-Forecaster", path: "MODEL_EVALUATION_REPORT.md", line: 16 },
      },
      {
        title: "Seven defects found by auditing my own pipeline",
        body: "Including normalisation leakage, a placeholder bounds test that always returned the same answer, and a README figure no artifact had produced. All fixed or retracted before the final run.",
      },
    ],
    results: [
      { figure: "49.24% vs 53.43%", label: "hybrid vs ARIMA directional accuracy", source: { repo: "Neuro-Econometric-Forecaster", path: "MODEL_EVALUATION_REPORT.md", line: 16 } },
      { figure: "p = 4.8e-5", label: "Diebold–Mariano, squared-error loss", source: { repo: "Neuro-Econometric-Forecaster", path: "MODEL_EVALUATION_REPORT.md", line: 56 } },
    ],
  },
  {
    slug: "hydrograph",
    title: "HydroGraph",
    kind: "project",
    tagline: "A dual-scale spatiotemporal graph network over a directed drainage graph.",
    headline: { figure: "28 / 68", label: "waterway edges reoriented downhill" },
    year: "2026",
    stack: ["PyTorch Geometric", "GATv2", "GraphSAGE", "GRU", "OSMnx"],
    repo: "HydroGraph",
    relevance: { ml: 2, research: 2, ds: 2, swe: 0, quant: 0 },
    summary: [
      "A spatiotemporal graph attention network that forecasts per-node urban flood probability at four lead times. The city's street and drainage network becomes a directed graph with 16 static features per node; rainfall is encoded at two time scales by separate GRUs, fused by a cross-temporal attention gate, and propagated with GATv2 and GraphSAGE layers.",
      "Two things make it engineering rather than a model demo: the graph is physically corrected, and the evaluation was audited and documented in a model card.",
    ],
    problem: [
      "Water flows through a drainage network, not between adjacent pixels, so a grid CNN cannot represent a watershed divide.",
      "A default street graph has symmetric edges, which lets message passing push a flood signal uphill. The model then has to learn not to do something the graph should never have allowed.",
      "Flooding is rare, so ROC-AUC flatters useless models; the evaluation needs precision-recall metrics and a persistence baseline.",
    ],
    pipeline: [
      { name: "Graph", detail: "Directed drainage and street graph; waterway edges oriented downhill, roads left bidirectional." },
      { name: "Features", detail: "16 static physical features per node." },
      { name: "Rainfall", detail: "Two GRUs at 6-hour and 24-hour windows, fused by attention." },
      { name: "Propagate", detail: "GATv2 and GraphSAGE message passing with edge features." },
      { name: "Evaluate", detail: "Persistence and learned baselines; precision-recall metrics." },
    ],
    decisions: [
      {
        choice: "Orient waterway edges by elevation, keep roads bidirectional",
        over: "A symmetric graph",
        because: "Drains carry water downhill; two-way streets are real.",
      },
      {
        choice: "Two rainfall time scales",
        over: "One window",
        because: "A short window misses saturation; a long one dilutes the trigger.",
      },
    ],
    findings: [
      {
        title: "The validation split was 99.7% positive",
        body: "A chronological split landed inside one continuous rainfall event, which made early stopping meaningless. Diagnosed and documented in the model card rather than hidden.",
        source: { repo: "HydroGraph", path: "MODEL_CARD.md", line: 104 },
      },
      {
        title: "A normalisation leak across folds",
        body: "Normalisation statistics were computed beyond the training fold. Closed, with tests.",
        source: { repo: "HydroGraph", path: "AUDIT_REPORT.md", line: 50 },
      },
    ],
    results: [
      { figure: "28 of 68", label: "waterway edges reoriented to flow downhill" },
      { figure: "51", label: "tests, including the orientation fix" },
    ],
  },
  {
    slug: "volt-infer",
    title: "Volt-Infer",
    kind: "project",
    tagline: "An LLM inference runtime with paged KV caching and INT8 paths.",
    headline: { figure: "< 1%", label: "INT8 error vs FP16" },
    year: "2026",
    stack: ["PyTorch", "Triton", "ONNX", "asyncio"],
    repo: "Volt-Infer",
    relevance: { ml: 2, swe: 2, research: 1, ds: 0, quant: 0 },
    summary: [
      "An inference server with a paged KV cache, copy-on-write forks for shared prefixes, and reference-counted page eviction. Requests are demultiplexed by key across concurrent connections, and Triton kernels sit behind import guards so CPU-only hosts fall back cleanly. A hysteresis-based autoscaler avoids thrashing.",
    ],
    problem: [
      "Serving many sequences means KV memory, not compute, is the constraint. Contiguous per-request buffers fragment memory and copy shared prefixes.",
    ],
    pipeline: [
      { name: "Admit", detail: "Request-keyed demultiplexing across concurrent connections." },
      { name: "Cache", detail: "Paged KV blocks, copy-on-write forks, reference-counted eviction." },
      { name: "Compute", detail: "Triton kernels where available; CPU fallback otherwise." },
      { name: "Quantise", detail: "INT8 weights with asymmetric quantisation." },
    ],
    decisions: [
      {
        choice: "Copy-on-write pages",
        over: "Copying prefixes per fork",
        because: "Shared prompt prefixes cost one copy until a branch writes.",
      },
    ],
    findings: [
      {
        title: "An asymmetric quantisation bug",
        body: "CPU and GPU INT8 paths disagreed. After the fix both agree with FP16 to within 1% relative error, enforced by tests.",
        source: { repo: "Volt-Infer", path: "tests/test_quantization.py", line: 47 },
      },
      {
        title: "A network header miscalculation",
        body: "Found while verifying demultiplexing across 50 concurrent connections.",
      },
    ],
    results: [
      { figure: "< 1%", label: "INT8 relative error against FP16", source: { repo: "Volt-Infer", path: "tests/test_quantization.py", line: 47 } },
      { figure: "50", label: "concurrent connections verified" },
    ],
  },
  {
    slug: "chatroom",
    title: "Chatroom",
    kind: "project",
    tagline: "A length-prefixed binary TCP protocol with pub/sub fan-out.",
    headline: { figure: "O(1)", label: "join and leave" },
    year: "2026",
    stack: ["Python", "asyncio", "TCP", "Nginx", "Docker"],
    repo: "ChatRoom",
    relevance: { swe: 2, ml: 0, ds: 0, research: 0, quant: 0 },
    summary: [
      "A multi-room chat server on a custom length-prefixed binary protocol over asyncio, deliberately not WebSockets. A dual index (room to connections, connection to rooms) gives O(1) join and leave, and broadcast fans out concurrently. Token-bucket rate limiting and input sanitisation guard the public endpoint.",
    ],
    problem: [
      "TCP delivers bytes, not messages. A naive read is wrong in both directions, fragmenting and coalescing messages, yet it seems to work on loopback, where small messages usually arrive whole.",
      "Sequential broadcast lets one slow client stall a room, and leave-by-scan makes the most common event in chat O(rooms).",
    ],
    pipeline: [
      { name: "Frame", detail: "Length-prefixed binary frames with a size cap." },
      { name: "Route", detail: "Dual index for O(1) membership changes." },
      { name: "Fan out", detail: "Concurrent sends with asyncio.gather." },
      { name: "Protect", detail: "Per-user token buckets, a per-IP connection cap, input sanitisation." },
    ],
    decisions: [
      {
        choice: "A custom binary protocol",
        over: "WebSockets",
        because: "Solving framing directly is the point of the exercise.",
      },
    ],
    findings: [],
    results: [
      { figure: "O(1)", label: "membership changes via the dual index", source: { repo: "ChatRoom", path: "app/core/protocol.py" } },
    ],
  },
  {
    slug: "amex-codestreet",
    title: "American Express CodeStreet",
    kind: "competition",
    tagline: "An autonomous flight-rebooking concierge and a calibrated delay model.",
    headline: { figure: "Top 6", label: "of 11,500 teams" },
    year: "2026",
    stack: ["XGBoost", "tree-SHAP", "LangGraph", "AWS Bedrock", "Python"],
    team: "Team of three. Top 6 finalist of 11,500 teams.",
    relevance: { ds: 3, ml: 2, swe: 1, research: 0, quant: 1 },
    summary: [
      "An autonomous flight concierge that rebooks disrupted travellers, spending only on delivery-verified consent and otherwise escalating to a human, built with schema-validated tool calling.",
      "Under it, an isotonic-calibrated XGBoost model trained on 11M flights across five countries, validated on an out-of-time split and explained with tree-SHAP.",
    ],
    problem: [
      "An agent that can spend money needs a consent rule it cannot talk its way around, and a probability it can trust, not just a ranking.",
    ],
    pipeline: [
      { name: "Predict", detail: "Calibrated XGBoost disruption risk with tree-SHAP explanations." },
      { name: "Smooth", detail: "Kernel-weighted neighbour smoothing over same-airport flights." },
      { name: "Act", detail: "Schema-validated tool calls; spending gated on delivery-verified consent; human escalation otherwise." },
    ],
    decisions: [
      {
        choice: "Isotonic calibration on a time-based split",
        over: "Raw model scores",
        because: "The agent acts on probabilities, so they have to mean what they say on future data.",
      },
    ],
    findings: [
      {
        title: "Half the model calls were unnecessary",
        body: "Kernel-weighted smoothing over same-airport flights cut real model calls by 50% at equal staleness.",
      },
    ],
    results: [
      { figure: "0.83", label: "AUC on an out-of-time split" },
      { figure: "5.4×", label: "lift" },
      { figure: "−50%", label: "model calls at equal staleness" },
    ],
  },
];

export const projectBySlug = (slug: string) => PROJECTS.find((p) => p.slug === slug);
