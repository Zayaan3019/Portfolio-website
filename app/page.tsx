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
    about: "I am a pre-final year undergraduate at IIT Madras, pursuing B.Tech in Civil Engineering with a Minor in Computer Science. My work spans architecting and training AI/ML models, optimizing hardware, developing cutting-edge deep learning systems, and building scalable distributed inference engines. I am driven by the challenge of co-designing hardware and software to unlock the next generation of AI efficiency. With a strong foundation in algorithms, deep learning, and system design, I have applied my skills to research projects, internships, and entrepreneurial ventures. I am passionate about pushing the boundaries of what AI can do while ensuring it is efficient, scalable, and responsible.",
    education: {
      degree: "B.Tech in Civil Engineering (Major) + Minor in CS",
      institution: "Indian Institute of Technology, Madras",
      cgpa: "8.39/10",
      year: "2023-2027"
    },
    achievements: [
      "Solved 200+ DSA problems on Leetcode, GFG & Coding Ninjas",
      "JEE Mains: 99.21 percentile | JEE Advanced: Rank 5641",
      "100% in Mathematics and Science in Class X CBSE",
      "Google India Certified: Student Upskilling Launchpad"
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
      desc: "Architected core MCP server using stdio/SSE transports and GraphQL for modular agent orchestration. Engineered Pydantic-validated cost tooling to enable granular spend analysis via custom drill-downs. Fortified security with multi-auth (OAuth2/API Key) & async hash-chained audit logging for compliance.",
      tags: ["MCP", "GraphQL", "OAuth2", "Pydantic", "System Design"]
    },
    {
      company: "CeRAI, IIT Madras",
      role: "AI Research Intern",
      time: "July '25 - Dec '25",
      desc: "Architected novel bias classifiers to identify & mitigate harmful socio-cultural biases in Indian LLMs. Researched on model fairness & safety to advance Responsible and Ethical AI frameworks. Tailored model safety protocols to prevent stereotype propagation and ensure equitable AI behaviour.",
      tags: ["LLM Safety", "Responsible AI", "Model Fairness", "Bias Detection"]
    },
    {
      company: "AGC Lab, IIT Madras",
      role: "Deep Learning Research Intern",
      time: "Apr '25 - Sep '25",
      desc: "Built skeletal-prior attention models for robust 1D curve skeleton creation from 3D point clouds. Boosted pose estimation accuracy using a transformer-based hybrid algorithm for spectral denoising. Solved cross-source alignment for unstructured, low-overlap 3D point clouds with novel skeletal models.",
      tags: ["Geometric DL", "Transformers", "3D Vision", "Point Clouds"]
    },
    {
      company: "FinMitr",
      role: "Founding Engineer",
      time: "June '24 - Mar '25",
      desc: "Led AI/ML development of FinGuru AI financial advisor. Built with LLM for insights, ML for categorization, and custom algorithms for anomaly detection. Worked on business operations strategy, overseeing implementation of user-focused features.",
      tags: ["LLMs", "ML", "Anomaly Detection", "Business Strategy"]
    }
  ],
  patents: [
    {
      title: "Hybrid TD3-ACO based Swarm Robotic System for Intelligent Warehouse Automation",
      status: "Patent under review",
      desc: "Fused Twin-Delayed DDPG (TD3) & Ant Colony Optimization (ACO) to create a novel hybrid multi-agent RL algorithm. This innovation enables decentralized swarm robot coordination of mobile robots in dynamic, unstructured environments.",
      tags: ["Reinforcement Learning", "Swarm Robotics", "TD3", "ACO"]
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
            <span className="text-xs font-mono text-neutral-300">IIT Madras • CGPA 8.39/10 • Pre-final Year</span>
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
            <span className="text-neutral-500 font-mono text-sm hidden md:block">RESEARCH & ENGINEERING</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Research Paper */}
            <BentoCard 
                title="Cortex-Synth"
                subtitle="Accepted • Computing Conference '26"
                desc="Synthesized 3D-skeletons from point clouds with differentiable deep learning model, learning topological & geometric constraints. Boosted skeleton realism using hierarchical graph attention mechanism."
                tags={["Geometric DL", "PyTorch", "arXiv:2509.06705"]}
                icon={<Brain />}
                large={true}
                link="https://arxiv.org/abs/2509.06705"
            />
            
            {/* 2. Logos-R1 */}
            <BentoCard 
                title="Logos-R1"
                subtitle="System 2 Reasoning Model"
                desc="Developed reasoning model using GRPO (RLHF) to enforce self-correcting chain of thought. Engineered PRM to score steps, boosting GSM8K accuracy from 42% to 68%."
                tags={["PyTorch", "GRPO", "vLLM", "PRM"]}
                icon={<Brain />}
                link="https://github.com/Zayaan3019"
            />

            {/* 3. HyperServe */}
            <BentoCard 
                title="HyperServe"
                subtitle="Distributed Inference Engine"
                desc="Architected RL-driven orchestrator for heterogeneous request routing. Built Radix-Tree KV Caching with custom Triton kernels. Slashed P99 latency 3.7x and boosted throughput 2.4x."
                tags={["OpenAI Triton", "RL", "FastAPI"]}
                icon={<Cpu />}
                large={true}
                link="https://github.com/Zayaan3019/HyperServe"
            />

            {/* 4. FinGuru AI */}
            <BentoCard 
                title="FinGuru AI"
                subtitle="Agentic RAG Financial Advisor"
                desc="Architected agentic RAG system grounding LLMs in secure multi-tenant data. Deployed scalable Docker microservices on AWS (ECS/Lambda) with real-time alerts & Apollo integration."
                tags={["Agentic RAG", "AWS ECS", "LangGraph", "VectorDB"]}
                icon={<Layers />}
                link="https://github.com/Zayaan3019/FinMitr_demo"
            />

            {/* 5. Volt-Infer */}
            <BentoCard 
                title="Volt-Infer"
                subtitle="Decentralized MoE Runtime"
                desc="Built decentralized MoE inference runtime via asyncio/gRPC, routing tokens with <10ms latency. Built speculative prefetching & Prometheus autoscaling, boosting throughput by 3.5x."
                tags={["OpenAI", "Asyncio", "gRPC", "MoE"]}
                icon={<Network />}
                link="https://github.com/Zayaan3019"
            />

            {/* 6. AI Auditor */}
            <BentoCard 
                title="AI Auditor"
                subtitle="Contract Auditing System"
                desc="Developed multimodal RAG-powered contract auditing for clause extraction. Implemented drift detection using Langfuse logs. Built CI/CD pipeline for auto-redeploy based on drift scores."
                tags={["LangChain", "Milvus", "CI/CD", "RAG"]}
                icon={<Code2 />}
                link="https://github.com/Zayaan3019"
            />

            {/* 7. Neuro-Econometric Forecaster */}
            <BentoCard 
                title="Neuro-Econometric Forecaster"
                subtitle="Multi-modal Forecasting"
                desc="Architected multi-modal cross-attention network fusing economic indicators with textual sentiment. Built hybrid LSTM-ARDL encoder combining sequence modelling with equilibrium correction."
                tags={["TensorFlow", "LSTM", "Transformers", "NLP"]}
                icon={<Brain />}
                large={true}
                link="https://github.com/Zayaan3019"
            />

            {/* 8. AI-Video Captioning */}
            <BentoCard 
                title="AI-Video Captioning"
                subtitle="Multi-modal Fusion"
                desc="Developed multi-stage fusion architecture for temporal alignment. Leveraged BLIP for visual analysis and Flan-T5 to refine captions using contextual audio from Whisper."
                tags={["BLIP", "Flan-T5", "Whisper", "Transformers"]}
                icon={<Code2 />}
                link="https://github.com/Zayaan3019"
            />
        </div>
      </section>

      {/* PATENTS & PUBLICATIONS */}
      <section className="relative z-10 py-20 px-6 max-w-7xl mx-auto">
         <h2 className="text-3xl font-bold text-white mb-12">Patents & Publications</h2>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {DATA.patents.map((patent, i) => (
                <motion.div 
                    key={i}
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
