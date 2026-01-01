"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Github, Linkedin, Mail, FileText, ChevronDown, 
  ExternalLink, Code2, Brain, Database, Cpu, Layers, Terminal 
} from "lucide-react";

// --- DATA SECTION ---
// All data is synthesized from your provided resumes to ensure accuracy and maximum impact.

const PROFILE = {
  name: "Mohamed Zayaan S",
  title: "AI Researcher & Systems Engineer",
  tagline: "Bridging the gap between High-Performance Computing and Geometric Deep Learning.",
  about: "I am a pre-final year undergraduate at IIT Madras specializing in Civil Engineering with a deep focus on AI/ML. My work spans architecting compiler backends for AI hardware, developing differentiable geometric deep learning models, and building scalable distributed systems. I am driven by the challenge of co-designing hardware and software to unlock the next generation of AI efficiency.",
  email: "ce23b092@smail.iitm.ac.in",
  links: {
    github: "https://github.com/Zayaan3019",
    linkedin: "https://www.linkedin.com/in/mohamed-zayaan-s",
    resume: "/resume.pdf" // Ensure you put your PDF in the public folder
  }
};

const EXPERIENCE = [
  {
    company: "Mavvrik",
    role: "Software Development Intern",
    period: "Dec 2025 - Present",
    description: "Architecting modular agent hosts and cost-observability middleware.",
    achievements: [
      "Architected MCP servers & clients to unify data access via REST & GraphQL.",
      "Engineered middleware for high-scale granular LLM & Vector DB cost observability."
    ]
  },
  {
    company: "Centre for Responsible AI (CeRAI), IIT Madras",
    role: "Research Intern",
    period: "July 2025 - Present",
    description: "Focusing on Model Fairness and Safety protocols for Indian LLMs.",
    achievements: [
      "Architecting novel bias classifiers to mitigate socio-cultural biases.",
      "Developing safety protocols to prevent stereotype propagation in LLMs."
    ]
  },
  {
    company: "AGC Lab, IIT Madras",
    role: "Research Intern",
    period: "April 2025 - Sep 2025",
    description: "Specialized in Computer Vision and Geometric Deep Learning.",
    achievements: [
      "Built skeletal-prior attention models for 1D curve skeleton creation from 3D point clouds.",
      "Solved cross-source alignment for unstructured, low-overlap 3D point clouds."
    ]
  },
  {
    company: "FinMitr",
    role: "Founding Engineer",
    period: "June 2024 - Mar 2025",
    description: "Led the AI/ML development of FinGuru, a personalized financial advisor.",
    achievements: [
      "Built FinGuru with LLM agents for insights and custom anomaly detection algorithms.",
      "Slashed ML model complexity by 40% via advanced audio preprocessing."
    ]
  }
];

const RESEARCH = [
  {
    title: "Cortex-Synth: Differentiable Topology-Aware 3D Skeleton Synthesis",
    conf: "Accepted to 14th Computing Conference, 2026",
    area: "Geometric Deep Learning",
    desc: "Synthesized 3D-skeletons from point clouds with a differentiable model learning topological constraints using Hierarchical Graph Attention.",
    link: "https://arxiv.org/abs/2509.06705"
  },
  {
    title: "Causal-Symbolic Meta-Learning (CSML)",
    conf: "Submitted to 14th Computing Conference, 2026",
    area: "Causal AI & Meta-Learning",
    desc: "Built a framework to induce causal world models for few-shot generalization, outperforming MAML and ProtoNets benchmarks.",
    link: "https://arxiv.org/abs/2509.12387"
  },
  {
    title: "Hybrid TD3-ACO Swarm Robotic System",
    conf: "Patent Under Review",
    area: "Reinforcement Learning",
    desc: "Fused Twin-Delayed DDPG & Ant Colony Optimization for decentralized swarm robot coordination in unstructured environments.",
    link: "#"
  }
];

const PROJECTS = [
  {
    title: "HyperServe",
    tags: ["OpenAI Triton", "RL", "FastAPI", "Systems"],
    desc: "High-performance inference engine. Built Radix-Tree KV Caching with custom Triton kernels for O(1) prefix reuse, slashing P99 latency by 3.7x.",
    icon: <Cpu className="w-6 h-6" />
  },
  {
    title: "Chronos AI Compiler",
    tags: ["OpenVINO", "C++", "Compilers"],
    desc: "Hardware-aware co-design engine. Auto-generates QAT-optimized models and reduces latency >35% via dynamic scheduling on heterogeneous hardware.",
    icon: <Terminal className="w-6 h-6" />
  },
  {
    title: "Nexus GUI Agent",
    tags: ["Ollama", "Pydantic", "Computer Vision"],
    desc: "Autonomous multimodal GUI agent using a See-Think-Act loop. Implements a robust cognition engine with async API calls for real-time control.",
    icon: <Layers className="w-6 h-6" />
  },
  {
    title: "CodeCollab",
    tags: ["React", "Yjs", "Docker", "WebSockets"],
    desc: "Real-time collaborative code editor using CRDTs (Yjs) for conflict-free editing, deployed on AWS EC2 with Docker.",
    icon: <Code2 className="w-6 h-6" />
  }
];

const SKILLS = {
  Languages: ["Python", "C", "C++", "SQL", "TypeScript"],
  "AI & ML": ["PyTorch", "TensorFlow", "OpenVINO", "LangChain", "Triton", "Transformers", "RAG"],
  "Systems & Web": ["Docker", "AWS (EC2/ECS)", "React", "GraphQL", "MongoDB", "PostgreSQL"],
  "Research Areas": ["Geometric DL", "Causal Inference", "Computer Vision", "Explainable AI"]
};

// --- COMPONENTS ---

const SectionHeading = ({ children }: { children: React.ReactNode }) => (
  <motion.h2 
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    className="text-3xl md:text-4xl font-bold mb-10 text-text flex items-center gap-3"
  >
    <span className="w-2 h-8 bg-accent rounded-full"></span>
    {children}
  </motion.h2>
);

const Card = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className={`bg-secondary/50 backdrop-blur-sm border border-slate-700 p-6 rounded-xl hover:border-accent/50 transition-colors ${className}`}
  >
    {children}
  </motion.div>
);

// --- MAIN PAGE ---

export default function Portfolio() {
  const [activeTab, setActiveTab] = useState("Languages");

  return (
    <main className="min-h-screen bg-primary text-text font-sans selection:bg-accent/30">
      
      {/* BACKGROUND ELEMENTS */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-highlight/10 rounded-full blur-3xl"></div>
      </div>

      {/* HERO SECTION */}
      <section className="relative z-10 min-h-screen flex flex-col justify-center items-start px-6 md:px-20 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-accent font-mono text-lg mb-4 block">Hi, I am</span>
          <h1 className="text-6xl md:text-8xl font-bold mb-6 tracking-tight">
            {PROFILE.name}
          </h1>
          <h2 className="text-3xl md:text-5xl font-bold text-muted mb-8">
            {PROFILE.title}
          </h2>
          <p className="max-w-2xl text-lg text-slate-400 leading-relaxed mb-10">
            {PROFILE.tagline} {PROFILE.about}
          </p>
          
          <div className="flex gap-4">
            <a href={PROFILE.links.resume} target="_blank" rel="noopener noreferrer" className="px-8 py-3 bg-accent/10 text-accent border border-accent rounded-lg hover:bg-accent hover:text-primary transition-all font-medium">
              View Resume
            </a>
            <a href={PROFILE.links.github} target="_blank" rel="noopener noreferrer" className="p-3 text-slate-400 hover:text-white transition-colors">
              <Github size={24} />
            </a>
            <a href={PROFILE.links.linkedin} target="_blank" rel="noopener noreferrer" className="p-3 text-slate-400 hover:text-white transition-colors">
              <Linkedin size={24} />
            </a>
            <a href={`mailto:${PROFILE.email}`} className="p-3 text-slate-400 hover:text-white transition-colors">
              <Mail size={24} />
            </a>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-slate-500 animate-bounce"
        >
          <ChevronDown size={32} />
        </motion.div>
      </section>

      {/* EXPERIENCE SECTION */}
      <section className="relative z-10 py-20 px-6 md:px-20 max-w-7xl mx-auto">
        <SectionHeading>Experience</SectionHeading>
        <div className="space-y-12 border-l-2 border-slate-800 ml-3 pl-8 md:pl-12">
          {EXPERIENCE.map((exp, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="relative"
            >
              <span className="absolute -left-[41px] md:-left-[57px] top-2 w-5 h-5 rounded-full bg-accent border-4 border-primary"></span>
              <h3 className="text-2xl font-bold text-white">{exp.role}</h3>
              <div className="flex flex-col md:flex-row md:items-center gap-2 mb-4">
                <span className="text-highlight font-medium text-lg">{exp.company}</span>
                <span className="hidden md:inline text-slate-600">•</span>
                <span className="text-slate-500 font-mono text-sm">{exp.period}</span>
              </div>
              <p className="text-slate-300 mb-4 italic">{exp.description}</p>
              <ul className="list-disc list-inside space-y-2 text-slate-400">
                {exp.achievements.map((ach, i) => (
                  <li key={i}>{ach}</li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      {/* RESEARCH SECTION */}
      <section className="relative z-10 py-20 px-6 md:px-20 max-w-7xl mx-auto">
        <SectionHeading>Research & Publications</SectionHeading>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {RESEARCH.map((res, idx) => (
            <Card key={idx} className="flex flex-col h-full">
              <div className="mb-4 text-accent">
                <Brain size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-accent transition-colors">
                {res.title}
              </h3>
              <p className="text-sm font-mono text-highlight mb-4">{res.conf}</p>
              <p className="text-slate-400 text-sm mb-6 flex-grow">
                {res.desc}
              </p>
              <a href={res.link} target="_blank" className="flex items-center gap-2 text-sm text-accent hover:underline mt-auto">
                Read Paper <ExternalLink size={14} />
              </a>
            </Card>
          ))}
        </div>
      </section>

      {/* PROJECTS SECTION */}
      <section className="relative z-10 py-20 px-6 md:px-20 max-w-7xl mx-auto">
        <SectionHeading>Featured Projects</SectionHeading>
        <div className="grid md:grid-cols-2 gap-8">
          {PROJECTS.map((project, idx) => (
            <Card key={idx}>
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-slate-800 rounded-lg text-accent">
                  {project.icon}
                </div>
                <div className="flex gap-2">
                  <a href={PROFILE.links.github} className="text-slate-400 hover:text-white">
                    <Github size={20} />
                  </a>
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-3">{project.title}</h3>
              <p className="text-slate-400 mb-6 leading-relaxed">
                {project.desc}
              </p>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag, i) => (
                  <span key={i} className="px-3 py-1 bg-slate-800 text-xs font-mono text-accent rounded-full border border-slate-700">
                    {tag}
                  </span>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* SKILLS SECTION */}
      <section className="relative z-10 py-20 px-6 md:px-20 max-w-7xl mx-auto mb-20">
        <SectionHeading>Technical Arsenal</SectionHeading>
        <div className="bg-secondary/30 rounded-2xl p-2 md:p-8 border border-slate-800">
          <div className="flex flex-wrap gap-4 mb-8 justify-center border-b border-slate-700 pb-4">
            {Object.keys(SKILLS).map((key) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === key 
                  ? "bg-accent text-primary shadow-[0_0_15px_rgba(56,189,248,0.3)]" 
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                {key}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-4 justify-center min-h-[100px] content-start">
            <AnimatePresence mode="wait">
              {SKILLS[activeTab as keyof typeof SKILLS].map((skill, i) => (
                <motion.div
                  key={skill}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.05 }}
                  className="px-6 py-3 bg-primary border border-slate-700 rounded-lg text-slate-300 font-mono text-sm shadow-sm hover:border-accent/50 hover:shadow-[0_0_10px_rgba(56,189,248,0.1)] transition-all cursor-default"
                >
                  {skill}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 text-center text-slate-600 text-sm relative z-10 border-t border-slate-800">
        <p>Built with Next.js, Tailwind & Framer Motion by {PROFILE.name}.</p>
      </footer>
    </main>
  );
}