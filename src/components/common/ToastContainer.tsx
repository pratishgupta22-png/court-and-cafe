import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, Coffee, Sparkles, X, Info } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className="pointer-events-auto rounded-2xl bg-zinc-900/95 border border-amber-500/30 p-4 shadow-2xl backdrop-blur-md flex items-start gap-3 text-xs animate-in slide-in-from-top-3 fade-in duration-200"
        >
          <div className="flex-shrink-0 mt-0.5">
            {toast.type === 'order' && (
              <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <Coffee className="w-4 h-4" />
              </div>
            )}
            {toast.type === 'booking' && (
              <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <Sparkles className="w-4 h-4" />
              </div>
            )}
            {toast.type === 'success' && (
              <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            )}
            {toast.type === 'info' && (
              <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-500/30">
                <Info className="w-4 h-4" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-white text-xs">{toast.title}</h4>
            <p className="text-zinc-300 text-[11px] mt-0.5 leading-relaxed">{toast.message}</p>
          </div>

          <button
            onClick={() => dismissToast(toast.id)}
            className="flex-shrink-0 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
