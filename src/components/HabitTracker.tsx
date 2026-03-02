import React, { useState, useEffect } from 'react';
import { Leaf, Plus, Sparkles, Droplets, CheckCircle2, ChevronRight, X, Trash2, Flame, Grid, Calendar as CalendarIcon, Info, Sprout, TreePine } from 'lucide-react';
import SharedHeader from './SharedHeader';
import { useAppContext } from '../AppContext';
import GlassCard from './ui/GlassCard';
import Button from './ui/Button';

interface Habit {
  id: string;
  name: string;
  description: string;
  icon: string;
  streak: number;
  completedDates: string[]; // ISO Strings
  category: string;
}

const STORAGE_KEY = 'zenflow_habits';
const CATEGORIES = ['All', 'Wellness', 'Growth', 'Mind', 'General'];

export default function HabitTracker({ onBack }: { onBack: () => void }) {
  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Morning Meditation', description: '15 mins of mindfulness', icon: 'self_improvement', streak: 5, completedDates: [], category: 'Mind' },
      { id: '2', name: 'Read 20 Pages', description: 'Expand your knowledge', icon: 'menu_book', streak: 15, completedDates: [], category: 'Growth' },
      { id: '3', name: 'Hydration', description: 'Drink 2L of water', icon: 'water_drop', streak: 2, completedDates: [], category: 'Wellness' }
    ];
  });

  const [activeCategory, setActiveCategory] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitDesc, setNewHabitDesc] = useState('');
  const [newHabitCat, setNewHabitCat] = useState('General');

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
  }, [habits]);

  const toggleHabit = (id: string) => {
    setHabits(prev => prev.map(h => {
      if (h.id !== id) return h;
      const isCompletedToday = h.completedDates.includes(today);
      const newDates = isCompletedToday 
        ? h.completedDates.filter(d => d !== today)
        : [...h.completedDates, today];
      
      return { 
        ...h, 
        completedDates: newDates,
        streak: isCompletedToday ? Math.max(0, h.streak - 1) : h.streak + 1
      };
    }));
  };

  const addHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    const newH: Habit = {
      id: Date.now().toString(),
      name: newHabitName,
      description: newHabitDesc,
      icon: 'yard',
      streak: 0,
      completedDates: [],
      category: newHabitCat
    };
    setHabits([...habits, newH]);
    setNewHabitName('');
    setNewHabitDesc('');
    setNewHabitCat('General');
    setShowAddModal(false);
  };

  const deleteHabit = (id: string) => {
    setHabits(habits.filter(h => h.id !== id));
  };

  const getDaysInMonth = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  };

  const monthDays = Array.from({ length: getDaysInMonth() }, (_, i) => {
    const d = new Date();
    d.setDate(i + 1);
    return d.toISOString().split('T')[0];
  });

  const getCompletionCount = (date: string) => {
    return habits.filter(h => h.completedDates.includes(date)).length;
  };

  const longestStreak = Math.max(...habits.map(h => h.streak), 0);

  const filteredHabits = activeCategory === 'All' 
    ? habits 
    : habits.filter(h => h.category === activeCategory);

  const getEvolutionIcon = (streak: number, isCompleted: boolean) => {
    const className = `${isCompleted ? 'fill-current' : ''}`;
    if (streak >= 14) return <TreePine className={className} size={28} />;
    if (streak >= 4) return <Leaf className={className} size={28} />;
    return <Sprout className={className} size={28} />;
  };

  const getEvolutionStage = (streak: number) => {
    if (streak >= 14) return 'Thriving Tree';
    if (streak >= 4) return 'Growing Leaf';
    return 'New Seedling';
  };

  return (
    <div className="flex flex-col h-full w-full bg-background-light text-sage-900 transition-colors duration-1000 relative overflow-hidden font-sans">
      
      {/* Light Morning Atmosphere Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden opacity-40">
        <div className="absolute -top-20 -right-20 w-[600px] h-[600px] bg-primary/20 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[-10%] -left-20 w-[500px] h-[500px] bg-blue-100/50 blur-[120px] rounded-full"></div>
      </div>

      <SharedHeader 
        title="Forest Floor" 
        onBack={onBack} 
        icon={Leaf} 
        iconColor="text-primary-dark"
      />

      <main className="flex-1 overflow-y-auto custom-scrollbar relative z-10 px-6 py-8 max-w-7xl mx-auto w-full">
        
        {/* Header Stats */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex flex-col gap-2 max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 leading-tight tracking-tight">The Forest Floor</h1>
            <p className="text-slate-500 text-lg font-light">Cultivate your daily habits. Each task nurtures your garden.</p>
          </div>

          <div className="flex items-center gap-4 bg-white border border-sage-100 rounded-3xl p-4 pr-6 shadow-soft">
            <div className="size-12 rounded-full bg-primary/20 flex items-center justify-center text-primary-dark shadow-inner">
              <Flame size={24} className="fill-current" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Longest Streak</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900 font-serif">{longestStreak} Days</span>
                <span className="text-primary-dark text-xs font-bold flex items-center gap-0.5">
                  <Leaf size={10} className="fill-current" /> Growing
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Category Tabs Section */}
        <div className="flex p-1 bg-white/50 backdrop-blur-md rounded-2xl border border-white max-w-fit mb-8 shadow-sm">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeCategory === cat ? 'bg-primary text-forest-deep shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Monthly Heatmap Section - Light Mode */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-serif font-bold text-slate-900 flex items-center gap-2">
              <Grid className="text-primary-dark" size={20} />
              Monthly Growth
            </h2>
            <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <span className="flex items-center gap-1.5"><div className="size-3 rounded-sm bg-slate-100"></div> Dormant</span>
              <span className="flex items-center gap-1.5"><div className="size-3 rounded-sm bg-primary/30"></div> Sprouting</span>
              <span className="flex items-center gap-1.5"><div className="size-3 rounded-sm bg-primary"></div> Blooming</span>
            </div>
          </div>

          <GlassCard padding="lg" className="bg-white/80 backdrop-blur-xl border-white overflow-x-auto">
            <div className="flex gap-3 flex-wrap justify-center md:justify-start">
              {monthDays.map((date, i) => {
                const count = getCompletionCount(date);
                const isToday = date === today;
                let bgClass = 'bg-slate-50';
                if (count > 0 && count < habits.length / 2) bgClass = 'bg-primary/20';
                else if (count >= habits.length / 2 && count < habits.length) bgClass = 'bg-primary/50';
                else if (count > 0 && count === habits.length) bgClass = 'bg-primary shadow-md shadow-primary/20';

                return (
                  <div key={date} className="flex flex-col items-center gap-1.5">
                    <div 
                      className={`size-10 md:size-12 rounded-xl ${bgClass} ${isToday ? 'ring-2 ring-primary ring-offset-4 ring-offset-white' : 'border border-slate-100'} transition-all hover:scale-110 cursor-pointer flex items-center justify-center`}
                      title={`${count} habits completed on ${date}`}
                    >
                      {count === habits.length && count > 0 && <Sparkles size={14} className="text-forest-deep" />}
                    </div>
                    <span className={`text-[10px] font-bold ${isToday ? 'text-primary-dark' : 'text-slate-400'}`}>{(i + 1).toString().padStart(2, '0')}</span>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </section>

        {/* Habit List - Light Mode */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-serif font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="text-primary-dark" size={20} />
              Growing Seedlings
            </h2>
            <Button 
              variant="ghost" 
              size="sm" 
              icon={Plus} 
              onClick={() => setShowAddModal(true)}
              className="bg-white shadow-sm border border-slate-100 hover:bg-primary/10"
            >
              Plant New Habit
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
            {filteredHabits.map(habit => {
              const isCompleted = habit.completedDates.includes(today);
              return (
                <div key={habit.id} className="group relative bg-white/70 hover:bg-white border border-white shadow-soft rounded-[2.5rem] p-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl overflow-hidden">
                  <button 
                    onClick={() => deleteHabit(habit.id)}
                    className="absolute top-6 right-6 p-2 opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-rose-500"
                  >
                    <Trash2 size={16} />
                  </button>

                  <div className="flex items-start gap-4 mb-8">
                    <div className={`size-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border transition-all duration-500 ${isCompleted ? 'bg-primary border-primary text-forest-deep rotate-6' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                      {getEvolutionIcon(habit.streak, isCompleted)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-1">{habit.name}</h3>
                      <p className="text-[10px] font-black text-primary-dark uppercase tracking-widest mb-1">{getEvolutionStage(habit.streak)}</p>
                      <p className="text-xs text-slate-400 font-medium tracking-wide leading-relaxed">{habit.description}</p>
                    </div>
                  </div>

                  <div className="flex items-end justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Consistency</span>
                      <span className="text-2xl font-serif font-bold text-slate-900">{habit.streak} Days</span>
                    </div>
                    
                    <button 
                      onClick={() => toggleHabit(habit.id)}
                      className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-500 ${
                        isCompleted 
                          ? 'bg-primary text-forest-deep shadow-lg shadow-primary/20 scale-105' 
                          : 'bg-slate-100 text-slate-600 hover:bg-primary/20 hover:text-primary-dark border border-transparent'
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 size={18} strokeWidth={3} /> : <Droplets size={18} />}
                      <span>{isCompleted ? 'Watered' : 'Water'}</span>
                    </button>
                  </div>

                  <div className="absolute bottom-0 left-0 w-full h-1.5 bg-slate-50">
                    <div 
                      className="h-full bg-primary transition-all duration-1000 ease-out" 
                      style={{ width: `${(habit.completedDates.length / getDaysInMonth()) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}

            {/* Empty State Card */}
            <div 
              onClick={() => setShowAddModal(true)}
              className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-primary/50 rounded-[2.5rem] p-8 transition-all duration-300 cursor-pointer min-h-[240px] bg-white/30 hover:bg-white/60 group"
            >
              <div className="size-16 rounded-full bg-slate-100 group-hover:bg-primary/20 flex items-center justify-center mb-4 transition-all group-hover:scale-110">
                <Plus size={32} className="text-slate-300 group-hover:text-primary-dark" />
              </div>
              <h3 className="text-lg font-bold text-slate-400 group-hover:text-slate-900 transition-colors">Plant a Seed</h3>
              <p className="text-xs text-slate-400 text-center mt-1">Nurture a new ritual today</p>
            </div>
          </div>
        </section>
      </main>

      {/* Add Habit Modal - Light Mode */}
      {showAddModal && (
        <div className="absolute inset-0 z-50 bg-slate-900/20 backdrop-blur-md flex items-center justify-center p-4">
          <GlassCard className="w-full max-w-md bg-white p-8 animate-in zoom-in-95 duration-300 border-none shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-serif font-bold text-slate-900">New Seedling</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors"><X size={24} /></button>
            </div>
            <form onSubmit={addHabit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Habit Name</label>
                  <input 
                    type="text" required value={newHabitName} onChange={e => setNewHabitName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-4 outline-none focus:border-primary focus:bg-white transition-all text-slate-900"
                    placeholder="e.g., Morning Yoga"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Category</label>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {CATEGORIES.filter(c => c !== 'All').map(c => (
                      <button
                        key={c} type="button" onClick={() => setNewHabitCat(c)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${newHabitCat === c ? 'bg-primary border-primary text-forest-deep' : 'bg-white border-slate-100 text-slate-400'}`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Description</label>
                <input 
                  type="text" value={newHabitDesc} onChange={e => setNewHabitDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-4 outline-none focus:border-primary focus:bg-white transition-all text-slate-900"
                  placeholder="Small detail to guide you..."
                />
              </div>
              <Button type="submit" className="w-full py-5 text-lg shadow-lg shadow-primary/30 rounded-2xl">Plant Seed</Button>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
