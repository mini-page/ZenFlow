import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Trash2, Leaf, Check, ArrowUp, Plus, Sprout, Sparkles, Droplets, CheckCircle2, Save, Smile, ChevronRight, Recycle, BookOpen, X } from 'lucide-react';
import SharedHeader from './SharedHeader';
import { useAppContext } from '../AppContext';

export default function TaskSoil({ onBack }: { onBack: () => void }) {
  const { tasks, setTasks } = useAppContext();
  const [newTask, setNewTask] = useState('');
  const [newPriority, setNewPriority] = useState<0 | 1 | 2 | 3>(0);
  const [animatingTaskId, setAnimatingTaskId] = useState<string | null>(null);
  const [overlayIcon, setOverlayIcon] = useState<'bloom' | 'add' | null>(null);
  
  // Sidebar State
  const [dailyNote, setDailyNote] = useState('');
  const [isNoteSaved, setIsNoteSaved] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  const overlayTimeoutRef = useRef<any>(null);

  // Random Tag Color System
  const tagColors = [
    'bg-rose-100 text-rose-600 border-rose-200',
    'bg-amber-100 text-amber-600 border-amber-200',
    'bg-emerald-100 text-emerald-600 border-emerald-200',
    'bg-blue-100 text-blue-600 border-blue-200',
    'bg-indigo-100 text-indigo-600 border-indigo-200',
    'bg-purple-100 text-purple-600 border-purple-200',
    'bg-teal-100 text-teal-600 border-teal-200',
  ];

  const getTagColor = (tagName: string) => {
    // Deterministic random color based on tagName string
    let hash = 0;
    for (let i = 0; i < tagName.length; i++) {
      hash = tagName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return tagColors[Math.abs(hash) % tagColors.length];
  };

  const parseTask = (input: string) => {
    const tags: string[] = [];
    let context: string | undefined = undefined;
    
    // Extract hashtags: #tag
    const hashtagRegex = /#(\w+)/g;
    let match;
    while ((match = hashtagRegex.exec(input)) !== null) {
      tags.push(match[1]);
    }
    
    // Extract context: @context
    const contextRegex = /@(\w+)/;
    const contextMatch = input.match(contextRegex);
    if (contextMatch) {
      context = contextMatch[1];
    }
    
    // Clean text by removing parsed elements
    const cleanText = input
      .replace(/#\w+/g, '')
      .replace(/@\w+/g, '')
      .trim();
      
    return { cleanText, tags, context };
  };

  const triggerOverlay = (type: 'bloom' | 'add') => {
    setOverlayIcon(type);
    if (overlayTimeoutRef.current) clearTimeout(overlayTimeoutRef.current);
    overlayTimeoutRef.current = setTimeout(() => setOverlayIcon(null), 800);
  };

  const toggleTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task && !task.completed) {
      setAnimatingTaskId(id);
      triggerOverlay('bloom');
      setTimeout(() => setAnimatingTaskId(null), 600);
    }
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    
    const { cleanText, tags, context } = parseTask(newTask);
    
    setTasks([{ 
      id: Date.now().toString(), 
      text: cleanText || newTask, // Fallback if user only typed tags
      completed: false, 
      priority: newPriority as 0|1|2|3,
      tags,
      context
    }, ...tasks]);
    
    setNewTask('');
    setNewPriority(0);
    triggerOverlay('add');
  };

  const activeCount = tasks.filter(t => !t.completed).length;
  const bloomingCount = tasks.filter(t => t.completed).length;
  
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed === b.completed) return b.priority - a.priority;
    return a.completed ? 1 : -1;
  });

  const saveNote = () => {
    setIsNoteSaved(true);
    setTimeout(() => setIsNoteSaved(false), 2000);
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#F0F4F0] text-[#1A2F1A] transition-colors duration-1000 relative overflow-hidden font-sans">
      
      {/* Nature Ambient Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[20%] w-[50%] h-[50%] bg-[#8FBC8F] rounded-full mix-blend-multiply filter blur-[120px] opacity-10 animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-[#E8B895] rounded-full mix-blend-multiply filter blur-[100px] opacity-15"></div>
      </div>

      <SharedHeader 
        title="Task Soil" 
        onBack={onBack} 
        icon={Sprout} 
        iconColor="text-[#2D5A27]"
      />

      <main className="flex-1 flex gap-6 px-6 pb-6 pt-2 z-10 max-w-[1600px] mx-auto w-full h-full overflow-hidden relative">
        
        {/* Mobile Toggle for Sidebar */}
        <button 
          onClick={() => setShowMobileSidebar(true)}
          className="xl:hidden fixed bottom-32 right-6 z-40 size-14 rounded-full bg-white/80 backdrop-blur-md border border-white/60 shadow-lg flex items-center justify-center text-[#2D5A27] hover:scale-110 active:scale-95 transition-all"
        >
          <BookOpen size={24} />
        </button>

        {/* Main Task Section */}
        <section className="flex-1 glass-panel rounded-[32px] shadow-soft flex flex-col relative overflow-hidden group/main border border-white/60 bg-white/65 backdrop-blur-xl">
          <div className="flex-none px-8 pt-8 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-serif text-[#1A2F1A] mb-1">Today's Planting</h1>
                <p className="text-[#1A2F1A] opacity-60 text-base font-light">Cultivate your focus, one seed at a time.</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="bg-[#E8F5E9] text-[#2D5A27] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-[#C8E6C9] shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <Leaf size={12} className="fill-current" />
                    <span>{activeCount} Growing</span>
                  </div>
                  <div className="w-px h-3 bg-[#2D5A27]/20"></div>
                  <div className="flex items-center gap-1.5 text-emerald-600">
                    <CheckCircle2 size={12} strokeWidth={3} />
                    <span>{bloomingCount} Blooming</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="h-px w-full bg-gradient-to-r from-transparent via-[#2D5A27]/10 to-transparent mt-6"></div>
          </div>

          <div className="flex-1 overflow-y-auto px-8 py-2 space-y-3 pb-32 custom-scrollbar">
            {sortedTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-[#1A2F1A] opacity-30">
                <Leaf size={64} strokeWidth={1} className="mb-4" />
                <p className="text-xl font-serif">The soil is ready for planting.</p>
              </div>
            ) : (
              sortedTasks.map(task => (
                <div 
                  key={task.id} 
                  className={`group relative flex items-center p-4 rounded-[20px] border transition-all duration-300 cursor-pointer
                    ${task.completed 
                      ? 'bg-[#F0F4F0]/40 border-transparent opacity-60' 
                      : 'bg-white/50 hover:bg-white/80 border-white/40 shadow-sm hover:shadow-md'}
                    ${task.priority === 3 && !task.completed ? 'ring-1 ring-[#E8B895]/30' : ''}
                  `}
                >
                  <label className="flex items-center gap-5 w-full cursor-pointer select-none">
                    <div className="relative flex items-center justify-center">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={task.completed}
                        onChange={() => toggleTask(task.id)}
                      />
                      {/* Custom Seed Hole Checkbox */}
                      <div className={`size-8 rounded-full border border-[#8A9A8A]/30 transition-all duration-500 flex items-center justify-center overflow-hidden
                        ${task.completed ? 'bg-[#2D5A27] border-[#2D5A27] shadow-inner' : 'bg-[#E0E5E0] shadow-[inset_0_2px_6px_rgba(0,0,0,0.15)] peer-hover:border-[#2D5A27]'}
                      `}>
                        {task.completed ? (
                          <Check size={18} className="text-white animate-in zoom-in duration-300" strokeWidth={3} />
                        ) : (
                          <Sprout size={18} className={`text-[#C8E6C9] transition-all duration-500 transform translate-y-4 opacity-0 peer-hover:opacity-40 peer-hover:translate-y-0`} />
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col flex-1">
                      <span className={`text-lg font-medium leading-snug transition-all ${task.completed ? 'text-[#8A9A8A] line-through decoration-[#8A9A8A]' : 'text-[#1A2F1A]'}`}>
                        {task.text}
                      </span>
                      
                      {/* Parsed Metadata: Tags and Context */}
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        {task.context && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/60 border border-white/40 text-[10px] font-bold text-[#2D5A27] uppercase tracking-wider shadow-sm">
                            <Plus size={10} className="rotate-45" /> {task.context}
                          </span>
                        )}
                        {task.tags && task.tags.map((tag, idx) => (
                          <span 
                            key={idx} 
                            className={`px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wider shadow-sm transition-all hover:scale-105 ${getTagColor(tag)}`}
                          >
                            # {tag}
                          </span>
                        ))}
                        {task.priority === 3 && !task.completed && (
                          <span className="text-[10px] text-[#E8B895] font-black uppercase tracking-wider bg-white/40 px-2 py-0.5 rounded-md border border-[#E8B895]/20 shadow-sm">High Priority</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Priority Icons (Eco/Leaf) */}
                    {!task.completed && task.priority > 0 && (
                      <div className="flex items-center gap-0.5 text-[#2D5A27] pr-4 opacity-40 group-hover:opacity-100 transition-opacity">
                        {[...Array(task.priority)].map((_, i) => (
                          <Leaf key={i} size={14} fill="currentColor" />
                        ))}
                      </div>
                    )}
                  </label>
                  
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}
                    className="opacity-0 group-hover:opacity-100 transition-all p-2 text-[#8A9A8A] hover:text-[#E8B895] rounded-xl hover:bg-[#FAF5F2]"
                  >
                    {task.completed ? <Recycle size={20} /> : <Trash2 size={20} />}
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Floating Task Input */}
          <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-white/90 via-white/80 to-transparent pt-12 rounded-b-[32px] z-20">
            <form onSubmit={addTask} className="relative flex items-center gap-3 bg-white/80 backdrop-blur-md rounded-[24px] p-2 pl-5 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white ring-1 ring-black/5 focus-within:ring-2 focus-within:ring-[#2D5A27]/40 transition-all">
              <Plus className="text-[#2D5A27] opacity-50" size={24} />
              <input 
                type="text" 
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Plant a new seed..." 
                className="w-full bg-transparent border-none p-2 text-[#1A2F1A] placeholder:text-[#8A9A8A] focus:ring-0 text-lg outline-none"
              />
              
              {/* Inline Priority Picker */}
              <div className="flex gap-1 mr-2 bg-[#F0F4F0] px-2 py-1.5 rounded-full shrink-0">
                {[1, 2, 3].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setNewPriority(newPriority === level ? 0 : level as 1|2|3)}
                    className={`rounded-full p-1 transition-all ${newPriority >= level ? 'opacity-100' : 'opacity-30 hover:opacity-60'}`}
                  >
                    <Leaf size={16} className="text-[#2D5A27]" fill={newPriority >= level ? 'currentColor' : 'none'} />
                  </button>
                ))}
              </div>

              <button type="submit" className="bg-[#2D5A27] hover:bg-[#20401C] text-white size-10 rounded-[18px] transition-all flex items-center justify-center shadow-lg shadow-[#2D5A27]/30 active:scale-95 shrink-0">
                <ArrowUp size={20} strokeWidth={3} />
              </button>
            </form>
          </div>
        </section>

        {/* Inner Growth Sidebar */}
        <aside className="hidden xl:flex w-[340px] flex-none glass-panel rounded-[32px] shadow-soft flex-col overflow-hidden border border-white/60 bg-white/65 backdrop-blur-xl">
          <div className="p-6 pb-4 border-b border-white/40">
            <h2 className="text-xl font-serif text-[#1A2F1A] flex items-center gap-2">
              <Smile size={24} className="text-[#2D5A27]" />
              Inner Growth
            </h2>
            <p className="text-sm font-light text-[#1A2F1A] opacity-70 mt-1">Your daily reflection space</p>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
            {/* Daily Note */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#2D5A27] opacity-80">Daily Note</h3>
                <span className="text-[10px] text-[#1A2F1A] opacity-50 bg-white/50 px-2 py-0.5 rounded-full font-bold uppercase">Today</span>
              </div>
              <div className="relative group">
                <textarea 
                  value={dailyNote}
                  onChange={(e) => setDailyNote(e.target.value)}
                  className="w-full h-32 bg-white/50 border border-white/60 rounded-2xl p-4 text-sm text-[#1A2F1A] placeholder:text-[#1A2F1A]/40 focus:ring-1 focus:ring-[#2D5A27]/50 focus:border-white focus:bg-white/80 resize-none transition-all shadow-sm leading-relaxed outline-none"
                  placeholder="What is one thing you are grateful for right now?"
                ></textarea>
                <div className={`absolute bottom-3 right-3 transition-opacity duration-300 ${dailyNote ? 'opacity-100' : 'opacity-0'}`}>
                  <button 
                    onClick={saveNote}
                    className={`size-8 flex items-center justify-center rounded-lg text-white transition-all shadow-sm ${isNoteSaved ? 'bg-emerald-500' : 'bg-[#2D5A27] hover:bg-[#20401C]'}`}
                  >
                    {isNoteSaved ? <Check size={16} /> : <Save size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Milestones */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#2D5A27] opacity-80">Milestones</h3>
                <Sparkles size={16} className="text-[#2D5A27]" />
              </div>
              <div className="bg-white/50 border border-white/60 rounded-2xl p-5 shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium">Weekly Streak</span>
                  <span className="text-xs font-bold bg-[#E8F5E9] text-[#2D5A27] px-2 py-0.5 rounded-md">5 Days</span>
                </div>
                <div className="flex gap-2 justify-between">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="size-7 rounded-full bg-[#2D5A27]/10 flex items-center justify-center text-[#2D5A27]">
                      <Sprout size={14} className="fill-current" />
                    </div>
                  ))}
                  <div className="size-7 rounded-full bg-black/5 flex items-center justify-center text-black/20 border border-dashed border-black/10">
                    <Sparkles size={12} />
                  </div>
                  <div className="size-7 rounded-full bg-black/5 flex items-center justify-center text-black/20 border border-dashed border-black/10">
                    <Sparkles size={12} />
                  </div>
                </div>
              </div>
            </div>

            {/* Whispers (Updates) */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#2D5A27] opacity-80">Whispers</h3>
              <div className="space-y-2">
                <div className="bg-[#E8F5E9]/60 border border-[#C8E6C9] rounded-2xl p-3 flex gap-3 items-start transition-all hover:bg-[#E8F5E9] hover:shadow-sm">
                  <div className="mt-0.5 size-7 rounded-full bg-[#A5D6A7] flex items-center justify-center flex-none shadow-sm text-white">
                    <Droplets size={14} />
                  </div>
                  <div>
                    <p className="text-sm leading-snug">Hydration goal reached. You are thriving.</p>
                    <span className="text-[10px] opacity-50 mt-1 block">Just now</span>
                  </div>
                </div>
                <div className="bg-white/50 border border-white/60 rounded-2xl p-3 flex gap-3 items-start transition-all hover:bg-white/80 hover:shadow-sm cursor-pointer group">
                  <div className="mt-0.5 size-7 rounded-full bg-[#E8B895] flex items-center justify-center flex-none shadow-sm text-white">
                    <Leaf size={14} />
                  </div>
                  <div>
                    <p className="text-sm leading-snug">New guided session: "Deep Roots".</p>
                    <span className="text-[10px] opacity-50 mt-1 block">2 hours ago</span>
                  </div>
                  <ChevronRight size={14} className="ml-auto opacity-40 group-hover:opacity-100 self-center" />
                </div>
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* Mobile Sidebar Overlay */}
      {showMobileSidebar && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-md flex items-end sm:items-center justify-center p-4 xl:hidden">
          <div className="bg-background-light w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85dvh] animate-in slide-in-from-bottom-10 border border-white/60">
            <div className="p-6 border-b border-sage-200 flex justify-between items-center shrink-0">
              <h3 className="font-serif text-xl font-bold text-[#1A2F1A] flex items-center gap-2">
                <Smile size={20} className="text-[#2D5A27]" />
                Inner Growth
              </h3>
              <button onClick={() => setShowMobileSidebar(false)} className="p-2 hover:bg-sage-100 rounded-full text-sage-500 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-8">
              {/* Daily Note (Mobile) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#2D5A27] opacity-80">Daily Note</h3>
                  <span className="text-[10px] text-[#1A2F1A] opacity-50 bg-white/50 px-2 py-0.5 rounded-full font-bold uppercase">Today</span>
                </div>
                <div className="relative group">
                  <textarea 
                    value={dailyNote}
                    onChange={(e) => setDailyNote(e.target.value)}
                    className="w-full h-32 bg-white/50 border border-white/60 rounded-2xl p-4 text-sm text-[#1A2F1A] placeholder:text-[#1A2F1A]/40 focus:ring-1 focus:ring-[#2D5A27]/50 focus:border-white focus:bg-white/80 resize-none transition-all shadow-sm leading-relaxed outline-none"
                    placeholder="What is one thing you are grateful for right now?"
                  ></textarea>
                  <div className={`absolute bottom-3 right-3 transition-opacity duration-300 ${dailyNote ? 'opacity-100' : 'opacity-0'}`}>
                    <button 
                      onClick={saveNote}
                      className={`size-8 flex items-center justify-center rounded-lg text-white transition-all shadow-sm ${isNoteSaved ? 'bg-emerald-500' : 'bg-[#2D5A27] hover:bg-[#20401C]'}`}
                    >
                      {isNoteSaved ? <Check size={16} /> : <Save size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Milestones (Mobile) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#2D5A27] opacity-80">Milestones</h3>
                  <Sparkles size={16} className="text-[#2D5A27]" />
                </div>
                <div className="bg-white/50 border border-white/60 rounded-2xl p-5 shadow-sm">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium">Weekly Streak</span>
                    <span className="text-xs font-bold bg-[#E8F5E9] text-[#2D5A27] px-2 py-0.5 rounded-md">5 Days</span>
                  </div>
                  <div className="flex gap-2 justify-between">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="size-7 rounded-full bg-[#2D5A27]/10 flex items-center justify-center text-[#2D5A27]">
                        <Sprout size={14} className="fill-current" />
                      </div>
                    ))}
                    <div className="size-7 rounded-full bg-black/5 flex items-center justify-center text-black/20 border border-dashed border-black/10">
                      <Sparkles size={12} />
                    </div>
                    <div className="size-7 rounded-full bg-black/5 flex items-center justify-center text-black/20 border border-dashed border-black/10">
                      <Sparkles size={12} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Whispers (Mobile) */}
              <div className="space-y-3 pb-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#2D5A27] opacity-80">Whispers</h3>
                <div className="space-y-2">
                  <div className="bg-[#E8F5E9]/60 border border-[#C8E6C9] rounded-2xl p-3 flex gap-3 items-start">
                    <div className="mt-0.5 size-7 rounded-full bg-[#A5D6A7] flex items-center justify-center flex-none shadow-sm text-white">
                      <Droplets size={14} />
                    </div>
                    <div>
                      <p className="text-sm leading-snug">Hydration goal reached. You are thriving.</p>
                      <span className="text-[10px] opacity-50 mt-1 block">Just now</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Decorative Nature Elements */}
      <div className="fixed bottom-12 right-12 z-0 opacity-10 pointer-events-none hidden lg:block">
        <Sprout size={140} className="rotate-12 text-[#2D5A27] blur-[1px]" />
      </div>
      <div className="fixed top-32 left-8 z-0 opacity-10 pointer-events-none hidden lg:block">
        <Leaf size={100} className="-rotate-12 text-[#E8B895] blur-[1px]" />
      </div>

      {/* Logic Overlays */}
      <div className={`absolute inset-0 z-50 flex items-center justify-center transition-all duration-500 pointer-events-none
        ${overlayIcon ? 'opacity-100 scale-100' : 'opacity-0 scale-150'}
      `}>
        <div className="w-24 h-24 rounded-full bg-[#2D5A27]/80 backdrop-blur-md flex items-center justify-center text-white shadow-2xl">
          {overlayIcon === 'bloom' ? <Sprout size={48} className="animate-bounce" /> : <Plus size={48} strokeWidth={3} />}
        </div>
      </div>

      <style>{`
        .glass-panel {
          background: rgba(255, 255, 255, 0.65);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.6);
        }
        .shadow-soft {
          box-shadow: 0 20px 40px -10px rgba(45, 90, 39, 0.15);
        }
      `}</style>
    </div>
  );
}
