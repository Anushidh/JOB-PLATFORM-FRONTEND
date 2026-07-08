import { cn } from '@/lib/utils';
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';

/* ─── Types ─── */
type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
  duration?: number;
}

interface ToastContextValue {
  toast: (options: Omit<Toast, 'id'>) => void;
  dismiss: (id: string) => void;
}

/* ─── Context ─── */
const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

/* ─── Provider ─── */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (options: Omit<Toast, 'id'>) => {
      const id = crypto.randomUUID();
      const newToast: Toast = { ...options, id };
      setToasts((prev) => [...prev, newToast]);

      const duration = options.duration ?? 4000;
      if (duration > 0) {
        setTimeout(() => dismiss(id), duration);
      }
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

/* ─── Container ─── */
function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  return createPortal(
    <div
      className="fixed z-9999 flex flex-col gap-3 max-w-[380px] w-[calc(100%-32px)] sm:w-full pointer-events-none top-4 left-1/2 -translate-x-1/2 sm:top-6 sm:right-6 sm:left-auto sm:translate-x-0"
      aria-live="polite"
      aria-atomic="false"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>,
    document.body
  );
}

/* ─── Toast Item ─── */
const variantConfig = {
  success: {
    icon: CheckCircle2,
    classes: 'text-success-600',
  },
  error: {
    icon: AlertCircle,
    classes: 'text-danger-600',
  },
  warning: {
    icon: AlertTriangle,
    classes: 'text-warning-600',
  },
  info: {
    icon: Info,
    classes: 'text-primary-600',
  },
};

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
}) {
  const config = variantConfig[toast.variant];
  const Icon = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.96 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        'pointer-events-auto',
        'flex items-start gap-3',
        'w-full rounded-xl',
        'bg-surface-elevated',
        'border border-border',
        'shadow-lg',
        'p-4',
      )}
      role="alert"
    >
      <Icon className={cn('size-5 shrink-0 mt-0.5', config.classes)} aria-hidden="true" />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">
          {toast.title}
        </p>
        {toast.description && (
          <p className="text-xs text-foreground-muted mt-0-5">
            {toast.description}
          </p>
        )}
      </div>

      <button
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 rounded-sm p-0-5 text-foreground-muted hover:text-foreground transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="size-4" />
      </button>
    </motion.div>
  );
}
