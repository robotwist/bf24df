import { useState, useCallback } from 'react';
import { ToastType } from '../components/common/Toast'; // Assuming Toast.tsx is in components/common
import { v4 as uuidv4 } from 'uuid';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

export const useToasts = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: ToastType = 'info', duration?: number) => {
    const id = uuidv4();
    const toastDuration = duration ?? 3000;
    setToasts(prev => [...prev, { id, message, type, duration: toastDuration }]);
    setTimeout(() => {
      removeToast(id);
    }, toastDuration);
  };

  const removeToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter(toast => toast.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}; 