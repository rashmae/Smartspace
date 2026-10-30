import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let icon = <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />;
        let borderClass = 'border-emerald-300 bg-white text-emerald-950';

        if (toast.type === 'error') {
          icon = <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />;
          borderClass = 'border-red-300 bg-white text-red-950';
        } else if (toast.type === 'warning') {
          icon = <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />;
          borderClass = 'border-amber-300 bg-white text-amber-950';
        } else if (toast.type === 'info') {
          icon = <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />;
          borderClass = 'border-blue-300 bg-white text-blue-950';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-xl border shadow-lg flex items-start justify-between gap-3 animate-in slide-in-from-bottom-3 duration-200 ${borderClass}`}
          >
            <div className="flex items-start gap-2.5">
              {icon}
              <div className="space-y-0.5 text-xs">
                <div className="font-bold text-slate-900">{toast.title}</div>
                <div className="text-slate-600 leading-normal">{toast.message}</div>
              </div>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-700 cursor-pointer p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
