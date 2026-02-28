import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  priority: 0 | 1 | 2 | 3;
}

export interface Sound {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  defaultImage: string;
}

export interface BreathingPattern {
  id: string;
  name: string;
  description: string;
  inhale: number;
  hold1: number;
  exhale: number;
  hold2: number;
  icon: string;
  isCustom?: boolean;
  theme?: 'relaxing' | 'energizing' | 'neutral';
}

export interface BreathingSession {
  id: string;
  date: string;
  duration: number; // in seconds
  patternId: string;
}

interface AppContextType {
  // Timer State
  focusDuration: number;
  setFocusDuration: (d: number) => void;
  breakDuration: number;
  setBreakDuration: (d: number) => void;
  isBreak: boolean;
  setIsBreak: (b: boolean) => void;
  timeLeft: number;
  setTimeLeft: (t: number | ((prev: number) => number)) => void;
  isActive: boolean;
  setIsActive: (a: boolean) => void;
  sessionCompleted: boolean;
  setSessionCompleted: (c: boolean) => void;
  task: string;
  setTask: (t: string) => void;
  toggleTimer: () => void;
  resetTimer: () => void;
  
  // Tasks State
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  
  // Sounds State
  sounds: Sound[];
  setSounds: (sounds: Sound[] | ((prev: Sound[]) => Sound[])) => void;
  playing: Record<string, boolean>;
  setPlaying: (playing: Record<string, boolean> | ((prev: Record<string, boolean>) => Record<string, boolean>)) => void;
  volumes: Record<string, number>;
  setVolumes: (volumes: Record<string, number> | ((prev: Record<string, number>) => Record<string, number>)) => void;
  masterVolume: number;
  setMasterVolume: (v: number) => void;
  
  // Breathing State
  breathingPatterns: BreathingPattern[];
  setBreathingPatterns: (patterns: BreathingPattern[] | ((prev: BreathingPattern[]) => BreathingPattern[])) => void;
  breathingHistory: BreathingSession[];
  setBreathingHistory: (history: BreathingSession[] | ((prev: BreathingSession[]) => BreathingSession[])) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  // Timer
  const [focusDuration, setFocusDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [isBreak, setIsBreak] = useState(false);
  const [timeLeft, setTimeLeft] = useState(focusDuration * 60);
  const [isActive, setIsActive] = useState(false);
  const [task, setTask] = useState('Writing Quarterly Report');

  const [sessionCompleted, setSessionCompleted] = useState(false);

  // Only update timeLeft when durations change and timer is not active
  useEffect(() => {
    if (!isActive) {
      setTimeLeft((isBreak ? breakDuration : focusDuration) * 60);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusDuration, breakDuration, isBreak]);

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(t => Math.max(0, t - 1));
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      setSessionCompleted(true);
      
      // We don't auto-transition here anymore, we let FocusMode handle it
      // so it can save the session and show the animation.
      // But wait, if FocusMode is not mounted, it won't be handled.
      // Let's just auto-transition here and let FocusMode watch sessionCompleted.
      
      if (!isBreak) {
        // We could save it here, but we don't have fetchHistory.
        // Let's just do the transition.
      }
      setIsBreak(!isBreak);
      setTimeLeft((!isBreak ? breakDuration : focusDuration) * 60);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, isBreak, breakDuration, focusDuration]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft((isBreak ? breakDuration : focusDuration) * 60);
  };

  // Tasks
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', text: 'Draft Q3 Performance Report', completed: false, priority: 0 },
    { id: '2', text: 'Review design mockups', completed: false, priority: 3 },
    { id: '3', text: 'Morning hydration log', completed: true, priority: 1 },
    { id: '4', text: 'Prepare meeting agenda', completed: false, priority: 2 },
  ]);

  // Sounds
  const [sounds, setSounds] = useState<Sound[]>([
    { id: 'forest-rain', name: 'Forest Rain', category: 'Nature', description: 'Gentle rain in a dense forest', icon: 'rainy', defaultImage: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=400&q=80' },
    { id: 'summer-meadow', name: 'Summer Meadow', category: 'Nature', description: 'Warm breeze and insects', icon: 'grass', defaultImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=400&q=80' },
    { id: 'ocean-waves', name: 'Ocean Waves', category: 'Nature', description: 'Calming beach waves', icon: 'water', defaultImage: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=400&q=80' },
    { id: 'crackling-fire', name: 'Crackling Fire', category: 'Nature', description: 'Warm campfire embers', icon: 'local_fire_department', defaultImage: 'https://images.unsplash.com/photo-1525905384812-7013e2008e3b?auto=format&fit=crop&w=400&q=80' },
    { id: 'lofi-stream', name: 'Lo-fi Stream', category: 'Urban', description: 'Chill beats to focus to', icon: 'headset', defaultImage: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=400&q=80' },
    { id: 'city-cafe', name: 'City Cafe', category: 'Urban', description: 'Bustling coffee shop chatter', icon: 'local_cafe', defaultImage: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=400&q=80' },
    { id: 'train-journey', name: 'Train Journey', category: 'Urban', description: 'Rhythmic train tracks', icon: 'train', defaultImage: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=400&q=80' },
    { id: 'deep-space', name: 'Deep Space', category: 'Meditation', description: 'Low frequency cosmic drone', icon: 'rocket_launch', defaultImage: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=400&q=80' },
    { id: 'tibetan-bowls', name: 'Tibetan Bowls', category: 'Meditation', description: 'Resonant singing bowls', icon: 'self_improvement', defaultImage: 'https://images.unsplash.com/photo-1515023115689-589c33041d3c?auto=format&fit=crop&w=400&q=80' },
    { id: 'wind-chimes', name: 'Wind Chimes', category: 'Meditation', description: 'Gentle bamboo chimes', icon: 'air', defaultImage: 'https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?auto=format&fit=crop&w=400&q=80' },
  ]);
  const [playing, setPlaying] = useState<Record<string, boolean>>({});
  const [volumes, setVolumes] = useState<Record<string, number>>({});
  const [masterVolume, setMasterVolume] = useState(72);

  // Breathing
  const [breathingPatterns, setBreathingPatterns] = useState<BreathingPattern[]>([
    { id: '4-7-8', name: '4-7-8 Relax', description: 'Promotes deep relaxation and sleep', inhale: 4, hold1: 7, exhale: 8, hold2: 0, icon: 'Moon', theme: 'relaxing' },
    { id: 'box', name: 'Box Breathing', description: 'Balances energy and calms the mind', inhale: 4, hold1: 4, exhale: 4, hold2: 4, icon: 'Square', theme: 'neutral' },
    { id: 'awake', name: 'Awake', description: 'Invigorates and energizes', inhale: 6, hold1: 0, exhale: 2, hold2: 0, icon: 'Sun', theme: 'energizing' },
    { id: 'deep-calm', name: 'Deep Calm', description: 'Reduces anxiety and stress', inhale: 4, hold1: 2, exhale: 6, hold2: 0, icon: 'Droplets', theme: 'relaxing' },
    { id: 'coherent', name: 'Coherent', description: 'Harmonizes heart and brain', inhale: 5.5, hold1: 0, exhale: 5.5, hold2: 0, icon: 'Heart', theme: 'neutral' },
    { id: 'pranayama', name: 'Pranayama', description: 'Traditional yogic breathing', inhale: 4, hold1: 16, exhale: 8, hold2: 0, icon: 'Flower2', theme: 'relaxing' }
  ]);
  const [breathingHistory, setBreathingHistory] = useState<BreathingSession[]>([]);

  return (
    <AppContext.Provider value={{
      focusDuration, setFocusDuration,
      breakDuration, setBreakDuration,
      isBreak, setIsBreak,
      timeLeft, setTimeLeft,
      isActive, setIsActive,
      sessionCompleted, setSessionCompleted,
      task, setTask,
      toggleTimer, resetTimer,
      tasks, setTasks,
      sounds, setSounds,
      playing, setPlaying,
      volumes, setVolumes,
      masterVolume, setMasterVolume,
      breathingPatterns, setBreathingPatterns,
      breathingHistory, setBreathingHistory
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
