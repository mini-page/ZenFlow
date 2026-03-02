/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import FocusMode from './components/FocusMode';
import BreathStudio from './components/BreathStudio';
import Hydration from './components/Hydration';
import TaskSoil from './components/TaskSoil';
import SoundSanctuary from './components/SoundSanctuary';
import StretchBreak from './components/StretchBreak';
import CreatorStudio from './components/CreatorStudio';
import { AppProvider, useAppContext } from './AppContext';
import { AppView } from './navigation';

import SharedHeader from './components/SharedHeader';
import { Info, Timer, Play, Pause, Music, X } from 'lucide-react';

export type View = AppView;

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
        case 'w': case 'h': setCurrentView('hydrate'); break;
        case 't': setCurrentView('tasks'); break;
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
  
  // Only show if timer is active or sounds are playing, AND we aren't already looking at the primary controls
  const shouldShow = (isActive || hasActiveSounds) && currentView !== 'dashboard';

  if (!shouldShow) return null;

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const stopSounds = () => {
    setPlaying({});
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-10 fade-in duration-500">
      <div className="bg-white/90 backdrop-blur-xl border border-white shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-full px-4 py-2 flex items-center gap-4 text-slate-900">
        
        {isActive && (
          <div className="flex items-center gap-3 pr-4 border-r border-slate-200">
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
          <div className="flex items-center gap-3">
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

  const { isActive } = useAppContext();

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

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard onNavigate={setCurrentView} />;
      case 'focus': return <FocusMode onBack={() => setCurrentView('dashboard')} />;
      case 'breathe': return <BreathStudio onBack={() => setCurrentView('dashboard')} />;
      case 'hydrate': return <Hydration onBack={() => setCurrentView('dashboard')} />;
      case 'tasks': return <TaskSoil onBack={() => setCurrentView('dashboard')} />;
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
      
      <div className="flex-1 relative overflow-hidden">
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
