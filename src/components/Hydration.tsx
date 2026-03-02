import React, { useState, useEffect } from 'react';
import { ArrowLeft, Settings, Droplet, GlassWater, Edit2, X, Plus, RotateCcw } from 'lucide-react';
import SharedHeader from './SharedHeader';
import { useAppContext } from '../AppContext';

export default function Hydration({ onBack }: { onBack: () => void }) {
  const { water, setWater, hydrationGoal: goal, setHydrationGoal: setGoal } = useAppContext();
  const [showSettings, setShowSettings] = useState(false);
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  const [overlayIcon, setOverlayIcon] = useState<'plus' | 'reset' | null>(null);
  
  const overlayTimeoutRef = React.useRef<any>(null);

  const addWater = (amount: number) => {
    setWater(prev => Math.min(prev + amount, goal));
    triggerOverlay('plus');
  };

  const triggerOverlay = (type: 'plus' | 'reset') => {
    setOverlayIcon(type);
    if (overlayTimeoutRef.current) clearTimeout(overlayTimeoutRef.current);
    overlayTimeoutRef.current = setTimeout(() => setOverlayIcon(null), 800);
  };

  const percentage = Math.min((water / goal) * 100, 100);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setAnimatedPercentage(percentage);
    }, 50);
    return () => clearTimeout(timeout);
  }, [percentage]);

  return (
    <div className="flex flex-col h-full w-full p-0 bg-background-light text-sage-900 transition-colors duration-1000 relative overflow-hidden">

      {/* Dynamic Background Glows */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute top-[-20%] right-[-20%] w-[500px] h-[500px] rounded-full blur-[120px] transition-all duration-1000 opacity-40 bg-blue-400"
          style={{ transform: `scale(${0.8 + (percentage / 200)})`, opacity: 0.2 + (percentage / 300) }}
        ></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] opacity-30"></div>
      </div>

      <SharedHeader 
        title="Hydration" 
        onBack={onBack} 
        currentView="hydrate"
        icon={Droplet} 
        iconColor="text-blue-500"
        actions={
          <button onClick={() => setShowSettings(true)} className="flex size-10 items-center justify-center rounded-xl bg-white/50 text-forest-deep hover:bg-primary/20 transition-all">
            <Settings size={20} />
          </button>
        }
      />

      <main className="flex-1 flex flex-col items-center justify-center relative z-10 overflow-hidden p-4">
        
        {/* Central Liquid Vessel */}
        <div className="relative group flex items-center justify-center">
          
          {/* Ripples when active */}
          <div className={`absolute w-[60vmin] h-[60vmin] max-w-[400px] max-h-[400px] rounded-full border border-blue-400/10 transition-all duration-1000 ${overlayIcon ? 'scale-110 opacity-100' : 'scale-90 opacity-0'}`}></div>

          {/* Central Circular Vessel */}
          <div className="relative w-[280px] h-[280px] md:w-[340px] md:h-[340px] bg-white/20 rounded-full border-4 border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.05)] overflow-hidden backdrop-blur-md animate-float flex items-center justify-center">
            
            {/* Liquid Level */}
            <div 
              className="absolute bottom-0 left-0 w-full bg-blue-400/80 transition-all duration-1000 cubic-bezier(0.4, 0, 0.2, 1) z-0" 
              style={{ height: `${animatedPercentage}%` }}
            >
              <div className="absolute top-[-15px] left-0 w-[200%] h-[30px] bg-[length:50%_100%] animate-[wave_3s_linear_infinite] opacity-60" style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg viewBox='0 0 1200 120' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><path d='M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z' fill='%2360A5FA'/></svg>")` }}></div>
              <div className="absolute top-[-20px] left-0 w-[200%] h-[40px] bg-[length:50%_100%] opacity-40 animate-[wave_5s_linear_infinite_reverse]" style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg viewBox='0 0 1200 120' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><path d='M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z' fill='%2360A5FA'/></svg>")` }}></div>
              
              {/* Bubbles */}
              <div className="absolute bottom-10 left-1/4 w-2 h-2 bg-white/40 rounded-full animate-bounce"></div>
              <div className="absolute bottom-24 right-1/3 w-3 h-3 bg-white/20 rounded-full animate-bounce delay-700"></div>
              <div className="absolute bottom-40 left-1/2 w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce delay-300"></div>
            </div>
            
            {/* Value Display (Centered inside) */}
            <div className="relative z-10 flex flex-col items-center select-none pointer-events-none">
              <span className={`text-6xl font-serif font-black tabular-nums transition-colors duration-500 drop-shadow-sm ${animatedPercentage > 55 ? 'text-white' : 'text-slate-800'}`}>{water}</span>
              <span className={`text-xs font-black uppercase tracking-[0.3em] mt-1 transition-colors duration-500 ${animatedPercentage > 55 ? 'text-white/80' : 'text-blue-500'}`}>ml track</span>
            </div>

            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/20 to-transparent pointer-events-none shadow-inner z-20"></div>
          </div>

          {/* Feedback Overlay */}
          <div className={`absolute inset-0 z-30 flex items-center justify-center transition-all duration-500 pointer-events-none
            ${overlayIcon ? 'opacity-100 scale-100' : 'opacity-0 scale-150'}
          `}>
            <div className="w-24 h-24 rounded-full bg-blue-500/80 backdrop-blur-md flex items-center justify-center text-white shadow-2xl">
              {overlayIcon === 'plus' ? <Plus size={48} strokeWidth={3} /> : <X size={48} strokeWidth={3} />}
            </div>
          </div>
        </div>
      </main>

      {/* Floating Control Bar */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <div className="glass-panel px-6 py-3 rounded-full flex items-center gap-6 shadow-2xl border-white/40 backdrop-blur-xl">
          <button 
            onClick={() => { setWater(0); triggerOverlay('reset'); }}
            className="flex flex-col items-center gap-1 group"
          >
            <div className="size-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-all">
              <RotateCcw size={18} className="text-slate-600" />
            </div>
            <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Reset</span>
          </button>

          <button 
            onClick={() => addWater(250)}
            className="flex flex-col items-center gap-1 group"
          >
            <div className="size-12 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-all text-blue-600 shadow-md">
              <Droplet size={20} />
            </div>
            <span className="text-[8px] font-bold uppercase tracking-widest text-blue-500">+250ml</span>
          </button>

          <button 
            onClick={() => addWater(500)}
            className="size-16 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all"
          >
            <GlassWater size={32} />
          </button>

          <button 
            onClick={() => setShowSettings(true)}
            className="flex flex-col items-center gap-1 group"
          >
            <div className="size-12 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-all text-blue-600 shadow-md">
              <Plus size={20} />
            </div>
            <span className="text-[8px] font-bold uppercase tracking-widest text-blue-500">Goal</span>
          </button>

          <div className="w-px h-8 bg-slate-200 mx-1"></div>

          <button 
            onClick={onBack}
            className="flex flex-col items-center gap-1 group"
          >
            <div className="size-10 rounded-full bg-rose-50 flex items-center justify-center group-hover:bg-rose-100 transition-all">
              <X size={18} className="text-rose-500" />
            </div>
            <span className="text-[8px] font-bold uppercase tracking-widest text-rose-400">Back</span>
          </button>
        </div>
      </nav>

      {/* Settings Modal */}
      {showSettings && (
        <div className="absolute inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-background-light w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95">
            <div className="p-6 border-b border-sage-200 flex justify-between items-center">
              <h3 className="font-bold text-lg text-sage-900">Hydration Settings</h3>
              <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-sage-100 rounded-full text-sage-500 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-sage-700 mb-2">Daily Goal (ml)</label>
                <input 
                  type="number" 
                  value={goal} 
                  onChange={(e) => setGoal(Math.max(100, parseInt(e.target.value) || 2000))}
                  className="w-full bg-white/50 border border-sage-200 rounded-xl px-4 py-3 outline-none focus:border-accent-water text-sage-900 transition-colors"
                />
              </div>
              <button onClick={() => { setWater(0); setShowSettings(false); }} className="w-full py-3 text-red-500 font-medium bg-red-50 rounded-xl hover:bg-red-100 transition-colors">
                Reset Today's Progress
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
