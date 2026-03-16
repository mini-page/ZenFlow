import React, { useState, useEffect } from 'react';
import { Settings, Timer, Droplets, CheckCircle2, Wind, ListTodo, Music, Activity, Edit2, Check, Quote, Plus, Trash2, ChevronRight, Zap, X, Play, Pause, Sun, Moon, CloudSun, Coffee, CupSoda, Maximize2, Minimize2, Accessibility, BarChart3, RotateCcw } from 'lucide-react';
import { View } from '../App';
import { useAppContext } from '../AppContext';
import SharedHeader from './SharedHeader';

interface Affirmation {
  id: number;
  text: string;
  is_custom: number;
}

interface FocusSession {
  id: number;
  duration: number;
  task_name: string;
  completed_at: string;
}

interface Props {
  onNavigate: (view: View) => void;
}

export default function Dashboard({ onNavigate }: Props) {
  const { 
    isActive, timeLeft, isBreak, task, toggleTimer,
    tasks,
    playing, sounds, setPlaying,
    water, hydrationGoal
  } = useAppContext();

  // 1. Initialize ALL states at the top
  const [userName, setUserName] = useState(() => localStorage.getItem('zenflow_username') || 'Alex');
  const [isEditingName, setIsEditingName] = useState(false);
  const [affirmations, setAffirmations] = useState<Affirmation[]>([]);
  const [currentAffirmationIndex, setCurrentAffirmationIndex] = useState(0);
  const [showAffirmationModal, setShowAffirmationModal] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [newAffirmation, setNewAffirmation] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [weather, setWeather] = useState<{ condition: string; temp: number }>({ condition: 'clear', temp: 72 });
  const [streak, setStreak] = useState(0);

  // 2. Effects
  useEffect(() => {
    localStorage.setItem('zenflow_username', userName);
  }, [userName]);

  useEffect(() => {
    fetchAffirmations();
    fetchSessions();
  }, []);

  useEffect(() => {
    // Determine streak (consecutive sessions today)
    if (!sessions || sessions.length === 0) {
      setStreak(0);
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    const todaysSessions = sessions.filter(s => s.completed_at && s.completed_at.startsWith(today)).length;
    setStreak(todaysSessions);

    const fetchWeather = async () => {
      try {
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(async (pos) => {
            const { latitude, longitude } = pos.coords;
            const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
            const data = await res.json();
            const code = data.current_weather?.weathercode || 0;
            let condition = 'clear';
            if (code >= 51 && code <= 67) condition = 'rain';
            else if (code >= 71 && code <= 86) condition = 'snow';
            else if (code >= 1 && code <= 3) condition = 'cloudy';
            
            setWeather({ condition, temp: Math.round(data.current_weather?.temperature || 72) });
          }, () => {});
        }
      } catch (e) { console.error('Weather fetch failed', e); }
    };
    fetchWeather();
  }, [sessions]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((e) => {
        console.error(`Error attempting to enable fullscreen: ${e.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const fetchAffirmations = async () => {
    try {
      const res = await fetch('/api/affirmations');
      const data = await res.json();
      setAffirmations(data);
      if (data.length > 0) {
        const today = new Date().toDateString();
        const savedDate = localStorage.getItem('affirmationDate');
        const savedIndex = localStorage.getItem('affirmationIndex');
        
        if (savedDate === today && savedIndex !== null) {
          setCurrentAffirmationIndex(parseInt(savedIndex));
        } else {
          const randomIndex = Math.floor(Math.random() * data.length);
          setCurrentAffirmationIndex(randomIndex);
          localStorage.setItem('affirmationDate', today);
          localStorage.setItem('affirmationIndex', randomIndex.toString());
        }
      }
    } catch (error) {
      console.error('Failed to fetch affirmations:', error);
    }
  };

  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/sessions');
      const data = await res.json();
      setSessions(data);
    } catch (e) {
      console.error('Failed to fetch sessions:', e);
    }
  };

  const addAffirmation = async () => {
    if (!newAffirmation.trim()) return;
    try {
      const res = await fetch('/api/affirmations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newAffirmation, is_custom: 1 })
      });
      if (res.ok) {
        setNewAffirmation('');
        fetchAffirmations();
      }
    } catch (error) {
      console.error('Failed to add affirmation:', error);
    }
  };

  const deleteAffirmation = async (id: number) => {
    try {
      await fetch(`/api/affirmations/${id}`, { method: 'DELETE' });
      fetchAffirmations();
    } catch (error) {
      console.error('Failed to delete affirmation:', error);
    }
  };

  const currentAffirmation = affirmations && affirmations.length > 0 ? affirmations[currentAffirmationIndex] : null;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const priorityTasks = tasks ? tasks.filter(t => !t.completed && t.priority > 0).sort((a, b) => b.priority - a.priority).slice(0, 2) : [];
  const activeSounds = sounds ? sounds.filter(s => playing[s.id]) : [];

  const togglePlay = (id: string) => {
    setPlaying(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const completedTasksCount = (tasks || []).filter(t => t.completed).length;

  const hour = new Date().getHours();
  let greeting = 'Good evening,';
  let weatherIcon = <Moon size={14} className="text-indigo-400" />;
  let weatherText = '65°F Clear';

  if (hour >= 5 && hour < 12) {
    greeting = 'Good morning,';
    weatherIcon = <Sun size={14} className="text-amber-500" />;
    weatherText = '68°F Sunny';
  } else if (hour >= 12 && hour < 18) {
    greeting = 'Good afternoon,';
    weatherIcon = <CloudSun size={14} className="text-orange-400" />;
    weatherText = '75°F Partly Cloudy';
  }

  // Calculate stats for chart
  const last7Days = Array.from({length: 7}, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });
  
  const weeklyData = last7Days.map(date => {
    const minutes = sessions
      .filter(s => s.completed_at && s.completed_at.startsWith(date))
      .reduce((sum, s) => sum + s.duration, 0);
    return { date, minutes };
  });
  const maxMinutes = Math.max(...weeklyData.map(d => d.minutes), 60);

  const forceUpdate = async () => {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
      }
    }
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
    window.location.reload();
  };

  return (
    <div className="flex flex-col h-full w-full bg-background-light text-sage-900 transition-colors duration-300 relative overflow-hidden">
      {/* Background Elements: Morning Sun & Clouds */}
      <div className="absolute -top-10 -right-10 w-64 h-64 bg-[#ffeeba] rounded-full blur-3xl opacity-60 animate-sun pointer-events-none"></div>
      <div className="absolute top-20 -left-10 w-48 h-48 bg-primary/20 rounded-full blur-3xl opacity-40 pointer-events-none"></div>
      
      <SharedHeader 
        title="Dashboard" 
        onBack={() => {}} 
        showDashboardLink={false}
        actions={
          <div className="flex items-center gap-2">
            <button onClick={forceUpdate} className="p-2.5 rounded-full bg-white/60 backdrop-blur-sm border border-white/50 shadow-sm hover:bg-white/80 transition-colors text-rose-500 group" title="Refresh & Update App">
              <RotateCcw size={20} className="group-hover:rotate-[-180deg] transition-transform duration-500" />
            </button>
            <button onClick={() => setShowStatsModal(true)} className="p-2.5 rounded-full bg-white/60 backdrop-blur-sm border border-white/50 shadow-sm hover:bg-white/80 transition-colors text-indigo-500 group">
              <BarChart3 size={20} className="group-hover:scale-110 transition-transform" />
            </button>
            <button onClick={() => setShowQuickActions(true)} className="p-2.5 rounded-full bg-white/60 backdrop-blur-sm border border-white/50 shadow-sm hover:bg-white/80 transition-colors text-amber-500 group">
              <Zap size={20} className="group-hover:scale-110 transition-transform" />
            </button>
            <button onClick={toggleFullscreen} className="p-2.5 rounded-full bg-white/60 backdrop-blur-sm border border-white/50 shadow-sm hover:bg-white/80 transition-colors text-slate-500 group">
              {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>
          </div>
        }
      />

      <div className="relative z-10 flex-1 flex flex-col overflow-y-auto custom-scrollbar p-4 md:p-8">
        {/* User Greeting Section */}
        <div className="flex justify-between items-start mb-6 shrink-0 px-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-slate-500 text-sm font-medium">{greeting}</h2>
              <div className="flex items-center gap-1.5 bg-white/50 px-2 py-0.5 rounded-full border border-white/40 shadow-sm">
                {weather.condition === 'rain' ? <Droplets size={14} className="text-blue-400" /> : weatherIcon}
                <span className="text-xs font-medium text-slate-600">{weather.temp}°F {weather.condition.charAt(0).toUpperCase() + weather.condition.slice(1)}</span>
              </div>
            </div>
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  onBlur={() => setIsEditingName(false)}
                  onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
                  autoFocus
                  className="text-2xl font-bold tracking-tight bg-transparent border-b border-primary outline-none text-slate-900 w-full max-w-[200px]"
                />
                <button onClick={() => setIsEditingName(false)} className="p-1 text-primary hover:text-primary-dark transition-colors">
                  <Check size={20} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setIsEditingName(true)}>
                <h1 className="text-slate-900 text-2xl font-bold tracking-tight">{userName}</h1>
                <Edit2 size={14} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 flex flex-col">
          {/* Hero Section: The Living Garden */}
          <div className="flex flex-col items-center justify-center relative mb-8 shrink-0 py-4">
            <div className="relative w-full max-w-[500px] h-64 flex items-end justify-center animate-in fade-in zoom-in duration-1000">
              <svg className="w-full h-full drop-shadow-2xl overflow-visible" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* The Ground / Terrain */}
                <path d="M20 160 Q200 140 380 160 L380 190 Q200 200 20 190 Z" fill="#4ade80" opacity="0.2" />
                <path d="M40 165 Q200 150 360 165 L360 185 Q200 195 40 185 Z" fill="#22c55e" opacity="0.3" />

                {/* Rain Animation */}
                {weather.condition === 'rain' && Array.from({ length: 20 }).map((_, i) => (
                  <line key={`rain-${i}`} x1={20 + (i * 20)} y1="0" x2={15 + (i * 20)} y2="10" stroke="#0ea5e9" strokeWidth="1" opacity="0.4">
                    <animate attributeName="y1" from="-20" to="200" dur={`${0.5 + Math.random()}s`} repeatCount="indefinite" />
                    <animate attributeName="y2" from="-10" to="210" dur={`${0.5 + Math.random()}s`} repeatCount="indefinite" />
                  </line>
                ))}
                
                {/* Hydration Pond */}
                <g transform="translate(280, 165)">
                  <ellipse cx="0" cy="5" rx="60" ry="15" fill="#bae6fd" opacity="0.4" />
                  <ellipse cx="0" cy="5" rx={Math.min(55, (water/hydrationGoal) * 55)} ry={Math.min(12, (water/hydrationGoal) * 12)} fill="#0ea5e9" opacity="0.6">
                    <animate attributeName="ry" values="10;12;10" dur="3s" repeatCount="indefinite" />
                  </ellipse>
                </g>

                {/* Completed Task Trees */}
                {Array.from({ length: Math.min(completedTasksCount, 8) }).map((_, i) => {
                  const x = 60 + (i * 35);
                  const scale = 0.8 + (Math.random() * 0.4);
                  return (
                    <g key={`tree-${i}`} transform={`translate(${x}, 165) scale(${scale})`}>
                      <path d="M0 0 L0 -30" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />
                      <circle cx="0" cy="-35" r="12" fill={weather.condition === 'rain' ? '#064e3b' : '#166534'} />
                      <circle cx="-8" cy="-28" r="8" fill={weather.condition === 'rain' ? '#065f46' : '#15803d'} />
                      <circle cx="8" cy="-28" r="8" fill={weather.condition === 'rain' ? '#065f46' : '#15803d'} />
                    </g>
                  );
                })}

                {/* Focus Streak Birds */}
                {streak >= 3 && Array.from({ length: Math.min(streak - 2, 5) }).map((_, i) => (
                  <g key={`bird-${i}`} transform={`translate(0, ${40 + (i * 20)})`}>
                    <path d="M0 0 Q5 -5 10 0 Q15 -5 20 0" stroke="#475569" strokeWidth="1.5" fill="none">
                      <animateTransform attributeName="transform" type="translate" from="-50 0" to="450 0" dur={`${8 + (i * 2)}s`} repeatCount="indefinite" />
                      <animate attributeName="d" values="M0 0 Q5 -5 10 0 Q15 -5 20 0; M0 0 Q5 5 10 0 Q15 5 20 0; M0 0 Q5 -5 10 0 Q15 -5 20 0" dur="0.5s" repeatCount="indefinite" />
                    </path>
                  </g>
                ))}

                {/* Focus Session Blooms */}
                {sessions.slice(-12).map((session, i) => {
                  const x = 40 + (i * 25) + (Math.sin(i) * 10);
                  const y = 175 + (Math.cos(i) * 5);
                  return (
                    <g key={`bloom-${session.id}`} transform={`translate(${x}, ${y}) scale(0.6)`}>
                      <path d="M0 0 L0 -10" stroke="#16a34a" strokeWidth="1.5" />
                      <circle cx="0" cy="-12" r="4" fill="#fb7185" />
                      <circle cx="-3" cy="-15" r="3" fill="#fda4af" opacity="0.8" />
                      <circle cx="3" cy="-15" r="3" fill="#fda4af" opacity="0.8" />
                      <circle cx="0" cy="-18" r="3" fill="#fda4af" opacity="0.8" />
                    </g>
                  );
                })}

                {/* Central Focus Core */}
                <g transform="translate(200, 120)">
                  {isActive && (
                    <>
                      <circle cx="0" cy="0" r="40" fill="url(#focusGlow)" opacity="0.3">
                        <animate attributeName="r" values="35;45;35" dur="2s" repeatCount="indefinite" />
                      </circle>
                      <circle cx="0" cy="0" r="15" fill="#13ec13">
                        <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
                      </circle>
                    </>
                  )}
                  {!isActive && <circle cx="0" cy="45" r="5" fill="#cbd5e1" />}
                </g>

                <defs>
                  <radialGradient id="focusGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#13ec13" />
                    <stop offset="100%" stopColor="#13ec13" stopOpacity="0" />
                  </radialGradient>
                </defs>
              </svg>
            </div>
            <p className="text-center text-slate-500 text-xs mt-4 font-mono tracking-widest uppercase opacity-60">
              {streak > 0 ? `Focus Streak: ${streak} | ` : ""}{completedTasksCount > 0 ? `Ecosystem Sustained by ${completedTasksCount} Completed Tasks` : "Your garden is waiting for its first seeds."}
            </p>
          </div>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            
            {/* Primary Bento: Focus Timer */}
            <div 
              onClick={() => onNavigate('focus')}
              className={`md:col-span-2 glass-panel p-6 rounded-[2.5rem] border border-primary/20 shadow-sm flex flex-col justify-between cursor-pointer hover:bg-white/80 transition-all group min-h-[200px] relative overflow-hidden`}
            >
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Timer size={120} className="text-primary-dark" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                    <Timer className="text-primary-dark" size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">{isActive ? (isBreak ? 'Break Time' : 'Deep Work') : 'Start Focusing'}</h4>
                    <p className="text-sm text-slate-500">{isActive ? task : 'Ready for a new session?'}</p>
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-primary-dark tabular-nums tracking-tighter">{formatTime(timeLeft)}</span>
                  <span className="text-xs font-bold text-primary-dark/60 uppercase tracking-widest">remaining</span>
                </div>
              </div>
              <div className="relative z-10 flex justify-end">
                <button onClick={(e) => { e.stopPropagation(); toggleTimer(); }} className="px-6 py-2 rounded-full bg-primary text-forest-deep font-bold text-sm shadow-md hover:bg-primary-dark transition-all active:scale-95">
                  {isActive ? 'Pause' : 'Resume Session'}
                </button>
              </div>
            </div>

            {/* Square Bento: Hydration Quick-Log */}
            <div 
              onClick={() => onNavigate('hydrate')}
              className="glass-panel p-6 rounded-[2.5rem] border border-blue-100 shadow-sm flex flex-col justify-between cursor-pointer hover:bg-blue-50/50 transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600">
                  <Droplets size={24} />
                </div>
                <ChevronRight size={20} className="text-slate-300 group-hover:text-blue-400 transition-colors" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Hydration</h4>
                <p className="text-2xl font-black text-slate-900">{water.toLocaleString()} <span className="text-sm font-normal text-slate-400">ml</span></p>
              </div>
              <p className="text-xs text-blue-600 font-medium mt-2">Goal: {hydrationGoal.toLocaleString()} ml</p>
            </div>

            {/* Tall Bento: Priority Tasks */}
            <div 
              onClick={() => onNavigate('tasks')}
              className="md:row-span-2 glass-panel p-6 rounded-[2.5rem] border border-amber-100 shadow-sm flex flex-col cursor-pointer hover:bg-white/80 transition-all group"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600">
                  <ListTodo size={24} />
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-tighter">Growing</span>
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-4">Priority Soil</h4>
              <div className="space-y-4 flex-1">
                {priorityTasks.length > 0 ? priorityTasks.map(task => (
                  <div key={task.id} className="flex gap-3 group/item">
                    <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${task.priority === 3 ? 'bg-rose-500' : task.priority === 2 ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                    <span className="text-sm font-medium text-slate-700 leading-snug group-hover/item:text-slate-900 transition-colors">{task.text}</span>
                  </div>
                )) : (
                  <p className="text-sm text-slate-400 italic">No priority tasks today. Use the extra time to breathe.</p>
                )}
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100">
                <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                  View all tasks <ChevronRight size={14} />
                </span>
              </div>
            </div>

            {/* Wide Bento: Affirmation */}
            <div 
              onClick={() => setShowAffirmationModal(true)}
              className="md:col-span-2 glass-panel p-8 rounded-[2.5rem] border border-white shadow-soft cursor-pointer group hover:bg-white/90 transition-all flex flex-col justify-center relative overflow-hidden bg-gradient-to-br from-white/40 to-primary/5"
            >
              <Quote className="absolute top-6 left-6 text-primary/20" size={40} />
              <div className="relative z-10 text-center px-4">
                <p className="text-xl md:text-2xl font-serif font-bold text-slate-800 leading-relaxed">
                  {currentAffirmation ? `"${currentAffirmation.text}"` : "Loading your daily inspiration..."}
                </p>
                <div className="mt-4 flex justify-center">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-dark/60 bg-primary/10 px-4 py-1 rounded-full">Daily Intention</span>
                </div>
              </div>
            </div>

            {/* Medium Bento: Active Sounds */}
            <div 
              onClick={() => onNavigate('sounds')}
              className="md:col-span-2 glass-panel p-6 rounded-[2.5rem] border border-purple-100 shadow-sm flex items-center justify-between cursor-pointer hover:bg-white/80 transition-all group overflow-hidden"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600 group-hover:rotate-12 transition-transform">
                  <Music size={28} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-black uppercase tracking-widest text-purple-600/70 mb-1">Atmosphere</h4>
                  {activeSounds.length > 0 ? (
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                      {activeSounds.map(sound => (
                        <span key={sound.id} className="text-lg font-bold text-slate-900 whitespace-nowrap">{sound.name}</span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-lg font-bold text-slate-400">Silent Sanctuary</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {activeSounds.length > 0 && (
                  <div className="size-8 rounded-full border-2 border-purple-400 border-t-transparent animate-spin-slow"></div>
                )}
                <ChevronRight size={20} className="text-slate-300" />
              </div>
            </div>
          </div>

          {/* Action Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 pb-10">
            <button onClick={() => onNavigate('focus')} className="group relative flex flex-col p-5 bg-white/60 backdrop-blur-md rounded-[2rem] border border-white/40 shadow-soft hover:-translate-y-1 hover:shadow-lg transition-all duration-300 text-left">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mb-3 group-hover:bg-primary/30 transition-colors">
                <Timer className="text-primary-dark group-hover:rotate-12 transition-transform duration-300" size={20} />
              </div>
              <div>
                <h3 className="text-slate-900 font-bold text-base">Focus</h3>
                <p className="text-slate-500 text-xs mt-1">Start a 25m session</p>
              </div>
              <div className="absolute inset-0 bg-primary/5 rounded-[2rem] -z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>

            <button onClick={() => onNavigate('breathe')} className="group relative flex flex-col p-5 bg-white/60 backdrop-blur-md rounded-[2rem] border border-white/40 shadow-soft hover:-translate-y-1 hover:shadow-lg transition-all duration-300 text-left">
              <div className="w-10 h-10 rounded-full bg-accent-water/20 flex items-center justify-center mb-3 group-hover:bg-accent-water/30 transition-colors">
                <Wind className="text-[#5e8ea6] group-hover:scale-110 transition-transform duration-300" size={20} />
              </div>
              <div>
                <h3 className="text-slate-900 font-bold text-base">Breathe</h3>
                <p className="text-slate-500 text-xs mt-1">4-7-8 technique</p>
              </div>
              <div className="absolute inset-0 bg-accent-water/5 rounded-[2rem] -z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>

            <button onClick={() => onNavigate('hydrate')} className="group relative flex flex-col p-5 bg-white/60 backdrop-blur-md rounded-[2rem] border border-white/40 shadow-soft hover:-translate-y-1 hover:shadow-lg transition-all duration-300 text-left">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-3 group-hover:bg-blue-200 transition-colors">
                <Droplets className="text-blue-600 group-hover:-translate-y-0.5 transition-transform duration-300" size={20} />
              </div>
              <div>
                <h3 className="text-slate-900 font-bold text-base">Hydrate</h3>
                <p className="text-slate-500 text-xs mt-1">Log water intake</p>
              </div>
              <div className="absolute inset-0 bg-blue-500/5 rounded-[2rem] -z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>

            <button onClick={() => onNavigate('tasks')} className="group relative flex flex-col p-5 bg-white/60 backdrop-blur-md rounded-[2rem] border border-white/40 shadow-soft hover:-translate-y-1 hover:shadow-lg transition-all duration-300 text-left">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mb-3 group-hover:bg-amber-200 transition-colors">
                <ListTodo className="text-amber-700 group-hover:rotate-6 transition-transform duration-300" size={20} />
              </div>
              <div>
                <h3 className="text-slate-900 font-bold text-base">Tasks</h3>
                <p className="text-slate-500 text-xs mt-1">Manage garden tasks</p>
              </div>
              <div className="absolute inset-0 bg-amber-500/5 rounded-[2rem] -z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>

            <button onClick={() => onNavigate('sounds')} className="group relative flex flex-col p-5 bg-white/60 backdrop-blur-md rounded-[2rem] border border-white/40 shadow-soft hover:-translate-y-1 hover:shadow-lg transition-all duration-300 text-left">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mb-3 group-hover:bg-purple-200 transition-colors">
                <Music className="text-purple-700 group-hover:scale-110 transition-transform duration-300" size={20} />
              </div>
              <div>
                <h3 className="text-slate-900 font-bold text-base">Sounds</h3>
                <p className="text-slate-500 text-xs mt-1">Ambient soundscapes</p>
              </div>
              <div className="absolute inset-0 bg-purple-500/5 rounded-[2rem] -z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>

            <button onClick={() => onNavigate('stretch')} className="group relative flex flex-col p-5 bg-white/60 backdrop-blur-md rounded-[2rem] border border-white/40 shadow-soft hover:-translate-y-1 hover:shadow-lg transition-all duration-300 text-left">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mb-3 group-hover:bg-emerald-200 transition-colors">
                <Activity className="text-emerald-700 group-hover:scale-110 transition-transform duration-300" size={20} />
              </div>
              <div>
                <h3 className="text-slate-900 font-bold text-base">Stretch</h3>
                <p className="text-slate-500 text-xs mt-1">Quick body refresh</p>
              </div>
              <div className="absolute inset-0 bg-emerald-500/5 rounded-[2rem] -z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Modal */}
      {showStatsModal && (
        <div className="absolute inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-background-light w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-10">
            <div className="p-6 border-b border-sage-200 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <div className="bg-indigo-100 p-1.5 rounded-lg text-indigo-600"><BarChart3 size={18} /></div>
                <h3 className="font-bold text-lg text-slate-900">Garden Stats</h3>
              </div>
              <button onClick={() => setShowStatsModal(false)} className="p-2 hover:bg-sage-100 rounded-full text-slate-500 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6">Weekly Focus</h4>
              <div className="flex items-end justify-between h-40 gap-2 mb-4">
                {weeklyData.map((d, i) => {
                  const height = Math.max((d.minutes / maxMinutes) * 100, 5);
                  const isToday = i === 6;
                  const dayName = new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' });
                  return (
                    <div key={d.date} className="flex flex-col items-center flex-1 group relative">
                      <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] py-1 px-2 rounded-md whitespace-nowrap z-10 pointer-events-none">
                        {d.minutes} mins
                      </div>
                      <div className={`w-full rounded-t-md transition-all duration-500 ${isToday ? 'bg-primary' : 'bg-primary/40 group-hover:bg-primary/60'}`} style={{ height: `${height}%` }}></div>
                      <span className={`text-[10px] mt-2 ${isToday ? 'font-bold text-slate-900' : 'font-medium text-slate-400'}`}>{dayName}</span>
                    </div>
                  );
                })}
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="bg-white rounded-2xl p-4 border border-sage-100 shadow-sm">
                  <p className="text-xs text-slate-500 font-bold uppercase mb-1">Total Focus</p>
                  <p className="text-2xl font-black text-slate-900">{sessions.reduce((sum, s) => sum + s.duration, 0)} <span className="text-sm font-normal text-slate-400">mins</span></p>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-sage-100 shadow-sm">
                  <p className="text-xs text-slate-500 font-bold uppercase mb-1">Blooms</p>
                  <p className="text-2xl font-black text-slate-900">{sessions.length} <span className="text-sm font-normal text-slate-400">sessions</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Affirmation Modal */}
      {showAffirmationModal && (
        <div className="absolute inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-background-light w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80%] animate-in slide-in-from-bottom-10">
            <div className="p-6 border-b border-sage-200 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-lg text-slate-900">Affirmations</h3>
              <button onClick={() => setShowAffirmationModal(false)} className="p-2 hover:bg-sage-100 rounded-full text-slate-500 transition-colors">
                <Check size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              <div className="mb-6">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Add Custom</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newAffirmation}
                    onChange={(e) => setNewAffirmation(e.target.value)}
                    placeholder="I am..."
                    className="flex-1 bg-white border border-sage-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-primary"
                  />
                  <button 
                    onClick={addAffirmation}
                    className="p-2 bg-primary text-forest-deep rounded-xl hover:bg-primary-dark transition-colors"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Choose One</label>
                {affirmations.map((aff, idx) => (
                  <div 
                    key={aff.id}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex justify-between items-center ${currentAffirmationIndex === idx ? 'bg-primary/10 border-primary' : 'bg-white border-sage-100 hover:border-primary/30'}`}
                    onClick={() => {
                      setCurrentAffirmationIndex(idx);
                      localStorage.setItem('affirmationIndex', idx.toString());
                    }}
                  >
                    <p className="text-sm text-slate-700 flex-1 pr-4">{aff.text}</p>
                    {aff.is_custom === 1 && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteAffirmation(aff.id);
                        }}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions Modal */}
      {showQuickActions && (
        <div className="absolute inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-background-light w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-10">
            <div className="p-6 border-b border-sage-200 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <div className="bg-amber-100 p-1.5 rounded-lg">
                  <Zap size={18} className="text-amber-600" />
                </div>
                <h3 className="font-bold text-lg text-slate-900">Quick Actions</h3>
              </div>
              <button onClick={() => setShowQuickActions(false)} className="p-2 hover:bg-sage-100 rounded-full text-slate-500 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 grid grid-cols-2 gap-4">
              <button onClick={() => { setShowQuickActions(false); onNavigate('focus'); }} className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-sage-100 shadow-sm hover:shadow-md hover:border-primary transition-all group hover:-translate-y-1">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-3 group-hover:bg-primary/30 transition-colors">
                  <Timer size={24} className="text-primary-dark" />
                </div>
                <span className="text-sm font-bold text-slate-700">Deep Work</span>
                <span className="text-[10px] text-slate-400 mt-1">Start 25m focus</span>
              </button>
              
              <button onClick={() => { setShowQuickActions(false); onNavigate('breathe'); }} className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-sage-100 shadow-sm hover:shadow-md hover:border-accent-water transition-all group hover:-translate-y-1">
                <div className="w-12 h-12 rounded-full bg-accent-water/20 flex items-center justify-center mb-3 group-hover:bg-accent-water/30 transition-colors">
                  <Wind size={24} className="text-[#5e8ea6]" />
                </div>
                <span className="text-sm font-bold text-slate-700">Quick Calm</span>
                <span className="text-[10px] text-slate-400 mt-1">1m breathing</span>
              </button>
              
              <button onClick={() => { setShowQuickActions(false); onNavigate('hydrate'); }} className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-sage-100 shadow-sm hover:shadow-md hover:border-blue-400 transition-all group hover:-translate-y-1">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3 group-hover:bg-blue-200 transition-colors">
                  <Droplets size={24} className="text-blue-600" />
                </div>
                <span className="text-sm font-bold text-slate-700">Log Water</span>
                <span className="text-[10px] text-slate-400 mt-1">+200ml glass</span>
              </button>
              
              <button onClick={() => { setShowQuickActions(false); onNavigate('tasks'); }} className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-sage-100 shadow-sm hover:shadow-md hover:border-amber-400 transition-all group hover:-translate-y-1">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-3 group-hover:bg-amber-200 transition-colors">
                  <ListTodo size={24} className="text-amber-700" />
                </div>
                <span className="text-sm font-bold text-slate-700">New Task</span>
                <span className="text-[10px] text-slate-400 mt-1">Add to list</span>
              </button>

              <button onClick={() => { setShowQuickActions(false); onNavigate('sounds'); }} className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-sage-100 shadow-sm hover:shadow-md hover:border-purple-400 transition-all group hover:-translate-y-1">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-3 group-hover:bg-purple-200 transition-colors">
                  <Music size={24} className="text-purple-700" />
                </div>
                <span className="text-sm font-bold text-slate-700">Play Sounds</span>
                <span className="text-[10px] text-slate-400 mt-1">Ambient focus</span>
              </button>

              <button onClick={() => { setShowQuickActions(false); onNavigate('stretch'); }} className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-sage-100 shadow-sm hover:shadow-md hover:border-emerald-400 transition-all group hover:-translate-y-1">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-3 group-hover:bg-emerald-200 transition-colors">
                  <Activity size={24} className="text-emerald-700" />
                </div>
                <span className="text-sm font-bold text-slate-700">Stretch</span>
                <span className="text-[10px] text-slate-400 mt-1">Quick refresh</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
