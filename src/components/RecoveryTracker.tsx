import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bed, Keyboard, Moon, RotateCcw, Save, Smile, Sparkles, Volume2, VolumeX, X, Zap } from 'lucide-react';
import SharedHeader from './SharedHeader';
import GlassCard from './ui/GlassCard';
import Button from './ui/Button';

type MoodLevel =
  | 'rough'
  | 'anxious'
  | 'low'
  | 'neutral'
  | 'pensive'
  | 'good'
  | 'creative'
  | 'focused'
  | 'great'
  | 'inspired';

type DialType = 'sleep' | 'mood' | 'energy';

interface RecoveryEntry {
  id: string;
  date: string;
  sleepHours: number;
  mood: MoodLevel;
  energy: number;
  completed_at: string;
}

const STORAGE_KEY = 'zenflow_recovery_history';
const SOUND_PREF_KEY = 'zenflow_recovery_tick_sound';
const ROW_HEIGHT = 80;

const MOODS: Array<{ id: MoodLevel; label: string; emoji: string }> = [
  { id: 'rough', label: 'Rough', emoji: '😵' },
  { id: 'anxious', label: 'Anxious', emoji: '😟' },
  { id: 'low', label: 'Low', emoji: '😕' },
  { id: 'neutral', label: 'Neutral', emoji: '😐' },
  { id: 'pensive', label: 'Pensive', emoji: '🤔' },
  { id: 'good', label: 'Good', emoji: '🙂' },
  { id: 'creative', label: 'Creative', emoji: '🎨' },
  { id: 'focused', label: 'Focused', emoji: '🧠' },
  { id: 'great', label: 'Great', emoji: '😄' },
  { id: 'inspired', label: 'Inspired', emoji: '✨' },
];

const MOOD_SCORE: Record<MoodLevel, number> = {
  rough: 5,
  anxious: 8,
  low: 10,
  neutral: 20,
  pensive: 25,
  good: 30,
  creative: 35,
  focused: 38,
  great: 40,
  inspired: 40,
};

const SLEEP_OPTIONS = Array.from({ length: 33 }, (_, i) => i * 0.5);
const ENERGY_OPTIONS = Array.from({ length: 10 }, (_, i) => i + 1);

export default function RecoveryTracker({ onBack }: { onBack: () => void }) {
  const [history, setHistory] = useState<RecoveryEntry[]>([]);
  const [sleepHours, setSleepHours] = useState(7.5);
  const [mood, setMood] = useState<MoodLevel>('great');
  const [energy, setEnergy] = useState(5);
  const [savedPulse, setSavedPulse] = useState(false);
  const [focusedColumn, setFocusedColumn] = useState(1);
  const [tickSoundEnabled, setTickSoundEnabled] = useState<boolean>(() => localStorage.getItem(SOUND_PREF_KEY) === 'on');
  const [pulseDial, setPulseDial] = useState<DialType | null>(null);

  const sleepRef = useRef<HTMLDivElement>(null);
  const moodRef = useRef<HTMLDivElement>(null);
  const energyRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const isInitialSleep = useRef(true);
  const isInitialMood = useRef(true);
  const isInitialEnergy = useRef(true);

  const today = new Date().toISOString().split('T')[0];

  const triggerDialPulse = (dial: DialType) => {
    setPulseDial(dial);
    window.setTimeout(() => {
      setPulseDial((current) => (current === dial ? null : current));
    }, 220);
  };

  const playTick = () => {
    if (!tickSoundEnabled) return;

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const ctx = audioContextRef.current;
      if (!ctx) return;
      if (ctx.state === 'suspended') {
        void ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 880;

      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.02, ctx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.065);
    } catch {
      // Best-effort micro feedback.
    }
  };

  useEffect(() => {
    localStorage.setItem(SOUND_PREF_KEY, tickSoundEnabled ? 'on' : 'off');
  }, [tickSoundEnabled]);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    const parsed: RecoveryEntry[] = JSON.parse(raw);
    setHistory(parsed);

    const todays = parsed.find((h) => h.date === today);
    if (todays) {
      setSleepHours(todays.sleepHours);
      setMood(todays.mood);
      setEnergy(todays.energy);
    }
  }, [today]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (sleepRef.current) sleepRef.current.scrollTop = SLEEP_OPTIONS.indexOf(sleepHours) * ROW_HEIGHT;
      if (moodRef.current) moodRef.current.scrollTop = MOODS.findIndex((m) => m.id === mood) * ROW_HEIGHT;
      if (energyRef.current) energyRef.current.scrollTop = ENERGY_OPTIONS.indexOf(energy) * ROW_HEIGHT;
    }, 80);

    return () => clearTimeout(timer);
  }, [sleepHours, mood, energy]);

  useEffect(() => {
    if (isInitialSleep.current) {
      isInitialSleep.current = false;
      return;
    }
    triggerDialPulse('sleep');
    playTick();
  }, [sleepHours]);

  useEffect(() => {
    if (isInitialMood.current) {
      isInitialMood.current = false;
      return;
    }
    triggerDialPulse('mood');
    playTick();
  }, [mood]);

  useEffect(() => {
    if (isInitialEnergy.current) {
      isInitialEnergy.current = false;
      return;
    }
    triggerDialPulse('energy');
    playTick();
  }, [energy]);

  const recoveryScore = useMemo(() => {
    const sleepScore = (sleepHours / 10) * 40;
    const moodScore = MOOD_SCORE[mood];
    const energyScore = (energy / 10) * 20;
    return Math.min(Math.round(sleepScore + moodScore + energyScore), 100);
  }, [sleepHours, mood, energy]);

  const scoreInsight = useMemo(() => {
    if (recoveryScore >= 85) return 'Strong recovery. Keep this rhythm.';
    if (recoveryScore >= 70) return 'Solid baseline. Wind down early tonight.';
    if (recoveryScore >= 55) return 'Mid recovery. Balance workload and rest.';
    return 'Low recovery signal. Prioritize reset habits.';
  }, [recoveryScore]);

  const handleScroll = (ref: React.RefObject<HTMLDivElement>, type: DialType) => {
    if (!ref.current) return;

    const index = Math.round(ref.current.scrollTop / ROW_HEIGHT);

    if (type === 'sleep') {
      const val = SLEEP_OPTIONS[index];
      if (val !== undefined && val !== sleepHours) setSleepHours(val);
      return;
    }

    if (type === 'mood') {
      const val = MOODS[index]?.id;
      if (val !== undefined && val !== mood) setMood(val);
      return;
    }

    const val = ENERGY_OPTIONS[index];
    if (val !== undefined && val !== energy) setEnergy(val);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
      if (target?.isContentEditable) return;

      if (e.key === 'ArrowLeft') setFocusedColumn((prev) => Math.max(0, prev - 1));
      if (e.key === 'ArrowRight') setFocusedColumn((prev) => Math.min(2, prev + 1));

      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        const currentRef = [sleepRef, moodRef, energyRef][focusedColumn];
        if (!currentRef.current) return;
        const direction = e.key === 'ArrowUp' ? -1 : 1;
        currentRef.current.scrollBy({ top: direction * ROW_HEIGHT, behavior: 'smooth' });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedColumn]);

  const saveEntry = () => {
    const entry: RecoveryEntry = {
      id: Date.now().toString(),
      date: today,
      sleepHours,
      mood,
      energy,
      completed_at: new Date().toISOString(),
    };

    const next = [entry, ...history.filter((h) => h.date !== today)].slice(0, 30);
    setHistory(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));

    setSavedPulse(true);
    setTimeout(() => setSavedPulse(false), 1000);
  };

  const averages = useMemo(() => {
    if (history.length === 0) return { sleep: '0.0', energy: '0.0' };
    const sumSleep = history.reduce((acc, h) => acc + h.sleepHours, 0);
    const sumEnergy = history.reduce((acc, h) => acc + h.energy, 0);
    return {
      sleep: (sumSleep / history.length).toFixed(1),
      energy: (sumEnergy / history.length).toFixed(1),
    };
  }, [history]);

  const streak = useMemo(() => {
    if (history.length === 0) return 0;
    const dates = Array.from(new Set(history.map((h) => h.date))).sort((a, b) => b.localeCompare(a));
    if (!dates.length) return 0;

    const dayMs = 24 * 60 * 60 * 1000;

    let count = 0;

    // Performance optimization: parse YYYY-MM-DD string without instantiating Date objects
    const parseDateStr = (date: string) => {
      // Format: YYYY-MM-DD
      // Index:  0123 56 89
      const y = (date.charCodeAt(0) - 48) * 1000 + (date.charCodeAt(1) - 48) * 100 + (date.charCodeAt(2) - 48) * 10 + (date.charCodeAt(3) - 48);
      const m = (date.charCodeAt(5) - 48) * 10 + (date.charCodeAt(6) - 48) - 1;
      const d = (date.charCodeAt(8) - 48) * 10 + (date.charCodeAt(9) - 48);
      return Date.UTC(y, m, d);
    };

    let expected = parseDateStr(dates[0]);

    for (const date of dates) {
      const ts = parseDateStr(date);
      if (ts === expected) {
        count += 1;
        expected -= dayMs;
      } else {
        break;
      }
    }

    return count;
  }, [history]);

  return (
    <div className="flex flex-col h-full w-full bg-background-light text-sage-900 transition-colors duration-1000 relative overflow-hidden mesh-gradient font-sans">
      <SharedHeader title="Recovery Track" onBack={onBack} currentView="recovery" icon={Moon} iconColor="text-indigo-500" />

      <main className="flex-1 max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 md:p-8 pb-32 overflow-hidden">
        <div className="lg:col-span-8 flex flex-col gap-6 h-full">
          <GlassCard className="flex flex-col md:flex-row justify-between items-center gap-4 shrink-0">
            <div>
              <p className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-1">
                Today, {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
              </p>
              <h2 className="text-3xl font-serif font-bold text-slate-900 leading-tight">Status Selection</h2>
              <div className="flex items-center gap-2 mt-1 text-slate-500 text-sm">
                <Keyboard size={14} />
                <span>
                  Arrows <span className="font-bold">← → ↑ ↓</span> to navigate
                </span>
              </div>
            </div>
            <div className="bg-slate-900 text-white rounded-2xl px-6 py-4 min-w-[190px] text-center shadow-lg">
              <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-1">Recovery Score</p>
              <p className="text-4xl font-serif font-bold text-primary">{recoveryScore}</p>
              <p className="text-[10px] text-slate-300 mt-1">{scoreInsight}</p>
            </div>
          </GlassCard>

          <div className="relative flex-1 min-h-[400px] glass-panel rounded-[2.5rem] overflow-hidden border border-white/60 shadow-xl bg-white/40 backdrop-blur-2xl">
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-20 bg-slate-900/90 z-0 shadow-2xl">
              <div className="absolute inset-0 border-y-2 border-primary/30"></div>
            </div>

            <div className="grid grid-cols-3 h-full relative z-10">
              <div
                onClick={() => setFocusedColumn(0)}
                className={`flex flex-col h-full border-r border-slate-200/50 relative transition-all duration-300 ${focusedColumn === 0 ? 'bg-primary/5' : ''}`}
              >
                <div className="absolute top-4 inset-x-0 text-center z-20">
                  <h3 className={`text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 ${focusedColumn === 0 ? 'text-primary-dark' : 'text-slate-400'}`}>
                    <Bed size={12} /> Sleep
                  </h3>
                </div>
                <div
                  ref={sleepRef}
                  onScroll={() => handleScroll(sleepRef, 'sleep')}
                  className="flex-1 overflow-y-auto hide-scrollbar snap-y-mandatory py-[calc(50%-40px)]"
                >
                  {SLEEP_OPTIONS.map((val) => (
                    <div
                      key={val}
                      className={`snap-center h-20 flex items-center justify-center transition-all duration-300 ${sleepHours === val ? `text-3xl font-black text-primary drop-shadow-sm ${pulseDial === 'sleep' ? 'dial-pop' : ''}` : 'text-xl text-slate-400/40'}`}
                    >
                      {val}
                      <span className="text-[10px] ml-1 font-bold uppercase">hrs</span>
                    </div>
                  ))}
                </div>
              </div>

              <div
                onClick={() => setFocusedColumn(1)}
                className={`flex flex-col h-full border-r border-slate-200/50 relative transition-all duration-300 ${focusedColumn === 1 ? 'bg-primary/5' : ''}`}
              >
                <div className="absolute top-4 inset-x-0 text-center z-20">
                  <h3 className={`text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 ${focusedColumn === 1 ? 'text-primary-dark' : 'text-slate-400'}`}>
                    <Smile size={12} /> Mood
                  </h3>
                </div>
                <div
                  ref={moodRef}
                  onScroll={() => handleScroll(moodRef, 'mood')}
                  className="flex-1 overflow-y-auto hide-scrollbar snap-y-mandatory py-[calc(50%-40px)]"
                >
                  {MOODS.map((m) => (
                    <div
                      key={m.id}
                      className={`snap-center h-20 flex flex-col items-center justify-center transition-all duration-300 ${mood === m.id ? `scale-125 ${pulseDial === 'mood' ? 'dial-pop' : ''}` : 'grayscale opacity-20'}`}
                    >
                      <span className="text-5xl drop-shadow-lg mb-1">{m.emoji}</span>
                      {mood === m.id && <span className="text-[9px] font-black text-primary uppercase tracking-tighter absolute -bottom-1">{m.label}</span>}
                    </div>
                  ))}
                </div>
              </div>

              <div
                onClick={() => setFocusedColumn(2)}
                className={`flex flex-col h-full relative transition-all duration-300 ${focusedColumn === 2 ? 'bg-primary/5' : ''}`}
              >
                <div className="absolute top-4 inset-x-0 text-center z-20">
                  <h3 className={`text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 ${focusedColumn === 2 ? 'text-primary-dark' : 'text-slate-400'}`}>
                    <Zap size={12} /> Energy
                  </h3>
                </div>
                <div
                  ref={energyRef}
                  onScroll={() => handleScroll(energyRef, 'energy')}
                  className="flex-1 overflow-y-auto hide-scrollbar snap-y-mandatory py-[calc(50%-40px)]"
                >
                  {ENERGY_OPTIONS.map((val) => (
                    <div
                      key={val}
                      className={`snap-center h-20 flex items-center justify-center transition-all duration-300 ${energy === val ? `text-3xl font-black text-primary ${pulseDial === 'energy' ? 'dial-pop' : ''}` : 'text-xl text-slate-400/40'}`}
                    >
                      Lvl {val}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-white/90 to-transparent pointer-events-none z-20"></div>
            <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-white/90 to-transparent pointer-events-none z-20"></div>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6 overflow-hidden h-full">
          <GlassCard className="shrink-0">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Sparkles size={14} className="text-primary" /> Weekly Stats
              </h3>
              <button
                onClick={() => setTickSoundEnabled((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-[0.12em] transition-colors ${tickSoundEnabled ? 'bg-primary/10 text-primary-dark border-primary/30' : 'bg-white text-slate-500 border-slate-200 hover:text-slate-700'}`}
                title={tickSoundEnabled ? 'Disable selector tick sound' : 'Enable selector tick sound'}
              >
                {tickSoundEnabled ? <Volume2 size={12} /> : <VolumeX size={12} />}
                Tick
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-slate-100">
                <span className="text-sm font-medium text-slate-500">Average Sleep</span>
                <span className="text-lg font-bold text-slate-900">{averages.sleep}h</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-slate-100">
                <span className="text-sm font-medium text-slate-500">Average Energy</span>
                <span className="text-lg font-bold text-slate-900">Level {averages.energy}</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-sm font-medium text-slate-500">Current Streak</span>
                <span className="text-lg font-bold text-slate-900">{streak} day{streak === 1 ? '' : 's'}</span>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="flex-1 flex flex-col min-h-0">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Recent History</h3>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
              {history.length === 0 ? (
                <div className="text-center py-10 opacity-30 italic text-sm">No entries yet.</div>
              ) : (
                history.map((entry) => (
                  <div key={entry.id} className="p-4 rounded-2xl bg-white/60 border border-white/80 shadow-sm hover:shadow-md transition-all">
                    <div className="flex justify-between items-center mb-1">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-black">
                        {new Date(entry.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="text-xl">{MOODS.find((m) => m.id === entry.mood)?.emoji}</span>
                    </div>
                    <p className="text-xs font-bold text-slate-800">{entry.sleepHours}h Sleep • Lvl {entry.energy} Energy</p>
                  </div>
                ))
              )}
            </div>
          </GlassCard>
        </div>
      </main>

      <nav className="fixed bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 z-[60] w-[calc(100vw-1rem)] max-w-xl px-1">
        <div className="bg-slate-900/90 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] rounded-full px-3 md:px-6 py-3 flex items-center gap-3 md:gap-6 justify-between">
          <button
            onClick={() => {
              setSleepHours(7.5);
              setMood('neutral');
              setEnergy(5);
              sleepRef.current?.scrollTo({ top: 15 * ROW_HEIGHT, behavior: 'smooth' });
              moodRef.current?.scrollTo({ top: 3 * ROW_HEIGHT, behavior: 'smooth' });
              energyRef.current?.scrollTo({ top: 4 * ROW_HEIGHT, behavior: 'smooth' });
            }}
            className="size-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all"
            title="Reset selectors"
          >
            <RotateCcw size={18} />
          </button>

          <Button
            size="lg"
            icon={Save}
            onClick={saveEntry}
            className={`transition-all duration-500 min-w-[170px] ${savedPulse ? 'bg-emerald-500 text-white' : 'bg-primary text-slate-900'}`}
          >
            {savedPulse ? 'Saved to Garden' : 'Confirm Track'}
          </Button>

          <button
            onClick={onBack}
            className="size-10 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-500 hover:bg-rose-500/30 transition-all"
            title="Back"
          >
            <X size={18} />
          </button>
        </div>
      </nav>

      <style>{`
        .mesh-gradient {
          background-color: #f6f8f6;
          background-image:
            radial-gradient(at 0% 0%, hsla(120, 45%, 88%, 1) 0, transparent 50%),
            radial-gradient(at 100% 0%, hsla(140, 50%, 93%, 1) 0, transparent 50%);
        }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .snap-y-mandatory { scroll-snap-type: y mandatory; }
        .snap-center { scroll-snap-align: center; }
        .dial-pop {
          animation: dial-pop 220ms cubic-bezier(0.2, 0.8, 0.25, 1);
        }
        @keyframes dial-pop {
          0% { transform: scale(1); }
          45% { transform: scale(1.08); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
