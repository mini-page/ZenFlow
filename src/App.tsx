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
import { AppProvider } from './AppContext';

import SharedHeader from './components/SharedHeader';
import { Info } from 'lucide-react';

export type View = 'dashboard' | 'focus' | 'breathe' | 'hydrate' | 'tasks' | 'sounds' | 'stretch' | 'studio';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');

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
      <div className="h-[100dvh] w-full bg-white flex flex-col transition-colors duration-300 overflow-hidden">
        <div className="flex-1 relative overflow-hidden">
          {renderView()}
        </div>
      </div>
    </AppProvider>
  );
}
