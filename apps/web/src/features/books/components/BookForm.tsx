"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { startTransition, useActionState, useEffect } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/hooks/useTranslation";
import { createBookAction } from "../actions/create-book.action";
import { bookSchema } from "../schemas/book.schema";
import type { BookFormState } from "../types/book-form.types";

type BookFormInput = z.input<typeof bookSchema>;
type BookFormValues = z.output<typeof bookSchema>;

const initialState: BookFormState = {
  success: false,
  errors: {},
};

export function BookForm() {
  const [state, formAction, isPending] = useActionState(createBookAction, initialState);
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm<BookFormInput, unknown, BookFormValues>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      title: "",
      author: "",
      isbn: "",
      description: "",
      status: "available",
      visibility: "public",
    },
  });
  const t = useTranslation();

  function onSubmit(values: BookFormValues) {
    const formData = new FormData();

    formData.set("title", values.title);
    formData.set("author", values.author);
    formData.set("isbn", values.isbn ?? "");
    formData.set("description", values.description ?? "");
    formData.set("status", values.status);
    formData.set("visibility", values.visibility);

    startTransition(() => {
      formAction(formData);
    });
  }

  useEffect(() => {
    if (state.success) {
      reset();
    }
  }, [reset, state.success]);

  const titleError = errors.title?.message ?? state.errors.title;
  const authorError = errors.author?.message ?? state.errors.author;
  const isbnError = errors.isbn?.message ?? state.errors.isbn;
  const descriptionError = errors.description?.message ?? state.errors.description;
  const statusError = errors.status?.message ?? state.errors.status;
  const visibilityError = errors.visibility?.message ?? state.errors.visibility;

  return (
    <form className="space-y-5" noValidate onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <Label htmlFor="title">{t("books.new.fields.title.label")}</Label>
        <Input
          aria-describedby={titleError ? "book-title-error" : undefined}
          aria-invalid={Boolean(titleError)}
          id="title"
          placeholder={t("books.new.fields.title.placeholder")}
          {...register("title")}
        />
        {titleError ? (
          <p className="text-sm text-destructive" id="book-title-error">
            {titleError}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="author">{t("books.new.fields.author.label")}</Label>
        <Input
          aria-describedby={authorError ? "book-author-error" : undefined}
          aria-invalid={Boolean(authorError)}
          id="author"
          placeholder={t("books.new.fields.author.placeholder")}
          {...register("author")}
        />
        {authorError ? (
          <p className="text-sm text-destructive" id="book-author-error">
            {authorError}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="isbn">{t("books.new.fields.isbn.label")}</Label>
        <Input
          aria-describedby={isbnError ? "book-isbn-error" : undefined}
          aria-invalid={Boolean(isbnError)}
          id="isbn"
          placeholder={t("books.new.fields.isbn.placeholder")}
          {...register("isbn")}
        />
        {isbnError ? (
          <p className="text-sm text-destructive" id="book-isbn-error">
            {isbnError}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">{t("books.new.fields.description.label")}</Label>
        <textarea
          aria-describedby={descriptionError ? "book-description-error" : undefined}
          aria-invalid={Boolean(descriptionError)}
          className="flex min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          id="description"
          placeholder={t("books.new.fields.description.placeholder")}
          {...register("description")}
        />
        {descriptionError ? (
          <p className="text-sm text-destructive" id="book-description-error">
            {descriptionError}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="status">{t("books.new.fields.status.label")}</Label>
          <select
            aria-describedby={statusError ? "book-status-error" : undefined}
            aria-invalid={Boolean(statusError)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            id="status"
            {...register("status")}
          >
            <option value="available">{t("books.status.available")}</option>
            <option value="reserved">{t("books.status.reserved")}</option>
            <option value="unavailable">{t("books.status.unavailable")}</option>
          </select>
          {statusError ? (
            <p className="text-sm text-destructive" id="book-status-error">
              {statusError}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="visibility">{t("books.new.fields.visibility.label")}</Label>
          <select
            aria-describedby={visibilityError ? "book-visibility-error" : undefined}
            aria-invalid={Boolean(visibilityError)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            id="visibility"
            {...register("visibility")}
          >
            <option value="public">{t("books.visibility.public")}</option>
            <option value="private">{t("books.visibility.private")}</option>
          </select>
          {visibilityError ? (
            <p className="text-sm text-destructive" id="book-visibility-error">
              {visibilityError}
            </p>
          ) : null}
        </div>
      </div>

      {state.messageKey ? (
        <p className={cnMessageClass(state.success)} role="status">
          {t(state.messageKey)}
        </p>
      ) : null}

      <Button disabled={isPending} type="submit" className="w-full">
        {isPending ? t("books.new.pendingLabel") : t("books.new.submitLabel")}
      </Button>
    </form>
  );
}

function cnMessageClass(success: boolean) {
  return success ? "text-sm text-muted-foreground" : "text-sm text-destructive";
}
