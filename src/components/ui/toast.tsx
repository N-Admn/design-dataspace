import * as React from 'react'
import { AlertCircle, CheckCircle2, X } from 'lucide-react'

import { cn } from '@/lib/utils'

type ToastVariant = 'success' | 'error'

interface ToastOptions {
  title: string
  description?: string
  variant?: ToastVariant
}

interface ToastItem extends ToastOptions {
  id: number
}

const TOAST_DURATION_MS = 4000

const ToastContext = React.createContext<(options: ToastOptions) => void>(() => {})

let toastIdCounter = 0

function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([])

  const dismiss = React.useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = React.useCallback(
    (options: ToastOptions) => {
      toastIdCounter += 1
      const id = toastIdCounter
      setToasts((prev) => [...prev, { ...options, id }])
      window.setTimeout(() => dismiss(id), TOAST_DURATION_MS)
    },
    [dismiss],
  )

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed right-4 top-4 z-[100] flex w-full max-w-sm flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className="flex items-start gap-2.5 rounded-lg border border-border bg-card px-4 py-3 shadow-lg animate-in fade-in-0 slide-in-from-top-2"
          >
            {t.variant === 'error' ? (
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
            ) : (
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">{t.title}</p>
              {t.description && <p className="mt-0.5 text-xs text-muted-foreground">{t.description}</p>}
            </div>
            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => dismiss(t.id)}
              className={cn(
                'shrink-0 rounded-md p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
              )}
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function useToast() {
  return React.useContext(ToastContext)
}

export { ToastProvider, useToast }
