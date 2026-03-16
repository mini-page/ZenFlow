import React from 'react';
import { Check } from 'lucide-react';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  id?: string;
  disabled?: boolean;
  className?: string;
}

export default function Checkbox({ 
  checked, 
  onChange, 
  label, 
  id, 
  disabled = false,
  className = "" 
}: CheckboxProps) {
  const identifier = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`flex items-center gap-3 group cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      <div className="relative flex items-center justify-center">
        <input
          type="checkbox"
          id={identifier}
          checked={checked}
          onChange={(e) => !disabled && onChange(e.target.checked)}
          disabled={disabled}
          className="peer appearance-none size-6 rounded-lg border-2 border-slate-200 checked:border-primary checked:bg-primary transition-all duration-300 cursor-pointer outline-none focus:ring-2 focus:ring-primary/30"
        />
        <Check 
          size={14} 
          className={`absolute text-forest-deep pointer-events-none transition-all duration-300 transform ${checked ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} 
          strokeWidth={4}
        />
      </div>
      {label && (
        <label 
          htmlFor={identifier} 
          className={`text-sm font-medium select-none cursor-pointer transition-colors ${checked ? 'text-slate-400 line-through' : 'text-slate-700'} group-hover:text-slate-900`}
        >
          {label}
        </label>
      )}
    </div>
  );
}
