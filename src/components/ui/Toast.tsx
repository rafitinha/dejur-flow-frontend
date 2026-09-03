'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { CheckCircle2, X } from 'lucide-react';

export type ToastVariant = 'success' | 'error' | 'info';

export type ToastItem = {
  id: number;
  title: string;
  description?: string;
  variant?: ToastVariant;
};

type ToastContextValue = {
  showToast: (toast: Omit<ToastItem, 'id'>) => void;
  dismissToast: (id: number) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextIdRef = useRef(1);

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (toast: Omit<ToastItem, 'id'>) => {
      const id = nextIdRef.current++;
      setToasts((current) => [...current, { ...toast, id }]);
      window.setTimeout(() => dismissToast(id), 3000);
    },
    [dismissToast],
  );

  const value = useMemo(
    () => ({ showToast, dismissToast }),
    [dismissToast, showToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[120] flex w-full max-w-sm flex-col gap-2">
        {toasts.map((toast) => {
          const variant = toast.variant ?? 'info';
          const isError = variant === 'error';
          const isSuccess = variant === 'success';

          return (
            <div
              key={toast.id}
              className={[
                'pointer-events-auto flex items-start gap-3 rounded-xl border p-3 shadow-lg',
                isError
                  ? 'border-danger/40 bg-danger/10'
                  : isSuccess
                    ? 'border-success/40 bg-success/10'
                    : 'border-border bg-card',
              ].join(' ')}
            >
              <div className="mt-0.5">
                {isError ? (
                  <X className="h-4 w-4 text-danger" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-success" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">
                  {toast.title}
                </p>
                {toast.description && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {toast.description}
                  </p>
                )}
              </div>
              <button
                type="button"
                aria-label="Fechar notificação"
                className="rounded-md p-1 text-muted-foreground transition hover:bg-hover hover:text-foreground"
                onClick={() => dismissToast(toast.id)}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
