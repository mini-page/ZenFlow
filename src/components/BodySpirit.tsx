import React, { useState } from 'react';
import { Settings, User, Accessibility, Clock, Calendar, Play, ChevronRight, Timer, Footprints, Bell, Volume2, Armchair, Smile, Leaf, X } from 'lucide-react';
import SharedHeader from './SharedHeader';

interface BodySpiritProps {
  onBack: () => void;
  onStartStretch: () => void;
}

export default function BodySpirit({ onBack, onStartStretch }: BodySpiritProps) {
  const [postureInterval, setPostureInterval] = useState(15);
  const [movementInterval, setMovementInterval] = useState(60);
  const [isReminderActive, setIsReminderActive] = useState(true);
  const [alertStyle, setAlertStyle] = useState<'chime' | 'silent'>('chime');

  return (
    <div className="flex flex-col h-full w-full bg-background-light text-slate-900 transition-colors duration-1000 relative overflow-hidden font-sans">
      
      <SharedHeader 
        title="Body & Spirit" 
        onBack={onBack} 
        icon={Accessibility} 
        iconColor="text-primary"
      />

      <main className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="container mx-auto px-4 py-8 lg:px-20 lg:py-12 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
            
            {/* Left Column: Settings */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Body & Spirit</h1>
                <p className="text-slate-500 font-medium">Nurture your physical well-being while you work.</p>
              </div>

              {/* Main Card: Posture & Movement */}
              <div className="relative overflow-hidden rounded-2xl bg-white border border-sage-light shadow-sm">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 size-64 rounded-full bg-primary/5 blur-3xl"></div>
                <div className="relative p-6 md:p-8 flex flex-col gap-8">
                  
                  {/* Master Toggle Section */}
                  <div className="flex items-center justify-between pb-6 border-b border-sage-light">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center size-12 rounded-xl bg-primary/10 text-primary">
                        <Smile size={28} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">Mindful Reminders</h3>
                        <p className="text-sm text-slate-500">Receive gentle nudges to correct posture.</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={isReminderActive}
                        onChange={(e) => setIsReminderActive(e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-14 h-8 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                    </label>
                  </div>

                  {/* Settings Form */}
                  <div className="grid gap-8 md:grid-cols-2">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                          <Timer size={18} className="text-primary" />
                          Posture Check Interval
                        </label>
                        <span className="text-primary font-bold text-sm bg-primary/10 px-2 py-1 rounded">{postureInterval}m</span>
                      </div>
                      <input 
                        type="range" min="5" max="60" value={postureInterval}
                        onChange={(e) => setPostureInterval(parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary outline-none focus:ring-2 focus:ring-primary/50" 
                      />
                      <div className="flex justify-between text-xs text-slate-400 px-1 font-bold">
                        <span>5m</span>
                        <span>30m</span>
                        <span>60m</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                          <Footprints size={18} className="text-primary" />
                          Movement Breaks
                        </label>
                        <span className="text-primary font-bold text-sm bg-primary/10 px-2 py-1 rounded">{movementInterval}m</span>
                      </div>
                      <input 
                        type="range" min="15" max="120" step="15" value={movementInterval}
                        onChange={(e) => setMovementInterval(parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary outline-none focus:ring-2 focus:ring-primary/50" 
                      />
                      <div className="flex justify-between text-xs text-slate-400 px-1 font-bold">
                        <span>15m</span>
                        <span>60m</span>
                        <span>2h</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-2">
                        <Bell size={18} className="text-primary" />
                        Alert Style
                      </label>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setAlertStyle('chime')}
                          className={`flex-1 py-2 px-3 rounded-lg border font-medium text-sm transition-all ${alertStyle === 'chime' ? 'border-primary bg-primary/10 text-primary' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                        >
                          Gentle Chime
                        </button>
                        <button 
                          onClick={() => setAlertStyle('silent')}
                          className={`flex-1 py-2 px-3 rounded-lg border font-medium text-sm transition-all ${alertStyle === 'silent' ? 'border-primary bg-primary/10 text-primary' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                        >
                          Silent Toast
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                          <Volume2 size={18} className="text-primary" />
                          Volume
                        </label>
                        <span className="text-slate-500 text-sm">40%</span>
                      </div>
                      <div className="relative h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div className="absolute h-full bg-primary w-[40%] rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preview Section */}
                <div className="bg-slate-50 p-6 border-t border-sage-light">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Preview</h4>
                  <div className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-lg border-l-4 border-primary max-w-md mx-auto transform transition-transform hover:scale-[1.02] cursor-default border-slate-100">
                    <div className="bg-primary/10 p-2 rounded-full shrink-0 text-primary">
                      <Leaf size={20} />
                    </div>
                    <div className="flex-1">
                      <h5 className="text-sm font-bold text-slate-900 mb-1">Time to realign</h5>
                      <p className="text-sm text-slate-600 leading-snug">Take a deep breath and straighten your spine. You've got this.</p>
                    </div>
                    <button className="text-slate-400 hover:text-slate-600 transition-colors">
                      <X size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Ergonomics */}
              <div className="rounded-2xl bg-white border border-sage-light p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg text-primary">
                      <Armchair size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Desk Setup Guide</h3>
                  </div>
                  <button className="text-sm font-medium text-primary hover:text-primary-dark hover:underline">View Guide</button>
                </div>
                <p className="text-slate-500 text-sm">Learn how to position your monitor and chair for optimal comfort.</p>
              </div>
            </div>

            {/* Right Column: Sidebar Stats */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="sticky top-24 rounded-2xl bg-white border border-sage-light p-6 flex flex-col gap-6 h-fit shadow-sm">
                <div className="flex items-center gap-4 pb-4 border-b border-sage-light">
                  <div className="bg-emerald-100 rounded-full size-12 flex items-center justify-center text-emerald-600">
                    <Accessibility size={24} />
                  </div>
                  <div className="flex flex-col">
                    <h2 className="text-slate-900 text-lg font-bold">Physical Vitality</h2>
                    <p className="text-primary text-sm font-medium">Daily Progress</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 p-4 rounded-xl flex flex-col items-center justify-center text-center gap-1">
                    <Accessibility size={24} className="text-primary mb-1" />
                    <span className="text-2xl font-black text-slate-900">12</span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Stretches</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl flex flex-col items-center justify-center text-center gap-1">
                    <Clock size={24} className="text-primary mb-1" />
                    <span className="text-2xl font-black text-slate-900">45m</span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Movement</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-2">
                  <h3 className="text-sm font-bold text-slate-900">Weekly Consistency</h3>
                  <div className="h-32 flex items-end justify-between gap-2 px-2">
                    {[40, 60, 30, 85, 50, 20, 45].map((height, i) => (
                      <div 
                        key={i} 
                        className={`w-full rounded-t-sm transition-all duration-500 cursor-pointer ${i === 3 ? 'bg-primary shadow-[0_0_10px_rgba(19,236,19,0.3)]' : 'bg-slate-200 hover:bg-primary/40'}`} 
                        style={{ height: `${height}%` }}
                      ></div>
                    ))}
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase px-1">
                    <span>M</span><span>T</span><span>W</span><span className="text-primary">T</span><span>F</span><span>S</span><span>S</span>
                  </div>
                </div>

                <button 
                  onClick={onStartStretch}
                  className="w-full py-4 mt-2 bg-primary text-slate-900 rounded-xl font-black text-sm shadow-md hover:shadow-lg hover:bg-primary-dark transition-all transform active:scale-95 flex items-center justify-center gap-2"
                >
                  <Play size={18} fill="currentColor" />
                  START 2M STRETCH
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
