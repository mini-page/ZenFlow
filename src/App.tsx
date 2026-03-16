/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import FocusMode from './components/FocusMode';
import BreathStudio from './components/BreathStudio';
import Hydration from './components/Hydration';
import RecoveryTracker from './components/RecoveryTracker';
import TaskSoil from './components/TaskSoil';
import Journal from './components/Journal';
import HabitTracker from './components/HabitTracker';
import SoundSanctuary from './components/SoundSanctuary';
import StretchBreak from './components/StretchBreak';
import CreatorStudio from './components/CreatorStudio';
import { AppProvider, useAppContext } from './AppContext';
import { AppView } from './navigation';
import { formatTime } from './utils/format';

import SharedHeader from './components/SharedHeader';
import Toast from './components/ui/Toast';
import { Info, Timer, Play, Pause, Music, X } from 'lucide-react';

export type View = AppView;
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const PWA_PROMPT_STATE_KEY = 'zenflow_pwa_prompt_state';

// Global keyboard shortcuts manager
function KeyboardManager({ currentView, setCurrentView }: { currentView: View, setCurrentView: (v: View) => void }) {
  const { toggleTimer } = useAppContext();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement && ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
      switch (e.key.toLowerCase()) {
        case ' ': e.preventDefault(); toggleTimer(); break;
        case 'd': setCurrentView('dashboard'); break;
        case 'f': setCurrentView('focus'); break;
        case 'w': setCurrentView('hydrate'); break;
        case 'h': setCurrentView('habits'); break;
        case 'r': setCurrentView('recovery'); break;
        case 't': setCurrentView('tasks'); break;
        case 'n': setCurrentView('journal'); break;
        case 's': setCurrentView('sounds'); break;
        case 'b': setCurrentView('breathe'); break;
        case 'x': setCurrentView('stretch'); break;
        case 'i': setCurrentView('studio'); break;
        case 'escape': if (currentView !== 'dashboard') setCurrentView('dashboard'); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleTimer, currentView, setCurrentView]);
  return null;
}

// Flow Pill Component (Contextual Action Bar)
function FlowPill({ currentView, setCurrentView }: { currentView: View, setCurrentView: (v: View) => void }) {
  const { isActive, timeLeft, isBreak, toggleTimer, resetTimer, playing, setPlaying } = useAppContext();
  
  const hasActiveSounds = Object.values(playing).some(isPlay => isPlay);
  
  const [position, setPosition] = useState(() => {
    const saved = localStorage.getItem('zenflow_pill_pos');
    return saved ? JSON.parse(saved) : { x: window.innerWidth / 2 - 100, y: window.innerHeight - 100 };
  });
  
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const pillRef = React.useRef<HTMLDivElement>(null);

  const shouldShow = (isActive || hasActiveSounds) && currentView !== 'dashboard';

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const newX = Math.max(20, Math.min(window.innerWidth - 220, e.clientX - dragOffset.x));
      const newY = Math.max(20, Math.min(window.innerHeight - 80, e.clientY - dragOffset.y));
      const newPos = { x: newX, y: newY };
      setPosition(newPos);
      localStorage.setItem('zenflow_pill_pos', JSON.stringify(newPos));
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      const touch = e.touches[0];
      const newX = Math.max(20, Math.min(window.innerWidth - 220, touch.clientX - dragOffset.x));
      const newY = Math.max(20, Math.min(window.innerHeight - 80, touch.clientY - dragOffset.y));
      const newPos = { x: newX, y: newY };
      setPosition(newPos);
      localStorage.setItem('zenflow_pill_pos', JSON.stringify(newPos));
    };
    const handleEnd = () => setIsDragging(false);
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, dragOffset]);

  if (!shouldShow) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (pillRef.current) {
      const rect = pillRef.current.getBoundingClientRect();
      setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      setIsDragging(true);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (pillRef.current) {
      const rect = pillRef.current.getBoundingClientRect();
      const touch = e.touches[0];
      setDragOffset({ x: touch.clientX - rect.left, y: touch.clientY - rect.top });
      setIsDragging(true);
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const stopSounds = () => {
    setPlaying({});
  };

  return (
    <div
      ref={pillRef}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      className={`fixed z-[100] select-none ${isDragging ? 'cursor-grabbing scale-105' : 'cursor-grab'} transition-transform duration-200`}
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
    >
      <div className="bg-white/90 backdrop-blur-xl border border-white shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-full px-4 py-2 flex items-center gap-4 text-slate-900">
        {isActive && (
          <div className="flex items-center gap-3 pr-4 border-r border-slate-200 pointer-events-auto" onMouseDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()}>
            <button 
              onClick={() => setCurrentView('focus')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors ${isBreak ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' : 'bg-primary/10 text-primary-dark hover:bg-primary/20'}`}
            >
              <Timer size={14} className={isActive ? "animate-pulse" : ""} />
              <span className="font-mono font-bold text-sm tracking-tighter tabular-nums">{formatTime(timeLeft)}</span>
            </button>
            <button onClick={toggleTimer} className="text-slate-600 hover:text-slate-900 transition-colors">
              {isActive ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
            </button>
          </div>
        )}

        {hasActiveSounds && (
          <div className="flex items-center gap-3 pointer-events-auto" onMouseDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()}>
            <button 
              onClick={() => setCurrentView('sounds')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors"
            >
              <Music size={14} className="animate-bounce" style={{ animationDuration: '2s' }} />
              <span className="text-xs font-bold uppercase tracking-wider">Audio</span>
            </button>
            <button onClick={stopSounds} className="text-slate-400 hover:text-red-500 transition-colors p-1" title="Stop All Sounds">
              <X size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Global Audio Manager for gapless playback
function AudioManager() {
  const { sounds, playing, volumes, masterVolume } = useAppContext();
  const audioRefs = React.useRef<Record<string, HTMLAudioElement>>({});

  // Map of sound IDs to sample audio files (for demonstration)
  const soundUrls: Record<string, string> = {
    'forest-rain': 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_82c2b0d00f.mp3?filename=rain-in-forest-birds-nature-111405.mp3',
    'ocean-waves': 'https://cdn.pixabay.com/download/audio/2021/08/09/audio_dc39bde80a.mp3?filename=ocean-waves-112906.mp3',
    'crackling-fire': 'https://cdn.pixabay.com/download/audio/2022/02/07/audio_73133b3a7a.mp3?filename=crackling-fire-14759.mp3',
    'lofi-stream': 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf589.mp3?filename=lofi-study-112191.mp3'
  };

  useEffect(() => {
    // Clean up audio elements for sounds that were removed
    const currentSoundIds = new Set(sounds.map(s => s.id));
    Object.keys(audioRefs.current).forEach(id => {
      if (!currentSoundIds.has(id)) {
        audioRefs.current[id].pause();
        audioRefs.current[id].src = "";
        delete audioRefs.current[id];
      }
    });

    sounds.forEach(sound => {
      const url = sound.url || soundUrls[sound.id] || soundUrls['forest-rain'];
      if (!audioRefs.current[sound.id]) {
        const audio = new Audio(url);
        audio.loop = true; 
        audioRefs.current[sound.id] = audio;
      }

      const audio = audioRefs.current[sound.id];
      if (sound.url && audio.src !== sound.url) {
        audio.src = sound.url;
      }

      const targetVolume = (volumes[sound.id] || 0) / 100 * (masterVolume / 100);
      audio.volume = Math.max(0, Math.min(1, targetVolume));

      if (playing[sound.id]) {
        if (audio.paused) {
          audio.play().catch(e => console.log('Audio playback prevented:', e));
        }
      } else {
        if (!audio.paused) {
          audio.pause();
        }
      }
    });
  }, [playing, volumes, masterVolume, sounds]);

  return null;
}

function AppContent() {
  const [currentView, setCurrentView] = useState<View>(() => {
    const saved = localStorage.getItem('zenflow_current_view');
    return (saved as View) || 'dashboard';
  });
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const installPromptTriedRef = React.useRef(false);

  const { isActive, timeLeft, isBreak } = useAppContext();

  // Dynamic Tab Title
  useEffect(() => {
    if (isActive) {
      const m = Math.floor(timeLeft / 60);
      const s = timeLeft % 60;
      const timeStr = `${m}:${s.toString().padStart(2, '0')}`;
      document.title = `${isBreak ? '☕' : '🌱'} ${timeStr} | ZenFlow`;
    } else {
      document.title = 'ZenFlow - Productivity & Wellness';
    }
  }, [isActive, timeLeft, isBreak]);

  useEffect(() => {
    localStorage.setItem('zenflow_current_view', currentView);
  }, [currentView]);

  useEffect(() => {
    const handleNavigate = (e: any) => {
      if (e.detail) setCurrentView(e.detail);
    };
    window.addEventListener('navigate', handleNavigate);
    return () => window.removeEventListener('navigate', handleNavigate);
  }, []);

  useEffect(() => {
    const savedPromptState = localStorage.getItem(PWA_PROMPT_STATE_KEY);
    if (savedPromptState === 'accepted' || savedPromptState === 'dismissed') return;

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredInstallPrompt(event as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      localStorage.setItem(PWA_PROMPT_STATE_KEY, 'accepted');
      setDeferredInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  useEffect(() => {
    const savedPromptState = localStorage.getItem(PWA_PROMPT_STATE_KEY);
    if (savedPromptState === 'accepted' || savedPromptState === 'dismissed') return;
    if (currentView !== 'dashboard') return;
    if (!deferredInstallPrompt) return;
    if (installPromptTriedRef.current) return;

    installPromptTriedRef.current = true;

    (async () => {
      try {
        await deferredInstallPrompt.prompt();
        const choice = await deferredInstallPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          localStorage.setItem(PWA_PROMPT_STATE_KEY, 'accepted');
        } else {
          localStorage.setItem(PWA_PROMPT_STATE_KEY, 'dismissed');
        }
      } catch {
        localStorage.setItem(PWA_PROMPT_STATE_KEY, 'dismissed');
      } finally {
        setDeferredInstallPrompt(null);
      }
    })();
  }, [currentView, deferredInstallPrompt]);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard onNavigate={setCurrentView} />;
      case 'focus': return <FocusMode onBack={() => setCurrentView('dashboard')} />;
      case 'breathe': return <BreathStudio onBack={() => setCurrentView('dashboard')} />;
      case 'hydrate': return <Hydration onBack={() => setCurrentView('dashboard')} />;
      case 'recovery': return <RecoveryTracker onBack={() => setCurrentView('dashboard')} />;
      case 'tasks': return <TaskSoil onBack={() => setCurrentView('dashboard')} />;
      case 'journal': return <Journal onBack={() => setCurrentView('dashboard')} />;
      case 'habits': return <HabitTracker onBack={() => setCurrentView('dashboard')} />;
      case 'sounds': return <SoundSanctuary onBack={() => setCurrentView('dashboard')} />;
      case 'stretch': return <StretchBreak onBack={() => setCurrentView('dashboard')} />;
      case 'studio': return <CreatorStudio onBack={() => setCurrentView('dashboard')} />;
      default: return <Dashboard onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="h-[100dvh] w-full bg-white flex flex-col transition-all duration-1000 overflow-hidden relative">
      <KeyboardManager currentView={currentView} setCurrentView={setCurrentView} />
      <FlowPill currentView={currentView} setCurrentView={setCurrentView} />
      <AudioManager />
      <Toast />

      <div key={currentView} className="flex-1 relative overflow-hidden animate-in fade-in duration-700">
        {renderView()}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
