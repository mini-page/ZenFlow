import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, Lightbulb, Image as ImageIcon, Bold, Italic, List, Check, Save, Smile, Sparkles, Trash2, PenLine, X } from 'lucide-react';
import SharedHeader from './SharedHeader';
import GlassCard from './ui/GlassCard';
import Button from './ui/Button';

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: string;
  mood: string;
  images: string[];
  completed_at: string;
}

const STORAGE_KEY = 'zenflow_journal_history';
const PROMPTS = [
  "What is one small thing that brought you peace today?",
  "How did you handle a challenge today with mindfulness?",
  "What are you most grateful for in this moment?",
  "Describe a beautiful detail you noticed in nature today.",
  "What is a thought or feeling you want to release?",
  "How did you nourish your body and mind today?"
];

export default function Journal({ onBack }: { onBack: () => void }) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState('Calm');
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [mobilePanelTouchStart, setMobilePanelTouchStart] = useState<{ x: number; y: number } | null>(null);

  const today = new Date().toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setEntries(JSON.parse(saved));
    setCurrentPrompt(PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);
  }, []);

  const saveEntry = () => {
    if (!title.trim() && !content.trim()) return;
    
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      title: title || 'Untitled Reflection',
      content,
      date: today,
      mood: selectedMood,
      images: [],
      completed_at: new Date().toISOString()
    };

    const nextEntries = [newEntry, ...entries];
    setEntries(nextEntries);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextEntries));
    
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      setTitle('');
      setContent('');
    }, 2000);
  };

  const deleteEntry = (id: string) => {
    const next = entries.filter(e => e.id !== id);
    setEntries(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <>
      <GlassCard padding="sm">
        <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2">
          <Smile size={14} className="text-primary-dark" /> Mood Bloom
        </h3>
        <div className="flex flex-wrap gap-2">
          {['Calm', 'Energetic', 'Pensive', 'Grateful', 'Focus'].map(m => (
            <button
              key={m}
              onClick={() => setSelectedMood(m)}
              className={`px-4 py-2 rounded-full border text-xs font-bold transition-all active:scale-95 ${selectedMood === m ? 'bg-primary/20 border-primary/30 text-primary-dark shadow-sm' : 'bg-white border-slate-100 text-slate-500 hover:border-primary/20'}`}
            >
              {m}
            </button>
          ))}
        </div>
      </GlassCard>

      <GlassCard padding="sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
            <ImageIcon size={14} className="text-primary-dark" /> Visual Garden
          </h3>
          <button className="text-primary-dark text-[10px] font-black uppercase tracking-widest hover:underline transition-all">Add New</button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 group relative cursor-pointer">
            <img src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=300&q=80" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-110 group-hover:scale-100" />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-tighter shadow-sm">Nature</div>
          </div>
          <div className="aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 group relative cursor-pointer">
            <img src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=300&q=80" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-110 group-hover:scale-100" />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-tighter shadow-sm">Yoga</div>
          </div>
        </div>
      </GlassCard>

      <GlassCard padding="none" className={`${isMobile ? '' : 'flex-1'} flex flex-col min-h-[300px] overflow-hidden`}>
        <div className="p-5 border-b border-slate-50">
          <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
            <Sparkles size={14} className="text-primary-dark" /> Past Reflections
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4">
          {entries.length === 0 ? (
            <div className="text-center py-10 opacity-30 italic text-sm text-slate-400">No reflections yet. Begin your journey today.</div>
          ) : entries.map(entry => (
            <div key={entry.id} className="p-4 rounded-2xl bg-white border border-slate-50 shadow-sm hover:shadow-md transition-all group relative">
              <button
                onClick={() => deleteEntry(entry.id)}
                className="absolute top-2 right-2 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-rose-500"
              >
                <Trash2 size={14} />
              </button>
              <div className="flex justify-between items-start mb-1">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{entry.date}</span>
                <span className="text-[9px] font-black text-primary-dark bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-tighter">{entry.mood}</span>
              </div>
              <h4 className="font-bold text-slate-800 text-sm truncate pr-6">{entry.title}</h4>
              <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">{entry.content}</p>
            </div>
          ))}
        </div>
      </GlassCard>
    </>
  );

  return (
    <div className="flex flex-col h-full w-full bg-background-light text-sage-900 transition-colors duration-1000 relative overflow-hidden font-sans">
      <SharedHeader title="Zen Notes" onBack={onBack} currentView="journal" icon={BookOpen} iconColor="text-primary-dark" />

      <main className="flex-1 max-w-7xl mx-auto w-full flex flex-col px-4 md:px-6 lg:px-10 py-6 gap-6 overflow-hidden">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 shrink-0">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Zen Notes</h1>
            <p className="text-slate-500 font-medium">The Balanced Sanctuary</p>
          </div>
          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-primary/10 shadow-soft">
            <Calendar size={18} className="text-primary-dark ml-2" />
            <span className="text-sm font-bold pr-4 text-slate-700">{today}</span>
          </div>
        </div>

        <div className="flex flex-1 gap-6 min-h-0 overflow-hidden">
          {/* Main Writing Area */}
          <section className="w-full xl:flex-[1.5] flex flex-col bg-white rounded-[2.5rem] border border-primary/10 shadow-sm overflow-hidden animate-in fade-in slide-in-from-left-4 duration-700">
            <div className="p-6 border-b border-primary/5 bg-primary/5">
              <div className="flex items-center gap-3">
                <Lightbulb size={18} className="text-primary-dark shrink-0" />
                <p className="text-sm font-medium text-slate-600 italic leading-relaxed">
                  "{currentPrompt}"
                </p>
              </div>
            </div>

            <div className="flex-1 flex flex-col p-8 relative overflow-y-auto custom-scrollbar">
              <div className="flex items-center gap-4 mb-6">
                <div className="size-12 rounded-full overflow-hidden border-2 border-primary/20 flex-none bg-primary/10 flex items-center justify-center text-primary-dark">
                  <PenLine size={24} />
                </div>
                <input 
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-transparent border-none text-2xl font-black focus:ring-0 placeholder:text-slate-200 outline-none text-slate-900" 
                  placeholder="Title your reflection..." 
                />
              </div>

              <textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="flex-1 w-full bg-transparent border-none resize-none focus:ring-0 text-lg leading-relaxed text-slate-700 placeholder:text-slate-200 outline-none" 
                placeholder="A quiet mind is a creative mind. Start typing your thoughts here..."
              ></textarea>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-1">
                  <button className="p-2.5 hover:bg-primary/10 rounded-xl text-slate-400 hover:text-primary-dark transition-all active:scale-90">
                    <Bold size={20} />
                  </button>
                  <button className="p-2.5 hover:bg-primary/10 rounded-xl text-slate-400 hover:text-primary-dark transition-all active:scale-90">
                    <Italic size={20} />
                  </button>
                  <button className="p-2.5 hover:bg-primary/10 rounded-xl text-slate-400 hover:text-primary-dark transition-all active:scale-90">
                    <List size={20} />
                  </button>
                  <button className="p-2.5 hover:bg-primary/10 rounded-xl text-slate-400 hover:text-primary-dark transition-all active:scale-90">
                    <ImageIcon size={20} />
                  </button>
                </div>
                
                <Button 
                  onClick={saveEntry}
                  icon={isSaved ? Check : Save}
                  className={`min-w-[140px] transition-all duration-500 ${isSaved ? 'bg-emerald-500 scale-105' : ''}`}
                >
                  {isSaved ? 'Saved' : 'Save Entry'}
                </Button>
              </div>
            </div>
          </section>

          {/* Sidebar */}
          <aside className="hidden xl:flex flex-1 flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar animate-in fade-in slide-in-from-right-4 duration-700">
            <SidebarContent />
          </aside>
        </div>
      </main>

      <button
        onClick={() => setShowMobileSidebar(true)}
        className="xl:hidden fixed bottom-32 right-6 z-40 size-14 rounded-full bg-white/85 backdrop-blur-md border border-white/60 shadow-lg flex items-center justify-center text-primary-dark hover:scale-110 active:scale-95 transition-all"
        aria-label="Open notes side panel"
      >
        <Smile size={22} />
      </button>

      {showMobileSidebar && (
        <div
          className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-md flex items-end sm:items-center justify-center p-4 xl:hidden"
          onClick={() => setShowMobileSidebar(false)}
        >
          <div
            className="bg-background-light w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85dvh] animate-in slide-in-from-bottom-10 border border-white/60"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => {
              const touch = e.touches[0];
              if (!touch) return;
              setMobilePanelTouchStart({ x: touch.clientX, y: touch.clientY });
            }}
            onTouchEnd={(e) => {
              if (!mobilePanelTouchStart) return;
              const touch = e.changedTouches[0];
              if (!touch) return;

              const dx = touch.clientX - mobilePanelTouchStart.x;
              const dy = touch.clientY - mobilePanelTouchStart.y;
              const absDx = Math.abs(dx);

              // Close only on intentional downward swipe; keep normal scrolling behavior.
              if (dy >= 70 && dy > absDx + 20) {
                setShowMobileSidebar(false);
              }
              setMobilePanelTouchStart(null);
            }}
          >
            <div className="p-6 border-b border-sage-200 flex justify-between items-center shrink-0">
              <h3 className="font-serif text-xl font-bold text-slate-900 flex items-center gap-2">
                <Smile size={20} className="text-primary-dark" />
                Notes Tools
              </h3>
              <button onClick={() => setShowMobileSidebar(false)} className="p-2 hover:bg-sage-100 rounded-full text-sage-500 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
              <SidebarContent isMobile />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
