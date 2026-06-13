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
      category: "",
      description: "",
      availability: "available",
      visibility: "public",
      physicalCondition: "good",
      latitude: "",
      longitude: "",
      radiusMeters: "",
    },
  });
  const t = useTranslation();

  function onSubmit(values: BookFormValues) {
    const formData = new FormData();

    formData.set("title", values.title);
    formData.set("author", values.author);
    formData.set("isbn", values.isbn ?? "");
    formData.set("category", values.category ?? "");
    formData.set("description", values.description ?? "");
    formData.set("availability", values.availability);
    formData.set("visibility", values.visibility);
    formData.set("physicalCondition", values.physicalCondition);
    formData.set("latitude", values.latitude?.toString() ?? "");
    formData.set("longitude", values.longitude?.toString() ?? "");
    formData.set("radiusMeters", values.radiusMeters?.toString() ?? "");

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
  const categoryError = errors.category?.message ?? state.errors.category;
  const descriptionError = errors.description?.message ?? state.errors.description;
  const availabilityError = errors.availability?.message ?? state.errors.availability;
  const visibilityError = errors.visibility?.message ?? state.errors.visibility;
  const physicalConditionError =
    errors.physicalCondition?.message ?? state.errors.physicalCondition;
  const latitudeError = errors.latitude?.message ?? state.errors.latitude;
  const longitudeError = errors.longitude?.message ?? state.errors.longitude;
  const radiusMetersError = errors.radiusMeters?.message ?? state.errors.radiusMeters;

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
        <Label htmlFor="category">{t("books.new.fields.category.label")}</Label>
        <Input
          aria-describedby={categoryError ? "book-category-error" : undefined}
          aria-invalid={Boolean(categoryError)}
          id="category"
          placeholder={t("books.new.fields.category.placeholder")}
          {...register("category")}
        />
        {categoryError ? (
          <p className="text-sm text-destructive" id="book-category-error">
            {categoryError}
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

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="availability">{t("books.new.fields.availability.label")}</Label>
          <select
            aria-describedby={availabilityError ? "book-availability-error" : undefined}
            aria-invalid={Boolean(availabilityError)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            id="availability"
            {...register("availability")}
          >
            <option value="available">{t("books.availability.available")}</option>
            <option value="consultation_only">{t("books.availability.consultationOnly")}</option>
            <option value="loanable">{t("books.availability.loanable")}</option>
            <option value="unavailable">{t("books.availability.unavailable")}</option>
          </select>
          {availabilityError ? (
            <p className="text-sm text-destructive" id="book-availability-error">
              {availabilityError}
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

        <div className="space-y-2">
          <Label htmlFor="physicalCondition">{t("books.new.fields.physicalCondition.label")}</Label>
          <select
            aria-describedby={physicalConditionError ? "book-physical-condition-error" : undefined}
            aria-invalid={Boolean(physicalConditionError)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            id="physicalCondition"
            {...register("physicalCondition")}
          >
            <option value="new">{t("books.physicalCondition.new")}</option>
            <option value="good">{t("books.physicalCondition.good")}</option>
            <option value="worn">{t("books.physicalCondition.worn")}</option>
            <option value="damaged">{t("books.physicalCondition.damaged")}</option>
          </select>
          {physicalConditionError ? (
            <p className="text-sm text-destructive" id="book-physical-condition-error">
              {physicalConditionError}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="latitude">{t("books.new.fields.latitude.label")}</Label>
          <Input
            aria-describedby={latitudeError ? "book-latitude-error" : undefined}
            aria-invalid={Boolean(latitudeError)}
            id="latitude"
            inputMode="decimal"
            placeholder={t("books.new.fields.latitude.placeholder")}
            {...register("latitude")}
          />
          {latitudeError ? (
            <p className="text-sm text-destructive" id="book-latitude-error">
              {latitudeError}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="longitude">{t("books.new.fields.longitude.label")}</Label>
          <Input
            aria-describedby={longitudeError ? "book-longitude-error" : undefined}
            aria-invalid={Boolean(longitudeError)}
            id="longitude"
            inputMode="decimal"
            placeholder={t("books.new.fields.longitude.placeholder")}
            {...register("longitude")}
          />
          {longitudeError ? (
            <p className="text-sm text-destructive" id="book-longitude-error">
              {longitudeError}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="radiusMeters">{t("books.new.fields.radiusMeters.label")}</Label>
          <Input
            aria-describedby={radiusMetersError ? "book-radius-error" : undefined}
            aria-invalid={Boolean(radiusMetersError)}
            id="radiusMeters"
            inputMode="numeric"
            placeholder={t("books.new.fields.radiusMeters.placeholder")}
            {...register("radiusMeters")}
          />
          {radiusMetersError ? (
            <p className="text-sm text-destructive" id="book-radius-error">
              {radiusMetersError}
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
