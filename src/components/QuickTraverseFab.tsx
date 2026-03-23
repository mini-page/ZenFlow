import React, { useEffect, useMemo, useState } from 'react';
import { Leaf, Timer, Wind, Droplet, MoonStar, ListTodo, BookOpen, Music, Activity, Cpu, Sparkles, Zap, X, LucideIcon } from 'lucide-react';
import { AppView, NAV_GROUPS, NAV_ITEMS } from '../navigation';

interface QuickTraverseFabProps {
  currentView: AppView;
  onNavigateView?: (view: AppView) => void;
}

export default function QuickTraverseFab({ currentView, onNavigateView }: QuickTraverseFabProps) {
  const initialGroup = NAV_ITEMS.find(i => i.view === currentView)?.group || 'Core';
  const [activeGroup, setActiveGroup] = useState<'Core' | 'Wellness' | 'Tools'>(initialGroup);
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [selectedView, setSelectedView] = useState<AppView>(currentView);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  const iconMap: Record<string, LucideIcon> = {
    leaf: Leaf,
    timer: Timer,
    wind: Wind,
    droplet: Droplet,
    'moon-star': MoonStar,
    'list-todo': ListTodo,
    'book-open': BookOpen,
    music: Music,
    activity: Activity,
    cpu: Cpu,
    sparkles: Sparkles,
  };

  const groupedItems = useMemo(
    () => NAV_ITEMS.filter(item => item.group === activeGroup),
    [activeGroup]
  );

  const toneMap: Record<AppView, { icon: string; chip: string; selected: string }> = {
    dashboard: {
      icon: 'bg-primary/20 text-primary-dark',
      chip: 'bg-primary/12 text-primary-dark border-primary/20',
      selected: 'bg-primary/15 border-primary/30 text-slate-900',
    },
    focus: {
      icon: 'bg-primary/20 text-primary-dark',
      chip: 'bg-primary/12 text-primary-dark border-primary/20',
      selected: 'bg-primary/15 border-primary/30 text-slate-900',
    },
    tasks: {
      icon: 'bg-amber-100 text-amber-700',
      chip: 'bg-amber-50 text-amber-700 border-amber-200',
      selected: 'bg-amber-50 border-amber-200 text-slate-900',
    },
    journal: {
      icon: 'bg-rose-100 text-rose-700',
      chip: 'bg-rose-50 text-rose-700 border-rose-200',
      selected: 'bg-rose-50 border-rose-200 text-slate-900',
    },
    habits: {
      icon: 'bg-fuchsia-100 text-fuchsia-700',
      chip: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
      selected: 'bg-fuchsia-50 border-fuchsia-200 text-slate-900',
    },
    breathe: {
      icon: 'bg-cyan-100 text-cyan-700',
      chip: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      selected: 'bg-cyan-50 border-cyan-200 text-slate-900',
    },
    hydrate: {
      icon: 'bg-blue-100 text-blue-700',
      chip: 'bg-blue-50 text-blue-700 border-blue-200',
      selected: 'bg-blue-50 border-blue-200 text-slate-900',
    },
    recovery: {
      icon: 'bg-indigo-100 text-indigo-700',
      chip: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      selected: 'bg-indigo-50 border-indigo-200 text-slate-900',
    },
    stretch: {
      icon: 'bg-emerald-100 text-emerald-700',
      chip: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      selected: 'bg-emerald-50 border-emerald-200 text-slate-900',
    },
    sounds: {
      icon: 'bg-purple-100 text-purple-700',
      chip: 'bg-purple-50 text-purple-700 border-purple-200',
      selected: 'bg-purple-50 border-purple-200 text-slate-900',
    },
    studio: {
      icon: 'bg-slate-100 text-slate-700',
      chip: 'bg-slate-100 text-slate-600 border-slate-200',
      selected: 'bg-slate-100 border-slate-300 text-slate-900',
    },
  };

  useEffect(() => {
    const currentGroup = NAV_ITEMS.find(i => i.view === currentView)?.group;
    if (currentGroup) setActiveGroup(currentGroup);
    setSelectedView(currentView);
  }, [currentView]);

  useEffect(() => {
    if (!isFabOpen) return;
    const selectedExists = groupedItems.some(item => item.view === selectedView);
    if (!selectedExists && groupedItems.length > 0) {
      setSelectedView(groupedItems[0].view);
    }
  }, [activeGroup, groupedItems, isFabOpen, selectedView]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
      if (target?.isContentEditable) return;

      if (e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setIsFabOpen(prev => {
          const next = !prev;
          if (next) setSelectedView(currentView);
          return next;
        });
        return;
      }

      if (e.key === 'Escape' && isFabOpen) {
        setIsFabOpen(false);
        return;
      }

      if (!isFabOpen) return;

      const currentGroupIndex = NAV_GROUPS.indexOf(activeGroup);
      const selectedIndex = groupedItems.findIndex(item => item.view === selectedView);

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const nextGroup = NAV_GROUPS[(currentGroupIndex - 1 + NAV_GROUPS.length) % NAV_GROUPS.length];
        setActiveGroup(nextGroup);
        const nextItems = NAV_ITEMS.filter(item => item.group === nextGroup);
        if (nextItems.length > 0) setSelectedView(nextItems[0].view);
        return;
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        const nextGroup = NAV_GROUPS[(currentGroupIndex + 1) % NAV_GROUPS.length];
        setActiveGroup(nextGroup);
        const nextItems = NAV_ITEMS.filter(item => item.group === nextGroup);
        if (nextItems.length > 0) setSelectedView(nextItems[0].view);
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (groupedItems.length === 0) return;
        const nextIndex = selectedIndex <= 0 ? groupedItems.length - 1 : selectedIndex - 1;
        setSelectedView(groupedItems[nextIndex].view);
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (groupedItems.length === 0) return;
        const nextIndex = selectedIndex < 0 || selectedIndex >= groupedItems.length - 1 ? 0 : selectedIndex + 1;
        setSelectedView(groupedItems[nextIndex].view);
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        const selected = groupedItems.find(item => item.view === selectedView);
        if (selected) handleNavigate(selected.view);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFabOpen, activeGroup, groupedItems, selectedView, currentView]);

  const handleNavigate = (view: AppView) => {
    setIsFabOpen(false);
    if (onNavigateView) {
      onNavigateView(view);
      return;
    }
    const event = new CustomEvent('navigate', { detail: view });
    window.dispatchEvent(event);
  };

  const switchGroupByOffset = (offset: -1 | 1) => {
    const currentGroupIndex = NAV_GROUPS.indexOf(activeGroup);
    const nextGroup = NAV_GROUPS[(currentGroupIndex + offset + NAV_GROUPS.length) % NAV_GROUPS.length];
    setActiveGroup(nextGroup);
    const nextItems = NAV_ITEMS.filter(item => item.group === nextGroup);
    if (nextItems.length > 0) setSelectedView(nextItems[0].view);
  };

  return (
    <>
      {isFabOpen && (
        <button
          className="fixed inset-0 z-[85] bg-black/20 backdrop-blur-[1px]"
          aria-label="Close navigation"
          onClick={() => setIsFabOpen(false)}
        />
      )}

      <div className="fixed bottom-6 right-6 z-[90] flex flex-col items-end gap-3">
        {isFabOpen && (
          <div
            className="w-[min(92vw,360px)] max-h-[68vh] overflow-hidden rounded-3xl bg-white/92 backdrop-blur-xl border border-white/70 shadow-2xl"
            onTouchStart={(e) => {
              const touch = e.touches[0];
              if (!touch) return;
              setTouchStart({ x: touch.clientX, y: touch.clientY });
            }}
            onTouchEnd={(e) => {
              if (!touchStart) return;
              const touch = e.changedTouches[0];
              if (!touch) return;

              const dx = touch.clientX - touchStart.x;
              const dy = touch.clientY - touchStart.y;
              const absDx = Math.abs(dx);
              const absDy = Math.abs(dy);

              // Horizontal-only swipe for category switch, preserving vertical list scroll.
              if (absDx >= 40 && absDx > absDy + 10) {
                if (dx > 0) switchGroupByOffset(-1);
                else switchGroupByOffset(1);
              }

              setTouchStart(null);
            }}
          >
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
              <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-slate-400">press A to toggle</p>
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
                const IconComp = iconMap[item.icon] || Sparkles;
                const tones = toneMap[item.view] || {
                  icon: 'bg-slate-100 text-slate-700',
                  chip: 'bg-slate-100 text-slate-600 border-slate-200',
                  selected: 'bg-slate-100 border-slate-300 text-slate-900',
                };
                return (
                  <button
                    key={item.view}
                    onClick={() => handleNavigate(item.view)}
                    onMouseEnter={() => setSelectedView(item.view)}
                    className={`w-full flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-all ${
                      isActive
                        ? `border ${tones.selected}`
                        : item.view === selectedView
                          ? 'bg-slate-100/90 border border-slate-300 text-slate-800'
                          : 'bg-white/65 border border-slate-200 text-slate-700 hover:bg-white'
                    }`}
                    title={`Go to ${item.label} (${item.shortcut})`}
                  >
                    <div className={`size-8 rounded-xl flex items-center justify-center ${isActive ? tones.icon : 'bg-slate-100 text-slate-500'}`}>
                      <IconComp size={16} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className={`text-sm font-bold ${isActive ? 'text-slate-900' : 'text-slate-700'}`}>{item.label}</p>
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-[0.16em] border rounded-full px-2 py-0.5 ${isActive ? tones.chip : 'text-slate-400 bg-slate-100/80 border-slate-200'}`}>
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
          title="Open navigation (A)"
        >
          <Zap size={22} />
        </button>
      </div>
    </>
  );
}
