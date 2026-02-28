import React, { useState, useEffect } from 'react';
import { ArrowLeft, Settings, PauseCircle, SkipForward, X, Activity, PlayCircle } from 'lucide-react';

const STRETCHES = [
  {
    id: 'neck-tilt',
    name: 'Neck Tilt',
    instructions: 'Gently tilt your head to the right and hold, then repeat on the left.',
    duration: 30,
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="5" r="2" />
        <path d="M12 7v6" />
        <path d="M8 11h8" />
        <path d="M12 13l-4 8" />
        <path d="M12 13l4 8" />
      </svg>
    )
  },
  {
    id: 'shoulder-roll',
    name: 'Shoulder Rolls',
    instructions: 'Roll your shoulders backwards in a circular motion, then forwards.',
    duration: 20,
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 7v10" />
        <path d="M18 11l-6-6-6 6" />
        <path d="M18 17l-6-6-6 6" />
      </svg>
    )
  },
  {
    id: 'wrist-stretch',
    name: 'Wrist Stretch',
    instructions: 'Extend one arm forward and gently pull your fingers back with the other hand.',
    duration: 25,
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
        <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
        <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
        <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
      </svg>
    )
  },
  {
    id: 'side-stretch',
    name: 'Side Stretch',
    instructions: 'Reach one arm overhead and lean to the opposite side.',
    duration: 30,
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 21 1.9-1.9" />
        <path d="m3 3 1.9 1.9" />
        <path d="M5 12h14" />
        <path d="m19 21-1.9-1.9" />
        <path d="m19 3-1.9 1.9" />
      </svg>
    )
  },
  {
    id: 'back-arch',
    name: 'Back Arch',
    instructions: 'Place hands on lower back and gently arch backwards while looking up.',
    duration: 20,
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v18" />
        <path d="M5 8l7-5 7 5" />
        <path d="M5 16l7 5 7-5" />
      </svg>
    )
  }
];

export default function StretchBreak({ onBack }: { onBack: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(STRETCHES[0].duration);
  const [isActive, setIsActive] = useState(true);

  const currentStretch = STRETCHES[currentIndex];

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

  const formatTime = (seconds: number) => {
    const s = seconds % 60;
    return s.toString().padStart(2, '0');
  };

  return (
    <div className="flex flex-col h-full w-full p-4 gap-4 bg-background-light text-sage-900 transition-colors duration-300 relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 blur-[120px] transition-colors duration-300"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-primary/10 blur-[100px] transition-colors duration-300"></div>
      </div>
      
      <header className="relative z-10 flex items-center justify-between px-2 pt-2 shrink-0">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="p-1.5 hover:bg-sage-100 rounded-lg transition-colors">
            <ArrowLeft className="text-sage-700" size={20} />
          </button>
          <div className="bg-emerald-100 p-1.5 rounded-lg">
            <Activity className="text-emerald-600" size={20} />
          </div>
          <h1 className="font-serif text-xl font-semibold text-sage-700">Stretch Break</h1>
        </div>
        <button className="p-2 hover:bg-sage-100 rounded-full transition-colors">
          <Settings className="text-sage-600" size={20} />
        </button>
      </header>

      <main className="relative z-10 flex-1 flex flex-col gap-4 px-2 overflow-y-auto custom-scrollbar py-4">
        <div className="text-center mt-2">
          <p className="text-sage-500 text-sm font-medium">Time to refresh your body</p>
        </div>

        <div className="flex flex-col gap-2 mt-2">
          <div className="flex justify-between items-end">
            <p className="text-sage-700 text-xs font-semibold uppercase tracking-wider">{currentStretch.name}</p>
            <p className="text-sage-700 text-xs font-bold">{currentIndex + 1} of {STRETCHES.length}</p>
          </div>
          <div className="h-2 w-full bg-sage-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-500" 
              style={{ width: `${((currentIndex + 1) / STRETCHES.length) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="relative group flex-1 min-h-[180px] mt-2">
          <div className="absolute inset-0 glass-panel rounded-2xl flex items-center justify-center p-6 overflow-hidden shadow-sm border border-sage-200/50">
            <div className="absolute inset-0 bg-primary/5 rounded-2xl"></div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="bg-white/80 p-6 rounded-full mb-4 shadow-inner border border-sage-100 text-sage-700">
                {currentStretch.icon}
              </div>
              <p className="text-sage-700 text-sm font-medium text-center italic px-4">
                "{currentStretch.instructions}"
              </p>
            </div>
          </div>
          <div className="absolute top-3 right-3 bg-primary text-forest-deep text-xs font-bold py-1 px-3 rounded-full shadow-sm">
            {currentStretch.duration}s
          </div>
        </div>

        <div className="flex flex-col items-center gap-1 mt-2">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-light text-sage-400">00</span>
            <span className="text-2xl text-sage-400">:</span>
            <span className="text-4xl font-bold text-sage-700">{formatTime(timeLeft)}</span>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sage-500">Seconds Remaining</p>
        </div>
      </main>

      <footer className="relative z-10 mt-auto pt-2 shrink-0">
        <div className="grid grid-cols-3 gap-3">
          <button onClick={() => setIsActive(!isActive)} className="flex flex-col items-center justify-center gap-1.5 py-4 glass-panel rounded-[2rem] text-sage-700 hover:bg-sage-100 transition-all border border-sage-200/50">
            {isActive ? <PauseCircle size={20} /> : <PlayCircle size={20} />}
            <span className="text-[10px] font-bold uppercase tracking-wider">{isActive ? 'Pause' : 'Resume'}</span>
          </button>
          <button onClick={handleNext} className="flex flex-col items-center justify-center gap-1.5 py-4 bg-primary text-forest-deep rounded-[2rem] hover:bg-primary-dark transition-all shadow-sm">
            <SkipForward size={20} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Skip</span>
          </button>
          <button onClick={onBack} className="flex flex-col items-center justify-center gap-1.5 py-4 glass-panel rounded-[2rem] text-red-600 hover:bg-red-50 transition-all border border-sage-200/50">
            <X size={20} />
            <span className="text-[10px] font-bold uppercase tracking-wider">End</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
