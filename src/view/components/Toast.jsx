import { createContext, useContext, useMemo, useState } from "react";
const ToastContext = createContext(null);
export function ToastProvider({ children }) {
  const [message, setMessage] = useState("");
  const show = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 2400);
  };
  const value = useMemo(() => ({ show }), []);
  return (
    <ToastContext.Provider value={value}>
      {children}
      {message && (
        <div className="fixed bottom-5 right-5 z-[100] rounded-xl bg-slate-950 px-4 py-3 text-sm font-medium text-white shadow-2xl">
          {message}
        </div>
      )}
    </ToastContext.Provider>
  );
}
export const useToast = () => useContext(ToastContext);
