import React, { useState, useEffect } from 'react';
import { Settings, Timer, Droplets, CheckCircle2, Wind, ListTodo, Music, Activity, Edit2, Check, Quote, Plus, Trash2, ChevronRight, Zap, X, Play, Pause, Sun, Moon, CloudSun, Coffee, CupSoda, Maximize2, Minimize2, Accessibility } from 'lucide-react';
import { View } from '../App';
import { useAppContext } from '../AppContext';
import SharedHeader from './SharedHeader';

interface Affirmation {
  id: number;
  text: string;
  is_custom: number;
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

  const [userName, setUserName] = useState(() => localStorage.getItem('zenflow_username') || 'Alex');
  const [isEditingName, setIsEditingName] = useState(false);

  useEffect(() => {
    localStorage.setItem('zenflow_username', userName);
  }, [userName]);
  const [affirmations, setAffirmations] = useState<Affirmation[]>([]);
  const [currentAffirmationIndex, setCurrentAffirmationIndex] = useState(0);
  const [showAffirmationModal, setShowAffirmationModal] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [newAffirmation, setNewAffirmation] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  useEffect(() => {
    fetchAffirmations();
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

  const completedTasksCount = tasks.filter(t => t.completed).length;
  const plantScale = Math.min(1 + (completedTasksCount * 0.05), 1.5);

  const hour = new Date().getHours();
  let greeting = 'Good evening,';
  let weatherIcon = <Moon size={14} className="text-indigo-400" />;
  let weatherText = '65°F Clear';
  let hydrationText = 'Time for a relaxing evening tea.';
  let hydrationIcon = <Coffee size={16} className="text-indigo-500" />;

  if (hour >= 5 && hour < 12) {
    greeting = 'Good morning,';
    weatherIcon = <Sun size={14} className="text-amber-500" />;
    weatherText = '68°F Sunny';
    hydrationText = 'Start your day with a glass of water.';
    hydrationIcon = <Droplets size={16} className="text-blue-500" />;
  } else if (hour >= 12 && hour < 18) {
    greeting = 'Good afternoon,';
    weatherIcon = <CloudSun size={14} className="text-orange-400" />;
    weatherText = '75°F Partly Cloudy';
    hydrationText = 'Stay hydrated to keep your energy up!';
    hydrationIcon = <CupSoda size={16} className="text-cyan-500" />;
  }

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
                {weatherIcon}
                <span className="text-xs font-medium text-slate-600">{weatherText}</span>
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
          {/* Hero Section: The Garden */}
          <div className="flex flex-col items-center justify-center relative mb-8 shrink-0">
            <div className="relative w-48 h-48 flex items-end justify-center animate-float">
              <svg className="w-full h-full drop-shadow-lg" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M60 140 L140 140 L130 190 H70 L60 140Z" fill="#E8B895" stroke="#2C3A2C" strokeWidth="2" strokeLinejoin="round"/>
                <path d="M55 135 H145 L140 140 H60 L55 135Z" fill="#D6A683" stroke="#2C3A2C" strokeWidth="2" strokeLinejoin="round"/>
                <g style={{ transform: `scale(${plantScale})`, transformOrigin: '100px 140px', transition: 'transform 1s ease-in-out' }}>
                  <path d="M100 140 Q100 100 100 90" stroke="#13ec13" strokeWidth="4" strokeLinecap="round"/>
                  <path d="M100 110 Q70 100 60 70 Q80 80 100 105" fill="#13ec13" stroke="#0ea60e" strokeWidth="1.5"/>
                  <path d="M100 100 Q130 90 140 60 Q120 70 100 95" fill="#13ec13" stroke="#0ea60e" strokeWidth="1.5"/>
                  <circle cx="100" cy="50" r="8" fill="#FFB7B2"/>
                </g>
              </svg>
            </div>
            <p className="text-center text-slate-500 text-sm mt-2 font-medium">Your garden is thriving today.</p>
          </div>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            
            {/* Primary Bento: Focus Timer (Wide on desktop) */}
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

          {/* Action Grid (The small utility circles) */}
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
