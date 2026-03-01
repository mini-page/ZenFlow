import React from 'react';
import { Leaf, Info, User, Layers, Library, Keyboard, Box, Tablet, Headphones, Coffee, FileText, Share2, ArrowUpRight, Terminal, Twitter, Github, Play, Code, Cpu } from 'lucide-react';
import * as Icons from 'lucide-react';
import SharedHeader from './SharedHeader';

export default function CreatorStudio({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col h-full w-full bg-background-light text-slate-900 transition-colors duration-300 relative overflow-hidden font-sans selection:bg-primary selection:text-black">
      
      <SharedHeader 
        title="Studio" 
        onBack={onBack} 
        icon={Cpu} 
        iconColor="text-primary"
        actions={
          <button className="hidden sm:flex items-center justify-center h-10 px-6 rounded-full bg-primary hover:bg-primary/90 text-background-dark text-sm font-bold transition-all transform hover:scale-105 shadow-[0_0_15px_rgba(19,236,19,0.3)]">
            Get Extension
          </button>
        }
      />

      <main className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="w-full max-w-[1400px] mx-auto px-6 py-8 lg:px-12 lg:py-16">
          
          {/* Hero Section */}
          <div className="mb-20 flex flex-col items-start gap-8 max-w-5xl animate-in fade-in slide-in-from-top-4 duration-1000">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-slate/10 dark:bg-accent-slate text-xs font-mono tracking-wider uppercase text-primary border border-primary/20">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              Integrated Creator Studio v3.0
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none text-slate-900 drop-shadow-sm">
              The Architect <br/><span className="text-primary italic">Behind the Flow.</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 max-w-3xl leading-relaxed">
              Exploring the intersection of human psychology and digital spatial design. This studio tracks the development of Zen Flow—from raw data to mindful environments.
            </p>
          </div>

          {/* Section 01: Creator's Desk */}
          <section className="mb-24">
            <div className="flex items-baseline gap-4 mb-10 border-b border-primary/20 pb-4">
              <h2 className="text-3xl font-black uppercase tracking-tighter font-mono text-slate-900">Creator's Desk</h2>
              <span className="text-primary font-mono text-sm">[01: Personal_Stack]</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Profile Card */}
              <div className="lg:col-span-2 relative overflow-hidden rounded-[2rem] bg-slate-100 p-8 md:p-10 border border-slate-200 group">
                <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
                  <div className="w-32 h-32 rounded-full bg-primary/20 border-4 border-primary/40 flex items-center justify-center flex-shrink-0 shadow-inner">
                    <User size={64} className="text-primary" />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-sm font-mono font-extrabold text-primary uppercase tracking-widest">Lead Architect / Founder</h3>
                    <p className="text-2xl md:text-3xl font-bold leading-tight text-slate-900">Designing systems that prioritize your attention over your screen-time.</p>
                    <div className="flex flex-wrap gap-2 pt-2">
                      <span className="px-3 py-1 rounded-full bg-white/50 border border-slate-300 text-[10px] font-mono uppercase tracking-tighter font-bold">Product Strategy</span>
                      <span className="px-3 py-1 rounded-full bg-white/50 border border-slate-300 text-[10px] font-mono uppercase tracking-tighter font-bold">Spatial Design</span>
                      <span className="px-3 py-1 rounded-full bg-white/50 border border-slate-300 text-[10px] font-mono uppercase tracking-tighter font-bold">Ethical AI</span>
                    </div>
                  </div>
                </div>
                <div className="absolute -right-20 -bottom-20 opacity-5 pointer-events-none transition-transform duration-1000 group-hover:scale-110 group-hover:rotate-6">
                  <Layers size={400} />
                </div>
              </div>

              {/* Current Focus */}
              <div className="rounded-[2rem] bg-slate-900 p-8 border border-white/10 flex flex-col justify-between group">
                <div>
                  <h4 className="text-xs font-mono font-extrabold text-primary uppercase tracking-widest mb-8">Current Focus</h4>
                  <div className="space-y-8">
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Library size={20} />
                      </div>
                      <div>
                        <p className="font-mono text-sm font-bold text-white uppercase leading-none">Cognitive Science</p>
                        <p className="text-xs text-slate-500 mt-2 leading-relaxed">Researching neuroplasticity & digital habits.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Keyboard size={20} />
                      </div>
                      <div>
                        <p className="font-mono text-sm font-bold text-white uppercase leading-none">Creative Coding</p>
                        <p className="text-xs text-slate-500 mt-2 leading-relaxed">Building generative gardens with React & Motion.</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-8 border-t border-white/5 pt-4">
                  <span className="text-[10px] font-mono text-slate-600 uppercase">Last Sync: 24 min ago</span>
                </div>
              </div>

              {/* The Toolkit */}
              <div className="rounded-[2rem] border-2 border-dashed border-slate-200 p-8 flex flex-col items-center justify-center text-center gap-4 hover:bg-white transition-colors duration-500">
                <Box size={48} className="text-slate-400 mb-2" />
                <h4 className="text-sm font-mono font-extrabold text-slate-900 uppercase tracking-widest">The Toolkit</h4>
                <p className="text-sm text-slate-500 italic px-4">Minimalist hardware. Maximum intention.</p>
                <div className="grid grid-cols-4 gap-6 mt-4">
                  <Tablet size={20} className="text-slate-400 hover:text-primary cursor-help transition-colors" />
                  <Headphones size={20} className="text-slate-400 hover:text-primary cursor-help transition-colors" />
                  <Coffee size={20} className="text-slate-400 hover:text-primary cursor-help transition-colors" />
                  <FileText size={20} className="text-slate-400 hover:text-primary cursor-help transition-colors" />
                </div>
              </div>

              {/* Philosophy Card */}
              <div className="lg:col-span-2 rounded-[2rem] overflow-hidden bg-slate-900 relative group min-h-[300px]">
                <img 
                  alt="Abstract digital landscape" 
                  className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay group-hover:scale-105 transition-transform duration-1000" 
                  src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80" 
                />
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900/80 to-transparent"></div>
                <div className="relative z-10 p-10 h-full flex flex-col justify-end">
                  <h4 className="text-xs font-mono font-extrabold text-primary uppercase tracking-widest mb-4">Philosophy</h4>
                  <p className="text-3xl md:text-4xl font-light text-white leading-tight max-w-2xl">
                    "A quiet interface is a <span className="font-bold text-primary">respectful</span> interface."
                  </p>
                  <p className="mt-6 font-mono text-xs text-slate-500 tracking-widest">MANIFESTO ARCHIVE /// 004</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 02: Studio Flux */}
          <section className="mb-24">
            <div className="flex items-baseline gap-4 mb-10 border-b border-primary/20 pb-4">
              <h2 className="text-3xl font-black uppercase tracking-tighter font-mono text-slate-900">Studio Flux</h2>
              <span className="text-primary font-mono text-sm">[02: Active_Builds]</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Featured Build */}
              <div className="lg:col-span-2 row-span-2 relative group overflow-hidden rounded-[2rem] bg-black aspect-video lg:aspect-auto min-h-[400px]">
                <img 
                  alt="Digital garden growth" 
                  className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:scale-110 transition-transform duration-1000" 
                  src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80" 
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="size-20 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform cursor-pointer">
                    <Play size={32} className="text-white fill-current" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full bg-gradient-to-t from-black via-black/60 to-transparent">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="font-mono text-[10px] font-black bg-primary text-black px-2 py-0.5 rounded uppercase">Experimental</span>
                    <span className="font-mono text-xs text-white/60 tracking-widest">BUILD_092</span>
                  </div>
                  <h3 className="text-3xl md:text-4xl font-black text-white uppercase font-mono tracking-tighter">Garden Render Engine</h3>
                  <p className="text-slate-300 mt-3 max-w-md text-sm leading-relaxed">Real-time biophilic visualizer that reacts to your keyboard velocity and focus patterns.</p>
                </div>
              </div>

              {/* Social Link */}
              <a href="#" className="group bg-slate-100 rounded-[2rem] p-8 border border-slate-200 flex flex-col justify-between hover:bg-white transition-all duration-500 shadow-sm hover:shadow-md">
                <div className="flex justify-between items-start">
                  <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                    <Share2 size={28} />
                  </div>
                  <ArrowUpRight size={20} className="text-slate-400 group-hover:text-primary transition-colors" />
                </div>
                <div>
                  <h4 className="text-xs font-mono font-extrabold text-slate-500 uppercase tracking-widest mb-2">Network</h4>
                  <h3 className="text-2xl font-black text-slate-900 font-mono tracking-tighter uppercase">@ZenFlowApp</h3>
                  <p className="text-sm text-slate-500 mt-2">Broadcasting insights on cognitive ergonomics and focus states.</p>
                </div>
              </a>

              {/* Source Link */}
              <a href="#" className="group bg-slate-900 rounded-[2rem] p-8 border border-white/5 flex flex-col justify-between hover:border-primary/40 transition-all duration-500 shadow-xl">
                <div className="flex justify-between items-start">
                  <div className="p-3 rounded-2xl bg-white/5 text-primary">
                    <Terminal size={28} />
                  </div>
                  <div className="flex gap-1.5 pt-2">
                    <span className="size-2 rounded-full bg-emerald-500"></span>
                    <span className="size-2 rounded-full bg-amber-500"></span>
                    <span className="size-2 rounded-full bg-rose-500"></span>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-mono font-extrabold text-slate-500 uppercase tracking-widest mb-2">The Engine</h4>
                  <h3 className="text-2xl font-black text-white font-mono tracking-tighter uppercase">Source Vault</h3>
                  <p className="text-sm text-slate-400 mt-2">Open-source primitives for the calmer web.</p>
                </div>
              </a>

              {/* Support Row */}
              <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div className="md:col-span-2 bg-primary/5 border border-primary/20 rounded-[2.5rem] p-8 md:p-12 flex flex-col md:flex-row items-center gap-10">
                  <div className="flex-1">
                    <h4 className="text-xs font-mono font-extrabold text-primary uppercase tracking-widest mb-4">Support The Studio</h4>
                    <h3 className="text-3xl md:text-4xl font-black text-slate-900 uppercase font-mono tracking-tighter leading-none mb-4">Fund Independent Design</h3>
                    <p className="text-slate-600 text-sm md:text-base leading-relaxed">No ads. No data mining. Just pure focus tools built for humans. Your support keeps the development cycle circular and sustainable.</p>
                  </div>
                  <div className="flex flex-col gap-3 w-full md:w-auto shrink-0">
                    <button className="px-8 py-4 bg-slate-900 text-white font-mono font-black uppercase text-sm rounded-2xl hover:translate-y-[-2px] active:translate-y-0 transition-transform shadow-xl">Join Patronage</button>
                    <button className="px-8 py-4 bg-transparent border-2 border-slate-900 text-slate-900 font-mono font-black uppercase text-sm rounded-2xl hover:bg-slate-900/5 transition-colors">One-time Tip</button>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center shadow-sm">
                  <span className="text-5xl md:text-6xl font-black text-slate-900 font-mono tracking-tighter">12.8K</span>
                  <p className="text-[10px] font-mono font-extrabold text-primary uppercase tracking-[0.3em] mt-3">Active Nodes</p>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full mt-8 overflow-hidden">
                    <div className="h-full w-[85%] bg-primary shadow-[0_0_10px_rgba(19,236,19,0.5)] animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Studio Footer */}
          <footer className="mt-32 pt-12 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-8 pb-12">
            <div className="flex items-center gap-4 group cursor-default">
              <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                <Leaf size={24} className="fill-current" />
              </div>
              <span className="text-sm font-mono font-black uppercase tracking-tighter text-slate-900">Zen Flow Studio / 2026</span>
            </div>
            <p className="text-[10px] font-mono text-slate-400 uppercase tracking-[0.2em] text-center">
              System Status: <span className="text-primary font-bold">All Flows Nominal</span> // Designing for Intention.
            </p>
            <div className="flex gap-4">
              <a href="#" className="size-12 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary transition-all shadow-sm hover:shadow-md">
                <Twitter size={20} />
              </a>
              <a href="#" className="size-12 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary transition-all shadow-sm hover:shadow-md">
                <Github size={20} />
              </a>
            </div>
          </footer>
        </div>
      </main>

      {/* Decorative Blur Elements */}
      <div className="fixed -bottom-24 -left-24 size-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="fixed -top-24 -right-24 size-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
    </div>
  );
}
