import React from 'react';
import { ArrowLeft, Leaf, Settings, LucideIcon } from 'lucide-react';
import { AppView } from '../navigation';
import QuickTraverseFab from './QuickTraverseFab';

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

      <QuickTraverseFab currentView={currentView} onNavigateView={onNavigateView} />
    </>
  );
}
