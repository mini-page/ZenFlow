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

import SharedHeader from './components/SharedHeader';
import { Info } from 'lucide-react';

export type View = 'dashboard' | 'focus' | 'breathe' | 'hydrate' | 'tasks' | 'sounds' | 'stretch' | 'studio';

// Global keyboard shortcuts manager
function KeyboardManager({ currentView, setCurrentView }: { currentView: View, setCurrentView: (v: View) => void }) {
  // ... (unchanged)
  const { toggleTimer } = useAppContext();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement && ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
      switch (e.key.toLowerCase()) {
        case ' ': e.preventDefault(); toggleTimer(); break;
        case 'f': setCurrentView('focus'); break;
        case 'w': case 'h': setCurrentView('hydrate'); break;
        case 't': setCurrentView('tasks'); break;
        case 's': setCurrentView('sounds'); break;
        case 'b': setCurrentView('breathe'); break;
        case 'escape': if (currentView !== 'dashboard') setCurrentView('dashboard'); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleTimer, currentView, setCurrentView]);
  return null;
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
    // Clean up audio elements for sounds that were removed (custom sounds deleted)
    const currentSoundIds = new Set(sounds.map(s => s.id));
    Object.keys(audioRefs.current).forEach(id => {
      if (!currentSoundIds.has(id)) {
        audioRefs.current[id].pause();
        audioRefs.current[id].src = "";
        delete audioRefs.current[id];
      }
    });

    sounds.forEach(sound => {
      const url = sound.url || soundUrls[sound.id] || soundUrls['forest-rain']; // Use custom URL or fallback
      if (!audioRefs.current[sound.id]) {
        const audio = new Audio(url);
        audio.loop = true; 
        audioRefs.current[sound.id] = audio;
      }

      const audio = audioRefs.current[sound.id];
      // Update src if it changed (unlikely for built-in, but possible for custom)
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

export default function App() {
  const [currentView, setCurrentView] = useState<View>(() => {
    const saved = localStorage.getItem('zenflow_current_view');
    return (saved as View) || 'dashboard';
  });

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
    <AppProvider>
      <KeyboardManager currentView={currentView} setCurrentView={setCurrentView} />
      <AudioManager />
      <div className="h-[100dvh] w-full bg-white flex flex-col transition-colors duration-300 overflow-hidden">
        <div className="flex-1 relative overflow-hidden">
          {renderView()}
        </div>
      </div>
    </AppProvider>
  );
}
