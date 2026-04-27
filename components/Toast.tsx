import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from './icons/HamaUIIcons';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  addToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-4 left-4 right-4 md:bottom-auto md:left-auto md:top-24 md:right-8 z-[100] flex flex-col gap-4 pointer-events-none items-center md:items-end">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              pointer-events-auto flex items-start gap-4 px-5 py-4 rounded-2xl glass-elevated backdrop-blur-xl border-hama-gold/20 shadow-2xl w-64 md:w-72 transform transition-all duration-500 animate-in slide-in-from-right-8 fade-in relative overflow-hidden
              ${toast.type === 'success' ? 'bg-bg-secondary/90' : ''}
              ${toast.type === 'error' ? 'bg-bg-secondary/90' : ''}
              ${toast.type === 'info' ? 'bg-bg-secondary/90' : ''}
            `}
          >
            <div className="noise opacity-10" />
            <div className="relative z-10 mt-0.5">
              {toast.type === 'success' && <CheckCircle size={18} className="text-hama-success" />}
              {toast.type === 'error' && <AlertCircle size={18} className="text-red-500" />}
              {toast.type === 'info' && <Info size={18} className="text-hama-gold" />}
            </div>
            <div className="relative z-10 flex-1">
              <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] font-sans ${toast.type === 'success' ? 'text-hama-success' :
                toast.type === 'error' ? 'text-red-500' :
                  'text-hama-gold'
                }`}>
                {toast.type === 'success' ? 'Success' : toast.type === 'error' ? 'Error' : 'Info'}
              </h4>
              <p className="text-[11px] text-text-secondary mt-1 font-bold tracking-tight leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="relative z-10 text-text-muted hover:text-text-primary transition-colors p-1"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
