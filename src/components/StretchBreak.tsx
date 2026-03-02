import React, { useState, useEffect } from 'react';
import { ArrowLeft, Settings, Pause, Play, SkipForward, X, Activity, RotateCcw, CheckCircle2, Clock } from 'lucide-react';
import SharedHeader from './SharedHeader';
import { useAppContext } from '../AppContext';

const STRETCHES = [
  {
    id: 'neck-tilt',
    name: 'Neck Tilt',
    instructions: 'Gently tilt your head to the right and hold, then repeat on the left.',
    duration: 30,
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'shoulder-roll',
    name: 'Shoulder Rolls',
    instructions: 'Roll your shoulders backwards in a circular motion, then forwards.',
    duration: 20,
    image: 'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'wrist-stretch',
    name: 'Wrist Stretch',
    instructions: 'Extend one arm forward and gently pull your fingers back with the other hand.',
    duration: 25,
    image: 'https://images.unsplash.com/photo-1518611012118-29fa75a28420?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'side-stretch',
    name: 'Side Stretch',
    instructions: 'Reach one arm overhead and lean to the opposite side.',
    duration: 30,
    image: 'https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'back-arch',
    name: 'Back Arch',
    instructions: 'Place hands on lower back and gently arch backwards while looking up.',
    duration: 20,
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80'
  }
];

export default function StretchBreak({ onBack }: { onBack: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(STRETCHES[0].duration);
  const [isActive, setIsActive] = useState(true);

  const currentStretch = STRETCHES[currentIndex];
  
  // Progress Ring Calculation
  const radius = 88;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (timeLeft / currentStretch.duration) * circumference;

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleNext();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % STRETCHES.length;
    setCurrentIndex(nextIndex);
    setTimeLeft(STRETCHES[nextIndex].duration);
    setIsActive(true);
  };

  const handleRestart = () => {
    setTimeLeft(currentStretch.duration);
    setIsActive(true);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const sessionProgress = ((currentIndex + 1) / STRETCHES.length) * 100;

  return (
    <div className="flex flex-col h-full w-full bg-background-light text-slate-900 transition-colors duration-1000 relative overflow-hidden font-sans">
      
      <SharedHeader 
        title="Stretch Break" 
        onBack={onBack} 
        currentView="stretch"
        icon={Activity} 
        iconColor="text-orange-500"
      />

      <main className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-5xl mx-auto w-full px-4 py-6 md:py-10 flex flex-col items-center">
          
          {/* Hero Section */}
          <div className="w-full aspect-[16/9] lg:aspect-[21/9] rounded-3xl overflow-hidden mb-8 shadow-2xl relative group">
            <img 
              src={currentStretch.image} 
              className="w-full h-full object-cover transition-transform duration-10000 group-hover:scale-110" 
              alt={currentStretch.name} 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-6 md:p-10">
              <div className="p-6 md:p-8 rounded-[2rem] inline-block max-w-md bg-slate-900/80 border border-white/10 backdrop-blur-xl animate-in slide-in-from-bottom-4 duration-700 shadow-2xl">
                <span className="text-primary font-bold uppercase tracking-[0.2em] text-[10px] mb-3 block">The Sanctuary</span>
                <h1 className="text-2xl md:text-3xl font-serif font-black mb-3 text-white">
                  {currentStretch.name} <span className="text-white/30 text-lg ml-2 font-normal">{currentIndex + 1} of {STRETCHES.length}</span>
                </h1>
                <p className="text-white/90 text-sm md:text-lg leading-relaxed font-medium">
                  {currentStretch.instructions}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16 w-full justify-center pb-24">
            
            {/* Progress Ring Timer */}
            <div className="relative size-48 md:size-56 flex items-center justify-center">
              <svg className="absolute -rotate-90" height="100%" width="100%" viewBox="0 0 192 192">
                <circle 
                  className="text-slate-200" 
                  cx="96" cy="96" r="88" 
                  fill="transparent" 
                  stroke="currentColor" 
                  strokeWidth="8"
                />
                <circle 
                  className="text-primary transition-all duration-1000 ease-linear" 
                  cx="96" cy="96" r="88" 
                  fill="transparent" 
                  stroke="currentColor" 
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={progressOffset}
                  strokeLinecap="round"
                />
              </svg>
              <div className="flex flex-col items-center z-10">
                <span className="text-5xl font-black tabular-nums tracking-tighter">{formatTime(timeLeft)}</span>
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mt-1">Remaining</span>
              </div>
            </div>

            {/* Session Stats Card */}
            <div className="flex flex-col gap-6 w-full max-w-xs glass-panel p-6 rounded-3xl border-white/60">
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Session Progress</span>
                  <span className="text-sm font-black text-primary">{Math.round(sessionProgress)}%</span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(19,236,19,0.3)]" 
                    style={{ width: `${sessionProgress}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5 mb-1">
                    <CheckCircle2 size={12} className="text-emerald-500" />
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Completed</span>
                  </div>
                  <span className="font-bold text-lg">{currentIndex}/{STRETCHES.length}</span>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Clock size={12} className="text-slate-400" />
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Total Time</span>
                  </div>
                  <span className="font-bold text-lg">02:30</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Control Bar */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <div className="glass-panel px-6 py-3 rounded-full flex items-center gap-6 shadow-2xl border-white/40 backdrop-blur-xl">
          <button 
            onClick={handleRestart}
            className="flex flex-col items-center gap-1 group"
          >
            <div className="size-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-all">
              <RotateCcw size={18} className="text-slate-600" />
            </div>
            <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Restart</span>
          </button>

          <button 
            onClick={() => setIsActive(!isActive)}
            className="size-14 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-all"
          >
            {isActive ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
          </button>

          <button 
            onClick={handleNext}
            className="flex flex-col items-center gap-1 group"
          >
            <div className="size-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-all">
              <SkipForward size={18} className="text-slate-600" />
            </div>
            <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Skip</span>
          </button>

          <div className="w-px h-8 bg-slate-200 mx-1"></div>

          <button 
            onClick={onBack}
            className="flex flex-col items-center gap-1 group"
          >
            <div className="size-10 rounded-full bg-rose-50 flex items-center justify-center group-hover:bg-rose-100 transition-all">
              <X size={18} className="text-rose-500" />
            </div>
            <span className="text-[8px] font-bold uppercase tracking-widest text-rose-400">End</span>
          </button>
        </div>
      </nav>

      {/* Footer Branding */}
      <div className="fixed bottom-4 left-8 opacity-30 hidden lg:block pointer-events-none">
        <p className="text-[10px] tracking-[0.3em] uppercase font-bold">Experience: The Sanctuary</p>
      </div>
      <div className="fixed bottom-4 right-8 opacity-30 hidden lg:block pointer-events-none">
        <p className="text-[10px] tracking-[0.3em] uppercase font-bold">Zen Flow Wellness v2.4</p>
      </div>
    </div>
  );
}
