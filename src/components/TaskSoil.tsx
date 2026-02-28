import React, { useState } from 'react';
import { ArrowLeft, Trash2, Leaf, Check, ArrowUp } from 'lucide-react';

interface Task {
  id: string;
  text: string;
  completed: boolean;
  priority: 0 | 1 | 2 | 3; // 0: none, 1: low, 2: medium, 3: high
}

export default function TaskSoil({ onBack }: { onBack: () => void }) {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', text: 'Draft Q3 Performance Report', completed: false, priority: 0 },
    { id: '2', text: 'Review design mockups', completed: false, priority: 3 },
    { id: '3', text: 'Morning hydration log', completed: true, priority: 1 },
    { id: '4', text: 'Prepare meeting agenda', completed: false, priority: 2 },
  ]);
  const [newTask, setNewTask] = useState('');
  const [newPriority, setNewPriority] = useState<0 | 1 | 2 | 3>(0);
  const [animatingTaskId, setAnimatingTaskId] = useState<string | null>(null);

  const toggleTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task && !task.completed) {
      setAnimatingTaskId(id);
      setTimeout(() => setAnimatingTaskId(null), 600);
    }
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    setTasks([{ id: Date.now().toString(), text: newTask, completed: false, priority: newPriority }, ...tasks]);
    setNewTask('');
    setNewPriority(0);
  };

  const getPriorityColor = (level: number, isCompleted: boolean) => {
    if (isCompleted) return 'text-sage-300';
    switch (level) {
      case 3: return 'text-rose-500';
      case 2: return 'text-amber-500';
      case 1: return 'text-emerald-500';
      default: return 'text-sage-300';
    }
  };

  const getPriorityBg = (level: number, isCompleted: boolean) => {
    if (isCompleted) return 'bg-sage-50/50 border-sage-100 opacity-60';
    switch (level) {
      case 3: return 'bg-rose-50 border-rose-200 hover:shadow-soft hover:-translate-y-0.5';
      case 2: return 'bg-amber-50 border-amber-200 hover:shadow-soft hover:-translate-y-0.5';
      case 1: return 'bg-emerald-50 border-emerald-200 hover:shadow-soft hover:-translate-y-0.5';
      default: return 'glass-panel border-sage-100 hover:shadow-soft hover:-translate-y-0.5';
    }
  };

  const getPriorityBorder = (level: number, isCompleted: boolean) => {
    if (isCompleted) return 'bg-primary border-primary';
    switch (level) {
      case 3: return 'border-rose-400 bg-rose-50 peer-hover:border-rose-500';
      case 2: return 'border-amber-400 bg-amber-50 peer-hover:border-amber-500';
      case 1: return 'border-emerald-400 bg-emerald-50 peer-hover:border-emerald-500';
      default: return 'border-sage-300 bg-white peer-hover:border-primary';
    }
  };

  const activeCount = tasks.filter(t => !t.completed).length;

  // Sort tasks: uncompleted first, then by priority (high to low)
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed === b.completed) {
      return b.priority - a.priority;
    }
    return a.completed ? 1 : -1;
  });

  return (
    <div className="flex flex-col h-full w-full p-4 gap-4 bg-background-light text-sage-900 transition-colors duration-300 relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 blur-[120px] transition-colors duration-300"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-primary/10 blur-[100px] transition-colors duration-300"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-2 pt-2 shrink-0">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="p-1.5 hover:bg-sage-100 rounded-lg transition-colors">
            <ArrowLeft className="text-sage-700" size={20} />
          </button>
          <div className="bg-emerald-100 p-1.5 rounded-lg">
            <Leaf className="text-emerald-600" size={20} />
          </div>
          <h1 className="font-serif text-xl font-semibold text-sage-700">Task Soil</h1>
        </div>
      </header>

      <main className="relative z-10 flex-1 overflow-y-auto px-2 py-2 space-y-4 custom-scrollbar">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-sage-900">Today's Planting</h2>
            <p className="text-sage-500 text-xs mt-1">Nourish your garden by completing tasks.</p>
          </div>
          <div className="glass-panel px-3 py-1.5 rounded-full shadow-sm flex items-center gap-2 border border-sage-200/50">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span className="text-xs font-semibold text-sage-600">{activeCount} Growing</span>
          </div>
        </div>

        <div className="space-y-3">
          {sortedTasks.map(task => (
            <div key={task.id} className={`group relative flex items-center p-3 rounded-xl border shadow-sm transition-all duration-500 cursor-pointer ${getPriorityBg(task.priority, task.completed)} ${animatingTaskId === task.id ? 'scale-95 opacity-70 bg-emerald-50 border-emerald-200' : 'scale-100'}`}>
              <label className="flex items-center gap-3 w-full cursor-pointer select-none">
                <div className="relative flex items-center justify-center">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                  />
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 relative z-10 ${getPriorityBorder(task.priority, task.completed)}`}>
                    <Check size={12} className={`text-white transition-all duration-300 ${task.completed ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`} strokeWidth={3} />
                  </div>
                  {animatingTaskId === task.id && (
                    <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping z-0 opacity-75"></div>
                  )}
                </div>
                <div className="flex flex-col flex-1">
                  <span className={`text-sm font-medium transition-all ${task.completed ? 'text-sage-400 line-through' : 'text-sage-800'}`}>
                    {task.text}
                  </span>
                  {task.priority > 0 && !task.completed && (
                    <div className="flex items-center gap-0.5 mt-1">
                      {[1, 2, 3].map((level) => (
                        <Leaf 
                          key={level} 
                          size={10} 
                          className={level <= task.priority ? getPriorityColor(task.priority, false) : 'text-sage-200'} 
                          fill={level <= task.priority ? 'currentColor' : 'none'}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </label>
              <button onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }} className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-sage-400 hover:text-red-500 rounded-lg hover:bg-red-50">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
        <div className="h-20"></div>
      </main>

      <footer className="relative z-10 mt-auto pt-2 shrink-0">
        <form onSubmit={addTask} className="relative flex flex-col gap-2 glass-panel rounded-[2rem] p-3 shadow-sm border border-sage-200/50 focus-within:ring-2 focus-within:ring-primary/50 transition-all">
          <div className="flex items-center gap-2 px-2">
            <span className="text-xs font-medium text-sage-500 mr-1">Priority:</span>
            <div className="flex items-center gap-1 bg-white/50 rounded-full p-1 border border-sage-200">
              {[1, 2, 3].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setNewPriority(newPriority === level ? 0 : level as 1|2|3)}
                  className="p-1 rounded-full transition-all hover:bg-sage-100"
                >
                  <Leaf 
                    size={16} 
                    className={level <= newPriority ? getPriorityColor(newPriority, false) : 'text-sage-300'}
                    fill={level <= newPriority ? 'currentColor' : 'none'}
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="text" 
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              className="flex-1 bg-transparent border-none p-2 text-sage-700 placeholder-sage-400 focus:ring-0 text-sm font-medium outline-none" 
              placeholder="Plant a new task..." 
            />
            <button type="submit" className="bg-primary hover:bg-primary-dark text-forest-deep font-bold p-2.5 rounded-full transition-colors flex items-center justify-center shadow-sm shadow-primary/20">
              <ArrowUp size={18} />
            </button>
          </div>
        </form>
      </footer>
    </div>
  );
}
