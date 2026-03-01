import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Square, Pause, Play, RotateCcw, Edit3, X, Timer, History, Calendar, CheckCircle2 } from 'lucide-react';
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
  
  // New features state
  const [overlayIcon, setOverlayIcon] = useState<'play' | 'pause' | 'stop' | 'check' | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  
  // Session goals
  const [targetCycles, setTargetCycles] = useState<number>(0); // 0 means infinite
  const [completedCycles, setCompletedCycles] = useState<number>(0);
  
  const overlayTimeoutRef = useRef<any>(null);

  useEffect(() => {
    if (sessionCompleted) {
      handleSessionComplete();
      setSessionCompleted(false);
    }
  }, [sessionCompleted]);

  const handleSessionComplete = async () => {
    // If we just entered a break, it means we completed a focus session
    if (isBreak) {
      const newCompletedCycles = completedCycles + 1;
      setCompletedCycles(newCompletedCycles);

      // Show celebration
      setShowCelebration(true);
      setOverlayIcon('check');
      if (overlayTimeoutRef.current) clearTimeout(overlayTimeoutRef.current);
      overlayTimeoutRef.current = setTimeout(() => {
        setOverlayIcon(null);
        setShowCelebration(false);
      }, 3000);

      // Save focus session
      try {
        await fetch('/api/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            duration: focusDuration,
            task_name: task
          })
        });
        fetchHistory();
      } catch (error) {
        console.error('Failed to save session:', error);
      }

      // Check if goal is reached
      if (targetCycles > 0 && newCompletedCycles >= targetCycles) {
        // Goal reached! Stop the timer completely.
        setTimeout(() => {
          resetTimer();
          setIsActive(false);
          setCompletedCycles(0);
        }, 1000);
      }
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/sessions');
      const data = await res.json();
      setHistory(data);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const totalTime = (isBreak ? breakDuration : focusDuration) * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 283;

  const handleToggleActive = () => {
    if (!isActive) {
      setIsActive(true);
      setOverlayIcon('play');
      if (overlayTimeoutRef.current) clearTimeout(overlayTimeoutRef.current);
      overlayTimeoutRef.current = setTimeout(() => setOverlayIcon(null), 1000);
    } else {
      setIsActive(false);
      setOverlayIcon('pause');
      if (overlayTimeoutRef.current) clearTimeout(overlayTimeoutRef.current);
      overlayTimeoutRef.current = setTimeout(() => setOverlayIcon(null), 1000);
    }
  };

  const handleStop = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsStopping(true);
    
    setTimeout(() => {
      resetTimer();
      setIsActive(false);
      setOverlayIcon('stop');
      setIsStopping(false);
      setCompletedCycles(0);
      if (overlayTimeoutRef.current) clearTimeout(overlayTimeoutRef.current);
      overlayTimeoutRef.current = setTimeout(() => setOverlayIcon(null), 1000);
    }, 400);
  };

  const handleSkip = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Skip to next phase (focus -> break or break -> focus)
    setIsActive(false);
    setIsBreak(!isBreak);
    resetTimer(); // This will reset to the new phase's duration
    setOverlayIcon('play'); // Show a brief play icon to indicate phase change
    if (overlayTimeoutRef.current) clearTimeout(overlayTimeoutRef.current);
    overlayTimeoutRef.current = setTimeout(() => setOverlayIcon(null), 1000);
  };

  return (
    <div className="flex flex-col h-full w-full p-0 bg-background-light text-sage-900 transition-colors duration-1000 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className={`absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] transition-all duration-1000 ease-in-out ${isBreak ? 'bg-blue-400/20 scale-110' : 'bg-primary/20 scale-100'}`}></div>
        <div className={`absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] rounded-full blur-[100px] transition-all duration-1000 ease-in-out ${isBreak ? 'bg-sky-200/30 scale-90' : 'bg-accent-clay/10 scale-110'}`}></div>
      </div>

      <SharedHeader 
        title="Focus Mode" 
        onBack={onBack} 
        icon={Timer} 
        iconColor={isBreak ? "text-blue-400" : "text-rose-500"}
        actions={
          <button onClick={() => { setShowModal(true); setModalTab('history'); }} className="flex size-10 items-center justify-center rounded-xl bg-white/50 text-sage-600 hover:bg-primary/20 transition-all">
            <History size={20} />
          </button>
        }
      />

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center w-full overflow-hidden py-4 animate-in fade-in zoom-in-95 duration-1000 p-4">
        
        {/* Motive Display / Input (Breath Studio Chemistry) */}
        <div className="absolute top-4 md:top-8 text-center z-40 w-full h-24 flex flex-col items-center justify-center px-6">
          {/* Editable State (Stopped) */}
          <div className={`w-full max-w-[400px] transition-all duration-700 ease-in-out ${isActive ? 'opacity-0 -translate-y-4 pointer-events-none' : 'opacity-100 translate-y-0'}`}>
            <div className="relative group">
              <input 
                type="text" 
                value={task}
                onChange={(e) => setTask(e.target.value)}
                className="w-full bg-white/20 backdrop-blur-sm border-b border-white/40 hover:border-primary/40 focus:border-primary/60 text-center text-sage-800 font-serif font-bold text-xl md:text-2xl outline-none placeholder:text-sage-500/40 transition-all py-2 pr-8"
                placeholder="What is your motive?"
              />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 text-sage-400 group-hover:text-primary transition-colors">
                <Edit3 size={16} />
              </div>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-sage-400 mt-2">Set your intention</p>
          </div>

          {/* Persistent Display State (Active) */}
          <div className={`absolute w-full flex flex-col items-center justify-center transition-all duration-700 ease-in-out ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-dark/40 mb-2">Currently Planting</span>
            <h2 className={`text-3xl md:text-4xl font-serif font-bold text-sage-800 tracking-tight drop-shadow-sm transition-all duration-1000 ease-in-out ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
              {task || 'Focusing'}
            </h2>
          </div>
        </div>

        {/* Central Timer Area */}
        <div 
          className="relative flex items-center justify-center cursor-pointer group"
          onClick={handleToggleActive}
        >
          {/* Visualizer Rings */}
          <div className={`absolute w-[65vmin] h-[65vmin] max-w-[450px] max-h-[450px] rounded-full border transition-all duration-1000 ease-in-out pointer-events-none
            ${isBreak ? 'border-accent-water/10' : 'border-primary/10'}
            ${isActive ? 'scale-110 opacity-100' : 'scale-90 opacity-0'}
          `}></div>
          <div className={`absolute w-[75vmin] h-[75vmin] max-w-[550px] max-h-[550px] rounded-full border transition-all duration-1000 ease-in-out pointer-events-none
            ${isBreak ? 'border-accent-water/5' : 'border-primary/5'}
            ${isActive ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}
          `}></div>

          {/* Main Timer Circle */}
          <div className={`relative w-[45vmin] h-[45vmin] max-w-[320px] max-h-[320px] min-w-[240px] min-h-[240px] flex items-center justify-center transition-transform duration-700 hover:scale-[1.02]
            ${showCelebration ? 'animate-bounce' : ''}
          `}>
            {/* Subtle Background Animation */}
            <div className="absolute inset-[4px] rounded-full overflow-hidden pointer-events-none z-0">
              {isActive && (
                <div className={`absolute inset-0 opacity-20 transition-colors duration-1000 ${timeLeft <= 5 && timeLeft > 0 ? 'bg-red-500' : isBreak ? 'bg-accent-water' : 'bg-primary'}`}>
                  <div className="absolute w-[200%] h-[200%] top-[20%] left-[-50%] bg-white/40 rounded-[40%] animate-[spin_10s_linear_infinite]"></div>
                  <div className="absolute w-[200%] h-[200%] top-[30%] left-[-50%] bg-white/40 rounded-[45%] animate-[spin_15s_linear_infinite]"></div>
                </div>
              )}
            </div>

            {/* Celebration Sparkles */}
            {showCelebration && (
              <div className="absolute inset-0 z-0 pointer-events-none">
                {[...Array(12)].map((_, i) => (
                  <div 
                    key={i}
                    className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-ping"
                    style={{
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 2}s`,
                      animationDuration: `${1 + Math.random()}s`
                    }}
                  />
                ))}
              </div>
            )}
            <svg className="absolute inset-0 w-full h-full transform -rotate-90 drop-shadow-xl z-10 pointer-events-none" viewBox="0 0 100 100">
              <circle 
                cx="50" cy="50" r="46" 
                fill={isBreak ? "rgba(186, 230, 253, 0.1)" : "rgba(224, 216, 208, 0.3)"} 
                className="stroke-white/50 transition-colors duration-1000" 
                strokeWidth="2" 
              />
              <circle 
                cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeLinecap="round"
                strokeWidth={timeLeft <= 5 && timeLeft > 0 ? "6" : "4"}
                className={`${timeLeft <= 5 && timeLeft > 0 ? 'text-red-500' : (isBreak ? 'text-blue-400' : 'text-primary')} transition-all duration-1000 ease-linear drop-shadow-md`}
                strokeDasharray="289"
                strokeDashoffset={((totalTime - timeLeft) / totalTime) * 289}
              />
            </svg>
            
            <div className={`absolute inset-0 flex flex-col items-center justify-center select-none pointer-events-none z-20 transition-opacity duration-500 ${!isActive ? 'opacity-40' : 'opacity-100'}`}>
              <h1 className={`text-6xl md:text-7xl font-bold tracking-tighter tabular-nums drop-shadow-sm transition-colors duration-500 ${timeLeft <= 5 && timeLeft > 0 ? 'text-red-600' : 'text-sage-900'}`}>
                {formatTime(timeLeft)}
              </h1>
              <p className="text-sage-500 text-sm font-medium mt-2 uppercase tracking-widest">
                {isBreak ? 'until focus' : 'until break'}
              </p>
              {targetCycles > 0 && (
                <div className="mt-4 flex items-center gap-1.5 bg-white/40 px-3 py-1 rounded-full border border-white/50 shadow-sm">
                  <span className="text-[10px] font-bold text-sage-600 uppercase tracking-wider">Cycle {completedCycles + 1} / {targetCycles}</span>
                </div>
              )}
            </div>

            {/* Play/Pause Overlay */}
            <div className={`absolute inset-0 z-30 flex items-center justify-center transition-all duration-500 pointer-events-none
              ${overlayIcon ? 'opacity-100 scale-100' : 'opacity-0 scale-150'}
            `}>
              <div className={`w-24 h-24 rounded-full backdrop-blur-md flex items-center justify-center text-white shadow-2xl transition-colors duration-500
                ${overlayIcon === 'check' ? 'bg-green-500/80' : 'bg-black/20'}
              `}>
                {overlayIcon === 'play' ? (
                  <Play size={48} className="fill-current ml-2" />
                ) : overlayIcon === 'stop' ? (
                  <Square size={40} className="fill-current" />
                ) : overlayIcon === 'check' ? (
                  <CheckCircle2 size={48} className="fill-current animate-in zoom-in duration-300" />
                ) : (
                  <Pause size={48} className="fill-current" />
                )}
              </div>
            </div>

            {/* Subtle Play Hint */}
            {!isActive && !overlayIcon && (
              <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none transition-opacity duration-500">
                <div className="w-24 h-24 rounded-full bg-primary/10 backdrop-blur-sm flex items-center justify-center text-primary/60 animate-pulse shadow-[0_0_30px_rgba(var(--color-primary),0.2)]">
                  <Play size={48} className="fill-current ml-2" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Phase Indicator */}
        {!isActive && (
          <div className="mt-8 flex items-center gap-2 glass-panel px-4 py-1.5 rounded-full shadow-sm z-40">
            <span className={`w-2 h-2 rounded-full animate-pulse ${isBreak ? 'bg-blue-400' : 'bg-primary'}`}></span>
            <span className={`text-xs font-bold uppercase tracking-wider ${isBreak ? 'text-blue-400' : 'text-primary-dark'}`}>
              {isBreak ? 'Break Time' : 'Deep Work'}
            </span>
          </div>
        )}

        {/* Bottom Controls (Skip/Stop) */}
        <div className={`absolute bottom-12 w-full flex justify-center gap-6 transition-all duration-500 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}>
          <button 
            onClick={handleSkip}
            className="flex items-center justify-center w-14 h-14 rounded-full bg-white/80 backdrop-blur-md border border-sage-200/50 text-sage-600 shadow-sm hover:shadow-md hover:bg-sage-50 active:scale-95 transition-all duration-300"
            title="Skip Phase"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 4 15 12 5 20 5 4"></polygon>
              <line x1="19" y1="5" x2="19" y2="19"></line>
            </svg>
          </button>

          <button 
            onClick={handleStop}
            disabled={isStopping}
            className={`flex items-center justify-center w-14 h-14 rounded-full backdrop-blur-md border shadow-sm transition-all duration-300
              ${isStopping 
                ? 'bg-red-500 text-white border-red-500 scale-95 opacity-0' 
                : 'bg-white/80 border-sage-200/50 text-sage-600 hover:shadow-md hover:bg-red-50 hover:text-red-500 hover:border-red-100 active:scale-95'
              }
            `}
            title="Stop Session"
          >
            <Square size={20} fill="currentColor" className={isStopping ? 'animate-pulse' : ''} />
          </button>
        </div>
      </main>

      {/* Unified Modal */}
      {showModal && (
        <div className="absolute inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-background-light w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[80%] animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95">
            <div className="p-6 border-b border-sage-200 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-lg text-sage-900">{modalTab === 'settings' ? 'Timer Settings' : 'Focus History'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-sage-100 rounded-full text-sage-500 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="px-6 pt-4 shrink-0">
              <div className="flex bg-sage-100/50 p-1 rounded-2xl">
                <button
                  onClick={() => setModalTab('settings')}
                  className={`flex-1 py-2 text-sm font-medium rounded-xl transition-all ${modalTab === 'settings' ? 'bg-white text-sage-800 shadow-sm' : 'text-sage-500 hover:text-sage-700'}`}
                >
                  Settings
                </button>
                <button
                  onClick={() => setModalTab('history')}
                  className={`flex-1 py-2 text-sm font-medium rounded-xl transition-all ${modalTab === 'history' ? 'bg-white text-sage-800 shadow-sm' : 'text-sage-500 hover:text-sage-700'}`}
                >
                  History
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              {modalTab === 'settings' ? (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-sage-700 mb-2">Focus Duration (minutes)</label>
                    <div className="flex gap-2 mb-3">
                      <button onClick={() => setFocusDuration(25)} className={`flex-1 py-1.5 text-sm rounded-lg border transition-colors ${focusDuration === 25 ? 'bg-primary/20 border-primary text-primary-dark font-medium' : 'bg-white/50 border-sage-200 text-sage-600 hover:bg-sage-50'}`}>25m</button>
                      <button onClick={() => setFocusDuration(45)} className={`flex-1 py-1.5 text-sm rounded-lg border transition-colors ${focusDuration === 45 ? 'bg-primary/20 border-primary text-primary-dark font-medium' : 'bg-white/50 border-sage-200 text-sage-600 hover:bg-sage-50'}`}>45m</button>
                      <button onClick={() => setFocusDuration(60)} className={`flex-1 py-1.5 text-sm rounded-lg border transition-colors ${focusDuration === 60 ? 'bg-primary/20 border-primary text-primary-dark font-medium' : 'bg-white/50 border-sage-200 text-sage-600 hover:bg-sage-50'}`}>60m</button>
                    </div>
                    <input 
                      type="number" 
                      value={focusDuration} 
                      onChange={(e) => setFocusDuration(Math.max(1, parseInt(e.target.value) || 25))}
                      className="w-full bg-white/50 border border-sage-200 rounded-xl px-4 py-3 outline-none focus:border-primary text-sage-900 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-sage-700 mb-2">Break Duration (minutes)</label>
                    <div className="flex gap-2 mb-3">
                      <button onClick={() => setBreakDuration(5)} className={`flex-1 py-1.5 text-sm rounded-lg border transition-colors ${breakDuration === 5 ? 'bg-accent-water/20 border-accent-water text-accent-water font-medium' : 'bg-white/50 border-sage-200 text-sage-600 hover:bg-sage-50'}`}>5m</button>
                      <button onClick={() => setBreakDuration(10)} className={`flex-1 py-1.5 text-sm rounded-lg border transition-colors ${breakDuration === 10 ? 'bg-accent-water/20 border-accent-water text-accent-water font-medium' : 'bg-white/50 border-sage-200 text-sage-600 hover:bg-sage-50'}`}>10m</button>
                      <button onClick={() => setBreakDuration(15)} className={`flex-1 py-1.5 text-sm rounded-lg border transition-colors ${breakDuration === 15 ? 'bg-accent-water/20 border-accent-water text-accent-water font-medium' : 'bg-white/50 border-sage-200 text-sage-600 hover:bg-sage-50'}`}>15m</button>
                    </div>
                    <input 
                      type="number" 
                      value={breakDuration} 
                      onChange={(e) => setBreakDuration(Math.max(1, parseInt(e.target.value) || 5))}
                      className="w-full bg-white/50 border border-sage-200 rounded-xl px-4 py-3 outline-none focus:border-primary text-sage-900 transition-colors"
                    />
                  </div>
                </div>
              ) : (
                history.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-sage-400">
                    <Calendar size={40} className="mb-2 opacity-20" />
                    <p className="text-sm">No sessions recorded yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {history.map((session) => (
                      <div key={session.id} className="glass-panel p-4 rounded-2xl border border-sage-100 shadow-sm flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary-dark shrink-0">
                          <CheckCircle2 size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-sage-900 truncate">{session.task_name || 'Focus Session'}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-bold text-primary-dark bg-primary/10 px-1.5 py-0.5 rounded uppercase">{session.duration}m</span>
                            <span className="text-[10px] text-sage-400">
                              {new Date(session.completed_at).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {new Date(session.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
