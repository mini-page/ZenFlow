import React, { useState, useEffect } from 'react';
import { ArrowLeft, Settings, Droplet, GlassWater, Edit2, X, Plus } from 'lucide-react';
import SharedHeader from './SharedHeader';

export default function Hydration({ onBack }: { onBack: () => void }) {
  const [water, setWater] = useState(1200);
  const [goal, setGoal] = useState(2000);
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

          <div className="relative w-[120px] h-[320px] md:w-[140px] md:h-[380px] bg-white/20 rounded-[4rem] border-4 border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.05)] overflow-hidden backdrop-blur-md animate-float">
            
            {/* Liquid Level */}
            <div 
              className="absolute bottom-0 left-0 w-full bg-blue-400/80 transition-all duration-1000 cubic-bezier(0.4, 0, 0.2, 1)" 
              style={{ height: `${animatedPercentage}%` }}
            >
              <div className="absolute top-[-15px] left-0 w-[200%] h-[30px] bg-[length:50%_100%] animate-[wave_3s_linear_infinite] opacity-60" style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg viewBox='0 0 1200 120' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><path d='M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z' fill='%2360A5FA'/></svg>")` }}></div>
              <div className="absolute top-[-20px] left-0 w-[200%] h-[40px] bg-[length:50%_100%] opacity-40 animate-[wave_5s_linear_infinite_reverse]" style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg viewBox='0 0 1200 120' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><path d='M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z' fill='%2360A5FA'/></svg>")` }}></div>
              
              {/* Bubbles */}
              <div className="absolute bottom-10 left-4 w-2 h-2 bg-white/40 rounded-full animate-bounce"></div>
              <div className="absolute bottom-24 right-8 w-3 h-3 bg-white/20 rounded-full animate-bounce delay-700"></div>
              <div className="absolute bottom-40 left-10 w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce delay-300"></div>
            </div>
            
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/20 to-transparent pointer-events-none"></div>
          </div>

          {/* Value Display */}
          <div className="absolute -bottom-12 flex flex-col items-center">
            <span className="text-5xl font-serif font-bold text-sage-800 tabular-nums drop-shadow-sm">{water}</span>
            <span className="text-sm font-bold text-blue-500 uppercase tracking-[0.2em] mt-1">ml log</span>
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

      <footer className="relative z-10 mt-auto pb-4 shrink-0">
        <div className="flex items-center justify-center gap-6">
          <button 
            onClick={() => addWater(250)}
            className="flex flex-col items-center gap-3 group"
          >
            <div className="w-16 h-16 rounded-full glass-panel flex items-center justify-center text-blue-500 hover:scale-110 active:scale-95 transition-all duration-300 shadow-soft border-white/50">
              <Droplet size={24} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-sage-500">250ml</span>
          </button>
          
          <button 
            onClick={() => addWater(500)}
            className="flex flex-col items-center gap-3 group"
          >
            <div className="w-20 h-20 rounded-full glass-panel flex items-center justify-center text-blue-600 hover:scale-110 active:scale-95 transition-all duration-300 shadow-lg border-white/60">
              <GlassWater size={32} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600">500ml</span>
          </button>
          
          <button 
            onClick={() => setShowSettings(true)}
            className="flex flex-col items-center gap-3 group"
          >
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary-dark hover:scale-110 active:scale-95 transition-all duration-300 shadow-soft border border-primary/20">
              <Plus size={24} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-sage-500">Goal</span>
          </button>
        </div>
      </footer>

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
