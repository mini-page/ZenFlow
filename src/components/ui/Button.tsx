import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'white';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  icon?: LucideIcon;
  loading?: boolean;
  children?: React.ReactNode;
}

export default function Button({ 
  variant = 'primary', 
  size = 'md', 
  icon: Icon, 
  loading, 
  children, 
  className = "",
  disabled,
  ...props 
}: ButtonProps) {
  const variants = {
    primary: 'bg-primary text-forest-deep hover:bg-primary-dark shadow-md active:scale-95',
    secondary: 'bg-blue-100 text-blue-600 hover:bg-blue-200 active:scale-95',
    ghost: 'bg-white/50 text-slate-600 hover:bg-primary/20 active:scale-95',
    danger: 'bg-rose-50 text-rose-500 hover:bg-rose-100 active:scale-95',
    white: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 active:scale-95'
  };

  const sizes = {
    sm: 'px-4 py-1.5 text-xs rounded-lg',
    md: 'px-6 py-2.5 text-sm rounded-xl',
    lg: 'px-8 py-4 text-base rounded-2xl',
    icon: 'size-10 flex items-center justify-center rounded-xl'
  };

  return (
    <button 
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 font-bold transition-all duration-200 
        disabled:opacity-50 disabled:pointer-events-none
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <div className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
      ) : Icon && <Icon size={size === 'sm' ? 14 : 18} />}
      {children}
    </button>
  );
}
