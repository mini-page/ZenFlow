import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Square, Pause, Play, RotateCcw, Edit3, X, Timer, History, Calendar, CheckCircle2, Settings, SkipForward } from 'lucide-react';
import { useAppContext } from '../AppContext';
import SharedHeader from './SharedHeader';

interface FocusSession {
  id: number;
  duration: number;
  task_name: string;
  completed_at: string;
}

export default function FocusMode({ onBack }: { onBack: () => void }) {
  const {
    focusDuration, setFocusDuration,
    breakDuration, setBreakDuration,
    isBreak, setIsBreak,
    timeLeft, setTimeLeft,
    isActive, setIsActive,
    sessionCompleted, setSessionCompleted,
    task, setTask,
    toggleTimer, resetTimer
  } = useAppContext();

  const [showModal, setShowModal] = useState(false);
  const [modalTab, setModalTab] = useState<'settings' | 'history'>('settings');
  const [history, setHistory] = useState<FocusSession[]>([]);
  const [overlayIcon, setOverlayIcon] = useState<'play' | 'pause' | 'stop' | 'check' | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [completedCycles, setCompletedCycles] = useState<number>(0);
  const overlayTimeoutRef = useRef<any>(null);

  useEffect(() => {
    if (sessionCompleted) {
      if (isBreak) {
        setCompletedCycles(prev => prev + 1);
        setShowCelebration(true);
        setOverlayIcon('check');
        if (overlayTimeoutRef.current) clearTimeout(overlayTimeoutRef.current);
        overlayTimeoutRef.current = setTimeout(() => {
          setOverlayIcon(null);
          setShowCelebration(false);
        }, 3000);
        fetchHistory();
      }
      setSessionCompleted(false);
    }
  }, [sessionCompleted, isBreak]);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/sessions');
      const data = await res.json();
      setHistory(data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchHistory(); }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const totalTime = (isBreak ? breakDuration : focusDuration) * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 289;

  const handleToggleActive = () => {
    setIsActive(!isActive);
    setOverlayIcon(!isActive ? 'play' : 'pause');
    if (overlayTimeoutRef.current) clearTimeout(overlayTimeoutRef.current);
    overlayTimeoutRef.current = setTimeout(() => setOverlayIcon(null), 1000);
  };

  const handleStop = () => {
    resetTimer();
    setIsActive(false);
    setOverlayIcon('stop');
    setCompletedCycles(0);
    if (overlayTimeoutRef.current) clearTimeout(overlayTimeoutRef.current);
    overlayTimeoutRef.current = setTimeout(() => setOverlayIcon(null), 1000);
  };

  const handleSkip = () => {
    setIsActive(false);
    setIsBreak(!isBreak);
    resetTimer();
    setOverlayIcon('play');
    if (overlayTimeoutRef.current) clearTimeout(overlayTimeoutRef.current);
    overlayTimeoutRef.current = setTimeout(() => setOverlayIcon(null), 1000);
  };

  return (
    <div className="flex flex-col h-full w-full p-0 bg-background-light text-sage-900 transition-colors duration-1000 relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className={`absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] transition-all duration-1000 ease-in-out ${isBreak ? 'bg-blue-400/20' : 'bg-primary/20'}`}></div>
        <div className={`absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] rounded-full blur-[100px] transition-all duration-1000 ease-in-out ${isBreak ? 'bg-sky-200/30' : 'bg-accent-clay/10'}`}></div>
      </div>

      <SharedHeader 
        title="Focus Mode" onBack={onBack} icon={Timer} iconColor={isBreak ? "text-blue-400" : "text-rose-500"}
        actions={<button onClick={() => { setShowModal(true); setModalTab('history'); }} className="flex size-10 items-center justify-center rounded-xl bg-white/50 text-sage-600 hover:bg-primary/20 transition-all shadow-sm"><History size={20} /></button>}
      />

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center w-full overflow-hidden py-4 animate-in fade-in zoom-in-95 duration-1000 p-4">
        <div className="absolute top-4 md:top-8 text-center z-40 w-full h-24 flex flex-col items-center justify-center px-6">
          <div className={`w-full max-w-[400px] transition-all duration-700 ease-in-out ${isActive ? 'opacity-0 -translate-y-4 pointer-events-none' : 'opacity-100 translate-y-0'}`}>
            <div className="relative group">
              <input type="text" value={task} onChange={(e) => setTask(e.target.value)} className="w-full bg-white/20 backdrop-blur-sm border-b border-white/40 hover:border-primary/40 focus:border-primary/60 text-center text-sage-800 font-serif font-bold text-xl md:text-2xl outline-none placeholder:text-sage-500/40 transition-all py-2 pr-8" placeholder="What is your motive?" />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 text-sage-400"><Edit3 size={16} /></div>
            </div>
          </div>
          <div className={`absolute w-full flex flex-col items-center justify-center transition-all duration-700 ease-in-out ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-dark/40 mb-2">Currently Planting</span>
            <h2 className={`text-3xl md:text-4xl font-serif font-bold text-sage-800 tracking-tight drop-shadow-sm transition-all duration-1000 ease-in-out ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
              {task || 'Focusing'}
            </h2>
          </div>
        </div>

        <div className="relative flex items-center justify-center cursor-pointer group" onClick={handleToggleActive}>
          <div className={`absolute w-[65vmin] h-[65vmin] max-w-[450px] max-h-[450px] rounded-full border transition-all duration-1000 pointer-events-none ${isActive ? 'scale-110 opacity-100' : 'scale-90 opacity-0'} ${isBreak ? 'border-blue-400/10' : 'border-primary/10'}`}></div>
          <div className={`relative w-[45vmin] h-[45vmin] max-w-[320px] max-h-[320px] min-w-[240px] min-h-[240px] flex items-center justify-center ${showCelebration ? 'animate-bounce' : ''}`}>
            <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="46" fill={isBreak ? "rgba(186, 230, 253, 0.1)" : "rgba(224, 216, 208, 0.3)"} className="stroke-white/50" strokeWidth="2" />
              <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="4" className={`${isBreak ? 'text-blue-400' : 'text-primary'} transition-all duration-1000 ease-linear`} strokeDasharray="289" strokeDashoffset={progress} />
            </svg>
            <div className="relative z-10 flex flex-col items-center">
              <h1 className="text-6xl md:text-7xl font-bold tracking-tighter tabular-nums text-sage-900">{formatTime(timeLeft)}</h1>
              <p className="text-sage-500 text-sm font-medium mt-2 uppercase tracking-widest">{isBreak ? 'until focus' : 'until break'}</p>
            </div>
            <div className={`absolute inset-0 z-30 flex items-center justify-center transition-all duration-500 pointer-events-none ${overlayIcon ? 'opacity-100 scale-100' : 'opacity-0 scale-150'}`}>
              <div className={`w-24 h-24 rounded-full backdrop-blur-md flex items-center justify-center text-white shadow-2xl ${overlayIcon === 'check' ? 'bg-green-500/80' : 'bg-black/20'}`}>
                {overlayIcon === 'play' ? <Play size={48} className="fill-current ml-2" /> : overlayIcon === 'pause' ? <Pause size={48} /> : overlayIcon === 'check' ? <CheckCircle2 size={48} /> : <Square size={40} />}
              </div>
            </div>
          </div>
        </div>

        {!isActive && (
          <div className="mt-8 flex items-center gap-2 glass-panel px-4 py-1.5 rounded-full shadow-sm z-40">
            <span className={`w-2 h-2 rounded-full animate-pulse ${isBreak ? 'bg-blue-400' : 'bg-primary'}`}></span>
            <span className={`text-xs font-bold uppercase tracking-wider ${isBreak ? 'text-blue-400' : 'text-primary-dark'}`}>{isBreak ? 'Break Time' : 'Deep Work'}</span>
          </div>
        )}
      </main>

      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <div className="glass-panel px-6 py-3 rounded-full flex items-center gap-6 shadow-2xl border-white/40 backdrop-blur-xl">
          <button onClick={handleStop} className="flex flex-col items-center gap-1 group">
            <div className="size-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-all"><RotateCcw size={18} className="text-slate-600" /></div>
            <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Restart</span>
          </button>
          <button onClick={handleToggleActive} className={`size-14 rounded-full flex items-center justify-center shadow-lg transition-all transform active:scale-95 ${isActive ? 'bg-white text-slate-700 border border-slate-200' : 'bg-slate-900 text-white'}`}>
            {isActive ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
          </button>
          <button onClick={handleSkip} className="flex flex-col items-center gap-1 group">
            <div className="size-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-all"><SkipForward size={18} className="text-slate-600" /></div>
            <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Skip</span>
          </button>
          <div className="w-px h-8 bg-slate-200 mx-1"></div>
          <button onClick={onBack} className="flex flex-col items-center gap-1 group">
            <div className="size-10 rounded-full bg-rose-50 flex items-center justify-center group-hover:bg-rose-100 transition-all"><X size={18} className="text-rose-500" /></div>
            <span className="text-[8px] font-bold uppercase tracking-widest text-rose-400">End</span>
          </button>
        </div>
      </nav>

      {showModal && (
        <div className="absolute inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-background-light w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[80%] animate-in slide-in-from-bottom-10">
            <div className="p-6 border-b border-sage-200 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-lg text-sage-900">{modalTab === 'settings' ? 'Timer Settings' : 'Focus History'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-sage-100 rounded-full text-sage-500 transition-colors"><X size={20} /></button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              {modalTab === 'settings' ? (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-sage-700 mb-2">Focus Duration (minutes)</label>
                    <input type="number" value={focusDuration} onChange={(e) => setFocusDuration(Math.max(1, parseInt(e.target.value) || 25))} className="w-full bg-white/50 border border-sage-200 rounded-xl px-4 py-3 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-sage-700 mb-2">Break Duration (minutes)</label>
                    <input type="number" value={breakDuration} onChange={(e) => setBreakDuration(Math.max(1, parseInt(e.target.value) || 5))} className="w-full bg-white/50 border border-sage-200 rounded-xl px-4 py-3 outline-none" />
                  </div>
                  <button onClick={() => setShowModal(false)} className="w-full py-4 rounded-2xl bg-slate-900 text-white font-bold">Save Changes</button>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.length === 0 ? <p className="text-center py-10 text-sage-400 italic">No history yet.</p> : history.map((session) => (
                    <div key={session.id} className="glass-panel p-4 rounded-2xl border border-sage-100 shadow-sm flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary-dark shrink-0"><CheckCircle2 size={20} /></div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-sage-900 truncate">{session.task_name || 'Focus Session'}</h4>
                        <p className="text-[10px] text-sage-400">{session.duration}m · {new Date(session.completed_at).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
