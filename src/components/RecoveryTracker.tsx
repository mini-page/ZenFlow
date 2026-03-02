import React, { useEffect, useMemo, useState } from 'react';
import { MoonStar, Bed, HeartPulse, Smile, Save, RotateCcw, X } from 'lucide-react';
import SharedHeader from './SharedHeader';

type MoodLevel = 'great' | 'good' | 'neutral' | 'low' | 'rough';

interface RecoveryEntry {
  id: string;
  date: string;
  sleepHours: number;
  sleepQuality: number;
  mood: MoodLevel;
  energy: number;
  note: string;
}

const STORAGE_KEY = 'zenflow_recovery_history';

const moods: Array<{ id: MoodLevel; label: string; emoji: string; tone: string }> = [
  { id: 'great', label: 'Great', emoji: '😁', tone: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { id: 'good', label: 'Good', emoji: '🙂', tone: 'bg-green-100 text-green-700 border-green-200' },
  { id: 'neutral', label: 'Neutral', emoji: '😐', tone: 'bg-slate-100 text-slate-700 border-slate-200' },
  { id: 'low', label: 'Low', emoji: '😕', tone: 'bg-amber-100 text-amber-700 border-amber-200' },
  { id: 'rough', label: 'Rough', emoji: '😣', tone: 'bg-rose-100 text-rose-700 border-rose-200' },
];

const moodLabels: Record<MoodLevel, string> = {
  great: 'Great',
  good: 'Good',
  neutral: 'Neutral',
  low: 'Low',
  rough: 'Rough',
};

export default function RecoveryTracker({ onBack }: { onBack: () => void }) {
  const [history, setHistory] = useState<RecoveryEntry[]>([]);
  const [sleepHours, setSleepHours] = useState(7.5);
  const [sleepQuality, setSleepQuality] = useState(7);
  const [mood, setMood] = useState<MoodLevel>('neutral');
  const [energy, setEnergy] = useState(6);
  const [note, setNote] = useState('');
  const [savedPulse, setSavedPulse] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as RecoveryEntry[];
      if (Array.isArray(parsed)) setHistory(parsed);
    } catch (error) {
      console.error('Failed to parse recovery history:', error);
    }
  }, []);

  useEffect(() => {
    const todayEntry = history.find(entry => entry.date === today);
    if (!todayEntry) return;
    setSleepHours(todayEntry.sleepHours);
    setSleepQuality(todayEntry.sleepQuality);
    setMood(todayEntry.mood);
    setEnergy(todayEntry.energy);
    setNote(todayEntry.note);
  }, [history, today]);

  const recoveryScore = useMemo(() => {
    const sleepDurationScore = Math.min((sleepHours / 8) * 10, 10);
    const score = ((sleepQuality * 0.45) + (sleepDurationScore * 0.35) + (energy * 0.2)) * 10;
    return Math.round(score);
  }, [sleepHours, sleepQuality, energy]);

  const pastWeek = useMemo(() => {
    return history.slice(0, 7);
  }, [history]);

  const averages = useMemo(() => {
    if (pastWeek.length === 0) return { hours: 0, quality: 0, energy: 0 };
    const totals = pastWeek.reduce(
      (acc, entry) => {
        acc.hours += entry.sleepHours;
        acc.quality += entry.sleepQuality;
        acc.energy += entry.energy;
        return acc;
      },
      { hours: 0, quality: 0, energy: 0 }
    );
    return {
      hours: +(totals.hours / pastWeek.length).toFixed(1),
      quality: +(totals.quality / pastWeek.length).toFixed(1),
      energy: +(totals.energy / pastWeek.length).toFixed(1),
    };
  }, [pastWeek]);

  const saveEntry = () => {
    const entry: RecoveryEntry = {
      id: `${today}-${Date.now()}`,
      date: today,
      sleepHours,
      sleepQuality,
      mood,
      energy,
      note: note.trim(),
    };

    const next = [entry, ...history.filter(item => item.date !== today)].slice(0, 45);
    setHistory(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSavedPulse(true);
    setTimeout(() => setSavedPulse(false), 900);
  };

  const resetToday = () => {
    setSleepHours(7.5);
    setSleepQuality(7);
    setMood('neutral');
    setEnergy(6);
    setNote('');
  };

  return (
    <div className="flex flex-col h-full w-full p-0 bg-background-light text-sage-900 transition-colors duration-1000 relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[420px] h-[420px] bg-indigo-300/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-15%] left-[-10%] w-[380px] h-[380px] bg-primary/10 rounded-full blur-[100px]" />
      </div>

      <SharedHeader
        title="Recovery Track"
        onBack={onBack}
        currentView="recovery"
        icon={MoonStar}
      />

      <main className="relative z-10 flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 xl:grid-cols-3 gap-6 pb-28">
          <section className="xl:col-span-2 space-y-6">
            <div className="glass-panel rounded-[2rem] border border-white/60 p-6 md:p-8 shadow-soft">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Today, {new Date(today).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</p>
                  <h2 className="mt-1 text-3xl md:text-4xl font-serif font-bold text-slate-900">Sleep + Mood Recovery</h2>
                </div>
                <div className="px-4 py-3 rounded-2xl bg-indigo-50 border border-indigo-100 text-center">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-indigo-500">Recovery Score</p>
                  <p className="text-3xl font-black text-indigo-700">{recoveryScore}</p>
                </div>
              </div>
            </div>

            <div className="glass-panel rounded-[2rem] border border-white/60 p-6 shadow-soft space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2"><Bed size={16} /> Sleep Time</label>
                  <span className="text-sm font-black text-slate-800">{sleepHours.toFixed(1)} hrs</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="12"
                  step="0.5"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2"><MoonStar size={16} /> Sleep Quality</label>
                  <span className="text-sm font-black text-slate-800">{sleepQuality}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={sleepQuality}
                  onChange={(e) => setSleepQuality(parseInt(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2"><Smile size={16} /> Mood Today</label>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-black">shortcut: R</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {moods.map(item => (
                    <button
                      key={item.id}
                      onClick={() => setMood(item.id)}
                      className={`px-3 py-2 rounded-xl border text-sm font-bold transition-all ${
                        mood === item.id ? item.tone : 'bg-white/70 border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="mr-1">{item.emoji}</span>
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2"><HeartPulse size={16} /> Energy</label>
                  <span className="text-sm font-black text-slate-800">{energy}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={energy}
                  onChange={(e) => setEnergy(parseInt(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-slate-700 mb-2 block">Notes</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="How did your sleep affect today?"
                  className="w-full min-h-24 rounded-xl border border-slate-200 bg-white/70 p-3 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="glass-panel rounded-[2rem] border border-white/60 p-5 shadow-soft">
              <h3 className="text-sm font-black uppercase tracking-[0.16em] text-slate-500 mb-4">Weekly Snapshot</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center bg-white/70 border border-white/60 rounded-xl px-3 py-2">
                  <span className="text-slate-500">Avg Sleep</span>
                  <span className="font-black text-slate-900">{averages.hours || '-'} hrs</span>
                </div>
                <div className="flex justify-between items-center bg-white/70 border border-white/60 rounded-xl px-3 py-2">
                  <span className="text-slate-500">Avg Quality</span>
                  <span className="font-black text-slate-900">{averages.quality || '-'} / 10</span>
                </div>
                <div className="flex justify-between items-center bg-white/70 border border-white/60 rounded-xl px-3 py-2">
                  <span className="text-slate-500">Avg Energy</span>
                  <span className="font-black text-slate-900">{averages.energy || '-'} / 10</span>
                </div>
              </div>
            </div>

            <div className="glass-panel rounded-[2rem] border border-white/60 p-5 shadow-soft">
              <h3 className="text-sm font-black uppercase tracking-[0.16em] text-slate-500 mb-4">Recent Entries</h3>
              <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar pr-1">
                {history.length === 0 && (
                  <p className="text-sm text-slate-500 py-8 text-center">No recovery logs yet.</p>
                )}
                {history.map(entry => (
                  <div key={entry.id} className="rounded-xl bg-white/70 border border-white/60 p-3">
                    <p className="text-[11px] uppercase tracking-wider text-slate-400 font-black">{entry.date}</p>
                    <p className="text-sm text-slate-700 mt-1">
                      {entry.sleepHours.toFixed(1)}h sleep · {entry.sleepQuality}/10 quality · {entry.energy}/10 energy
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Mood: {moodLabels[entry.mood]}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>

      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <div className="glass-panel px-6 py-3 rounded-full flex items-center gap-6 shadow-2xl border-white/40 backdrop-blur-xl">
          <button onClick={resetToday} className="flex flex-col items-center gap-1 group">
            <div className="size-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-all">
              <RotateCcw size={18} className="text-slate-600" />
            </div>
            <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Reset</span>
          </button>

          <button
            onClick={saveEntry}
            className={`size-14 rounded-full flex items-center justify-center shadow-lg transition-all ${
              savedPulse
                ? 'bg-emerald-500 text-white scale-105'
                : 'bg-slate-900 text-white hover:scale-105 active:scale-95'
            }`}
          >
            <Save size={24} />
          </button>

          <button onClick={onBack} className="flex flex-col items-center gap-1 group">
            <div className="size-10 rounded-full bg-rose-50 flex items-center justify-center group-hover:bg-rose-100 transition-all">
              <X size={18} className="text-rose-500" />
            </div>
            <span className="text-[8px] font-bold uppercase tracking-widest text-rose-400">Back</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

