import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Leaf, Settings, LucideIcon, Timer, Wind, Droplet, ListTodo, Music, Activity, Cpu, Compass, X } from 'lucide-react';
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
  actions,
  onNavigateView
}: SharedHeaderProps) {
  const initialGroup = NAV_ITEMS.find(i => i.view === currentView)?.group || 'Core';
  const [activeGroup, setActiveGroup] = useState<'Core' | 'Wellness' | 'Tools'>(initialGroup);
  const [isFabOpen, setIsFabOpen] = useState(false);

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
    if (currentGroup) setActiveGroup(currentGroup);
  }, [currentView]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
      if (target?.isContentEditable) return;

      if (e.key.toLowerCase() === 'g') {
        e.preventDefault();
        setIsFabOpen(prev => !prev);
      }

      if (e.key === 'Escape' && isFabOpen) {
        setIsFabOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFabOpen]);

  const handleNavigate = (view: AppView) => {
    setIsFabOpen(false);
    if (onNavigateView) {
      onNavigateView(view);
      return;
    }
    const event = new CustomEvent('navigate', { detail: view });
    window.dispatchEvent(event);
  };

  return (
    <>
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[min(94vw,1080px)]">
        <div className="glass-panel px-4 md:px-6 py-3 rounded-full flex items-center justify-between gap-3 shadow-2xl border border-white/40 backdrop-blur-xl">
          <div className="flex items-center gap-3 text-forest-deep min-w-0">
            <button onClick={onBack} className="p-2 hover:bg-primary/20 rounded-full transition-colors md:hidden">
              <ArrowLeft size={20} />
            </button>
            <div className="size-8 flex items-center justify-center bg-primary rounded-full text-forest-deep shrink-0">
              <Leaf size={18} strokeWidth={3} className="fill-current" />
            </div>
            <h2 className="text-forest-deep text-base md:text-lg font-serif font-bold leading-tight tracking-tight truncate">
              {title}
            </h2>
          </div>
          <div className="flex gap-2 shrink-0">
            {actions}
            {!actions && (
              <button className="flex size-10 items-center justify-center rounded-full bg-white/50 text-forest-deep hover:bg-primary/20 transition-all">
                <Settings size={20} />
              </button>
            )}
          </div>
        </div>
      </header>
      <div className="h-24 shrink-0" aria-hidden />

      {isFabOpen && (
        <button
          className="fixed inset-0 z-[85] bg-black/20 backdrop-blur-[1px]"
          aria-label="Close navigation"
          onClick={() => setIsFabOpen(false)}
        />
      )}

      <div className="fixed bottom-6 right-6 z-[90] flex flex-col items-end gap-3">
        {isFabOpen && (
          <div className="w-[min(92vw,360px)] max-h-[68vh] overflow-hidden rounded-3xl bg-white/92 backdrop-blur-xl border border-white/70 shadow-2xl">
            <div className="p-4 border-b border-slate-200/70">
              <div className="flex items-center justify-between">
                <p className="text-sm font-black text-slate-800">Quick Traverse</p>
                <button
                  onClick={() => setIsFabOpen(false)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  aria-label="Close quick traverse"
                >
                  <X size={16} />
                </button>
              </div>
              <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-slate-400">press G to toggle</p>
            </div>

            <div className="p-3 border-b border-slate-200/70">
              <div className="inline-flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-full">
                {NAV_GROUPS.map(group => (
                  <button
                    key={group}
                    onClick={() => setActiveGroup(group)}
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.15em] transition-all ${
                      activeGroup === group
                        ? 'bg-white text-slate-800 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {group}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 overflow-y-auto max-h-[46vh] custom-scrollbar space-y-2">
              {groupedItems.map(item => {
                const isActive = item.view === currentView;
                const IconComp = iconMap[item.icon];
                return (
                  <button
                    key={item.view}
                    onClick={() => handleNavigate(item.view)}
                    className={`w-full flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-all ${
                      isActive
                        ? 'bg-primary/15 border border-primary/30 text-slate-900'
                        : 'bg-white/65 border border-slate-200 text-slate-700 hover:bg-white'
                    }`}
                    title={`Go to ${item.label} (${item.shortcut})`}
                  >
                    <div className={`size-8 rounded-xl flex items-center justify-center ${isActive ? 'bg-primary/20 text-primary-dark' : 'bg-slate-100 text-slate-500'}`}>
                      <IconComp size={16} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className={`text-sm font-bold ${isActive ? 'text-slate-900' : 'text-slate-700'}`}>{item.label}</p>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400 bg-slate-100/80 border border-slate-200 rounded-full px-2 py-0.5">
                      {item.shortcut}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <button
          onClick={() => setIsFabOpen(prev => !prev)}
          className={`size-14 rounded-full border shadow-xl flex items-center justify-center transition-all ${
            isFabOpen
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white/95 text-forest-deep border-white/80 hover:bg-primary hover:text-forest-deep'
          }`}
          aria-label="Open page navigation"
          title="Open navigation (G)"
        >
          <Compass size={22} />
        </button>
      </div>
    </>
  );
}
