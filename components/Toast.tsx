import React, { useState, createContext, useContext, useCallback, ReactNode } from 'react';
import { CheckCircle, Info, X, Gem } from 'lucide-react';

interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'info';
}

interface ToastContextType {
  addToast: (message: string, type?: 'success' | 'info') => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: 'success' | 'info' = 'info') => {
    const id = Date.now();
    setToasts(prevToasts => [...prevToasts, { id, message, type }]);

    const timer = setTimeout(() => {
      removeToast(id);
    }, 4000);

    return () => clearTimeout(timer);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-5 right-5 z-[100] space-y-2 w-full max-w-xs">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className="bg-white rounded-lg shadow-soft border-l-4 p-4 flex items-start space-x-3 animate-fade-in-left"
            style={{ borderColor: toast.type === 'success' ? '#D32F2F' : '#DAB982' }}
          >
            <div className="flex-shrink-0 pt-0.5">
                {toast.type === 'success' ? (
                    <CheckCircle className="text-primary" size={20} />
                ) : (
                    <Gem className="text-gold" size={20} />
                )}
            </div>
            <p className="flex-1 text-sm font-semibold text-neutral-900">{toast.message}</p>
            <button onClick={() => removeToast(toast.id)} className="text-neutral-800 hover:text-neutral-900 flex-shrink-0">
                <X size={16}/>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
