import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Leaf, Settings, LucideIcon, Timer, Wind, Droplet, ListTodo, Music, Activity, Cpu } from 'lucide-react';
import { AppView, NAV_GROUPS, NAV_ITEMS } from '../navigation';

interface SharedHeaderProps {
  title: string;
  onBack: () => void;
  currentView: AppView;
  icon?: LucideIcon;
  iconColor?: string;
  actions?: React.ReactNode;
  onNavigateView?: (view: AppView) => void;
}

export default function SharedHeader({ 
  title, 
  onBack, 
  currentView,
  icon: Icon, 
  iconColor = "text-primary", 
  actions,
  onNavigateView
}: SharedHeaderProps) {
  const initialGroup = NAV_ITEMS.find(i => i.view === currentView)?.group || 'Core';
  const [activeGroup, setActiveGroup] = useState<'Core' | 'Wellness' | 'Tools'>(initialGroup);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Partial<Record<AppView, HTMLButtonElement | null>>>({});
  const [sliderStyle, setSliderStyle] = useState({
    width: 0,
    transform: 'translateX(0px)',
    opacity: 0,
  });

  const iconMap: Record<string, LucideIcon> = {
    leaf: Leaf,
    timer: Timer,
    wind: Wind,
    droplet: Droplet,
    'list-todo': ListTodo,
    music: Music,
    activity: Activity,
    cpu: Cpu,
  };

  const groupedItems = useMemo(
    () => NAV_ITEMS.filter(item => item.group === activeGroup),
    [activeGroup]
  );

  useEffect(() => {
    const currentGroup = NAV_ITEMS.find(i => i.view === currentView)?.group;
    if (currentGroup) {
      setActiveGroup(currentGroup);
    }
  }, [currentView]);

  useEffect(() => {
    const updateSlider = () => {
      const activeButton = buttonRefs.current[currentView];
      const container = containerRef.current;
      if (!activeButton || !container) {
        setSliderStyle(prev => ({ ...prev, opacity: 0 }));
        return;
      }

      const activeRect = activeButton.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      setSliderStyle({
        width: activeRect.width,
        transform: `translateX(${activeRect.left - containerRect.left}px)`,
        opacity: 1,
      });
    };

    updateSlider();
    window.addEventListener('resize', updateSlider);
    return () => window.removeEventListener('resize', updateSlider);
  }, [currentView]);

  const handleNavigate = (view: AppView) => {
    if (onNavigateView) {
      onNavigateView(view);
      return;
    }
    const event = new CustomEvent('navigate', { detail: view });
    window.dispatchEvent(event);
  };

  return (
    <header className="border-b border-solid border-forest-deep/5 px-4 md:px-8 py-3 glass-panel sticky top-0 z-50 shrink-0">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-forest-deep min-w-0">
          <button onClick={onBack} className="p-2 hover:bg-primary/20 rounded-lg transition-colors md:hidden">
            <ArrowLeft size={20} />
          </button>
          <div className={`size-8 flex items-center justify-center bg-primary rounded-lg text-forest-deep shrink-0`}>
            <Leaf size={18} strokeWidth={3} className="fill-current" />
          </div>
          <h2 className="text-forest-deep text-lg md:text-xl font-serif font-bold leading-tight tracking-tight truncate">Zen Flow</h2>
        </div>
        <div className="flex gap-2 shrink-0">
          {actions}
          {!actions && (
            <button className="flex size-10 items-center justify-center rounded-xl bg-white/50 text-forest-deep hover:bg-primary/20 transition-all">
              <Settings size={20} />
            </button>
          )}
        </div>
      </div>

      <nav className="mt-3 overflow-x-auto scrollbar-hide">
        <div className="mb-2 inline-flex items-center gap-1.5 bg-white/35 p-1 rounded-full border border-white/50">
          {NAV_GROUPS.map(group => (
            <button
              key={group}
              onClick={() => setActiveGroup(group)}
              className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider transition-all ${
                activeGroup === group
                  ? 'bg-white text-forest-deep shadow-sm'
                  : 'text-forest-deep/55 hover:text-forest-deep hover:bg-white/50'
              }`}
            >
              {group}
            </button>
          ))}
        </div>

        <div
          ref={containerRef}
          className="relative inline-flex min-w-full md:min-w-0 items-center gap-2 bg-white/40 p-1 rounded-full backdrop-blur-md border border-white/50 shadow-sm"
        >
          <div
            className="absolute top-1 bottom-1 bg-white rounded-full shadow-sm transition-all duration-300 ease-out"
            style={sliderStyle}
          />
          {groupedItems.map(item => {
            const isActive = item.view === currentView;
            const IconComp = iconMap[item.icon];
            return (
              <button
                key={item.view}
                ref={(el) => { buttonRefs.current[item.view] = el; }}
                onClick={() => handleNavigate(item.view)}
                className={`relative z-10 h-10 rounded-full text-xs md:text-sm font-bold transition-all duration-300 whitespace-nowrap flex items-center ${
                  isActive
                    ? 'px-4 gap-2 text-forest-deep'
                    : 'w-10 justify-center text-forest-deep/70 hover:text-forest-deep hover:bg-white/50'
                }`}
                title={`Go to ${item.label}`}
                aria-label={item.label}
              >
                <IconComp size={16} className={isActive ? 'text-primary' : 'text-forest-deep/70'} />
                {isActive && <span>{item.label}</span>}
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
