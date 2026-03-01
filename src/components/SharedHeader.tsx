import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Leaf, Settings, LucideIcon, Info } from 'lucide-react';

interface SharedHeaderProps {
  title: string;
  onBack: () => void;
  icon?: LucideIcon;
  iconColor?: string;
  actions?: React.ReactNode;
  showDashboardLink?: boolean;
}

export default function SharedHeader({ 
  title, 
  onBack, 
  icon: Icon, 
  iconColor = "text-primary", 
  actions,
  showDashboardLink = true
}: SharedHeaderProps) {
  const [activeTab, setActiveTab] = useState<'current' | 'dashboard' | 'studio'>('current');
  const [sliderStyle, setSliderStyle] = useState({ width: 0, transform: 'translateX(0px)' });
  const currentTabRef = useRef<HTMLButtonElement>(null);
  const dashboardTabRef = useRef<HTMLButtonElement>(null);
  const studioTabRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const updateSlider = () => {
    let activeRef;
    if (activeTab === 'current') activeRef = currentTabRef;
    else if (activeTab === 'dashboard') activeRef = dashboardTabRef;
    else activeRef = studioTabRef;

    if (activeRef.current && containerRef.current) {
      const rect = activeRef.current.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      setSliderStyle({
        width: rect.width,
        transform: `translateX(${rect.left - containerRect.left - 6}px)`
      });
    }
  };

  useEffect(() => {
    const timer = setTimeout(updateSlider, 50);
    window.addEventListener('resize', updateSlider);
    return () => {
      window.removeEventListener('resize', updateSlider);
      clearTimeout(timer);
    };
  }, [activeTab, showDashboardLink]);

  const handleDashboardClick = () => {
    setActiveTab('dashboard');
    setTimeout(onBack, 300);
  };

  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-forest-deep/5 px-6 md:px-10 py-4 glass-panel sticky top-0 z-50 shrink-0">
      <div className="flex items-center gap-4 text-forest-deep">
        <button onClick={onBack} className="p-2 hover:bg-primary/20 rounded-lg transition-colors md:hidden">
          <ArrowLeft size={20} />
        </button>
        <div className={`size-8 flex items-center justify-center bg-primary rounded-lg text-forest-deep`}>
          <Leaf size={18} strokeWidth={3} className="fill-current" />
        </div>
        <h2 className="text-forest-deep text-xl font-serif font-bold leading-tight tracking-tight">Zen Flow</h2>
      </div>
      
      <div className="flex flex-1 justify-end gap-4 md:gap-8 items-center">
        <nav className="hidden md:flex items-center">
          <div ref={containerRef} className="tab-switcher relative flex items-center bg-white/40 p-[6px] rounded-full backdrop-blur-md border border-white/50 shadow-sm">
            {/* Sliding Background */}
            <div 
              className="absolute top-[6px] left-[6px] h-[calc(100%-12px)] bg-white rounded-full shadow-md transition-all duration-300 ease-out z-10"
              style={{
                width: `${sliderStyle.width}px`,
                transform: sliderStyle.transform
              }}
            />
            
            {/* Current Page Tab */}
            <button 
              ref={currentTabRef}
              onClick={() => setActiveTab('current')}
              className={`relative z-20 px-6 py-2 rounded-full text-sm font-bold transition-colors duration-200 flex items-center gap-2 ${activeTab === 'current' ? 'text-forest-deep' : 'text-forest-deep/50 hover:text-forest-deep/70'}`}
            >
              {Icon && <Icon size={16} className={activeTab === 'current' ? iconColor : 'text-slate-400'} />}
              <span>{title}</span>
            </button>

            {/* Dashboard Tab */}
            {showDashboardLink && (
              <button 
                ref={dashboardTabRef}
                onClick={handleDashboardClick}
                className={`relative z-20 px-6 py-2 rounded-full text-sm font-bold transition-colors duration-200 flex items-center gap-2 ${activeTab === 'dashboard' ? 'text-forest-deep' : 'text-forest-deep/50 hover:text-forest-deep/70'}`}
              >
                <Leaf size={14} className={activeTab === 'dashboard' ? 'text-primary' : 'text-slate-400'} />
                <span>Dashboard</span>
              </button>
            )}

            {/* Studio Tab (Only show on Dashboard to prevent clutter on other pages) */}
            {!showDashboardLink && title === "Dashboard" && (
              <button 
                ref={studioTabRef}
                onClick={() => {
                  setActiveTab('studio');
                  const event = new CustomEvent('navigate', { detail: 'studio' });
                  window.dispatchEvent(event);
                }}
                className={`relative z-20 px-6 py-2 rounded-full text-sm font-bold transition-colors duration-200 flex items-center gap-2 ${activeTab === 'studio' ? 'text-forest-deep' : 'text-forest-deep/50 hover:text-forest-deep/70'}`}
              >
                <Info size={14} className={activeTab === 'studio' ? 'text-primary' : 'text-slate-400'} />
                <span>Studio</span>
              </button>
            )}
          </div>
        </nav>
        
        <div className="flex gap-2">
          {actions}
          {!actions && (
            <button className="flex size-10 items-center justify-center rounded-xl bg-white/50 text-forest-deep hover:bg-primary/20 transition-all">
              <Settings size={20} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
