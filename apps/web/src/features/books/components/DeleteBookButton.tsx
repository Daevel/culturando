"use client";

import { Trash2 } from "lucide-react";
import { startTransition, useState } from "react";
import { Button } from "@/components/ui/button";
import { deleteBookAction } from "../actions/delete-book.action";

type DeleteBookButtonProps = {
  actionLabel: string;
  bookId: string;
  cancelLabel: string;
  confirmDescription: string;
  confirmTitle: string;
  label: string;
};

export function DeleteBookButton({
  actionLabel,
  bookId,
  cancelLabel,
  confirmDescription,
  confirmTitle,
  label,
}: DeleteBookButtonProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsConfirmOpen(true)} type="button" variant="destructive">
        <Trash2 aria-hidden="true" className="size-4" />
        {label}
      </Button>

      {isConfirmOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 px-4 backdrop-blur-sm">
          <button
            aria-label={cancelLabel}
            className="absolute inset-0 cursor-default"
            onClick={() => setIsConfirmOpen(false)}
            type="button"
          />
          <div
            aria-describedby="delete-book-confirm-description"
            aria-labelledby="delete-book-confirm-title"
            className="relative z-10 w-full max-w-md rounded-xl border border-destructive/30 bg-destructive p-5 text-destructive-foreground shadow-2xl"
            role="alertdialog"
          >
            <div className="space-y-1">
              <p className="font-semibold" id="delete-book-confirm-title">
                {confirmTitle}
              </p>
              <p className="text-sm opacity-85" id="delete-book-confirm-description">
                {confirmDescription}
              </p>
            </div>
            <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                className="bg-background/10 text-current hover:bg-background/20"
                onClick={() => setIsConfirmOpen(false)}
                type="button"
                variant="ghost"
              >
                {cancelLabel}
              </Button>
              <Button
                className="bg-background px-4 text-foreground hover:bg-background/90"
                onClick={() => {
                  setIsConfirmOpen(false);
                  startTransition(() => {
                    void deleteBookAction(bookId);
                  });
                }}
                type="button"
                variant="secondary"
              >
                {actionLabel}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
