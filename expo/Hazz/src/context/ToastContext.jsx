import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-white border border-[#e6ecea] px-4 py-3 rounded-[12px] shadow-[0_8px_24px_-12px_rgba(14,26,22,0.35)] animate-in slide-in-from-bottom-5 fade-in duration-300">
          {toast.type === 'success' ? (
            <span className="w-8 h-8 rounded-[9px] bg-[rgba(23,163,119,0.14)] text-[#0b7a5b] grid place-items-center flex-shrink-0">
              <svg className="w-4 h-4 stroke-current stroke-2 fill-none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
            </span>
          ) : (
            <span className="w-8 h-8 rounded-[9px] bg-[#fdf3e3] text-[#c8811f] grid place-items-center flex-shrink-0">
              <svg className="w-4 h-4 stroke-current stroke-2 fill-none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            </span>
          )}
          <span className="text-[#0e1a16] text-[13.5px] font-semibold pr-2">{toast.message}</span>
        </div>
      )}
    </ToastContext.Provider>
  );
};
