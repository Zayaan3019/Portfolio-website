"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import {
  Github, Linkedin, Mail, FileText,
  Cpu, Network, Brain,
  ArrowUpRight, Code2,
  ChevronDown, Trophy, BookOpen,
  Shield, Database, GitBranch, LineChart,
  Boxes, Workflow, Search, Command, X,
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// --- UTILS ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- COMPONENTS ---

// Hero background lighting effect (self-contained SVG, no external icon library).
const SpotlightEffect = ({ className, fill }: { className?: string; fill?: string }) => (
  <svg
    className={cn(
      "animate-spotlight pointer-events-none absolute z-[1] h-[169%] w-[138%] lg:w-[84%] opacity-0",
      className
    )}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 3787 2842"
    fill="none"
  >
    <g filter="url(#spotlight-blur)">
      <ellipse
        cx="1924.71"
        cy="273.501"
        rx="1924.71"
        ry="273.501"
        fill={fill ?? "white"}
        fillOpacity="0.18"
        transform="matrix(-0.822377 -0.568943 -0.568943 0.822377 3631.88 2291.09)"
      />
    </g>
    <defs>
      <filter
        id="spotlight-blur"
        x="0.860352"
        y="0.838989"
        width="3785.16"
        height="2840.26"
        filterUnits="userSpaceOnUse"
        colorInterpolation="sRGB"
      >
        <feFlood floodOpacity="0" result="BackgroundImageFix" />
        <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
        <feGaussianBlur stdDeviation="151" result="effect1_blur" />
      </filter>
    </defs>
  </svg>
);

// Thin gradient bar tracking scroll depth across the whole page.
const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30, restDelta: 0.001 });
  return (
    <motion.div
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 h-[2px] origin-left z-[60] bg-gradient-to-r from-brand-accent via-cyan-400 to-brand-accent"
    />
  );
};

// Small editorial section label, e.g. "02 — PROJECTS"
const SectionEyebrow = ({ index, label }: { index: string; label: string }) => (
  <div className="flex items-center gap-3 mb-4">
    <span className="text-brand-accent font-mono text-xs">{index}</span>
    <span className="h-px w-8 bg-brand-accent/40" />
    <span className="text-neutral-500 font-mono text-xs uppercase tracking-[0.2em]">{label}</span>
  </div>
);

// Card wrapper that tracks the cursor and renders a soft radial glow following it.
const SpotlightCard = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [active, setActive] = useState(false);

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }, []);

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      className={className}
    >
      <div
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
        style={{
          opacity: active ? 1 : 0,
          background: `radial-gradient(500px circle at ${pos.x}% ${pos.y}%, rgba(59,130,246,0.14), transparent 60%)`,
        }}
      />
      {children}
    </div>
  );
};

// 1. The Bento Card (Apple/Linear Style), now with cursor-tracked spotlight glow.
const BentoCard = ({
  title, subtitle, desc, tags, icon, link, large
}: {
  title: string; subtitle: string; desc: string; tags: string[]; icon: React.ReactNode; link?: string; large?: boolean
}) => (
  <motion.div whileHover={{ y: -5 }} className={large ? "md:col-span-2" : "md:col-span-1"}>
    <SpotlightCard className="group relative overflow-hidden rounded-3xl bg-neutral-900/50 border border-neutral-800 p-8 hover:border-brand-accent/50 transition-colors duration-300 flex flex-col h-full">
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex justify-between items-start mb-6">
          <div className="p-3 bg-neutral-800 rounded-2xl text-white group-hover:scale-110 group-hover:text-brand-accent transition-all duration-300">
            {icon}
          </div>
          {link && <ArrowUpRight className="text-neutral-500 group-hover:text-white group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />}
        </div>

        <div className="mb-auto">
          <h3 className="text-xl font-bold text-white mb-1 group-hover:text-brand-accent transition-colors">{title}</h3>
          <p className="text-xs font-mono text-brand-accent mb-4 uppercase tracking-wider">{subtitle}</p>
          <p className="text-neutral-400 text-sm leading-relaxed">{desc}</p>
        </div>

        <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-neutral-800/50">
          {tags.map((tag, i) => (
            <span key={i} className="text-[10px] font-mono text-neutral-500 border border-neutral-800 px-2 py-1 rounded bg-neutral-900">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {link && <a href={link} target="_blank" rel="noopener noreferrer" aria-label={`Open ${title} on GitHub`} className="absolute inset-0 z-20" />}
    </SpotlightCard>
  </motion.div>
);

// Verified-metrics ledger. Every figure is produced by a test or benchmark in the linked repo.
const PROOF_POINTS = [
  { value: "5.96e-8", unit: "max deviation", label: "KV-cache decoding proven logit-identical to a full forward pass.", repo: "NanoLM" },
  { value: "4.04", unit: "ms p99", label: "DeepLOB inference held inside a hard 5 ms CPU budget.", repo: "Adaptive Market Making Engine" },
  { value: "41.3", unit: "% CPU saved", label: "Native C /proc collector against a psutil baseline at 10 Hz.", repo: "SystemLens" },
  { value: "0.90", unit: "recall@5", label: "Hybrid retrieval measured over 661 real SEC filing chunks.", repo: "Chronicle" },
  { value: "4,111", unit: "POSIX cases", label: "pjdfstest conformance for a FUSE filesystem built from scratch.", repo: "Distributed File Sync" },
  { value: "10,000", unit: "resamples", label: "Paired bootstrap gating every evaluation regression.", repo: "AI-Evals" },
  { value: "99.3", unit: "% of ticks", label: "Misfire rate of a textbook VPIN threshold, found and calibrated away.", repo: "Adaptive Market Making Engine" },
  { value: "1", unit: "honest null", label: "Model collapse published in a model card instead of an inflated metric.", repo: "HydroGraph" },
];

const ProofOfWork = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    {PROOF_POINTS.map((pt, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.35, delay: (i % 4) * 0.05 }}
      >
        <SpotlightCard className="group relative h-full overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 hover:border-brand-accent/50 transition-colors duration-300">
          <div className="relative z-10 flex h-full flex-col">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="font-mono text-3xl font-bold tracking-tight text-white">{pt.value}</span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-brand-accent">{pt.unit}</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-neutral-400">{pt.label}</p>
            <p className="mt-auto pt-5 font-mono text-[10px] uppercase tracking-wider text-neutral-500">{pt.repo}</p>
          </div>
        </SpotlightCard>
      </motion.div>
    ))}
  </div>
);

// Command palette — Cmd/Ctrl+K quick navigation, matching the "engineer's portfolio" idiom.
type CommandItem = { label: string; hint: string; action: () => void };

// Mounted fresh each time the palette opens, so its query state always starts empty
// without needing an effect to reset it.
const PaletteBody = ({ onClose, items }: { onClose: () => void; items: CommandItem[] }) => {
  const [query, setQuery] = useState("");
  const filtered = useMemo(
    () => items.filter((i) => i.label.toLowerCase().includes(query.toLowerCase())),
    [items, query]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: -12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.98 }}
      transition={{ duration: 0.15 }}
      onClick={(e) => e.stopPropagation()}
      className="w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden"
    >
      <div className="flex items-center gap-3 px-5 py-4 border-b border-neutral-800">
        <Search size={18} className="text-neutral-500 flex-shrink-0" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Jump to a section or open a link..."
          className="bg-transparent outline-none text-white placeholder:text-neutral-600 w-full text-sm"
          onKeyDown={(e) => {
            if (e.key === "Escape") onClose();
            if (e.key === "Enter" && filtered[0]) {
              filtered[0].action();
              onClose();
            }
          }}
        />
        <button onClick={onClose} aria-label="Close" className="text-neutral-600 hover:text-white transition-colors flex-shrink-0">
          <X size={18} />
        </button>
      </div>
      <div className="max-h-80 overflow-y-auto py-2">
        {filtered.length === 0 && (
          <p className="px-5 py-6 text-sm text-neutral-600 text-center">No matches.</p>
        )}
        {filtered.map((item, i) => (
          <button
            key={i}
            onClick={() => { item.action(); onClose(); }}
            className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-neutral-800/60 transition-colors"
          >
            <span className="text-sm text-neutral-200">{item.label}</span>
            <span className="text-xs font-mono text-neutral-600">{item.hint}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
};

const CommandPalette = ({
  open, onClose, items,
}: {
  open: boolean; onClose: () => void; items: CommandItem[];
}) => (
  <AnimatePresence>
    {open && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      >
        <PaletteBody onClose={onClose} items={items} />
      </motion.div>
    )}
  </AnimatePresence>
);

// --- DATA ---
const DATA = {
  profile: {
    name: "Mohamed Zayaan S",
    tagline: "Engineering Verified, Production-Grade Systems Across AI, Deep Learning, and Distributed Software.",
    about: "I'm a final-year undergraduate at IIT Madras, graduating in May 2027 with a B.Tech in Civil Engineering and a Minor in Computer Science. My work spans building deep learning architectures from first principles (GPT-style LMs, ViT/CLIP, spatiotemporal GNNs), hardening backend and distributed systems (row-level security, FUSE filesystems, native telemetry collectors), and researching AI evaluation and agentic systems. Every project on this page is backed by a real, passing test suite — I care as much about proving a claim as making it, whether that means a 5.96e-8 KV-cache deviation bound or an honest null result published instead of an inflated metric.",
    education: {
      degree: "B.Tech in Civil Engineering (Major) + Minor in CS",
      institution: "Indian Institute of Technology, Madras",
      cgpa: "8.46/10",
      year: "2023-2027"
    },
    achievements: [
      "Top 6 Finalist among 11,500 teams, American Express CodeStreet 2026",
      "Author, Cortex-Synth (arXiv:2509.06705) — 3D skeleton synthesis via hierarchical graph attention",
      "Codeforces Specialist — max rating 1423, with 400+ DSA problems solved across LeetCode, Striver, NeetCode & GfG",
      "Top 0.8% in JEE Mains (11.13L candidates) · Top 0.5% in JEE Advanced (1.80L candidates)"
    ],
    links: {
      resume: "https://drive.google.com/file/d/1aarBTHwfhVeHV14wBM_KzrPw_gpyjCZg/view?usp=sharing",
      github: "https://github.com/Zayaan3019",
      linkedin: "https://www.linkedin.com/in/mohamed-zayaan-s",
      codeforces: "https://codeforces.com/profile/Zayaan30_",
      mail: "ce23b092@smail.iitm.ac.in"
    }
  },
  experience: [
    {
      company: "London Stock Exchange Group (LSEG)",
      role: "ML Intern",
      time: "May '26 - July '26",
      desc: "Architected a Salesignal classification pipeline from scratch, automating Snowflake ingestion into a live feature store. Integrated a Neo4j knowledge graph linking account, product, and ticket entities as first-class features, cutting classifier false positives 20%, and engineered AWS Bedrock batch-LLM workflows over 5 million rows to distill feedback and telemetry into model features. Worked on the streaming quality-analytics plane of LSEG's real-time market-data platform, flagging price anomalies and rolling-volatility outliers and validating every tick within a 50ms assessment budget, cutting analyst alert volume by around 45%.",
      tags: ["Snowflake", "Neo4j", "AWS Bedrock", "Microservices"]
    },
    {
      company: "Mavvrik",
      role: "SDE Intern",
      time: "Dec '25 - Mar '26",
      desc: "Architected a core MCP server using stdio/SSE transports and GraphQL APIs for modular, multi-agent tool orchestration. Fortified security with multi-auth (OAuth2/API Key) and async audit logging for enterprise-grade compliance. Engineered Pydantic-validated cost tooling for granular spend analysis via custom, real-time drill-down dashboards.",
      tags: ["MCP", "GraphQL", "OAuth2", "Pydantic", "System Design"]
    },
    {
      company: "CeRAI, IIT Madras",
      role: "AI Research Intern",
      time: "July '25 - Dec '25",
      desc: "Architected bias classifiers to identify and mitigate harmful socio-cultural biases in Indian LLMs. Researched model fairness and safety to advance Responsible and Ethical AI frameworks. Tailored model safety protocols to prevent stereotype propagation and improve equitable AI behaviour.",
      tags: ["LLM Safety", "Responsible AI", "Model Fairness", "Bias Detection"]
    },
    {
      company: "AGC Lab, IIT Madras",
      role: "Deep Learning Research Intern",
      time: "Apr '25 - Sep '25",
      desc: "Built skeletal-prior attention models for 1D curve skeleton creation from 3D point clouds. Improved pose estimation accuracy using a transformer-based hybrid algorithm for spectral denoising. Worked on cross-source alignment for unstructured, low-overlap 3D point clouds with novel skeletal models.",
      tags: ["Geometric DL", "Transformers", "3D Vision", "Point Clouds"]
    },
    {
      company: "FinMitr",
      role: "Founding Engineer",
      time: "June '24 - Mar '25",
      desc: "Led AI/ML development of the FinGuru financial advisor platform — LLM-driven insights, ML-based transaction categorization, and custom anomaly detection. Owned business operations strategy alongside implementation of user-facing features.",
      tags: ["LLMs", "ML", "Anomaly Detection", "Business Strategy"]
    }
  ],
  competitions: [
    {
      title: "American Express CodeStreet 2026",
      subtitle: "Top 6 Finalist • 11,500 Teams Nationwide",
      desc: "Designed an autonomous flight concierge pipeline that spends only on delivery-verified consent and otherwise escalates to a human. Shipped it on AWS Bedrock and LangGraph with schema-validated tool-calling, forced tool-choice, a circuit breaker, and an 8s timeout. Trained an isotonic-calibrated XGBoost model over 11M flights across 5 countries — 0.83 PR-AUC with 5.4x lift on an out-of-time split, explained with tree-SHAP — and built kernel-weighted neighbour smoothing over same-airport flights, cutting real model calls 50% at equal staleness.",
      tags: ["AWS Bedrock", "LangGraph", "XGBoost", "tree-SHAP"],
      icon: <Trophy />
    }
  ],
  publications: [
    {
      title: "Cortex-Synth: Differentiable Topology-Aware 3D Skeleton Synthesis",
      status: "arXiv:2509.06705",
      desc: "Synthesizes 3D skeleton geometry and topology directly from 2D images using a hierarchical graph-attention mechanism for multi-scale skeletal refinement and a differentiable spectral topology optimization via Laplacian eigendecomposition. Reports an 18.7% improvement in MPJPE and a 27.3% improvement in Graph Edit Distance on ShapeNet.",
      tags: ["Geometric DL", "PyTorch", "Graph Attention", "ShapeNet"],
      link: "https://arxiv.org/abs/2509.06705"
    }
  ],
  patents: [
    {
      title: "Hybrid TD3-ACO based Swarm Robotic System for Intelligent Warehouse Automation",
      status: "Patent under review",
      desc: "Fused Twin-Delayed DDPG (TD3) and Ant Colony Optimization (ACO) into a novel hybrid multi-agent RL algorithm, enabling decentralized swarm coordination of mobile robots in dynamic, unstructured warehouse environments.",
      tags: ["Reinforcement Learning", "Swarm Robotics", "TD3", "ACO"]
    }
  ],
  projects: [
    {
      title: "Adaptive Market Making Engine",
      category: "Quant & Trading",
      subtitle: "Real-Time Market Microstructure",
      desc: "Architected an 8-service market-making engine ingesting live Binance L2 order-book data through Redis Streams into a TimescaleDB-backed Avellaneda-Stoikov quoting strategy. Trained a DeepLOB CNN-Inception-LSTM with additive attention (146K params) that beat the majority-class baseline by 7.9 accuracy points, optimized ONNX Runtime inference to a 4.04ms p99 — 2.2x faster than TorchScript at equal lookback — to meet a hard 5ms budget, and self-calibrated a VPIN toxicity gate that replaced a fixed threshold misfiring on 99.3% of ticks.",
      tags: ["DeepLOB", "ONNX Runtime", "Redis Streams", "TimescaleDB"],
      icon: <LineChart />,
      link: "https://github.com/Zayaan3019/AMME",
      large: true
    },
    {
      title: "SystemLens",
      category: "Systems",
      subtitle: "Native Systems Telemetry",
      desc: "Replaced psutil with a native C telemetry collector parsing /proc and /sys through persistent file descriptors and zero-allocation pread sampling, cutting agent CPU overhead 41.3% at 10Hz — proven by a paired harness alternating backends across five repetitions. Designed a multi-tenant fleet schema on partitioned PostgreSQL enforcing isolation via row-level security, backed by 133 regression cases validated against real /proc and /sys captures.",
      tags: ["C", "FastAPI", "PostgreSQL RLS", "Prometheus"],
      icon: <Cpu />,
      link: "https://github.com/Zayaan3019/SystemLens"
    },
    {
      title: "FinGuru",
      category: "Systems",
      subtitle: "Fintech Security & Account Aggregation",
      desc: "Eliminated an IDOR vulnerability by deriving every user identity from a verified JWT instead of a URL parameter, then enforced tenant isolation with PostgreSQL row-level security, Argon2id hashing, and rotating refresh-token families. Integrated a ReBIT-spec Account Aggregator client (Setu/Finvu/OneMoney) behind a fail-closed PII-redaction pipeline that tokenizes accounts, cards, and PAN/UPI IDs before anything reaches an LLM.",
      tags: ["FastAPI", "PostgreSQL RLS", "RBI Account Aggregator"],
      icon: <Shield />,
      link: "https://github.com/Zayaan3019/FinMitr_demo"
    },
    {
      title: "NanoLM",
      category: "AI & ML",
      subtitle: "GPT-Style Language Model From Scratch",
      desc: "Built a GPT-style language model from first principles — BPE tokenizer, fused QKV projections, pre-norm transformer blocks, tied embeddings — with configs scaling to 345M parameters (GPT-2-medium), validated by parameter-count and shape-correctness tests. Proved KV-cache decoding is logit-identical to a full forward pass within 5.96e-8 max deviation, and enforced correct DDP semantics with loss-scaled gradient accumulation and no_sync bucketing.",
      tags: ["PyTorch", "DDP", "Flash Attention", "BPE"],
      icon: <Brain />,
      link: "https://github.com/Zayaan3019/NanoLM",
      large: true
    },
    {
      title: "NanoVision",
      category: "AI & ML",
      subtitle: "ViT + CLIP From Scratch",
      desc: "Implemented ViT and CLIP entirely from scratch in pure PyTorch — patch embedding, pre-LN blocks, Flash Attention, DropPath — training a symmetric InfoNCE objective with a learnable temperature clamped at ln(100), matching the CLIP paper's own convention. Backed by 146 unit tests, 89% asserting closed-form numerics or gradients, reaching 83.7% ViT top-1 and 64.2% CLIP zero-shot top-1 on a contamination-free CIFAR-10 gallery.",
      tags: ["PyTorch", "ViT", "CLIP", "InfoNCE"],
      icon: <Boxes />,
      link: "https://github.com/Zayaan3019/NanoVision"
    },
    {
      title: "HydroGraph",
      category: "AI & ML",
      subtitle: "Spatiotemporal Flood-Risk GNN",
      desc: "Architected a spatiotemporal GNN (GATv2 + GraphSAGE + GRU) over a directed drainage graph built from OSMnx waterway topology, physically reorienting 28 of 68 edges downhill by real elevation delta. Closed a train-fold normalization leak and built a persistence-baseline evaluation harness verified by 51 passing tests — then root-caused an early-stopping model collapse to a 99.7%-positive validation split and published the failure transparently in the project's own model card instead of reporting an inflated metric.",
      tags: ["GATv2", "GraphSAGE", "GRU", "OSMnx"],
      icon: <Network />,
      link: "https://github.com/Zayaan3019/HydroGraph",
      large: true
    },
    {
      title: "Arbitron",
      category: "Quant & Trading",
      subtitle: "Autonomous Quant Research Agent",
      desc: "Built an LLM research agent running 13-factor walk-forward backtests with purged, embargoed cross-validation folds, computing Deflated Sharpe Ratio and Probability of Backtest Overfitting against a persisted trial count. Corrected IC significance for 21-day overlapping labels via Newey-West HAC — removing a 4.6x t-stat inflation — and gated regime detection on causal, forward-filtered HMM posteriors to eliminate look-ahead bias.",
      tags: ["FastAPI", "React", "Llama 3.3", "scikit-learn"],
      icon: <LineChart />,
      link: "https://github.com/Zayaan3019/Arbitron"
    },
    {
      title: "Chronicle",
      category: "AI & ML",
      subtitle: "Multi-Agentic Financial Research Engine",
      desc: "Built a 7-stage multi-agent research pipeline over live SEC EDGAR and GDELT sources that denies unchecked LLM output, enforcing point-in-time correctness through pre-ranking filters on dense and sparse retrieval, proven over 200 trials. Added a numeric-claim verifier forcing correction on any unsupported figure, and ran a retrieval ablation across BM25, dense, and hybrid+cross-encoder to reach 0.90 recall@5 on 661 real SEC filing chunks.",
      tags: ["RAG", "SEC EDGAR", "Chroma", "BM25"],
      icon: <Database />,
      link: "https://github.com/Zayaan3019/Chronicle"
    },
    {
      title: "Neuro-Econometric Intelligence Engine",
      category: "Quant & Trading",
      subtitle: "Hybrid Deep Learning + Econometrics",
      desc: "Fused a causal-masked Transformer-LSTM with ARDL/ARIMA econometric baselines via a learned gating network, proving the regime-detection mechanism genuinely causal by perturbation testing. Ran walk-forward evaluation across 1,574 predictions with zero train/test index overlap, and audited the pipeline end-to-end — catching a leakage bug and a placeholder statistic before reporting the corrected, honest null result.",
      tags: ["PyTorch", "statsmodels", "Transformer", "LSTM"],
      icon: <Workflow />,
      link: "https://github.com/Zayaan3019/Neuro-Econometric-Forecaster"
    },
    {
      title: "AI-Evals",
      category: "AI & ML",
      subtitle: "LLM Observability & Judge Calibration",
      desc: "Built an OTel-native tracing SDK with bounded-queue export, redaction-before-egress, and sub-millisecond p50 overhead, backed by a 4-tier evaluator registry verified by double-execution. Calibrated LLM judges against human labels with Cohen's kappa, gated regressions with a 10,000-sample paired bootstrap, and caught and fixed a real superuser Postgres row-level-security bypass defect in the process.",
      tags: ["OpenTelemetry", "ClickHouse", "PostgreSQL", "React"],
      icon: <Code2 />,
      link: "https://github.com/Zayaan3019/AI-Evals",
      large: true
    },
    {
      title: "Distributed File Sync Engine",
      category: "Systems",
      subtitle: "Peer-to-Peer FUSE Filesystem",
      desc: "Built a FUSE filesystem (pyfuse3) replicating peer edits transparently through Merkle-tree 4KB chunk delta transfer, layering vector-clock causality over a crash-recoverable SQLite catalog so conflicts surface as visible files. Secured peer sync with PSK-derived AES-256-GCM encryption and challenge-response mutual authentication, validating POSIX compliance at 4,111 of 8,798 pjdfstest cases.",
      tags: ["FUSE", "asyncio", "Merkle Trees", "AES-256-GCM"],
      icon: <GitBranch />,
      link: "https://github.com/Zayaan3019/Distributed_File_Sync"
    },
    {
      title: "Volt-Infer",
      category: "Systems",
      subtitle: "Decentralized LLM Inference Runtime",
      desc: "Built an LLM inference server with paged KV caching, copy-on-write forks, and reference-counted page eviction, debugging a network header miscalculation and verifying request-keyed demultiplexing across 50 concurrent connections. Corrected an asymmetric INT8 quantization bug so CPU and GPU paths agree within 1% of FP16, guarding Triton kernel imports for CPU-only fallback behind a hysteresis-based autoscaler.",
      tags: ["PyTorch", "ONNX", "asyncio", "Triton"],
      icon: <Network />,
      link: "https://github.com/Zayaan3019/Volt-Infer"
    }
  ]
};

const PROJECT_FILTERS = ["All", "AI & ML", "Quant & Trading", "Systems"];

const NAV_LINKS = [
  { id: "about", label: "About" },
  { id: "proof", label: "Proof" },
  { id: "projects", label: "Projects" },
  { id: "experience", label: "Experience" },
  { id: "contact", label: "Contact" },
];

const SECTION_IDS = {
  hero: "top",
  about: "about",
  proof: "proof",
  projects: "projects",
  competitions: "competitions",
  publications: "publications",
  experience: "experience",
  contact: "contact",
};

// --- EXPERIENCE TIMELINE (scroll-linked progress line) ---
const ExperienceTimeline = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 75%", "end 60%"],
  });
  const lineHeight = useSpring(scrollYProgress, { stiffness: 120, damping: 25 });

  return (
    <div ref={containerRef} className="relative space-y-8 max-w-3xl">
      <div className="absolute left-[5px] top-1 bottom-1 w-[2px] bg-neutral-800" />
      <motion.div
        style={{ scaleY: lineHeight }}
        className="absolute left-[5px] top-1 bottom-1 w-[2px] bg-brand-accent origin-top"
      />
      {DATA.experience.map((exp, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.4 }}
          className="relative flex gap-4 md:gap-8 group pl-0"
        >
          <div className="flex flex-col items-center relative z-10">
            <div className="w-3 h-3 rounded-full bg-neutral-950 border-2 border-neutral-700 group-hover:border-brand-accent transition-colors" />
          </div>
          <div className="pb-4 -mt-1.5">
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h3 className="text-xl font-bold text-white">{exp.company}</h3>
              <span className="text-xs font-mono text-neutral-500 bg-neutral-900 px-2 py-1 rounded">{exp.time}</span>
            </div>
            <p className="text-brand-accent font-medium text-sm mb-3">{exp.role}</p>
            <p className="text-neutral-400 leading-relaxed mb-3">{exp.desc}</p>
            <div className="flex gap-2 flex-wrap">
              {exp.tags.map((t, idx) => (
                <span key={idx} className="text-xs text-neutral-500 font-mono">#{t}</span>
              ))}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// --- MAIN PAGE ---
export default function Portfolio() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [filter, setFilter] = useState("All");

  const visibleProjects = useMemo(
    () => (filter === "All" ? DATA.projects : DATA.projects.filter((pr) => pr.category === filter)),
    [filter]
  );

  const scrollToId = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
      if (e.key === "Escape") setPaletteOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const commandItems: CommandItem[] = useMemo(() => [
    { label: "About", hint: "section", action: () => scrollToId(SECTION_IDS.about) },
    { label: "Proof of Work", hint: "section", action: () => scrollToId(SECTION_IDS.proof) },
    { label: "Projects & Research", hint: "section", action: () => scrollToId(SECTION_IDS.projects) },
    { label: "Competitions", hint: "section", action: () => scrollToId(SECTION_IDS.competitions) },
    { label: "Publications & Patents", hint: "section", action: () => scrollToId(SECTION_IDS.publications) },
    { label: "Experience", hint: "section", action: () => scrollToId(SECTION_IDS.experience) },
    { label: "Contact", hint: "section", action: () => scrollToId(SECTION_IDS.contact) },
    { label: "Open GitHub", hint: "external", action: () => window.open(DATA.profile.links.github, "_blank") },
    { label: "Open LinkedIn", hint: "external", action: () => window.open(DATA.profile.links.linkedin, "_blank") },
    { label: "Open Codeforces", hint: "external", action: () => window.open(DATA.profile.links.codeforces, "_blank") },
    { label: "View Resume", hint: "external", action: () => window.open(DATA.profile.links.resume, "_blank") },
    { label: "Send an Email", hint: "external", action: () => { window.location.href = `mailto:${DATA.profile.links.mail}`; } },
  ], [scrollToId]);

  return (
    <main id={SECTION_IDS.hero} className="min-h-screen bg-brand-dark selection:bg-brand-accent/30 selection:text-white font-sans overflow-x-hidden">

      <ScrollProgress />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} items={commandItems} />

      {/* BACKGROUND ELEMENTS */}
      <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#40404012_1px,transparent_1px),linear-gradient(to_bottom,#40404012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md border-b border-white/5 bg-brand-dark/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <span className="font-bold text-xl tracking-tight text-white">Zayaan<span className="text-brand-accent">.</span></span>
            <div className="hidden md:flex items-center gap-7">
              {NAV_LINKS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToId(item.id)}
                  className="text-sm text-neutral-400 hover:text-white transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/60"
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-4">
               <button
                 onClick={() => setPaletteOpen(true)}
                 className="hidden sm:flex items-center gap-2 text-xs font-mono text-neutral-500 border border-neutral-800 rounded-lg px-3 py-1.5 hover:border-brand-accent/50 hover:text-neutral-300 transition-colors"
               >
                 <Command size={12} /> K
               </button>
               <a href={DATA.profile.links.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="text-neutral-400 hover:text-white transition-colors"><Github size={20}/></a>
               <a href={DATA.profile.links.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-neutral-400 hover:text-white transition-colors"><Linkedin size={20}/></a>
               <a href={`mailto:${DATA.profile.links.mail}`} aria-label="Email" className="text-neutral-400 hover:text-white transition-colors"><Mail size={20}/></a>
            </div>
        </div>
      </nav>

      {/* 1. HERO SECTION (Name + Tagline) */}
      <section className="relative z-10 min-h-screen flex flex-col justify-center items-center text-center px-4">
        <SpotlightEffect className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl"
        >
          {/* Status badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-800 bg-neutral-900/80 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-accent"></span>
            </span>
            <span className="text-xs font-mono text-neutral-300">IIT Madras • CGPA 8.46/10 • Final Year</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-accent/30 bg-brand-accent/10 backdrop-blur-sm">
            <Trophy size={12} className="text-brand-accent" />
            <span className="text-xs font-mono text-brand-accent">Top 6 / 11,500 Teams • Amex CodeStreet 2026</span>
          </div>
          <a
            href={DATA.profile.links.codeforces}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-800 bg-neutral-900/80 backdrop-blur-sm hover:border-brand-accent/50 transition-colors"
          >
            <Code2 size={12} className="text-brand-accent" />
            <span className="text-xs font-mono text-neutral-300">Codeforces Specialist • Max rating 1423</span>
          </a>
          </div>

          {/* THE NAME */}
          <h1 className="text-6xl md:text-9xl font-bold tracking-tighter text-white mb-8">
            {DATA.profile.name}
          </h1>

          {/* THE TAGLINE */}
          <h2 className="text-2xl md:text-4xl font-semibold leading-tight text-transparent bg-clip-text bg-gradient-to-b from-neutral-200 to-neutral-500 max-w-4xl mx-auto">
            Engineering Verified, Production-Grade Systems Across <span className="text-brand-accent">AI</span>, <span className="text-brand-accent">Deep Learning</span>, <br className="hidden md:block"/> and Distributed Software.
          </h2>

          {/* Command Palette Hint */}
          <button
            onClick={() => setPaletteOpen(true)}
            className="mt-10 inline-flex items-center gap-2 text-xs font-mono text-neutral-600 hover:text-neutral-400 transition-colors"
          >
            <Search size={12} /> Press <kbd className="px-1.5 py-0.5 rounded border border-neutral-800 bg-neutral-900 text-neutral-500">⌘K</kbd> to navigate
          </button>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => scrollToId(SECTION_IDS.proof)}
              className="px-6 py-3 rounded-full bg-white text-black text-sm font-semibold hover:bg-neutral-200 transition-colors"
            >
              See the proof
            </button>
            <a
              href={DATA.profile.links.resume}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-full border border-neutral-700 text-white text-sm font-semibold hover:border-white/60 hover:bg-neutral-900 transition-colors inline-flex items-center gap-2"
            >
              <FileText size={16} /> Resume
            </a>
            <a
              href={DATA.profile.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-full border border-neutral-800 text-neutral-300 text-sm font-semibold hover:text-white hover:border-neutral-600 transition-colors inline-flex items-center gap-2"
            >
              <Github size={16} /> GitHub
            </a>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.button
          onClick={() => scrollToId(SECTION_IDS.about)}
          aria-label="Scroll to About"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-10 animate-bounce text-neutral-500 hover:text-white transition-colors"
        >
          <ChevronDown size={32} />
        </motion.button>
      </section>

      {/* 2. ABOUT ME SECTION */}
      <section id={SECTION_IDS.about} className="relative z-10 py-20 px-6 max-w-7xl mx-auto scroll-mt-16">
        <SectionEyebrow index="01" label="About" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* About Me Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2 bg-neutral-900/30 border border-neutral-800 rounded-3xl p-8 md:p-12 backdrop-blur-sm flex flex-col"
          >
            <p className="text-lg md:text-xl text-neutral-300 leading-relaxed font-light mb-6">
              {DATA.profile.about}
            </p>

            {/* Education */}
            <div className="mt-auto p-6 bg-neutral-900/50 rounded-2xl border border-neutral-800">
              <h4 className="text-sm font-mono text-brand-accent mb-3">EDUCATION</h4>
              <div className="space-y-2">
                <p className="text-white font-semibold">{DATA.profile.education.degree}</p>
                <p className="text-neutral-400 text-sm">{DATA.profile.education.institution}</p>
                <div className="flex gap-4 text-sm">
                  <span className="text-brand-accent font-mono">CGPA: {DATA.profile.education.cgpa}</span>
                  <span className="text-neutral-500">•</span>
                  <span className="text-neutral-400">{DATA.profile.education.year}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Achievements Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-neutral-900/30 border border-neutral-800 rounded-3xl p-8 backdrop-blur-sm"
          >
            <h3 className="text-xs font-mono text-brand-accent uppercase tracking-widest mb-6">Achievements</h3>
            <div className="space-y-4">
              {DATA.profile.achievements.map((achievement, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-accent mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-neutral-300 leading-relaxed">{achievement}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

      </section>

      {/* PROOF OF WORK */}
      <section id={SECTION_IDS.proof} className="relative z-10 py-20 px-6 max-w-7xl mx-auto scroll-mt-16">
        <SectionEyebrow index="02" label="Proof of Work" />
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-12">
          <h2 className="text-3xl font-bold text-white">The numbers behind the claims</h2>
          <p className="text-neutral-500 text-sm max-w-md md:text-right">
            Each figure is produced by a test or a benchmark in the linked repository, not an estimate.
          </p>
        </div>
        <ProofOfWork />
      </section>

      {/* FEATURED WORK (Bento Grid) */}
      <section id={SECTION_IDS.projects} className="relative z-10 py-20 px-6 max-w-7xl mx-auto scroll-mt-16">
        <div className="flex items-end justify-between mb-2 flex-wrap gap-2">
            <SectionEyebrow index="03" label="Projects & Research" />
            <span className="text-neutral-500 font-mono text-sm">12 VERIFIED, TEST-BACKED BUILDS</span>
        </div>
        <h2 className="text-3xl font-bold text-white mb-6">Projects &amp; Research</h2>

        <div className="flex flex-wrap gap-2 mb-10">
          {PROJECT_FILTERS.map((f) => {
            const count = f === "All" ? DATA.projects.length : DATA.projects.filter((pr) => pr.category === f).length;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                aria-pressed={filter === f}
                className={cn(
                  "px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider border transition-colors",
                  filter === f
                    ? "border-brand-accent/60 bg-brand-accent/15 text-brand-accent"
                    : "border-neutral-800 bg-neutral-900/50 text-neutral-500 hover:text-neutral-300 hover:border-neutral-700"
                )}
              >
                {f} <span className="text-neutral-600">{count}</span>
              </button>
            );
          })}
        </div>

        <motion.div layout className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {visibleProjects.map((project) => (
                <BentoCard
                    key={project.title}
                    title={project.title}
                    subtitle={project.subtitle}
                    desc={project.desc}
                    tags={project.tags}
                    icon={project.icon}
                    link={project.link}
                    large={project.large}
                />
            ))}
        </motion.div>
      </section>

      {/* COMPETITIONS */}
      <section id={SECTION_IDS.competitions} className="relative z-10 py-20 px-6 max-w-7xl mx-auto scroll-mt-16">
         <SectionEyebrow index="04" label="Competitions" />
         <h2 className="text-3xl font-bold text-white mb-12">Competitions</h2>
         <div className="grid grid-cols-1 gap-6">
            {DATA.competitions.map((c, i) => (
                <motion.div key={i} whileHover={{ y: -5 }}>
                  <SpotlightCard className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-accent/10 to-neutral-900/50 border border-brand-accent/30 p-8 md:p-10 hover:border-brand-accent/60 transition-colors duration-300">
                    <div className="relative z-10">
                      <div className="flex items-start gap-4 mb-4">
                          <div className="p-3 bg-brand-accent/20 rounded-2xl text-brand-accent">
                              {c.icon}
                          </div>
                          <div>
                              <h3 className="text-xl font-bold text-white leading-tight">{c.title}</h3>
                              <p className="text-xs font-mono text-brand-accent uppercase tracking-wider mt-1">{c.subtitle}</p>
                          </div>
                      </div>
                      <p className="text-neutral-400 text-sm leading-relaxed mb-4 max-w-3xl">{c.desc}</p>
                      <div className="flex flex-wrap gap-2 pt-4 border-t border-neutral-800/50">
                          {c.tags.map((tag, idx) => (
                              <span key={idx} className="text-[10px] font-mono text-brand-accent/70 border border-brand-accent/20 px-2 py-1 rounded bg-brand-accent/5">
                                  {tag}
                              </span>
                          ))}
                      </div>
                    </div>
                  </SpotlightCard>
                </motion.div>
            ))}
         </div>
      </section>

      {/* PUBLICATIONS & PATENTS */}
      <section id={SECTION_IDS.publications} className="relative z-10 py-20 px-6 max-w-7xl mx-auto scroll-mt-16">
         <SectionEyebrow index="05" label="Publications & Patents" />
         <h2 className="text-3xl font-bold text-white mb-12">Publications &amp; Patents</h2>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {DATA.publications.map((pub, i) => (
                <motion.a
                    key={`pub-${i}`}
                    href={pub.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ y: -5 }}
                    className="block"
                >
                  <SpotlightCard className="group relative overflow-hidden rounded-3xl bg-neutral-900/50 border border-neutral-800 p-8 hover:border-brand-accent/50 transition-colors duration-300 h-full">
                    <div className="relative z-10">
                      <div className="flex items-start gap-4 mb-4">
                          <div className="p-3 bg-neutral-800 rounded-2xl text-white">
                              <BookOpen size={24} />
                          </div>
                          <span className="text-xs font-mono text-neutral-400 bg-neutral-900 px-3 py-1 rounded-full border border-neutral-800">
                              {pub.status}
                          </span>
                          <ArrowUpRight className="ml-auto text-neutral-500 group-hover:text-white transition-colors flex-shrink-0" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3 leading-tight group-hover:text-brand-accent transition-colors">{pub.title}</h3>
                      <p className="text-neutral-400 text-sm leading-relaxed mb-4">{pub.desc}</p>
                      <div className="flex flex-wrap gap-2 pt-4 border-t border-neutral-800/50">
                          {pub.tags.map((tag, idx) => (
                              <span key={idx} className="text-[10px] font-mono text-neutral-500 border border-neutral-800 px-2 py-1 rounded bg-neutral-900">
                                  {tag}
                              </span>
                          ))}
                      </div>
                    </div>
                  </SpotlightCard>
                </motion.a>
            ))}
            {DATA.patents.map((patent, i) => (
                <motion.div key={`patent-${i}`} whileHover={{ y: -5 }}>
                  <SpotlightCard className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-accent/10 to-neutral-900/50 border border-brand-accent/30 p-8 hover:border-brand-accent/60 transition-colors duration-300 h-full">
                    <div className="relative z-10">
                      <div className="flex items-start gap-4 mb-4">
                          <div className="p-3 bg-brand-accent/20 rounded-2xl text-brand-accent">
                              <FileText size={24} />
                          </div>
                          <span className="text-xs font-mono text-brand-accent bg-brand-accent/10 px-3 py-1 rounded-full border border-brand-accent/30">
                              {patent.status}
                          </span>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3 leading-tight">{patent.title}</h3>
                      <p className="text-neutral-400 text-sm leading-relaxed mb-4">{patent.desc}</p>
                      <div className="flex flex-wrap gap-2 pt-4 border-t border-neutral-800/50">
                          {patent.tags.map((tag, idx) => (
                              <span key={idx} className="text-[10px] font-mono text-brand-accent/70 border border-brand-accent/20 px-2 py-1 rounded bg-brand-accent/5">
                                  {tag}
                              </span>
                          ))}
                      </div>
                    </div>
                  </SpotlightCard>
                </motion.div>
            ))}
         </div>
      </section>

      {/* EXPERIENCE (Timeline) */}
      <section id={SECTION_IDS.experience} className="relative z-10 py-20 px-6 max-w-7xl mx-auto mb-20 scroll-mt-16">
         <SectionEyebrow index="06" label="Experience" />
         <h2 className="text-3xl font-bold text-white mb-12">Experience</h2>
         <ExperienceTimeline />
      </section>

      {/* 5. GRAND FINALE (Contact) */}
      <section id={SECTION_IDS.contact} className="relative z-10 py-32 px-6 max-w-7xl mx-auto text-center scroll-mt-16">
        <div className="bg-gradient-to-b from-neutral-900/50 to-brand-dark border border-neutral-800 rounded-[3rem] p-12 md:p-24 relative overflow-hidden">

          {/* Decorative Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-accent/20 blur-[100px] rounded-full pointer-events-none" />

          <h2 className="text-4xl md:text-7xl font-bold text-white mb-8 relative z-10">
            Let&apos;s Build Something <br/> Verifiable.
          </h2>
          <p className="text-neutral-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 relative z-10">
            Graduating from IIT Madras in May 2027 and open to roles in quantitative research and trading, AI/ML research and engineering, and software development across backend and distributed systems. Every claim on this page is reproducible — clone any repository and run its test suite.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center relative z-10">
            <a
              href={DATA.profile.links.resume}
              target="_blank"
              rel="noopener noreferrer"
              className="px-10 py-5 bg-white text-black font-bold text-lg rounded-full hover:bg-neutral-200 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] flex items-center justify-center gap-3"
            >
              <FileText size={24}/> View Resume
            </a>
            <a
              href={`mailto:${DATA.profile.links.mail}`}
              className="px-10 py-5 bg-transparent border-2 border-neutral-700 text-white font-bold text-lg rounded-full hover:bg-neutral-800 hover:border-white/50 transition-all flex items-center justify-center gap-3"
            >
              <Mail size={24}/> Get in Touch
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 border-t border-neutral-900 bg-black relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-neutral-600 text-sm font-mono">
          <p>Architected & Built by Mohamed Zayaan S.</p>
          <div className="flex items-center gap-5">
            <a href={DATA.profile.links.github} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a>
            <a href={DATA.profile.links.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">LinkedIn</a>
            <a href={DATA.profile.links.codeforces} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Codeforces</a>
            <a href={DATA.profile.links.resume} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Resume</a>
            <a href={"mailto:" + DATA.profile.links.mail} className="hover:text-white transition-colors">Email</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
