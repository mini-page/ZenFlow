import React, { useState, useEffect } from 'react';
import { Settings, Timer, Droplets, CheckCircle2, Wind, ListTodo, BookOpen, Music, Activity, MoonStar, Edit2, Check, Quote, Plus, Trash2, ChevronRight, Zap, X, Play, Pause, Sun, Moon, CloudSun, Coffee, CupSoda, Maximize2, Minimize2, Accessibility, BarChart3, Sparkles } from 'lucide-react';
import { AppView } from '../navigation';
import { useAppContext } from '../AppContext';
import SharedHeader from './SharedHeader';
import { formatTime } from '../utils/format';
import { FocusSession } from '../utils/types';

interface Affirmation {
  id: number;
  text: string;
  is_custom: number;
}

interface Props {
  onNavigate: (view: AppView) => void;
}

export default function Dashboard({ onNavigate }: Props) {
  const { 
    isActive, timeLeft, isBreak, task, toggleTimer,
    tasks,
    playing, sounds, setPlaying,
    water, hydrationGoal,
    showToast
  } = useAppContext();

  // 1. Initialize ALL states at the top
  const [userName, setUserName] = useState(() => localStorage.getItem('zenflow_username') || '');
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
  const [now, setNow] = useState(() => new Date());

  // 2. Effects
  useEffect(() => {
    localStorage.setItem('zenflow_username', userName);
  }, [userName]);

  useEffect(() => {
    fetchAffirmations();
    fetchSessions();
  }, []);

  useEffect(() => {
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
          }, () => {
            showToast('Unable to get your location for weather updates.', 'error');
          });
        }
      } catch (e) {
        showToast('Failed to fetch weather data.', 'error');
      }
    };
    fetchWeather();
  }, []);

  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((e) => {
        showToast('Unable to enter fullscreen. Please check your browser settings.', 'error');
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

  const DEFAULT_AFFIRMATIONS: Affirmation[] = [
    { id: 1, text: 'I am capable of achieving my goals.', is_custom: 0 },
    { id: 2, text: 'Every breath I take fills me with peace.', is_custom: 0 },
    { id: 3, text: 'I focus on what I can control and let go of the rest.', is_custom: 0 },
    { id: 4, text: 'My productivity is a reflection of my focus, not my speed.', is_custom: 0 },
    { id: 5, text: 'I am worthy of rest and rejuvenation.', is_custom: 0 },
    { id: 6, text: 'Today is a new opportunity to grow my garden.', is_custom: 0 },
  ];

  const fetchAffirmations = async () => {
    try {
      const res = await fetch('/api/affirmations');
      if (!res.ok) throw new Error('API unavailable');
      const data = await res.json();
      setAffirmations(data);
      localStorage.setItem('zenflow_affirmations_cache', JSON.stringify(data));
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
      // Fallback: use cached or default affirmations
      const cached = localStorage.getItem('zenflow_affirmations_cache');
      const fallback = cached ? JSON.parse(cached) : DEFAULT_AFFIRMATIONS;
      setAffirmations(fallback);
      if (fallback.length > 0) {
        const today = new Date().toDateString();
        const savedDate = localStorage.getItem('affirmationDate');
        const savedIndex = localStorage.getItem('affirmationIndex');
        if (savedDate === today && savedIndex !== null) {
          setCurrentAffirmationIndex(parseInt(savedIndex));
        } else {
          const randomIndex = Math.floor(Math.random() * fallback.length);
          setCurrentAffirmationIndex(randomIndex);
          localStorage.setItem('affirmationDate', today);
          localStorage.setItem('affirmationIndex', randomIndex.toString());
        }
      }
    }
  };

  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/sessions');
      if (!res.ok) throw new Error('API unavailable');
      const data = await res.json();
      setSessions(data);
      localStorage.setItem('zenflow_sessions_cache', JSON.stringify(data));
    } catch (e) {
      // Fallback to cached sessions
      const cached = localStorage.getItem('zenflow_sessions_cache');
      if (cached) setSessions(JSON.parse(cached));
    }
  };

  const addAffirmation = async () => {
    if (!newAffirmation.trim()) return;
    const newItem: Affirmation = { id: Date.now(), text: newAffirmation.trim(), is_custom: 1 };
    // Optimistic local update
    const updated = [...affirmations, newItem];
    setAffirmations(updated);
    localStorage.setItem('zenflow_affirmations_cache', JSON.stringify(updated));
    setNewAffirmation('');
    try {
      const res = await fetch('/api/affirmations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newAffirmation, is_custom: 1 })
      });
      if (res.ok) fetchAffirmations();
    } catch (error) {
      // Already saved locally, will sync when backend is available
    }
  };

  const deleteAffirmation = async (id: number) => {
    // Optimistic local update
    const updated = affirmations.filter(a => a.id !== id);
    setAffirmations(updated);
    localStorage.setItem('zenflow_affirmations_cache', JSON.stringify(updated));
    try {
      await fetch(`/api/affirmations/${id}`, { method: 'DELETE' });
    } catch (error) {
      // Already removed locally
    }
  };

  const currentAffirmation = affirmations && affirmations.length > 0 ? affirmations[currentAffirmationIndex] : null;

  const priorityTasks = tasks ? tasks.filter(t => !t.completed && t.priority > 0).sort((a, b) => b.priority - a.priority).slice(0, 2) : [];
  const activeSounds = sounds ? sounds.filter(s => playing[s.id]) : [];

  const completedTasksCount = (tasks || []).filter(t => t.completed).length;
  const todaysDateKey = now.toISOString().split('T')[0];
  const todaysFocusSessions = sessions.filter(s => s.completed_at && s.completed_at.startsWith(todaysDateKey)).length;
  const hour = now.getHours();
  let greeting = 'Good evening,';
  let weatherIcon = <Moon size={14} className="text-indigo-400" />;

  if (hour >= 5 && hour < 12) {
    greeting = 'Good morning,';
    weatherIcon = <Sun size={14} className="text-amber-500" />;
  } else if (hour >= 12 && hour < 18) {
    greeting = 'Good afternoon,';
    weatherIcon = <CloudSun size={14} className="text-orange-400" />;
  }

  const getWeekNumber = (date: Date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  };

  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
  const fullDate = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const timezoneLabel = Intl.DateTimeFormat().resolvedOptions().timeZone.replace(/_/g, ' ');
  const dayProgress = Math.round((((hour * 60) + now.getMinutes()) / 1440) * 100);
  const weekNumber = getWeekNumber(now);

  // Calculate stats for chart
  const last7Days = Array.from({length: 7}, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });
  
  const sessionsByDate: Record<string, number> = {};
  sessions.forEach(s => {
    if (s.completed_at) {
      const date = s.completed_at.substring(0, 10);
      sessionsByDate[date] = (sessionsByDate[date] || 0) + s.duration;
    }
  });

  const weeklyData = last7Days.map(date => ({
    date,
    minutes: sessionsByDate[date] || 0
  }));
  const maxMinutes = Math.max(...weeklyData.map(d => d.minutes), 60);

  const forceUpdate = async () => {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(registration => registration.unregister()));
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
        title="ZenFlow" 
        onBack={() => {}} 
        currentView="dashboard"
        actions={
          <div className="flex items-center gap-2">
            <button onClick={() => setShowStatsModal(true)} className="p-2.5 rounded-full bg-white/60 backdrop-blur-sm border border-white/50 shadow-sm hover:bg-white/80 transition-colors text-indigo-500 group">
              <BarChart3 size={20} className="group-hover:scale-110 transition-transform" />
            </button>
            <button onClick={toggleFullscreen} className="p-2.5 rounded-full bg-white/60 backdrop-blur-sm border border-white/50 shadow-sm hover:bg-white/80 transition-colors text-slate-500 group">
              {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>
          </div>
        }
      />

      <div className="relative z-10 flex-1 flex flex-col overflow-y-auto custom-scrollbar p-4 md:p-8">
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 flex flex-col">
          {/* Hero Section: Live Time Dashboard */}
          <div className="relative mb-8 shrink-0 animate-in fade-in zoom-in duration-700">
            <div className="absolute -top-10 right-12 w-36 h-36 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="glass-panel relative rounded-[2.5rem] border border-white/60 shadow-sm p-6 md:p-8 overflow-hidden">
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-end">
                <div className="lg:col-span-2">
                  <div className="mb-3">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h2 className="text-slate-500 text-sm font-medium">{greeting}</h2>
                      <div className="flex items-center gap-1.5 bg-white/60 px-2 py-0.5 rounded-full border border-white/50 shadow-sm">
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
                          className="text-2xl font-bold tracking-tight bg-transparent border-b border-primary outline-none text-slate-900 w-full max-w-[220px]"
                        />
                        <button onClick={() => setIsEditingName(false)} className="p-1 text-primary hover:text-primary-dark transition-colors">
                          <Check size={20} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setIsEditingName(true)}>
                        <h1 className="text-slate-900 text-2xl font-bold tracking-tight">{userName || 'Your Name'}</h1>
                        <Edit2 size={14} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    )}
                  </div>
                  <h2 className="font-groovy text-slate-900 text-[clamp(2.6rem,10vw,6.5rem)] leading-[0.95] tracking-[0.04em] tabular-nums">
                    {timeString}
                  </h2>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-white/70 border border-white/60 text-xs font-black uppercase tracking-wider text-slate-700">
                      {dayName}
                    </span>
                    <span className="text-sm md:text-base font-semibold text-slate-600">{fullDate}</span>
                  </div>
                </div>

                <div className="glass-panel rounded-2xl border border-white/60 p-4 md:p-5">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="rounded-xl bg-white/70 border border-white/60 p-3">
                      <p className="font-black uppercase tracking-wider text-slate-400">Week</p>
                      <p className="mt-1 text-lg font-black text-slate-900">{weekNumber}</p>
                    </div>
                    <div className="rounded-xl bg-white/70 border border-white/60 p-3">
                      <p className="font-black uppercase tracking-wider text-slate-400">Focus</p>
                      <p className="mt-1 text-lg font-black text-slate-900">{todaysFocusSessions}</p>
                    </div>
                    <div className="col-span-2 rounded-xl bg-white/70 border border-white/60 p-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-black uppercase tracking-wider text-slate-400">Day Progress</p>
                        <p className="font-black text-slate-700">{dayProgress}%</p>
                      </div>
                      <div className="h-2 rounded-full bg-slate-200/70 overflow-hidden">
                        <div className="h-full bg-primary transition-all duration-500" style={{ width: `${dayProgress}%` }}></div>
                      </div>
                      <p className="mt-2 text-[11px] font-semibold text-slate-500 truncate">{timezoneLabel}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
              <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-primary/15 text-primary-dark text-[9px] font-black uppercase tracking-[0.12em] border border-primary/25">F</span>
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
              <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-cyan-100 text-[#4c7b94] text-[9px] font-black uppercase tracking-[0.12em] border border-cyan-200">B</span>
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
              <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[9px] font-black uppercase tracking-[0.12em] border border-blue-200">W</span>
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
              <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[9px] font-black uppercase tracking-[0.12em] border border-amber-200">T</span>
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mb-3 group-hover:bg-amber-200 transition-colors">
                <ListTodo className="text-amber-700 group-hover:rotate-6 transition-transform duration-300" size={20} />
              </div>
              <div>
                <h3 className="text-slate-900 font-bold text-base">Soil</h3>
                <p className="text-slate-500 text-xs mt-1">Manage task seeds</p>
              </div>
              <div className="absolute inset-0 bg-amber-500/5 rounded-[2rem] -z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>

            <button onClick={() => onNavigate('journal')} className="group relative flex flex-col p-5 bg-white/60 backdrop-blur-md rounded-[2rem] border border-white/40 shadow-soft hover:-translate-y-1 hover:shadow-lg transition-all duration-300 text-left">
              <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[9px] font-black uppercase tracking-[0.12em] border border-rose-200">N</span>
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center mb-3 group-hover:bg-rose-200 transition-colors">
                <BookOpen className="text-rose-700 group-hover:-rotate-6 transition-transform duration-300" size={20} />
              </div>
              <div>
                <h3 className="text-slate-900 font-bold text-base">Zen Notes</h3>
                <p className="text-slate-500 text-xs mt-1">Journal reflections</p>
              </div>
              <div className="absolute inset-0 bg-rose-500/5 rounded-[2rem] -z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>

            <button onClick={() => onNavigate('habits')} className="group relative flex flex-col p-5 bg-white/60 backdrop-blur-md rounded-[2rem] border border-white/40 shadow-soft hover:-translate-y-1 hover:shadow-lg transition-all duration-300 text-left">
              <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase tracking-[0.12em] border border-emerald-200">H</span>
              <div className="w-10 h-10 rounded-full bg-[#86efac]/30 flex items-center justify-center mb-3 group-hover:bg-[#86efac]/50 transition-colors">
                <Sparkles className="text-emerald-700 group-hover:rotate-6 transition-transform duration-300" size={20} />
              </div>
              <div>
                <h3 className="text-slate-900 font-bold text-base">Forest</h3>
                <p className="text-slate-500 text-xs mt-1">Daily habit tracker</p>
              </div>
              <div className="absolute inset-0 bg-emerald-500/5 rounded-[2rem] -z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>

            <button onClick={() => onNavigate('sounds')} className="group relative flex flex-col p-5 bg-white/60 backdrop-blur-md rounded-[2rem] border border-white/40 shadow-soft hover:-translate-y-1 hover:shadow-lg transition-all duration-300 text-left">
              <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[9px] font-black uppercase tracking-[0.12em] border border-purple-200">S</span>
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mb-3 group-hover:bg-purple-200 transition-colors">
                <Music className="text-purple-700 group-hover:scale-110 transition-transform duration-300" size={20} />
              </div>
              <div>
                <h3 className="text-slate-900 font-bold text-base">Sounds</h3>
                <p className="text-slate-500 text-xs mt-1">Ambient layers</p>
              </div>
              <div className="absolute inset-0 bg-purple-500/5 rounded-[2rem] -z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>

            <button onClick={() => onNavigate('stretch')} className="group relative flex flex-col p-5 bg-white/60 backdrop-blur-md rounded-[2rem] border border-white/40 shadow-soft hover:-translate-y-1 hover:shadow-lg transition-all duration-300 text-left">
              <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[9px] font-black uppercase tracking-[0.12em] border border-rose-200">X</span>
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center mb-3 group-hover:bg-rose-200 transition-colors">
                <Activity className="text-rose-700 group-hover:scale-110 transition-transform duration-300" size={20} />
              </div>
              <div>
                <h3 className="text-slate-900 font-bold text-base">Stretch</h3>
                <p className="text-slate-500 text-xs mt-1">Quick body refresh</p>
              </div>
              <div className="absolute inset-0 bg-rose-500/5 rounded-[2rem] -z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>

            <button onClick={() => onNavigate('recovery')} className="group relative flex flex-col p-5 bg-white/60 backdrop-blur-md rounded-[2rem] border border-white/40 shadow-soft hover:-translate-y-1 hover:shadow-lg transition-all duration-300 text-left">
              <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[9px] font-black uppercase tracking-[0.12em] border border-indigo-200">R</span>
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mb-3 group-hover:bg-indigo-200 transition-colors">
                <MoonStar className="text-indigo-700 group-hover:scale-110 transition-transform duration-300" size={20} />
              </div>
              <div>
                <h3 className="text-slate-900 font-bold text-base">Recovery</h3>
                <p className="text-slate-500 text-xs mt-1">Sleep & mood tracker</p>
              </div>
              <div className="absolute inset-0 bg-indigo-500/5 rounded-[2rem] -z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
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
                <span className="text-[10px] text-slate-400 mt-1">Start focus</span>
              </button>
              
              <button onClick={() => { setShowQuickActions(false); onNavigate('breathe'); }} className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-sage-100 shadow-sm hover:shadow-md hover:border-accent-water transition-all group hover:-translate-y-1">
                <div className="w-12 h-12 rounded-full bg-accent-water/20 flex items-center justify-center mb-3 group-hover:bg-accent-water/30 transition-colors">
                  <Wind size={24} className="text-[#5e8ea6]" />
                </div>
                <span className="text-sm font-bold text-slate-700">Quick Calm</span>
                <span className="text-[10px] text-slate-400 mt-1">Breathing</span>
              </button>
              
              <button onClick={() => { setShowQuickActions(false); onNavigate('habits'); }} className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-sage-100 shadow-sm hover:shadow-md hover:border-emerald-400 transition-all group hover:-translate-y-1">
                <div className="w-12 h-12 rounded-full bg-[#86efac]/30 flex items-center justify-center mb-3 group-hover:bg-[#86efac]/50 transition-colors">
                  <Sparkles size={24} className="text-emerald-700" />
                </div>
                <span className="text-sm font-bold text-slate-700">Forest Floor</span>
                <span className="text-[10px] text-slate-400 mt-1">Habit tracking</span>
              </button>
              
              <button onClick={() => { setShowQuickActions(false); onNavigate('tasks'); }} className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-sage-100 shadow-sm hover:shadow-md hover:border-amber-400 transition-all group hover:-translate-y-1">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-3 group-hover:bg-amber-200 transition-colors">
                  <ListTodo size={24} className="text-amber-700" />
                </div>
                <span className="text-sm font-bold text-slate-700">New Task</span>
                <span className="text-[10px] text-slate-400 mt-1">Add to list</span>
              </button>

              <button onClick={() => { setShowQuickActions(false); onNavigate('recovery'); }} className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-sage-100 shadow-sm hover:shadow-md hover:border-indigo-400 transition-all group hover:-translate-y-1">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-3 group-hover:bg-indigo-200 transition-colors">
                  <MoonStar size={24} className="text-indigo-700" />
                </div>
                <span className="text-sm font-bold text-slate-700">Recovery</span>
                <span className="text-[10px] text-slate-400 mt-1">Sleep & mood</span>
              </button>

              <button onClick={() => { setShowQuickActions(false); onNavigate('stretch'); }} className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-sage-100 shadow-sm hover:shadow-md hover:border-rose-400 transition-all group hover:-translate-y-1">
                <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mb-3 group-hover:bg-rose-200 transition-colors">
                  <Activity size={24} className="text-rose-700" />
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
