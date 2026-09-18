import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { ToastNotification } from '../types';

interface ToastContainerProps {
  toasts: ToastNotification[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onDismiss,
}) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-2xl border p-3.5 shadow-xl transition-all duration-300 animate-in slide-in-from-bottom-5 bg-white ${
              isSuccess
                ? 'border-emerald-200 text-slate-900'
                : isError
                ? 'border-rose-200 text-slate-900'
                : 'border-slate-200 text-slate-900'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {isSuccess && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
              {isError && <AlertCircle className="h-4 w-4 text-rose-600" />}
              {!isSuccess && !isError && <Info className="h-4 w-4 text-amber-600" />}
            </div>

            <div className="flex-1 min-w-0">
              <h5 className="font-display text-xs font-bold text-slate-900 leading-snug">
                {toast.title}
              </h5>
              {toast.message && (
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  {toast.message}
                </p>
              )}
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              className="shrink-0 rounded-lg p-1 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
