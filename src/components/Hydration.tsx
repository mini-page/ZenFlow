import React, { useState, useEffect } from 'react';
import { ArrowLeft, Settings, Droplet, GlassWater, Edit2, X } from 'lucide-react';

export default function Hydration({ onBack }: { onBack: () => void }) {
  const [water, setWater] = useState(1200);
  const [goal, setGoal] = useState(2000);
  const [showSettings, setShowSettings] = useState(false);
  const [animatedPercentage, setAnimatedPercentage] = useState(0);

  const addWater = (amount: number) => {
    setWater(prev => Math.min(prev + amount, goal));
  };

  const percentage = Math.min((water / goal) * 100, 100);

  useEffect(() => {
    // Subtle animation for the water level
    const timeout = setTimeout(() => {
      setAnimatedPercentage(percentage);
    }, 50);
    return () => clearTimeout(timeout);
  }, [percentage]);

  return (
    <div className="flex flex-col h-full w-full p-4 gap-4 bg-background-light text-sage-900 transition-colors duration-300 relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-20%] w-[400px] h-[400px] bg-primary/20 rounded-full blur-3xl transition-colors duration-300 opacity-40"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-accent-water/20 rounded-full blur-3xl transition-colors duration-300 opacity-40"></div>
      </div>

      <header className="relative z-10 flex items-center justify-between px-2 pt-2 shrink-0">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="p-1.5 hover:bg-sage-100 rounded-lg transition-colors">
            <ArrowLeft className="text-sage-700" size={20} />
          </button>
          <div className="bg-blue-100 p-1.5 rounded-lg">
            <Droplet className="text-blue-600" size={20} />
          </div>
          <h1 className="font-serif text-xl font-semibold text-sage-700">Hydration</h1>
        </div>
        <button onClick={() => setShowSettings(true)} className="p-2 hover:bg-sage-100 rounded-full transition-colors">
          <Settings className="text-sage-600" size={20} />
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center gap-6 relative z-10 overflow-y-auto custom-scrollbar py-4">
        <div className="relative group cursor-pointer">
          <div className="absolute -left-12 top-1/4 text-xs text-sage-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <span className="block mb-12">— 1.5L</span>
            <span className="block">— 1.0L</span>
          </div>

          <div className="relative w-[100px] h-[280px] bg-white/30 rounded-full border-2 border-white/60 shadow-[inset_0_4px_12px_rgba(0,0,0,0.05)] overflow-hidden backdrop-blur-sm ring-1 ring-black/5 transition-colors duration-300">
            <div 
              className="absolute bottom-0 left-0 w-full bg-accent-water/90 transition-all duration-1000 cubic-bezier(0.4, 0, 0.2, 1) flex items-end justify-center" 
              style={{ height: `${animatedPercentage}%` }}
            >
              <div className="absolute top-[-12px] left-0 w-[200%] h-[24px] bg-[length:50%_100%] animate-[wave_4s_linear_infinite]" style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg viewBox='0 0 1200 120' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><path d='M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z' fill='%23A5C4D4' opacity='0.6'/></svg>")` }}></div>
              <div className="absolute top-[-16px] left-0 w-[200%] h-[24px] bg-[length:50%_100%] opacity-50 animate-[wave_6s_linear_infinite_reverse]" style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg viewBox='0 0 1200 120' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><path d='M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z' fill='%23A5C4D4' opacity='0.6'/></svg>")` }}></div>
              
              <div className="absolute bottom-4 left-4 w-2 h-2 bg-white/30 rounded-full animate-bounce"></div>
              <div className="absolute bottom-12 right-6 w-1.5 h-1.5 bg-white/20 rounded-full animate-bounce delay-300"></div>
              <div className="absolute bottom-8 left-8 w-1 h-1 bg-white/40 rounded-full animate-bounce delay-150"></div>
            </div>
            
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/40 to-transparent pointer-events-none opacity-50"></div>
            <div className="absolute top-4 left-4 w-3 h-12 bg-white/40 rounded-full blur-[2px]"></div>
          </div>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
            <span className="block text-3xl font-bold text-sage-800 drop-shadow-sm">{water}</span>
            <span className="block text-xs font-medium text-sage-500 mt-1 uppercase tracking-wider">/ {goal} ml</span>
          </div>
        </div>

        <div className="text-center">
          <p className="text-primary-dark font-medium text-xs bg-primary/10 px-3 py-1 rounded-full inline-block">
            {water >= goal ? 'Goal reached! Great job!' : 'On track · Keep going!'}
          </p>
        </div>
      </main>

      <footer className="relative z-10 mt-auto pt-2 shrink-0">
        <div className="glass-panel rounded-[2rem] p-5 flex items-center justify-between shadow-sm border border-sage-200/50">
          <button onClick={() => addWater(250)} className="flex flex-col items-center gap-2 group relative">
            <div className="w-12 h-12 rounded-full bg-white border border-sage-100 shadow-sm flex items-center justify-center text-[#8aaec0] hover:bg-accent-water/10 hover:scale-105 active:scale-95 transition-all duration-300">
              <Droplet size={20} className="group-hover:text-accent-water transition-colors" />
            </div>
            <span className="text-[10px] font-semibold text-sage-800 group-hover:text-[#8aaec0] transition-colors">+250ml</span>
          </button>
          
          <button onClick={() => addWater(500)} className="flex flex-col items-center gap-2 group relative">
            <div className="w-12 h-12 rounded-full bg-white border border-sage-100 shadow-sm flex items-center justify-center text-[#8aaec0] hover:bg-accent-water/10 hover:scale-105 active:scale-95 transition-all duration-300">
              <GlassWater size={20} className="group-hover:text-accent-water transition-colors" />
            </div>
            <span className="text-[10px] font-semibold text-sage-800 group-hover:text-[#8aaec0] transition-colors">+500ml</span>
          </button>
          
          <button onClick={() => setShowSettings(true)} className="flex flex-col items-center gap-2 group relative">
            <div className="w-12 h-12 rounded-full bg-primary text-forest-deep shadow-md shadow-primary/30 flex items-center justify-center hover:bg-primary-dark hover:scale-105 active:scale-95 transition-all duration-300">
              <Edit2 size={20} />
            </div>
            <span className="text-[10px] font-semibold text-sage-800">Custom</span>
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
