import React, { useState, useEffect, useRef } from 'react';
import * as Icons from 'lucide-react';
import { X, Wind, Settings, ArrowLeft, Play, Pause, Plus, Edit2, Trash2, History, Activity } from 'lucide-react';
import { useAppContext, BreathingPattern } from '../AppContext';
import SharedHeader from './SharedHeader';

const MESSAGES = {
  'Inhale': ['Fill your lungs with peace', 'Breathe in the morning light', 'Invite calm into your body'],
  'Hold': ['Savor the stillness', 'Be present in this moment', 'Find your inner center'],
  'Exhale': ['Release all tension', 'Let go of what no longer serves you', 'Exhale slowly and gently'],
  'Hold Out': ['Rest in the emptiness', 'Wait for the next breath', 'Peace is here']
};

export default function BreathStudio({ onBack }: { onBack: () => void }) {
  const { breathingPatterns, setBreathingPatterns, breathingHistory, setBreathingHistory } = useAppContext();
  
  const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Hold Out'>('Inhale');
  const [patternId, setPatternId] = useState<string>('4-7-8');
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'patterns' | 'history'>('patterns');
  const [messageIndex, setMessageIndex] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [overlayIcon, setOverlayIcon] = useState<'play' | 'pause' | null>(null);
  const overlayTimeoutRef = useRef<any>(null);
  
  // New features state
  const [countdown, setCountdown] = useState<number | null>(null);
  const [sessionGoal, setSessionGoal] = useState<{ type: 'duration' | 'cycles' | 'infinite', value: number }>({ type: 'infinite', value: 0 });
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [phaseTimeRemaining, setPhaseTimeRemaining] = useState<number | null>(null);
  
  // Edit Pattern State
  const [editingPattern, setEditingPattern] = useState<BreathingPattern | null>(null);
  
  const pattern = breathingPatterns.find(p => p.id === patternId) || breathingPatterns[0];

  const themeColors = {
    neutral: { inhale: '#8fb2c4', hold: '#a3c4b5', exhale: '#b5c4a3' },
    relaxing: { inhale: '#8b5cf6', hold: '#6366f1', exhale: '#3b82f6' },
    energizing: { inhale: '#f59e0b', hold: '#ef4444', exhale: '#ec4899' }
  };
  const bubbleColors = themeColors[pattern.theme as keyof typeof themeColors] || themeColors.neutral;

  useEffect(() => {
    setMessageIndex(Math.floor(Math.random() * 3));
  }, [phase]);

  // Handle session tracking
  useEffect(() => {
    if (isActive && !sessionStartTime) {
      setSessionStartTime(Date.now());
    } else if (!isActive && sessionStartTime) {
      const duration = Math.floor((Date.now() - sessionStartTime) / 1000);
      if (duration > 10) { // Only save sessions longer than 10 seconds
        setBreathingHistory(prev => [...prev, {
          id: Date.now().toString(),
          date: new Date().toISOString(),
          duration,
          patternId: pattern.id
        }]);
      }
      setSessionStartTime(null);
    }
  }, [isActive]);

  // Save session on unmount if active
  useEffect(() => {
    return () => {
      if (isActive && sessionStartTime) {
        const duration = Math.floor((Date.now() - sessionStartTime) / 1000);
        if (duration > 10) {
          setBreathingHistory(prev => [...prev, {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            duration,
            patternId: pattern.id
          }]);
        }
      }
    };
  }, [isActive, sessionStartTime, pattern.id, setBreathingHistory]);

  const handleToggleActive = () => {
    if (!isActive && countdown === null) {
      setCountdown(3);
      setOverlayIcon('play');
      if (overlayTimeoutRef.current) clearTimeout(overlayTimeoutRef.current);
      overlayTimeoutRef.current = setTimeout(() => setOverlayIcon(null), 1000);
    } else if (isActive || countdown !== null) {
      setIsActive(false);
      setCountdown(null);
      setOverlayIcon('pause');
      if (overlayTimeoutRef.current) clearTimeout(overlayTimeoutRef.current);
      overlayTimeoutRef.current = setTimeout(() => setOverlayIcon(null), 1000);
    }
  };

  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCountdown(null);
      setIsActive(true);
      setCyclesCompleted(0);
      if (sessionGoal.type === 'duration') {
        setTimeRemaining(sessionGoal.value * 60);
      }
    }
  }, [countdown, sessionGoal]);

  useEffect(() => {
    if (!isActive || sessionGoal.type !== 'duration' || timeRemaining === null) return;
    if (timeRemaining <= 0) {
      setIsActive(false);
      return;
    }
    const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000);
    return () => clearTimeout(timer);
  }, [isActive, timeRemaining, sessionGoal]);

  useEffect(() => {
    if (isActive && sessionGoal.type === 'cycles' && cyclesCompleted >= sessionGoal.value) {
      setIsActive(false);
    }
  }, [cyclesCompleted, isActive, sessionGoal]);

  useEffect(() => {
    if (!isActive) {
      setPhaseTimeRemaining(null);
      return;
    }

    let duration = 0;
    if (phase === 'Inhale') duration = pattern.inhale;
    else if (phase === 'Hold') duration = pattern.hold1;
    else if (phase === 'Exhale') duration = pattern.exhale;
    else if (phase === 'Hold Out') duration = pattern.hold2;

    setPhaseTimeRemaining(duration);

    const interval = setInterval(() => {
      setPhaseTimeRemaining(prev => {
        if (prev === null || prev <= 1) return prev;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, isActive, pattern]);

  useEffect(() => {
    if (!isActive) {
      setPhase('Inhale');
      return;
    }

    let timeoutId: any;
    let isCancelled = false;

    const runCycle = () => {
      if (isCancelled) return;
      
      setPhase('Inhale');
      timeoutId = setTimeout(() => {
        if (isCancelled) return;
        
        if (pattern.hold1 > 0) {
          setPhase('Hold');
          timeoutId = setTimeout(() => {
            if (isCancelled) return;
            setPhase('Exhale');
            timeoutId = setTimeout(() => {
              if (isCancelled) return;
              if (pattern.hold2 > 0) {
                setPhase('Hold Out');
                timeoutId = setTimeout(() => {
                  setCyclesCompleted(c => c + 1);
                  runCycle();
                }, pattern.hold2 * 1000);
              } else {
                setCyclesCompleted(c => c + 1);
                runCycle();
              }
            }, pattern.exhale * 1000);
          }, pattern.hold1 * 1000);
        } else {
          setPhase('Exhale');
          timeoutId = setTimeout(() => {
            if (isCancelled) return;
            if (pattern.hold2 > 0) {
              setPhase('Hold Out');
              timeoutId = setTimeout(() => {
                setCyclesCompleted(c => c + 1);
                runCycle();
              }, pattern.hold2 * 1000);
            } else {
              setCyclesCompleted(c => c + 1);
              runCycle();
            }
          }, pattern.exhale * 1000);
        }
      }, pattern.inhale * 1000);
    };
    
    runCycle();
    
    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [pattern, isActive]);

  const handleSavePattern = () => {
    if (!editingPattern) return;
    
    if (editingPattern.id.startsWith('custom-')) {
      // Update existing custom pattern
      setBreathingPatterns(prev => prev.map(p => p.id === editingPattern.id ? editingPattern : p));
    } else if (editingPattern.isCustom) {
      // Create new custom pattern
      setBreathingPatterns(prev => [...prev, { ...editingPattern, id: `custom-${Date.now()}` }]);
      setPatternId(`custom-${Date.now()}`);
    } else {
      // Modifying a built-in pattern creates a custom copy
      const newCustomPattern = { ...editingPattern, id: `custom-${Date.now()}`, isCustom: true, name: `${editingPattern.name} (Custom)` };
      setBreathingPatterns(prev => [...prev, newCustomPattern]);
      setPatternId(newCustomPattern.id);
    }
    setEditingPattern(null);
  };

  const handleDeletePattern = (id: string) => {
    setBreathingPatterns(prev => prev.filter(p => p.id !== id));
    if (patternId === id) {
      setPatternId('4-7-8');
    }
  };

  const totalMeditationTime = breathingHistory.reduce((acc, session) => acc + session.duration, 0);
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  return (
    <div className={`flex flex-col h-full w-full p-0 transition-colors duration-700 relative overflow-hidden ${showSettings ? 'bg-background-light' : 'bg-[#fdf8f5]'}`}>
      
      {/* Unified Background & Particles */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className={`absolute inset-0 transition-all duration-[3000ms] ease-in-out opacity-40
          ${showSettings ? 'bg-gradient-to-b from-[#EBF2EB] to-transparent' : 
            phase === 'Inhale' ? 'bg-gradient-to-br from-blue-100 via-emerald-50 to-peach-50' : 
            phase === 'Hold' ? 'bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50' : 
            phase === 'Exhale' ? 'bg-gradient-to-br from-peach-50 via-rose-50 to-blue-50' : 
            'bg-gradient-to-br from-slate-100 via-blue-50 to-emerald-50'}
        `}></div>
        
        {!showSettings && (
          <>
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white/40 rounded-full blur-3xl animate-float opacity-60"></div>
            <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-primary/10 rounded-full blur-3xl animate-float opacity-40" style={{animationDelay: '-2s'}}></div>
            <div className="absolute top-1/2 right-1/3 w-24 h-24 bg-accent-water/10 rounded-full blur-2xl animate-float opacity-30" style={{animationDelay: '-4s'}}></div>
          </>
        )}
        {showSettings && (
          <div className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[40%] bg-accent-clay/10 rounded-full blur-3xl transition-colors duration-300"></div>
        )}
      </div>

      <SharedHeader 
        title={showSettings ? "Settings" : "Breath Studio"} 
        onBack={showSettings ? () => { setShowSettings(false); setEditingPattern(null); } : onBack} 
        currentView="breathe"
        icon={Wind} 
        actions={
          <button onClick={() => { setShowSettings(!showSettings); setEditingPattern(null); }} className={`size-10 flex items-center justify-center rounded-xl transition-all ${showSettings ? 'bg-primary text-forest-deep' : 'bg-white/50 hover:bg-primary/20'}`}>
            {showSettings ? <X size={20} /> : <Settings size={20} />}
          </button>
        }
      />

      {showSettings ? (
        <div className="relative z-10 flex-1 overflow-y-auto custom-scrollbar pr-2 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500 mt-2 px-6">
          
          {/* Tabs */}
          {!editingPattern && (
            <div className="flex bg-sage-100/50 p-1 rounded-2xl mb-6 shrink-0">
              <button
                onClick={() => setSettingsTab('patterns')}
                className={`flex-1 py-2 text-sm font-medium rounded-xl transition-all ${settingsTab === 'patterns' ? 'bg-white text-sage-800 shadow-sm' : 'text-sage-500 hover:text-sage-700'}`}
              >
                Patterns
              </button>
              <button
                onClick={() => setSettingsTab('history')}
                className={`flex-1 py-2 text-sm font-medium rounded-xl transition-all ${settingsTab === 'history' ? 'bg-white text-sage-800 shadow-sm' : 'text-sage-500 hover:text-sage-700'}`}
              >
                History
              </button>
            </div>
          )}

          {editingPattern ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-sage-800">{editingPattern.id.startsWith('custom-') ? 'Edit Pattern' : 'Customize Pattern'}</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-sage-500 uppercase tracking-wider mb-2">Pattern Name</label>
                  <input 
                    type="text" 
                    value={editingPattern.name}
                    onChange={(e) => setEditingPattern({...editingPattern, name: e.target.value})}
                    className="w-full bg-white border border-sage-200 rounded-xl px-4 py-3 text-sage-800 focus:outline-none focus:border-accent-water focus:ring-1 focus:ring-accent-water transition-all"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-sage-500 uppercase tracking-wider mb-2">Inhale (s)</label>
                    <input 
                      type="number" min="1" max="20" step="0.5"
                      value={editingPattern.inhale}
                      onChange={(e) => setEditingPattern({...editingPattern, inhale: parseFloat(e.target.value) || 0})}
                      className="w-full bg-white border border-sage-200 rounded-xl px-4 py-3 text-sage-800 focus:outline-none focus:border-accent-water focus:ring-1 focus:ring-accent-water transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-sage-500 uppercase tracking-wider mb-2">Hold (s)</label>
                    <input 
                      type="number" min="0" max="20" step="0.5"
                      value={editingPattern.hold1}
                      onChange={(e) => setEditingPattern({...editingPattern, hold1: parseFloat(e.target.value) || 0})}
                      className="w-full bg-white border border-sage-200 rounded-xl px-4 py-3 text-sage-800 focus:outline-none focus:border-accent-water focus:ring-1 focus:ring-accent-water transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-sage-500 uppercase tracking-wider mb-2">Exhale (s)</label>
                    <input 
                      type="number" min="1" max="20" step="0.5"
                      value={editingPattern.exhale}
                      onChange={(e) => setEditingPattern({...editingPattern, exhale: parseFloat(e.target.value) || 0})}
                      className="w-full bg-white border border-sage-200 rounded-xl px-4 py-3 text-sage-800 focus:outline-none focus:border-accent-water focus:ring-1 focus:ring-accent-water transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-sage-500 uppercase tracking-wider mb-2">Hold Out (s)</label>
                    <input 
                      type="number" min="0" max="20" step="0.5"
                      value={editingPattern.hold2}
                      onChange={(e) => setEditingPattern({...editingPattern, hold2: parseFloat(e.target.value) || 0})}
                      className="w-full bg-white border border-sage-200 rounded-xl px-4 py-3 text-sage-800 focus:outline-none focus:border-accent-water focus:ring-1 focus:ring-accent-water transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-sage-500 uppercase tracking-wider mb-2">Theme</label>
                  <select 
                    value={editingPattern.theme || 'neutral'}
                    onChange={(e) => setEditingPattern({...editingPattern, theme: e.target.value as any})}
                    className="w-full bg-white border border-sage-200 rounded-xl px-4 py-3 text-sage-800 focus:outline-none focus:border-accent-water focus:ring-1 focus:ring-accent-water transition-all appearance-none cursor-pointer"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: `right 0.75rem center`,
                      backgroundRepeat: `no-repeat`,
                      backgroundSize: `1.5em 1.5em`,
                      paddingRight: `2.5rem`
                    }}
                  >
                    <option value="neutral">Neutral (Green/Blue)</option>
                    <option value="relaxing">Relaxing (Cool Colors)</option>
                    <option value="energizing">Energizing (Warm Colors)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setEditingPattern(null)}
                  className="flex-1 py-3 rounded-xl border border-sage-200 text-sage-600 font-medium hover:bg-sage-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSavePattern}
                  className="flex-1 py-3 rounded-xl bg-accent-water text-white font-medium hover:bg-[#8fb2c4] transition-colors shadow-sm"
                >
                  Save Pattern
                </button>
              </div>
            </div>
          ) : settingsTab === 'patterns' ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-xs font-bold text-sage-400 uppercase tracking-widest">Breathing Patterns</h2>
                <button 
                  onClick={() => setEditingPattern({ id: '', name: 'New Pattern', description: 'Custom breathing pattern', inhale: 4, hold1: 4, exhale: 4, hold2: 4, icon: 'Wind', isCustom: true })}
                  className="text-xs font-bold text-accent-water uppercase tracking-widest flex items-center gap-1 hover:text-[#8fb2c4] transition-colors"
                >
                  <Plus size={14} /> Create
                </button>
              </div>
              <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-6 custom-scrollbar -mx-2 px-2">
                {breathingPatterns.map((p) => {
                  const Icon = (Icons as any)[p.icon] || Wind;
                  return (
                    <div key={p.id} className={`shrink-0 w-64 text-left p-5 rounded-[2rem] border transition-all flex flex-col gap-4 snap-center ${patternId === p.id ? 'bg-accent-water/20 border-accent-water shadow-sm' : 'glass-panel border-sage-200 hover:border-accent-water/50 hover:shadow-sm'}`}>
                      <button 
                        onClick={() => { setPatternId(p.id); setShowSettings(false); }}
                        className="flex flex-col gap-3 text-left w-full"
                      >
                        <div className={`p-3 rounded-2xl transition-colors w-fit ${patternId === p.id ? 'bg-accent-water/30 text-accent-water' : 'bg-sage-100 text-sage-500'}`}>
                          <Icon size={24} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-sage-900">{p.name}</h3>
                          <p className="text-sm text-sage-600 mt-0.5 mb-2 line-clamp-2">{p.description}</p>
                          <p className="text-[10px] font-mono font-bold text-sage-500 uppercase tracking-wider">
                            {p.inhale}s in {p.hold1 > 0 ? `· ${p.hold1}s hold ` : ''}· {p.exhale}s out{p.hold2 > 0 ? ` · ${p.hold2}s hold` : ''}
                          </p>
                        </div>
                      </button>
                      <div className="flex items-center gap-2 mt-auto pt-3 border-t border-sage-200/50">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setEditingPattern(p); }}
                          className="flex-1 flex items-center justify-center gap-1.5 p-2 text-xs font-bold text-sage-500 hover:text-accent-water hover:bg-accent-water/10 rounded-xl transition-colors uppercase tracking-wider"
                        >
                          <Edit2 size={14} /> Edit
                        </button>
                        {p.isCustom && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDeletePattern(p.id); }}
                            className="p-2 text-sage-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="px-2">
                <h2 className="text-xs font-bold text-sage-400 uppercase tracking-widest mb-4">Session History</h2>
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="glass-panel p-5 rounded-[2rem] border border-sage-200 flex flex-col items-center justify-center text-center">
                    <Activity className="text-accent-water mb-2" size={28} />
                    <span className="text-3xl font-serif font-bold text-sage-800">{breathingHistory.length}</span>
                    <span className="text-xs font-bold text-sage-500 uppercase tracking-wider mt-1">Total Sessions</span>
                  </div>
                  <div className="glass-panel p-5 rounded-[2rem] border border-sage-200 flex flex-col items-center justify-center text-center">
                    <History className="text-accent-clay mb-2" size={28} />
                    <span className="text-3xl font-serif font-bold text-sage-800">{formatTime(totalMeditationTime)}</span>
                    <span className="text-xs font-bold text-sage-500 uppercase tracking-wider mt-1">Mindful Time</span>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-sage-700 mb-4">Recent Sessions</h3>
                {breathingHistory.length === 0 ? (
                  <p className="text-sage-500 text-sm text-center py-8">No sessions recorded yet. Start breathing to track your progress!</p>
                ) : (
                  <div className="space-y-3">
                    {[...breathingHistory].reverse().slice(0, 10).map(session => {
                      const sessionPattern = breathingPatterns.find(p => p.id === session.patternId);
                      const Icon = sessionPattern ? (Icons as any)[sessionPattern.icon] || Wind : Wind;
                      return (
                        <div key={session.id} className="flex items-center justify-between p-4 glass-panel rounded-2xl border border-sage-200">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-sage-100 text-sage-500 rounded-xl">
                              <Icon size={18} />
                            </div>
                            <div>
                              <p className="font-bold text-sage-800 text-sm">{sessionPattern?.name || 'Unknown Pattern'}</p>
                              <p className="text-xs text-sage-500">{new Date(session.date).toLocaleDateString()} at {new Date(session.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold text-sage-700">{Math.floor(session.duration / 60)}m {session.duration % 60}s</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          <style>{`
            @keyframes wave-out {
              0% { transform: scale(0.8); opacity: 0.4; }
              100% { transform: scale(4.5); opacity: 0; }
            }
            .animate-wave-1 {
              animation: wave-out 8s cubic-bezier(0.33, 1, 0.68, 1) infinite;
            }
            .animate-wave-2 {
              animation: wave-out 8s cubic-bezier(0.33, 1, 0.68, 1) infinite;
              animation-delay: 2s;
            }
            .animate-wave-3 {
              animation: wave-out 8s cubic-bezier(0.33, 1, 0.68, 1) infinite;
              animation-delay: 4s;
            }
            .animate-wave-4 {
              animation: wave-out 8s cubic-bezier(0.33, 1, 0.68, 1) infinite;
              animation-delay: 6s;
            }
          `}</style>
          <main className="relative z-10 flex-1 flex flex-col items-center justify-center overflow-hidden animate-in fade-in zoom-in-95 duration-1000">
            <div className="absolute top-4 md:top-8 text-center z-40 pointer-events-none px-4 w-full h-20 flex flex-col items-center justify-center">
              {/* Pattern Info */}
              <div className={`absolute w-full transition-all duration-700 ease-in-out ${isActive ? 'opacity-0 -translate-y-4 pointer-events-none' : 'opacity-60 translate-y-0'}`}>
                <h2 className="text-2xl font-bold text-sage-800 mb-1">{pattern.name}</h2>
                <p className="text-sage-500 text-sm font-medium max-w-xs mx-auto">{pattern.description}</p>
              </div>
              
              {/* Instruction Text */}
              <div className={`absolute w-full flex items-center justify-center transition-all duration-700 ease-in-out ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                <div className="relative h-12 w-full flex items-center justify-center">
                  <h2 className={`absolute text-3xl md:text-4xl font-serif font-bold text-sage-800 tracking-widest drop-shadow-sm transition-all duration-700 ease-in-out ${phase === 'Inhale' ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2'}`}>
                    Breathe in
                  </h2>
                  <h2 className={`absolute text-3xl md:text-4xl font-serif font-bold text-sage-800 tracking-widest drop-shadow-sm transition-all duration-700 ease-in-out ${phase === 'Hold' || phase === 'Hold Out' ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2'}`}>
                    Hold
                  </h2>
                  <h2 className={`absolute text-3xl md:text-4xl font-serif font-bold text-sage-800 tracking-widest drop-shadow-sm transition-all duration-700 ease-in-out ${phase === 'Exhale' ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2'}`}>
                    Breathe out
                  </h2>
                </div>
              </div>
            </div>

            {!isActive && countdown === null && (
              <div className="absolute top-24 md:top-32 z-40 flex flex-col items-center gap-2">
                <select 
                  value={`${sessionGoal.type}-${sessionGoal.value}`}
                  onChange={(e) => {
                    const [type, val] = e.target.value.split('-');
                    setSessionGoal({ type: type as any, value: parseInt(val) });
                  }}
                  className="bg-white/80 backdrop-blur-md border border-sage-200/50 text-sage-800 text-sm font-medium rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent-water/50 cursor-pointer hover:bg-white transition-all shadow-sm appearance-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%234b5563' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: `right 0.5rem center`,
                    backgroundRepeat: `no-repeat`,
                    backgroundSize: `1.5em 1.5em`,
                    paddingRight: `2.5rem`
                  }}
                >
                  <option value="infinite-0">Infinite Session</option>
                  <option value="duration-1">1 Minute</option>
                  <option value="duration-3">3 Minutes</option>
                  <option value="duration-5">5 Minutes</option>
                  <option value="cycles-5">5 Breaths</option>
                  <option value="cycles-10">10 Breaths</option>
                </select>
              </div>
            )}

            <div 
              className="relative w-full flex-1 flex items-center justify-center cursor-pointer group mt-16 md:mt-24"
              onClick={handleToggleActive}
            >
              {/* Continuous Waves when Active */}
              {isActive && (
                <>
                  <div className="absolute w-[25vmin] h-[25vmin] max-w-[160px] max-h-[160px] min-w-[120px] min-h-[120px] rounded-full bg-white/30 z-0 animate-wave-1 pointer-events-none"></div>
                  <div className="absolute w-[25vmin] h-[25vmin] max-w-[160px] max-h-[160px] min-w-[120px] min-h-[120px] rounded-full bg-white/30 z-0 animate-wave-2 pointer-events-none"></div>
                  <div className="absolute w-[25vmin] h-[25vmin] max-w-[160px] max-h-[160px] min-w-[120px] min-h-[120px] rounded-full bg-white/30 z-0 animate-wave-3 pointer-events-none"></div>
                  <div className="absolute w-[25vmin] h-[25vmin] max-w-[160px] max-h-[160px] min-w-[120px] min-h-[120px] rounded-full bg-white/30 z-0 animate-wave-4 pointer-events-none"></div>
                </>
              )}

              {/* Visualizer Rings */}
              <div className={`absolute w-[65vmin] h-[65vmin] max-w-[450px] max-h-[450px] rounded-full border border-accent-clay/10 transition-all ease-in-out
                ${phase === 'Inhale' ? 'scale-110 opacity-0' : phase === 'Hold' ? 'scale-110 opacity-0' : 'scale-75 opacity-10'}
              `}
              style={{ transitionDuration: phase === 'Inhale' ? `${pattern.inhale}s` : phase === 'Hold' ? `${pattern.hold1}s` : phase === 'Exhale' ? `${pattern.exhale}s` : `${pattern.hold2}s` }}></div>
              <div className={`absolute w-[75vmin] h-[75vmin] max-w-[550px] max-h-[550px] rounded-full border border-primary/5 transition-all ease-in-out
                ${phase === 'Inhale' ? 'scale-100 opacity-20' : phase === 'Hold' ? 'scale-100 opacity-20' : 'scale-75 opacity-0'}
              `}
              style={{ transitionDuration: phase === 'Inhale' ? `${pattern.inhale}s` : phase === 'Hold' ? `${pattern.hold1}s` : phase === 'Exhale' ? `${pattern.exhale}s` : `${pattern.hold2}s` }}></div>
              
              <div className="relative flex items-center justify-center animate-float">
                <div className={`w-[25vmin] h-[25vmin] max-w-[160px] max-h-[160px] min-w-[120px] min-h-[120px] rounded-full flex items-center justify-center relative z-20 transition-all ease-in-out shadow-2xl
                  ${!isActive ? 'scale-100 opacity-80' : phase === 'Inhale' ? 'scale-[1.8] opacity-100' : phase === 'Hold' ? 'scale-[1.8] opacity-100' : phase === 'Exhale' ? 'scale-100 opacity-80' : 'scale-100 opacity-80'}
                `}
                style={{
                  transitionDuration: !isActive ? '1s' : phase === 'Inhale' ? `${pattern.inhale}s` : phase === 'Hold' ? `${pattern.hold1}s` : phase === 'Exhale' ? `${pattern.exhale}s` : `${pattern.hold2}s`,
                  backgroundColor: !isActive ? '#9CA3AF' :
                                   phase === 'Inhale' ? bubbleColors.inhale : 
                                   phase === 'Hold' ? bubbleColors.hold :
                                   phase === 'Exhale' ? bubbleColors.exhale :
                                   bubbleColors.hold,
                  backgroundImage: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.6), rgba(255,255,255,0) 70%)',
                  boxShadow: !isActive ? '0 0 40px -10px rgba(156, 163, 175, 0.5)' :
                             phase === 'Inhale' ? `0 0 80px -10px ${bubbleColors.inhale}` : 
                             phase === 'Hold' ? `0 0 80px -10px ${bubbleColors.hold}` :
                             phase === 'Exhale' ? `0 0 80px -10px ${bubbleColors.exhale}` :
                             `0 0 80px -10px ${bubbleColors.hold}`
                }}>
                  {/* Bubble Reflection */}
                  <div className="absolute top-[15%] left-[20%] w-[25%] h-[15%] bg-white/60 rounded-full -rotate-45 blur-[2px]"></div>
                  <div className="absolute bottom-[20%] right-[20%] w-[10%] h-[10%] bg-white/30 rounded-full blur-[1px]"></div>
                </div>

                {/* Phase Text inside bubble - Sibling to bubble so it doesn't scale */}
                <div 
                  className={`absolute inset-0 z-30 flex items-center justify-center pointer-events-none transition-opacity duration-700 ${isActive && !overlayIcon ? 'opacity-100' : 'opacity-0'}`}
                >
                  {phaseTimeRemaining !== null && (
                    <span 
                      key={phaseTimeRemaining}
                      className="text-white/90 font-serif text-5xl md:text-6xl font-bold drop-shadow-md text-center animate-in fade-in zoom-in-95 duration-300"
                    >
                      {phaseTimeRemaining}
                    </span>
                  )}
                </div>

                {/* Hold Visual: Rotating ring */}
                <div className={`absolute w-[28vmin] h-[28vmin] max-w-[180px] max-h-[180px] min-w-[130px] min-h-[130px] border-t-2 border-r-2 border-white/60 rounded-full z-10 transition-opacity duration-500 ${isActive && (phase === 'Hold' || phase === 'Hold Out') ? 'opacity-100 animate-spin' : 'opacity-0'}`} style={{ animationDuration: '3s' }}></div>

                {/* Outer Rings */}
                <div className={`absolute w-[30vmin] h-[30vmin] max-w-[200px] max-h-[200px] min-w-[140px] min-h-[140px] border-2 border-white/40 rounded-full z-10 transition-all ease-in-out ${!isActive ? 'scale-100 opacity-0' : phase === 'Inhale' ? 'scale-[2] opacity-50' : phase === 'Hold' ? 'scale-[2] opacity-50' : 'scale-100 opacity-100'}`}
                     style={{ transitionDuration: !isActive ? '1s' : phase === 'Inhale' ? `${pattern.inhale}s` : phase === 'Hold' ? `${pattern.hold1}s` : phase === 'Exhale' ? `${pattern.exhale}s` : `${pattern.hold2}s` }}></div>
                <div className={`absolute w-[40vmin] h-[40vmin] max-w-[260px] max-h-[260px] min-w-[180px] min-h-[180px] border border-white/30 rounded-full border-dashed z-0 transition-all ease-in-out ${!isActive ? 'scale-100 opacity-0' : phase === 'Inhale' ? 'scale-[1.6] rotate-90 opacity-30' : phase === 'Hold' ? 'scale-[1.6] rotate-90 opacity-30' : 'scale-100 rotate-0 opacity-80'}`}
                     style={{ transitionDuration: !isActive ? '1s' : phase === 'Inhale' ? `${pattern.inhale}s` : phase === 'Hold' ? `${pattern.hold1}s` : phase === 'Exhale' ? `${pattern.exhale}s` : `${pattern.hold2}s` }}></div>
                
                {/* Play/Pause Overlay */}
                <div className={`absolute z-30 flex items-center justify-center transition-all duration-500 pointer-events-none
                  ${overlayIcon || countdown !== null ? 'opacity-100 scale-100' : 'opacity-0 scale-150'}
                `}>
                  <div className="w-24 h-24 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white shadow-2xl">
                    {countdown !== null ? (
                      <span className="text-4xl font-bold">{countdown > 0 ? countdown : 'Go'}</span>
                    ) : overlayIcon === 'play' ? (
                      <Play size={48} className="fill-current ml-2" />
                    ) : (
                      <Pause size={48} className="fill-current" />
                    )}
                  </div>
                </div>

                {/* Subtle Play Hint */}
                {!isActive && countdown === null && !overlayIcon && (
                  <div className="absolute z-30 flex items-center justify-center pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                    <Play size={56} className="text-white fill-white/20 ml-2" />
                  </div>
                )}
              </div>
            </div>
          </main>
        </>
      )}
    </div>
  );
}
