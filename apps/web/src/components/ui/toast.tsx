"use client";

import { X } from "lucide-react";
import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ToastVariant = "default" | "success" | "destructive";

type Toast = {
  description?: string;
  id: string;
  title: string;
  variant: ToastVariant;
};

type ToastInput = {
  description?: string;
  title: string;
  variant?: ToastVariant;
};

type ToastContextValue = {
  dismissToast: (id: string) => void;
  showToast: (toast: ToastInput) => void;
  toasts: Toast[];
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (toast: ToastInput) => {
      const id = crypto.randomUUID();

      setToasts((currentToasts) => [
        ...currentToasts,
        {
          id,
          title: toast.title,
          description: toast.description,
          variant: toast.variant ?? "default",
        },
      ]);
      window.setTimeout(() => dismissToast(id), 4500);
    },
    [dismissToast],
  );

  const value = useMemo(
    () => ({ dismissToast, showToast, toasts }),
    [dismissToast, showToast, toasts],
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function Toaster() {
  const { dismissToast, toasts } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3">
      {toasts.map((toast) => (
        <div
          className={cn(
            "rounded-xl border bg-background p-4 text-foreground shadow-lg",
            toast.variant === "success" && "border-primary/30 bg-primary text-primary-foreground",
            toast.variant === "destructive" &&
              "border-destructive/30 bg-destructive text-destructive-foreground",
          )}
          key={toast.id}
          role="status"
        >
          <div className="flex gap-3">
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{toast.title}</p>
              {toast.description ? (
                <p className="mt-1 text-sm opacity-85">{toast.description}</p>
              ) : null}
            </div>
            <Button
              aria-label="Chiudi notifica"
              className="size-7 shrink-0 rounded-md bg-transparent text-current hover:bg-current/10"
              onClick={() => dismissToast(toast.id)}
              size="icon"
              type="button"
              variant="ghost"
            >
              <X aria-hidden="true" className="size-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
}
