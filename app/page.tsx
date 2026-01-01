"use client";
import React from "react";
import { motion } from "framer-motion";
import { 
  Github, Linkedin, Mail, FileText, 
  Terminal, Cpu, Network, Brain, 
  ArrowUpRight, Code2, Layers, 
  ChevronDown,
  Spotlight
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// --- UTILS ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- COMPONENTS ---

// 1. The Bento Card (Apple/Linear Style)
const BentoCard = ({ 
  title, subtitle, desc, tags, icon, link, large 
}: { 
  title: string; subtitle: string; desc: string; tags: string[]; icon: React.ReactNode; link?: string; large?: boolean 
}) => (
  <motion.div 
    whileHover={{ y: -5 }}
    {...{ className: cn(
      "group relative overflow-hidden rounded-3xl bg-neutral-900/50 border border-neutral-800 p-8 hover:border-brand-accent/50 transition-all duration-300 flex flex-col",
      large ? "md:col-span-2" : "md:col-span-1"
    ) }}
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
    
    {link && <a href={link} target="_blank" className="absolute inset-0 z-10" />}
  </motion.div>
);

// --- DATA ---
const DATA = {
  profile: {
    name: "Mohamed Zayaan S",
    tagline: "Architecting the Next Generation of Efficient AI and Engineering Intelligence at Scale.",
    about: "I am a pre-final year undergraduate at IIT Madras with a deep focus on AI/ML, deep learning, and systems engineering. My work spans architecting compiler backends for AI hardware, developing AI/ML, deep learning models, and building scalable distributed AI systems. I am driven by the challenge of optimizing the interplay between algorithms and underlying architectures to unlock the next generation of AI efficiency.",
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
      time: "Dec '25 - Present",
      desc: "Architecting modular agent hosts. Built MCP servers & clients to unify data access via REST & GraphQL.",
      tags: ["System Design", "MCP", "GraphQL", "API" ]
    },
    {
      company: "CeRAI, IIT Madras",
      role: "AI Research Intern",
      time: "July '25 - Present",
      desc: "Architecting novel bias classifiers to identify & mitigate socio-cultural biases in Indian LLMs.",
      tags: ["LLM Safety", "Responsible AI", "NER", "Python"]
    },
    {
      company: "AGC Lab, IIT Madras",
      role: "Deep Learning Research Intern",
      time: "Apr '25 - Sep '25",
      desc: "Built skeletal-prior attention models for 1D curve skeleton creation from 3D point clouds.",
      tags: ["Geometric DL", "Transformers", "3D Vision"]
    },
    {
      company: "FinMitr",
      role: "Founding Engineer",
      time: "June '24 - Mar '25",
      desc: "Designed and implemented the core architecture for a fintech platform, enabling seamless financial planning and AI agent orchestration.",
      tags: ["Vector DBs", "LangGraph", "Fine-tuning", "React", "Node.js"]
    },
    {
      company: "SPIRE Lab, IISc Bangalore",
      role: "ML Research Intern",
      time: "Nov '24 - Jan '25",
      desc: "Developed novel ML models for time-series forecasting, improving prediction accuracy for medical datasets.",
      tags: ["Time-Series", "Fourier Transform", "TensorFlow", "Research"]
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
               <a href={DATA.profile.links.github} target="_blank" className="text-neutral-400 hover:text-white transition-colors"><Github size={20}/></a>
               <a href={DATA.profile.links.linkedin} target="_blank" className="text-neutral-400 hover:text-white transition-colors"><Linkedin size={20}/></a>
            </div>
        </div>
      </nav>

      {/* 1. HERO SECTION (Name + Tagline) */}
      <section className="relative z-10 min-h-screen flex flex-col justify-center items-center text-center px-4">
        <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl"
        >
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-800 bg-neutral-900/80 backdrop-blur-sm mb-10 mx-auto">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-accent"></span>
            </span>
            <span className="text-xs font-mono text-neutral-300">IIT Madras • Pre-final Year</span>
          </div>

          {/* THE NAME */}
          <h1 className="text-6xl md:text-9xl font-bold tracking-tighter text-white mb-8">
            {DATA.profile.name}
          </h1>

          {/* THE TAGLINE */}
          <h2 className="text-2xl md:text-4xl font-semibold leading-tight text-transparent bg-clip-text bg-gradient-to-b from-neutral-200 to-neutral-500 max-w-4xl mx-auto">
            Architecting the Next Generation of <span className="text-brand-accent">Efficient AI</span> and <br className="hidden md:block"/> Engineering <span className="text-brand-accent">Intelligence at Scale</span>.
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
      <section className="relative z-10 py-20 px-6 max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-neutral-900/30 border border-neutral-800 rounded-3xl p-8 md:p-12 backdrop-blur-sm text-center md:text-left"
        >
          <h3 className="text-xs font-mono text-brand-accent uppercase tracking-widest mb-4">About Me</h3>
          <p className="text-xl md:text-2xl text-neutral-300 leading-relaxed font-light">
            {DATA.profile.about}
          </p>
        </motion.div>
      </section>

      {/* FEATURED WORK (Bento Grid) */}
      <section className="relative z-10 py-20 px-6 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-12">
            <h2 className="text-3xl font-bold text-white">Some Project Works</h2>
            <span className="text-neutral-500 font-mono text-sm hidden md:block">RESEARCH & ENGINEERING</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Research Paper */}
            <BentoCard 
                title="Cortex-Synth"
                subtitle="Accepted • Computing Conference '26"
                desc="Differentiable Topology-Aware 3D Skeleton Synthesis. Engineered a model using hierarchical graph attention to synthesize 3D skeletons from point clouds."
                tags={["Geometric DL", "PyTorch", "Research"]}
                icon={<Brain />}
                large={true}
                link="https://arxiv.org/abs/2509.06705"
            />
            
            {/* 2. System Project */}
            <BentoCard 
                title="HyperServe"
                subtitle="Inference Engine"
                desc="High-performance inference engine. Slashed P99 latency by 3.7x using Radix-Tree KV Caching with custom Triton kernels."
                tags={["OpenAI Triton", "CUDA", "FastAPI"]}
                icon={<Cpu />}
                link="https://github.com/Zayaan3019/HyperServe"
            />

            {/* 3. Compiler Project */}
            <BentoCard 
                title="Chronos AI Compiler"
                subtitle="Systems Engineering"
                desc="Hardware-aware co-design engine. Auto-generates QAT-optimized models reducing latency >35% on heterogeneous hardware."
                tags={["C++", "OpenVINO", "Compilers"]}
                icon={<Terminal />}
                link="https://github.com/Zayaan3019/Chronos-AI_Compiler"
            />

            {/* 4. Agent Project */}
            <BentoCard 
                title="Finguru AI"
                subtitle="Agentic RAG Financial Advisor"
                desc="Architected an autonomous Agentic RAG system grounding LLMs in secure multi-tenant data. Deployed scalable Docker microservices on AWS(ECS/Lambda) with real-time alerts & Apollo integration."
                tags={["Agentic RAG", "AWS ECS", "LangGraph"]}
                icon={<Layers />}
                large={true}
                link="https://github.com/Zayaan3019/FinMitr_demo"
            />
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
                            {exp.desc}.
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
            Ready to Architect <br/> the Future?
          </h2>
          <p className="text-neutral-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 relative z-10">
            Let's build AI that is efficient, scalable, and intelligent.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center relative z-10">
            <a 
              href={DATA.profile.links.resume} 
              target="_blank" 
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
