"use client";

import { Trash2 } from "lucide-react";
import { startTransition } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
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
  const { showToast } = useToast();

  return (
    <Button
      onClick={() => {
        showToast({
          action: {
            label: actionLabel,
            onClick: () => {
              startTransition(() => {
                void deleteBookAction(bookId);
              });
            },
          },
          cancelAction: {
            label: cancelLabel,
            onClick: () => undefined,
          },
          description: confirmDescription,
          title: confirmTitle,
          variant: "destructive",
        });
      }}
      type="button"
      variant="destructive"
    >
      <Trash2 aria-hidden="true" className="size-4" />
      {label}
    </Button>
  );
}
