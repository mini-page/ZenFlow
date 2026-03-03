import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Square, Pause, Play, RotateCcw, Edit3, X, Timer, History, Calendar, CheckCircle2, Settings, SkipForward, ChevronDown } from 'lucide-react';
import { useAppContext } from '../AppContext';
import SharedHeader from './SharedHeader';
import { formatTime } from '../utils/format';
import { FocusSession } from '../utils/types';

export default function FocusMode({ onBack }: { onBack: () => void }) {
  const {
    focusDuration, setFocusDuration,
    breakDuration, setBreakDuration,
    isBreak, setIsBreak,
    timeLeft, setTimeLeft,
    isActive, setIsActive,
    sessionCompleted, setSessionCompleted,
    task, setTask,
    toggleTimer, resetTimer,
    tasks, setTasks
  } = useAppContext();

  const [showModal, setShowModal] = useState(false);
  const [modalTab, setModalTab] = useState<'settings' | 'history'>('settings');
  const [history, setHistory] = useState<FocusSession[]>([]);
  const [overlayIcon, setOverlayIcon] = useState<'play' | 'pause' | 'stop' | 'check' | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [completedCycles, setCompletedCycles] = useState<number>(0);
  const [showTaskDropdown, setShowTaskDropdown] = useState(false);
  const [showTaskCompletionPrompt, setShowTaskCompletionPrompt] = useState(false);
  const overlayTimeoutRef = useRef<any>(null);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }, []);

  const triggerNotification = (title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/icon-192.png' });
    }
  };

  useEffect(() => {
    if (sessionCompleted) {
      if (isBreak) {
        // A focus session just ended, we are now in break
        setCompletedCycles(prev => prev + 1);
        setShowCelebration(true);
        setOverlayIcon('check');
        triggerNotification('Focus Session Complete!', `Time for a ${breakDuration} minute break.`);
        
        // Check if the current task exists in the tasks list and is not completed
        const linkedTask = tasks.find(t => t.text.toLowerCase() === task.toLowerCase() && !t.completed);
        if (linkedTask) {
          setShowTaskCompletionPrompt(true);
        }

        if (overlayTimeoutRef.current) clearTimeout(overlayTimeoutRef.current);
        overlayTimeoutRef.current = setTimeout(() => {
          setOverlayIcon(null);
          setShowCelebration(false);
        }, 3000);
        
        // Save session locally and attempt backend sync
        const newSession: FocusSession = {
          id: Date.now(),
          duration: focusDuration,
          task_name: task,
          completed_at: new Date().toISOString()
        };
        const cached = JSON.parse(localStorage.getItem('zenflow_sessions_cache') || '[]');
        const updated = [newSession, ...cached].slice(0, 50);
        localStorage.setItem('zenflow_sessions_cache', JSON.stringify(updated));
        setHistory(updated);

        fetch('/api/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ duration: focusDuration, task_name: task })
        }).then(() => fetchHistory()).catch(() => {});
      } else {
        // A break just ended, back to focus
        triggerNotification('Break Over!', 'Time to get back to focus.');
      }
      setSessionCompleted(false);
    }
  }, [sessionCompleted, isBreak, tasks, task, breakDuration, focusDuration]);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/sessions');
      if (!res.ok) throw new Error('API unavailable');
      const data = await res.json();
      setHistory(data);
      localStorage.setItem('zenflow_sessions_cache', JSON.stringify(data));
    } catch (e) {
      // Fallback to cached sessions
      const cached = localStorage.getItem('zenflow_sessions_cache');
      if (cached) setHistory(JSON.parse(cached));
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  const totalTime = (isBreak ? breakDuration : focusDuration) * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 289;

  const handleToggleActive = () => {
    const wasActive = isActive;
    toggleTimer();
    setOverlayIcon(!wasActive ? 'play' : 'pause');
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

  const markTaskCompleted = () => {
    setTasks(tasks.map(t => t.text.toLowerCase() === task.toLowerCase() ? { ...t, completed: true } : t));
    setShowTaskCompletionPrompt(false);
  };

  const uncompletedTasks = tasks.filter(t => !t.completed);

  return (
    <div className="flex flex-col h-full w-full p-0 bg-background-light text-sage-900 transition-colors duration-1000 relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className={`absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] transition-all duration-1000 ease-in-out ${isBreak ? 'bg-blue-400/20' : 'bg-primary/20'}`}></div>
        <div className={`absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] rounded-full blur-[100px] transition-all duration-1000 ease-in-out ${isBreak ? 'bg-sky-200/30' : 'bg-accent-clay/10'}`}></div>
      </div>

      <SharedHeader 
        title="Focus Mode" onBack={onBack} icon={Timer} iconColor={isBreak ? "text-blue-400" : "text-rose-500"}
        currentView="focus"
        actions={
          <div className="flex gap-2">
            <button onClick={() => { setShowModal(true); setModalTab('history'); }} className="flex size-10 items-center justify-center rounded-xl bg-white/50 text-sage-600 hover:bg-primary/20 transition-all shadow-sm" title="History">
              <History size={20} />
            </button>
            <button onClick={() => { setShowModal(true); setModalTab('settings'); }} className="flex h-10 px-4 items-center gap-2 rounded-xl bg-primary text-forest-deep hover:bg-primary-dark transition-all shadow-sm font-bold text-xs">
              <Settings size={18} />
              <span>Configure Timer</span>
            </button>
          </div>
        }
      />

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center w-full overflow-hidden py-4 animate-in fade-in zoom-in-95 duration-1000 p-4">
        <div className="absolute top-4 md:top-8 text-center z-40 w-full h-24 flex flex-col items-center justify-center px-6">
          <div className={`w-full max-w-[400px] transition-all duration-700 ease-in-out ${isActive ? 'opacity-0 -translate-y-4 pointer-events-none' : 'opacity-100 translate-y-0'}`}>
            <div className="relative group">
              <input 
                type="text" 
                value={task} 
                onChange={(e) => setTask(e.target.value)} 
                onFocus={() => setShowTaskDropdown(true)}
                onBlur={() => setTimeout(() => setShowTaskDropdown(false), 200)}
                className="w-full bg-white/20 backdrop-blur-sm border-b border-white/40 hover:border-primary/40 focus:border-primary/60 text-center text-sage-800 font-serif font-bold text-xl md:text-2xl outline-none placeholder:text-sage-500/40 transition-all py-2 pr-8" 
                placeholder="What is your motive?" 
              />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 text-sage-400 cursor-pointer" onClick={() => setShowTaskDropdown(!showTaskDropdown)}><ChevronDown size={20} /></div>
              
              {showTaskDropdown && uncompletedTasks.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-sage-100 py-2 z-50 text-left">
                  {uncompletedTasks.map(t => (
                    <div 
                      key={t.id} 
                      className="px-4 py-2 hover:bg-primary/10 cursor-pointer text-sage-700 text-sm truncate"
                      onClick={() => { setTask(t.text); setShowTaskDropdown(false); }}
                    >
                      {t.text}
                    </div>
                  ))}
                </div>
              )}
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

      {/* Task Completion Prompt Modal */}
      {showTaskCompletionPrompt && (
        <div className="absolute inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 p-8 text-center">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-dark">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-sage-900 mb-2">Great Focus!</h3>
            <p className="text-sage-600 text-sm mb-6">Did you complete "{task}" during this session?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowTaskCompletionPrompt(false)} className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition-colors">Not Yet</button>
              <button onClick={markTaskCompleted} className="flex-1 py-3 rounded-xl bg-primary text-forest-deep font-bold hover:bg-primary-dark transition-colors">Yes, Done!</button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="absolute inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
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
                    <div className="flex items-center gap-4">
                      <input 
                        type="range" min="1" max="120" 
                        value={focusDuration} 
                        onChange={(e) => setFocusDuration(parseInt(e.target.value))}
                        className="flex-1 accent-primary" 
                      />
                      <span className="w-12 text-right font-bold text-sage-900">{focusDuration}m</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-sage-700 mb-2">Break Duration (minutes)</label>
                    <div className="flex items-center gap-4">
                      <input 
                        type="range" min="1" max="30" 
                        value={breakDuration} 
                        onChange={(e) => setBreakDuration(parseInt(e.target.value))}
                        className="flex-1 accent-blue-400" 
                      />
                      <span className="w-12 text-right font-bold text-sage-900">{breakDuration}m</span>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-sage-100">
                    <p className="text-[10px] text-sage-400 uppercase font-black tracking-widest mb-4 text-center">Quick Presets</p>
                    <div className="grid grid-cols-3 gap-2">
                      {[15, 25, 45].map(m => (
                        <button key={m} onClick={() => setFocusDuration(m)} className={`py-2 rounded-xl text-xs font-bold transition-all ${focusDuration === m ? 'bg-primary text-forest-deep' : 'bg-sage-50 text-sage-500 hover:bg-sage-100'}`}>{m}m</button>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => setShowModal(false)} className="w-full py-4 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all">Apply Settings</button>
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
