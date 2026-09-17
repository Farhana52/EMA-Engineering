'use client';

import { useEffect, useState, createContext, useContext, useCallback, useRef } from 'react';
import { CheckCircle2, XCircle, AlertCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: AlertCircle,
} as const;

const THEMES = {
  success: {
    border: 'border-emerald-200/80',
    iconBg: 'bg-emerald-100/80 text-emerald-700',
    title: 'text-emerald-950',
    bar: 'bg-emerald-500',
    badge: 'Success'
  },
  error: {
    border: 'border-rose-200/80',
    iconBg: 'bg-rose-100/80 text-rose-700',
    title: 'text-rose-950',
    bar: 'bg-rose-500',
    badge: 'Error'
  },
  info: {
    border: 'border-blue-200/80',
    iconBg: 'bg-blue-100/80 text-blue-700',
    title: 'text-blue-950',
    bar: 'bg-blue-500',
    badge: 'Notice'
  },
} as const;

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const [isExiting, setIsExiting] = useState(false);
  const theme = THEMES[toast.type];
  const Icon = ICONS[toast.type];

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onRemove(toast.id), 250);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => onRemove(toast.id), 250);
  };

  return (
    <div
      role="alert"
      style={{
        animation: isExiting ? 'none' : 'toastIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards'
      }}
      className={`relative flex items-start gap-3 p-3.5 sm:p-4 rounded-2xl bg-white border ${theme.border} shadow-[0_12px_40px_rgba(0,0,0,0.16)] w-[320px] sm:w-[380px] max-w-[calc(100vw-32px)] transition-all duration-200 ease-in overflow-hidden ${
        isExiting ? 'opacity-0 -translate-y-2 scale-95' : 'opacity-100 translate-y-0 scale-100'
      }`}
    >
      <div className={`w-8 h-8 rounded-xl ${theme.iconBg} flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs`}>
        <Icon className="w-5 h-5" />
      </div>

      <div className="flex-1 min-w-0 pr-2">
        <div className="flex items-center gap-2">
          <p className={`text-xs sm:text-sm font-bold tracking-tight leading-none ${theme.title}`}>
            {theme.badge}
          </p>
        </div>
        <p className="text-xs text-slate-700 font-medium mt-1 leading-snug break-words">
          {toast.message}
        </p>
      </div>

      <button
        type="button"
        onClick={handleDismiss}
        className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors flex-shrink-0 -mr-1"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Progress timer bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-slate-100 overflow-hidden">
        <div
          className={`h-full ${theme.bar} origin-left`}
          style={{ animation: 'shrink 4s linear forwards' }}
        />
      </div>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    counter.current += 1;
    const id = `toast-${Date.now()}-${counter.current}`;
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container pinned to Top-Right for optimal visibility */}
      <div
        aria-live="polite"
        className="fixed top-5 right-5 sm:top-6 sm:right-6 z-[999999] flex flex-col items-end gap-2.5 pointer-events-none no-print"
      >
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onRemove={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
