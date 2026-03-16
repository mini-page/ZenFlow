import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  hoverable?: boolean;
  activeScale?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  title?: string; // Support for the title prop used in RecoveryTracker
}

export default function GlassCard({ 
  children, 
  onClick, 
  className = "", 
  hoverable = true,
  activeScale = true,
  padding = 'md'
}: GlassCardProps) {
  const paddingMap = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  return (
    <div 
      onClick={onClick}
      className={`
        glass-panel rounded-[2.5rem] border border-white/40 shadow-sm transition-all duration-300
        ${paddingMap[padding]}
        ${onClick ? 'cursor-pointer' : ''}
        ${hoverable && onClick ? 'hover:bg-white/80 hover:-translate-y-1 hover:shadow-lg' : ''}
        ${activeScale && onClick ? 'active:scale-[0.98]' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
