"use client";
import React from "react";
import { motion } from "framer-motion";
import {
  Github, Linkedin, Mail, FileText,
  Cpu, Network, Brain,
  ArrowUpRight, Code2,
  ChevronDown, Trophy, BookOpen,
  Shield, Database, GitBranch, LineChart,
  Boxes, Workflow,
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

// 1. The Bento Card (Apple/Linear Style)
const BentoCard = ({
  title, subtitle, desc, tags, icon, link, large
}: {
  title: string; subtitle: string; desc: string; tags: string[]; icon: React.ReactNode; link?: string; large?: boolean
}) => (
  <motion.div
    whileHover={{ y: -5 }}
    className={cn(
      "group relative overflow-hidden rounded-3xl bg-neutral-900/50 border border-neutral-800 p-8 hover:border-brand-accent/50 transition-all duration-300 flex flex-col",
      large ? "md:col-span-2" : "md:col-span-1"
    )}
  >
    <div className="flex justify-between items-start mb-6">
      <div className="p-3 bg-neutral-800 rounded-2xl text-white group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      {link && <ArrowUpRight className="text-neutral-500 group-hover:text-white transition-colors" />}
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

    {link && <a href={link} target="_blank" rel="noopener noreferrer" aria-label={`Open ${title} on GitHub`} className="absolute inset-0 z-10" />}
  </motion.div>
);

// --- DATA ---
const DATA = {
  profile: {
    name: "Mohamed Zayaan S",
    tagline: "Engineering Verified, Production-Grade Systems Across AI, Backend, and Quantitative Finance.",
    about: "I'm a pre-final year undergraduate at IIT Madras, pursuing a B.Tech in Civil Engineering with a Minor in Computer Science. My work spans building deep learning architectures from first principles (GPT-style LMs, ViT/CLIP, spatiotemporal GNNs), hardening backend and distributed systems (row-level security, FUSE filesystems, native telemetry collectors), and researching AI evaluation and quant infrastructure. Every project on this page is backed by a real, passing test suite — I care as much about proving a claim as making it, whether that means a 5.96e-8 KV-cache deviation bound or an honest null result published instead of an inflated metric.",
    education: {
      degree: "B.Tech in Civil Engineering (Major) + Minor in CS",
      institution: "Indian Institute of Technology, Madras",
      cgpa: "8.39/10",
      year: "2023-2027"
    },
    achievements: [
      "Top 6 Finalist among 11,500 teams, American Express CodeStreet 2026",
      "Author, Cortex-Synth (arXiv:2509.06705) — 3D skeleton synthesis via hierarchical graph attention",
      "Solved 200+ DSA problems on LeetCode, GfG & Coding Ninjas",
      "JEE Mains: 99.21 percentile | JEE Advanced: Rank 5641"
    ],
    links: {
      resume: "https://drive.google.com/file/d/1aarBTHwfhVeHV14wBM_KzrPw_gpyjCZg/view?usp=sharing",
      github: "https://github.com/Zayaan3019",
      linkedin: "https://www.linkedin.com/in/mohamed-zayaan-s",
      mail: "ce23b092@smail.iitm.ac.in"
    }
  },
  experience: [
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
      desc: "Advanced to the Top 6 out of 11,500 teams with ZKD Concierge, an autonomous travel-disruption agent. Architected a two-layer system: a LangGraph planner operates with zero spend authority while a Temporal.io saga executes under an OPA policy gate. Encoded DGCA duty-of-care regulation as executable Rego policy, enforced by 25 automated compliance tests, and validated re-booking economics via a 250,000-case Monte Carlo simulation, byte-reproducible under a fixed seed.",
      tags: ["LangGraph", "Temporal.io", "OPA/Rego", "Next.js"],
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
      subtitle: "Real-Time Market Microstructure",
      desc: "Architected an 8-service market-making engine ingesting live Binance L2 order-book data through Redis Streams into a TimescaleDB-backed Avellaneda-Stoikov quoting strategy. Trained a DeepLOB CNN-Inception-LSTM with additive attention (146K params) that beat the majority-class baseline by 7.9 F1 points, optimized ONNX Runtime inference to a 4.04ms p99 — 2.8x faster than TorchScript — to meet a hard 5ms budget, and self-calibrated a VPIN toxicity gate that replaced a fixed threshold misfiring on 99.3% of ticks.",
      tags: ["DeepLOB", "ONNX Runtime", "Redis Streams", "TimescaleDB"],
      icon: <LineChart />,
      link: "https://github.com/Zayaan3019/AMME",
      large: true
    },
    {
      title: "SystemLens",
      subtitle: "Native Systems Telemetry",
      desc: "Replaced psutil with a native C telemetry collector parsing /proc and /sys through persistent file descriptors and zero-allocation pread sampling, cutting agent CPU overhead 41.3% at 10Hz — proven by a paired harness alternating backends across five repetitions. Designed a multi-tenant fleet schema on partitioned PostgreSQL enforcing isolation via row-level security, backed by 133 regression cases validated against real /proc and /sys captures.",
      tags: ["C", "FastAPI", "PostgreSQL RLS", "Prometheus"],
      icon: <Cpu />,
      link: "https://github.com/Zayaan3019/SystemLens"
    },
    {
      title: "FinGuru",
      subtitle: "Fintech Security & Account Aggregation",
      desc: "Eliminated an IDOR vulnerability by deriving every user identity from a verified JWT instead of a URL parameter, then enforced tenant isolation with PostgreSQL row-level security, Argon2id hashing, and rotating refresh-token families. Integrated a ReBIT-spec Account Aggregator client (Setu/Finvu/OneMoney) behind a fail-closed PII-redaction pipeline that tokenizes accounts, cards, and PAN/UPI IDs before anything reaches an LLM.",
      tags: ["FastAPI", "PostgreSQL RLS", "RBI Account Aggregator"],
      icon: <Shield />,
      link: "https://github.com/Zayaan3019/FinMitr_demo"
    },
    {
      title: "NanoLM",
      subtitle: "GPT-Style Language Model From Scratch",
      desc: "Built a GPT-style language model from first principles — BPE tokenizer, fused QKV projections, pre-norm transformer blocks, tied embeddings — with configs scaling to 345M parameters (GPT-2-medium), validated by parameter-count and shape-correctness tests. Proved KV-cache decoding is logit-identical to a full forward pass within 5.96e-8 max deviation, and enforced correct DDP semantics with loss-scaled gradient accumulation and no_sync bucketing.",
      tags: ["PyTorch", "DDP", "Flash Attention", "BPE"],
      icon: <Brain />,
      link: "https://github.com/Zayaan3019/NanoLM",
      large: true
    },
    {
      title: "NanoVision",
      subtitle: "ViT + CLIP From Scratch",
      desc: "Implemented ViT and CLIP entirely from scratch in pure PyTorch — patch embedding, pre-LN blocks, Flash Attention, DropPath — training a symmetric InfoNCE objective with a learnable temperature clamped at ln(100), matching the CLIP paper's own convention. Backed by 146 unit tests, 89% asserting closed-form numerics or gradients, reaching 83.7% ViT top-1 and 64.2% CLIP zero-shot top-1 on a contamination-free CIFAR-10 gallery.",
      tags: ["PyTorch", "ViT", "CLIP", "InfoNCE"],
      icon: <Boxes />,
      link: "https://github.com/Zayaan3019/NanoVision"
    },
    {
      title: "HydroGraph",
      subtitle: "Spatiotemporal Flood-Risk GNN",
      desc: "Architected a spatiotemporal GNN (GATv2 + GraphSAGE + GRU) over a directed drainage graph built from OSMnx waterway topology, physically reorienting 28 of 68 edges downhill by real elevation delta. Closed a train-fold normalization leak and built a persistence-baseline evaluation harness verified by 51 passing tests — then root-caused an early-stopping model collapse to a 99.7%-positive validation split and published the failure transparently in the project's own model card instead of reporting an inflated metric.",
      tags: ["GATv2", "GraphSAGE", "GRU", "OSMnx"],
      icon: <Network />,
      link: "https://github.com/Zayaan3019/HydroGraph",
      large: true
    },
    {
      title: "Arbitron",
      subtitle: "Autonomous Quant Research Agent",
      desc: "Built an LLM research agent running 13-factor walk-forward backtests with purged, embargoed cross-validation folds, computing Deflated Sharpe Ratio and Probability of Backtest Overfitting against a persisted trial count. Corrected IC significance for 21-day overlapping labels via Newey-West HAC — removing a 4.6x t-stat inflation — and gated regime detection on causal, forward-filtered HMM posteriors to eliminate look-ahead bias.",
      tags: ["FastAPI", "React", "Llama 3.3", "scikit-learn"],
      icon: <LineChart />,
      link: "https://github.com/Zayaan3019/Arbitron"
    },
    {
      title: "Chronicle",
      subtitle: "Multi-Agentic Financial Research Engine",
      desc: "Built a 7-stage multi-agent research pipeline over live SEC EDGAR and GDELT sources that denies unchecked LLM output, enforcing point-in-time correctness through pre-ranking filters on dense and sparse retrieval, proven over 200 trials. Added a numeric-claim verifier forcing correction on any unsupported figure, and ran a retrieval ablation across BM25, dense, and hybrid+cross-encoder to reach 0.90 recall@5 on 661 real SEC filing chunks.",
      tags: ["RAG", "SEC EDGAR", "Chroma", "BM25"],
      icon: <Database />,
      link: "https://github.com/Zayaan3019/Chronicle"
    },
    {
      title: "Neuro-Econometric Intelligence Engine",
      subtitle: "Hybrid Deep Learning + Econometrics",
      desc: "Fused a causal-masked Transformer-LSTM with ARDL/ARIMA econometric baselines via a learned gating network, proving the regime-detection mechanism genuinely causal by perturbation testing. Ran walk-forward evaluation across 1,394 predictions with zero train/test index overlap, and audited the pipeline end-to-end — catching a leakage bug and a placeholder statistic before reporting the corrected, honest null result.",
      tags: ["PyTorch", "statsmodels", "Transformer", "LSTM"],
      icon: <Workflow />,
      link: "https://github.com/Zayaan3019/Neuro-Econometric-Forecaster"
    },
    {
      title: "AI-Evals",
      subtitle: "LLM Observability & Judge Calibration",
      desc: "Built an OTel-native tracing SDK with bounded-queue export, redaction-before-egress, and sub-millisecond p50 overhead, backed by a 4-tier evaluator registry verified by double-execution. Calibrated LLM judges against human labels with Cohen's kappa, gated regressions with a 10,000-sample paired bootstrap, and caught and fixed a real superuser Postgres row-level-security bypass defect in the process.",
      tags: ["OpenTelemetry", "ClickHouse", "PostgreSQL", "React"],
      icon: <Code2 />,
      link: "https://github.com/Zayaan3019/AI-Evals",
      large: true
    },
    {
      title: "Distributed File Sync Engine",
      subtitle: "Peer-to-Peer FUSE Filesystem",
      desc: "Built a FUSE filesystem (pyfuse3) replicating peer edits transparently through Merkle-tree 4KB chunk delta transfer, layering vector-clock causality over a crash-recoverable SQLite catalog so conflicts surface as visible files. Secured peer sync with PSK-derived AES-256-GCM encryption and challenge-response mutual authentication, validating POSIX compliance at 4,111 of 8,798 pjdfstest cases.",
      tags: ["FUSE", "asyncio", "Merkle Trees", "AES-256-GCM"],
      icon: <GitBranch />,
      link: "https://github.com/Zayaan3019/Distributed_File_Sync"
    },
    {
      title: "Volt-Infer",
      subtitle: "Decentralized LLM Inference Runtime",
      desc: "Built an LLM inference server with paged KV caching, copy-on-write forks, and reference-counted page eviction, debugging a network header miscalculation and verifying request-keyed demultiplexing across 50 concurrent connections. Corrected an asymmetric INT8 quantization bug so CPU and GPU paths agree within 1% of FP16, guarding Triton kernel imports for CPU-only fallback behind a hysteresis-based autoscaler.",
      tags: ["PyTorch", "ONNX", "asyncio", "Triton"],
      icon: <Network />,
      link: "https://github.com/Zayaan3019/Volt-Infer"
    }
  ]
};

// --- MAIN PAGE ---
export default function Portfolio() {
  return (
    <main className="min-h-screen bg-brand-dark selection:bg-brand-accent/30 selection:text-white font-sans overflow-hidden">

      {/* BACKGROUND ELEMENTS */}
      <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#40404012_1px,transparent_1px),linear-gradient(to_bottom,#40404012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md border-b border-white/5 bg-brand-dark/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <span className="font-bold text-xl tracking-tight text-white">Zayaan<span className="text-brand-accent">.</span></span>
            <div className="flex gap-4">
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
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-800 bg-neutral-900/80 backdrop-blur-sm mb-6 mx-auto">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-accent"></span>
            </span>
            <span className="text-xs font-mono text-neutral-300">IIT Madras • CGPA 8.39/10 • Pre-final Year</span>
          </div>

          {/* Competition Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-accent/30 bg-brand-accent/10 backdrop-blur-sm mb-10 mx-auto ml-2">
            <Trophy size={12} className="text-brand-accent" />
            <span className="text-xs font-mono text-brand-accent">Top 6 / 11,500 Teams • Amex CodeStreet 2026</span>
          </div>

          {/* THE NAME */}
          <h1 className="text-6xl md:text-9xl font-bold tracking-tighter text-white mb-8">
            {DATA.profile.name}
          </h1>

          {/* THE TAGLINE */}
          <h2 className="text-2xl md:text-4xl font-semibold leading-tight text-transparent bg-clip-text bg-gradient-to-b from-neutral-200 to-neutral-500 max-w-4xl mx-auto">
            Engineering Verified, Production-Grade Systems Across <span className="text-brand-accent">AI</span>, <br className="hidden md:block"/> Backend, and <span className="text-brand-accent">Quantitative Finance</span>.
          </h2>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-10 animate-bounce text-neutral-500"
        >
          <ChevronDown size={32} />
        </motion.div>
      </section>

      {/* 2. ABOUT ME SECTION */}
      <section className="relative z-10 py-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* About Me Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2 bg-neutral-900/30 border border-neutral-800 rounded-3xl p-8 md:p-12 backdrop-blur-sm"
          >
            <h3 className="text-xs font-mono text-brand-accent uppercase tracking-widest mb-4">About Me</h3>
            <p className="text-lg md:text-xl text-neutral-300 leading-relaxed font-light mb-6">
              {DATA.profile.about}
            </p>

            {/* Education */}
            <div className="mt-8 p-6 bg-neutral-900/50 rounded-2xl border border-neutral-800">
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

      {/* FEATURED WORK (Bento Grid) */}
      <section className="relative z-10 py-20 px-6 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-12">
            <h2 className="text-3xl font-bold text-white">Projects & Research</h2>
            <span className="text-neutral-500 font-mono text-sm hidden md:block">12 VERIFIED, TEST-BACKED BUILDS</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {DATA.projects.map((project, i) => (
                <BentoCard
                    key={i}
                    title={project.title}
                    subtitle={project.subtitle}
                    desc={project.desc}
                    tags={project.tags}
                    icon={project.icon}
                    link={project.link}
                    large={project.large}
                />
            ))}
        </div>
      </section>

      {/* COMPETITIONS */}
      <section className="relative z-10 py-20 px-6 max-w-7xl mx-auto">
         <h2 className="text-3xl font-bold text-white mb-12">Competitions</h2>
         <div className="grid grid-cols-1 gap-6">
            {DATA.competitions.map((c, i) => (
                <motion.div
                    key={i}
                    whileHover={{ y: -5 }}
                    className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-accent/10 to-neutral-900/50 border border-brand-accent/30 p-8 md:p-10 hover:border-brand-accent/60 transition-all duration-300"
                >
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
                </motion.div>
            ))}
         </div>
      </section>

      {/* PUBLICATIONS & PATENTS */}
      <section className="relative z-10 py-20 px-6 max-w-7xl mx-auto">
         <h2 className="text-3xl font-bold text-white mb-12">Publications & Patents</h2>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {DATA.publications.map((pub, i) => (
                <motion.a
                    key={`pub-${i}`}
                    href={pub.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ y: -5 }}
                    className="group relative overflow-hidden rounded-3xl bg-neutral-900/50 border border-neutral-800 p-8 hover:border-brand-accent/50 transition-all duration-300"
                >
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
                </motion.a>
            ))}
            {DATA.patents.map((patent, i) => (
                <motion.div
                    key={`patent-${i}`}
                    whileHover={{ y: -5 }}
                    className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-accent/10 to-neutral-900/50 border border-brand-accent/30 p-8 hover:border-brand-accent/60 transition-all duration-300"
                >
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
                </motion.div>
            ))}
         </div>
      </section>

      {/* EXPERIENCE (Timeline) */}
      <section className="relative z-10 py-20 px-6 max-w-7xl mx-auto mb-20">
         <h2 className="text-3xl font-bold text-white mb-12">Experience</h2>
         <div className="space-y-8 max-w-3xl">
            {DATA.experience.map((exp, i) => (
                <div key={i} className="flex gap-4 md:gap-8 group">
                    <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-neutral-800 border border-neutral-700 group-hover:bg-brand-accent group-hover:border-brand-accent transition-colors"></div>
                        <div className="w-[1px] flex-1 bg-neutral-800 my-2"></div>
                    </div>
                    <div className="pb-12">
                        <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-xl font-bold text-white">{exp.company}</h3>
                            <span className="text-xs font-mono text-neutral-500 bg-neutral-900 px-2 py-1 rounded">{exp.time}</span>
                        </div>
                        <p className="text-brand-accent font-medium text-sm mb-3">{exp.role}</p>
                        <p className="text-neutral-400 leading-relaxed mb-3">
                            {exp.desc}
                        </p>
                        <div className="flex gap-2">
                            {exp.tags.map((t, idx) => (
                                <span key={idx} className="text-xs text-neutral-500 font-mono">#{t}</span>
                            ))}
                        </div>
                    </div>
                </div>
            ))}
         </div>
      </section>
      {/* 5. GRAND FINALE (Contact) */}
      <section className="relative z-10 py-32 px-6 max-w-7xl mx-auto text-center">
        <div className="bg-gradient-to-b from-neutral-900/50 to-brand-dark border border-neutral-800 rounded-[3rem] p-12 md:p-24 relative overflow-hidden">

          {/* Decorative Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-accent/20 blur-[100px] rounded-full pointer-events-none" />

          <h2 className="text-4xl md:text-7xl font-bold text-white mb-8 relative z-10">
            Let&apos;s Build Something <br/> Verifiable.
          </h2>
          <p className="text-neutral-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 relative z-10">
            Open to SDE, ML, and Quant roles — reach out to talk shop or collaborate.
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
      <footer className="py-8 border-t border-neutral-900 bg-black text-center text-neutral-600 text-sm font-mono relative z-10">
        <p>Architected & Built by Mohamed Zayaan S.</p>
      </footer>
    </main>
  );
}
