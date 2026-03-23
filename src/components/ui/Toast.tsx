import React from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useAppContext } from '../../AppContext';

export default function Toast() {
  const { toast } = useAppContext();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="text-emerald-500" size={20} />,
    error: <AlertCircle className="text-rose-500" size={20} />,
    info: <Info className="text-blue-500" size={20} />
  };

  const bgColors = {
    success: 'bg-emerald-50/90 border-emerald-100',
    error: 'bg-rose-50/90 border-rose-100',
    info: 'bg-blue-50/90 border-blue-100'
  };

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] w-[min(90vw,400px)] animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className={`
        ${bgColors[toast.type]}
        backdrop-blur-md border shadow-lg rounded-2xl p-4
        flex items-start gap-3 transition-all duration-300
      `}>
        <div className="shrink-0 mt-0.5">
          {icons[toast.type]}
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-slate-800 leading-tight">
            {toast.message}
          </p>
        </div>
      </div>
    </div>
  );
}
