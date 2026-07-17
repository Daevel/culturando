"use client";

import { X } from "lucide-react";
import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ToastVariant = "default" | "success" | "destructive";

type ToastAction = {
  label: string;
  onClick: () => void;
};

type Toast = {
  action?: ToastAction;
  cancelAction?: ToastAction;
  description?: string;
  id: string;
  title: string;
  variant: ToastVariant;
};

type ToastInput = {
  action?: ToastAction;
  cancelAction?: ToastAction;
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
          action: toast.action,
          cancelAction: toast.cancelAction,
          title: toast.title,
          description: toast.description,
          variant: toast.variant ?? "default",
        },
      ]);
      if (!toast.action) {
        window.setTimeout(() => dismissToast(id), 4500);
      }
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
  const actionToasts = toasts.filter((toast) => toast.action);
  const passiveToasts = toasts.filter((toast) => !toast.action);

  return (
    <>
      {actionToasts.length > 0 ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 px-4 backdrop-blur-sm">
          <button
            aria-label="Chiudi notifica"
            className="absolute inset-0 cursor-default"
            onClick={() => {
              for (const toast of actionToasts) {
                dismissToast(toast.id);
              }
            }}
            type="button"
          />
          <div className="relative z-10 w-full max-w-md">
            {actionToasts.map((toast) => (
              <ToastCard dismissToast={dismissToast} isCentered key={toast.id} toast={toast} />
            ))}
          </div>
        </div>
      ) : null}

      <div className="fixed bottom-4 right-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3">
        {passiveToasts.map((toast) => (
          <ToastCard dismissToast={dismissToast} key={toast.id} toast={toast} />
        ))}
      </div>
    </>
  );
}

function ToastCard({
  dismissToast,
  isCentered = false,
  toast,
}: {
  dismissToast: (id: string) => void;
  isCentered?: boolean;
  toast: Toast;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-background p-4 text-foreground shadow-lg",
        isCentered && "w-full max-w-md p-5 shadow-2xl",
        toast.variant === "success" && "border-primary/30 bg-primary text-primary-foreground",
        toast.variant === "destructive" &&
          "border-destructive/30 bg-destructive text-destructive-foreground",
      )}
      role={toast.action ? "alertdialog" : "status"}
    >
      <div className="flex gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{toast.title}</p>
          {toast.description ? (
            <p className="mt-1 text-sm opacity-85">{toast.description}</p>
          ) : null}
          {toast.action ? (
            <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              {toast.cancelAction ? (
                <Button
                  className="bg-background/10 text-current hover:bg-background/20"
                  onClick={() => {
                    toast.cancelAction?.onClick();
                    dismissToast(toast.id);
                  }}
                  type="button"
                  variant="ghost"
                >
                  {toast.cancelAction.label}
                </Button>
              ) : null}
              <Button
                className="bg-background px-4 text-foreground hover:bg-background/90"
                onClick={() => {
                  toast.action?.onClick();
                  dismissToast(toast.id);
                }}
                type="button"
                variant="secondary"
              >
                {toast.action.label}
              </Button>
            </div>
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
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
}
