import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db } from './utils/db';

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  priority: 0 | 1 | 2 | 3;
  tags?: string[];
  context?: string;
}

export interface Sound {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  defaultImage: string;
  url?: string;
  isCustom?: boolean;
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
  customSounds: Sound[];
  addCustomSound: (sound: Sound) => void;
  deleteCustomSound: (id: string) => void;
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
  // Hydration State
  water: number;
  setWater: (w: number | ((prev: number) => number)) => void;
  hydrationGoal: number;
  setHydrationGoal: (g: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  // Custom Sounds
  const [customSounds, setCustomSounds] = useState<Sound[]>([]);

  useEffect(() => {
    const loadCustomSounds = async () => {
      try {
        const saved = await db.getAllSounds();
        setCustomSounds(saved);
      } catch (e) {
        console.error('Failed to load custom sounds:', e);
      }
    };
    loadCustomSounds();
  }, []);

  const addCustomSound = async (sound: Sound) => {
    const newSound = { ...sound, isCustom: true };
    setCustomSounds(prev => [...prev, newSound]);
    try {
      await db.saveSound(newSound);
    } catch (e) {
      console.error('Failed to save custom sound:', e);
    }
  };

  const deleteCustomSound = async (id: string) => {
    setCustomSounds(prev => prev.filter(s => s.id !== id));
    setPlaying(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    try {
      await db.deleteSound(id);
    } catch (e) {
      console.error('Failed to delete custom sound:', e);
    }
  };

  // Built-in Sounds list
  const builtInSounds: Sound[] = [
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
  ];

  const [sounds, setSounds] = useState<Sound[]>(() => [...builtInSounds, ...customSounds]);

  useEffect(() => {
    setSounds([...builtInSounds, ...customSounds]);
  }, [customSounds]);

  // Hydration
  const [water, setWater] = useState(() => {
    const saved = localStorage.getItem('zenflow_water');
    return saved ? parseInt(saved) : 1200;
  });
  const [hydrationGoal, setHydrationGoal] = useState(() => {
    const saved = localStorage.getItem('zenflow_hydration_goal');
    return saved ? parseInt(saved) : 2000;
  });

  useEffect(() => {
    localStorage.setItem('zenflow_water', water.toString());
  }, [water]);

  useEffect(() => {
    localStorage.setItem('zenflow_hydration_goal', hydrationGoal.toString());
  }, [hydrationGoal]);

  // Timer settings persistence
  const [focusDuration, setFocusDuration] = useState(() => {
    const saved = localStorage.getItem('zenflow_focus_duration');
    return saved ? parseInt(saved) : 25;
  });
  const [breakDuration, setBreakDuration] = useState(() => {
    const saved = localStorage.getItem('zenflow_break_duration');
    return saved ? parseInt(saved) : 5;
  });
  const [isBreak, setIsBreak] = useState(() => {
    return localStorage.getItem('zenflow_is_break') === 'true';
  });
  const [task, setTask] = useState(() => {
    return localStorage.getItem('zenflow_task') || 'Writing Quarterly Report';
  });

  const [timeLeft, setTimeLeft] = useState(() => {
    const isActive = localStorage.getItem('zenflow_timer_active') === 'true';
    const expiry = localStorage.getItem('zenflow_timer_expiry');
    
    if (isActive && expiry) {
      const remaining = Math.max(0, Math.floor((parseInt(expiry) - Date.now()) / 1000));
      return remaining;
    }
    
    // If not active, use saved durations
    const savedIsBreak = localStorage.getItem('zenflow_is_break') === 'true';
    const savedFocus = localStorage.getItem('zenflow_focus_duration');
    const savedBreak = localStorage.getItem('zenflow_break_duration');
    return (savedIsBreak ? (savedBreak ? parseInt(savedBreak) : 5) : (savedFocus ? parseInt(savedFocus) : 25)) * 60;
  });

  const [isActive, setIsActive] = useState(() => {
    const active = localStorage.getItem('zenflow_timer_active') === 'true';
    const expiry = localStorage.getItem('zenflow_timer_expiry');
    if (active && expiry && parseInt(expiry) > Date.now()) {
      return true;
    }
    return false;
  });

  const [sessionCompleted, setSessionCompleted] = useState(false);

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('zenflow_focus_duration', focusDuration.toString());
  }, [focusDuration]);

  useEffect(() => {
    localStorage.setItem('zenflow_break_duration', breakDuration.toString());
  }, [breakDuration]);

  useEffect(() => {
    localStorage.setItem('zenflow_is_break', isBreak.toString());
  }, [isBreak]);

  useEffect(() => {
    localStorage.setItem('zenflow_task', task);
  }, [task]);

  useEffect(() => {
    localStorage.setItem('zenflow_timer_active', isActive.toString());
    if (isActive) {
      const expiry = Date.now() + timeLeft * 1000;
      localStorage.setItem('zenflow_timer_expiry', expiry.toString());
    } else {
      localStorage.removeItem('zenflow_timer_expiry');
    }
  }, [isActive, timeLeft]);

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
        setTimeLeft(t => {
          const newTime = Math.max(0, t - 1);
          if (newTime === 0) {
            setIsActive(false);
            setSessionCompleted(true);
            setIsBreak(!isBreak);
            // TimeLeft will be updated by the !isActive effect above
          }
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, isBreak, breakDuration, focusDuration]);

  const toggleTimer = () => {
    if (!isActive) {
      // Starting: set expiry
      const expiry = Date.now() + timeLeft * 1000;
      localStorage.setItem('zenflow_timer_expiry', expiry.toString());
    }
    setIsActive(!isActive);
  };
  
  const resetTimer = () => {
    setIsActive(false);
    const newTime = (isBreak ? breakDuration : focusDuration) * 60;
    setTimeLeft(newTime);
    localStorage.removeItem('zenflow_timer_expiry');
  };

  // Tasks
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('zenflow_tasks');
    return saved ? JSON.parse(saved) : [
      { id: '1', text: 'Draft Q3 Performance Report', completed: false, priority: 0 },
      { id: '2', text: 'Review design mockups', completed: false, priority: 3 },
      { id: '3', text: 'Morning hydration log', completed: true, priority: 1 },
      { id: '4', text: 'Prepare meeting agenda', completed: false, priority: 2 },
    ];
  });

  useEffect(() => {
    localStorage.setItem('zenflow_tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Sounds (Cleanup: remove previous built-in list from state initialization if any)
  const [playing, setPlaying] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('zenflow_playing');
    return saved ? JSON.parse(saved) : {};
  });
  const [volumes, setVolumes] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('zenflow_volumes');
    return saved ? JSON.parse(saved) : {};
  });
  const [masterVolume, setMasterVolume] = useState(() => {
    const saved = localStorage.getItem('zenflow_master_volume');
    return saved ? parseInt(saved) : 72;
  });

  useEffect(() => {
    localStorage.setItem('zenflow_playing', JSON.stringify(playing));
  }, [playing]);

  useEffect(() => {
    localStorage.setItem('zenflow_volumes', JSON.stringify(volumes));
  }, [volumes]);

  useEffect(() => {
    localStorage.setItem('zenflow_master_volume', masterVolume.toString());
  }, [masterVolume]);

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
      customSounds, addCustomSound, deleteCustomSound,
      playing, setPlaying,
      volumes, setVolumes,
      masterVolume, setMasterVolume,
      breathingPatterns, setBreathingPatterns,
      breathingHistory, setBreathingHistory,
      water, setWater,
      hydrationGoal, setHydrationGoal
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
