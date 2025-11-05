import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

export type ToastVariant = 'info' | 'success' | 'warning' | 'error'

export interface ToastMessage {
  id: string
  title: string
  description?: string
  variant: ToastVariant
  dismissAfterMs?: number
}

export interface FeedbackContextValue {
  notify: (message: Omit<ToastMessage, 'id'>) => void
  dismiss: (id: string) => void
  toasts: ToastMessage[]
  confirm: (options: {
    title: string
    description?: string
    confirmText?: string
    cancelText?: string
  }) => Promise<boolean>
}

const FeedbackContext = createContext<FeedbackContextValue | null>(null)

export function useFeedback(): FeedbackContextValue {
  const value = useContext(FeedbackContext)
  if (!value) {
    throw new Error('useFeedback must be used within FeedbackProvider')
  }
  return value
}

interface FeedbackProviderProps {
  children: ReactNode
}

interface PendingConfirm {
  id: string
  resolve: (accepted: boolean) => void
  title: string
  description?: string
  confirmText: string
  cancelText: string
}

export function FeedbackProvider({ children }: FeedbackProviderProps) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const confirmQueue = useRef<PendingConfirm[]>([])
  const [, setTick] = useState(0)

  const scheduleRemoval = useCallback((id: string, after = 4000) => {
    setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id))
    }, after)
  }, [])

  const notify = useCallback<FeedbackContextValue['notify']>(({ dismissAfterMs = 4000, ...input }) => {
    const id = crypto.randomUUID()
    const toast: ToastMessage = { id, ...input, dismissAfterMs }
    setToasts((current) => [...current, toast])
    if (dismissAfterMs > 0) {
      scheduleRemoval(id, dismissAfterMs)
    }
  }, [scheduleRemoval])

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const confirm = useCallback<FeedbackContextValue['confirm']>(async (options) => {
    return new Promise<boolean>((resolve) => {
      const item: PendingConfirm = {
        id: crypto.randomUUID(),
        resolve,
        title: options.title,
        description: options.description,
        confirmText: options.confirmText ?? '确认',
        cancelText: options.cancelText ?? '取消',
      }
      confirmQueue.current.push(item)
      setTick((value) => value + 1)
    })
  }, [])

  const acceptConfirm = useCallback((id: string, accepted: boolean) => {
    const index = confirmQueue.current.findIndex((item) => item.id === id)
    if (index >= 0) {
      const [item] = confirmQueue.current.splice(index, 1)
      item.resolve(accepted)
      setTick((value) => value + 1)
    }
  }, [])

  const value = useMemo<FeedbackContextValue>(() => ({ notify, dismiss, toasts, confirm }), [dismiss, notify, toasts, confirm])

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      <ConfirmDialogs queue={confirmQueue.current} onAnswer={acceptConfirm} />
    </FeedbackContext.Provider>
  )
}

// Toast components removed - notifications disabled for silent mode


interface ConfirmDialogsProps {
  queue: PendingConfirm[]
  onAnswer: (id: string, accepted: boolean) => void
}

function ConfirmDialogs({ queue, onAnswer }: ConfirmDialogsProps) {
  if (queue.length === 0) {
    return null
  }
  const active = queue[0]
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="text-lg font-semibold text-zinc-900">{active.title}</h2>
        {active.description ? (
          <p className="mt-2 text-sm text-zinc-600">{active.description}</p>
        ) : null}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-600"
            onClick={() => onAnswer(active.id, false)}
          >
            {active.cancelText}
          </button>
          <button
            type="button"
            className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white"
            onClick={() => onAnswer(active.id, true)}
          >
            {active.confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
