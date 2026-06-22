"use client";

import { extractIsbnFromText } from "@culturando/ai";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  type ExtractIsbnFromImageResult,
  extractIsbnFromImageAction,
} from "@/features/cataloging/actions/extract-isbn-from-image.action";
import {
  type LookupBookMetadataResult,
  lookupBookMetadataAction,
} from "@/features/cataloging/actions/lookup-book-metadata.action";
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

type CoverLookupStatus = "idle" | "loading" | "found" | "not-found" | "error" | "missing-isbn";
type IsbnExtractionStatus = "idle" | "found" | "not-found";
type MetadataLookupStatus = CoverLookupStatus;
type MetadataApplyField =
  | "author"
  | "category"
  | "coverUrl"
  | "description"
  | "isbn"
  | "language"
  | "publishedYear"
  | "publisher"
  | "title";
type MetadataSuggestionSource = "ocr" | "open-library";
type OcrLookupStatus =
  | "idle"
  | "loading"
  | "found"
  | Extract<ExtractIsbnFromImageResult, { success: false }>["reason"];

export function BookForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const coverObjectUrlRef = useRef<string | null>(null);
  const ocrImageInputRef = useRef<HTMLInputElement | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string>();
  const [coverLookupStatus, setCoverLookupStatus] = useState<CoverLookupStatus>("idle");
  const [isbnExtractionStatus, setIsbnExtractionStatus] = useState<IsbnExtractionStatus>("idle");
  const [isbnSourceText, setIsbnSourceText] = useState("");
  const [metadataLookupStatus, setMetadataLookupStatus] = useState<MetadataLookupStatus>("idle");
  const [metadataSuggestion, setMetadataSuggestion] = useState<
    Extract<LookupBookMetadataResult, { success: true }>["metadata"] | undefined
  >();
  const [metadataSuggestionSource, setMetadataSuggestionSource] =
    useState<MetadataSuggestionSource>("open-library");
  const [selectedMetadataFields, setSelectedMetadataFields] = useState<MetadataApplyField[]>([]);
  const [ocrLookupStatus, setOcrLookupStatus] = useState<OcrLookupStatus>("idle");
  const [ocrTextPreview, setOcrTextPreview] = useState<string>();
  const [state, formAction, isPending] = useActionState(createBookAction, initialState);
  const {
    handleSubmit,
    getValues,
    register,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BookFormInput, unknown, BookFormValues>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      title: "",
      author: "",
      isbn: "",
      publisher: "",
      publishedYear: "",
      language: "",
      category: "",
      description: "",
      availability: "available",
      visibility: "public",
      physicalCondition: "good",
      addressLabel: "",
      city: "",
      province: "",
      region: "",
      country: "Italia",
      imageUrls: "",
      externalCoverUrl: "",
    },
  });
  const t = useTranslation();
  const isbnValue = watch("isbn");

  function onSubmit(_values: BookFormValues) {
    if (!formRef.current) {
      return;
    }

    const formData = new FormData(formRef.current);

    startTransition(() => {
      formAction(formData);
    });
  }

  useEffect(() => {
    if (state.success) {
      reset();
      formRef.current?.reset();
      if (coverObjectUrlRef.current) {
        URL.revokeObjectURL(coverObjectUrlRef.current);
        coverObjectUrlRef.current = null;
      }
      setCoverPreviewUrl(undefined);
      setCoverLookupStatus("idle");
      setIsbnExtractionStatus("idle");
      setIsbnSourceText("");
      setMetadataLookupStatus("idle");
      setMetadataSuggestion(undefined);
      setMetadataSuggestionSource("open-library");
      setSelectedMetadataFields([]);
      setOcrLookupStatus("idle");
      setOcrTextPreview(undefined);
    }
  }, [reset, state.success]);

  useEffect(() => {
    return () => {
      if (coverObjectUrlRef.current) {
        URL.revokeObjectURL(coverObjectUrlRef.current);
      }
    };
  }, []);

  async function lookupCoverByIsbn() {
    const normalizedIsbn = isbnValue?.replace(/[-\s]/g, "").trim();

    if (!normalizedIsbn) {
      setCoverLookupStatus("missing-isbn");
      return;
    }

    setCoverLookupStatus("loading");

    try {
      const response = await fetch(
        `https://openlibrary.org/isbn/${encodeURIComponent(normalizedIsbn)}.json`,
      );

      if (!response.ok) {
        setCoverLookupStatus("not-found");
        return;
      }

      const data = (await response.json()) as { covers?: number[] };
      const coverId = data.covers?.[0];

      if (!coverId) {
        setCoverLookupStatus("not-found");
        return;
      }

      const coverUrl = `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`;

      clearCoverObjectUrl();
      setCoverPreviewUrl(coverUrl);
      setValue("externalCoverUrl", coverUrl, { shouldDirty: true });
      setCoverLookupStatus("found");
    } catch {
      setCoverLookupStatus("error");
    }
  }

  function extractIsbn() {
    const isbn = extractIsbnFromText(isbnSourceText);

    if (!isbn) {
      setIsbnExtractionStatus("not-found");
      return;
    }

    setValue("isbn", isbn, { shouldDirty: true, shouldValidate: true });
    setIsbnExtractionStatus("found");
  }

  async function extractIsbnFromImage() {
    const image = ocrImageInputRef.current?.files?.[0];

    setOcrTextPreview(undefined);
    setOcrLookupStatus("loading");

    const formData = new FormData();
    formData.set("image", image ?? "");

    const result = await extractIsbnFromImageAction(formData);

    if (!result.success) {
      setOcrLookupStatus(result.reason);
      setOcrTextPreview(result.text);
      return;
    }

    setValue("isbn", result.isbn, { shouldDirty: true, shouldValidate: true });

    if (result.metadata) {
      setMetadataSuggestion(result.metadata);
      setMetadataSuggestionSource("ocr");
      setSelectedMetadataFields(
        getDefaultSelectedMetadataFields(result.metadata, getValues(), coverPreviewUrl),
      );
      setMetadataLookupStatus("found");
    }

    setOcrLookupStatus("found");
    setOcrTextPreview(result.text);
  }

  async function lookupMetadataByIsbn() {
    const normalizedIsbn = isbnValue?.replace(/[-\s]/g, "").trim();

    if (!normalizedIsbn) {
      setMetadataSuggestion(undefined);
      setMetadataLookupStatus("missing-isbn");
      return;
    }

    setMetadataSuggestion(undefined);
    setMetadataLookupStatus("loading");

    const result = await lookupBookMetadataAction(normalizedIsbn);

    if (!result.success) {
      setMetadataLookupStatus(result.reason);
      setSelectedMetadataFields([]);
      return;
    }

    setMetadataSuggestion(result.metadata);
    setMetadataSuggestionSource("open-library");
    setSelectedMetadataFields(
      getDefaultSelectedMetadataFields(result.metadata, getValues(), coverPreviewUrl),
    );
    setMetadataLookupStatus("found");
  }

  function applyMetadataSuggestion() {
    if (!metadataSuggestion) {
      return;
    }

    const metadataValues = getMetadataFieldValues(metadataSuggestion);
    const shouldApply = (field: MetadataApplyField) => selectedMetadataFields.includes(field);

    if (shouldApply("isbn")) {
      setValue("isbn", metadataValues.isbn ?? "", { shouldDirty: true, shouldValidate: true });
    }

    if (shouldApply("title")) {
      setValue("title", metadataValues.title ?? "", { shouldDirty: true, shouldValidate: true });
    }

    if (shouldApply("author")) {
      setValue("author", metadataValues.author ?? "", {
        shouldDirty: true,
        shouldValidate: true,
      });
    }

    if (shouldApply("publisher")) {
      setValue("publisher", metadataValues.publisher ?? "", { shouldDirty: true });
    }

    if (shouldApply("publishedYear")) {
      setValue("publishedYear", metadataValues.publishedYear ?? "", { shouldDirty: true });
    }

    if (shouldApply("language")) {
      setValue("language", metadataValues.language ?? "", { shouldDirty: true });
    }

    if (shouldApply("category")) {
      setValue("category", metadataValues.category ?? "", { shouldDirty: true });
    }

    if (shouldApply("description")) {
      setValue("description", metadataValues.description ?? "", { shouldDirty: true });
    }

    if (shouldApply("coverUrl") && metadataSuggestion.coverUrl) {
      clearCoverObjectUrl();
      setCoverPreviewUrl(metadataSuggestion.coverUrl);
      setValue("externalCoverUrl", metadataSuggestion.coverUrl, { shouldDirty: true });
      setCoverLookupStatus("found");
    }
  }

  function toggleMetadataField(field: MetadataApplyField) {
    setSelectedMetadataFields((currentFields) =>
      currentFields.includes(field)
        ? currentFields.filter((currentField) => currentField !== field)
        : [...currentFields, field],
    );
  }

  function handleCoverImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    setValue("externalCoverUrl", "", { shouldDirty: true });
    setCoverLookupStatus("idle");
    clearCoverObjectUrl();

    if (!file) {
      setCoverPreviewUrl(undefined);
      return;
    }

    const objectUrl = URL.createObjectURL(file);

    coverObjectUrlRef.current = objectUrl;
    setCoverPreviewUrl(objectUrl);
  }

  function clearCoverObjectUrl() {
    if (coverObjectUrlRef.current) {
      URL.revokeObjectURL(coverObjectUrlRef.current);
      coverObjectUrlRef.current = null;
    }
  }

  const titleError = errors.title?.message ?? state.errors.title;
  const authorError = errors.author?.message ?? state.errors.author;
  const isbnError = errors.isbn?.message ?? state.errors.isbn;
  const publisherError = errors.publisher?.message ?? state.errors.publisher;
  const publishedYearError = errors.publishedYear?.message ?? state.errors.publishedYear;
  const languageError = errors.language?.message ?? state.errors.language;
  const categoryError = errors.category?.message ?? state.errors.category;
  const descriptionError = errors.description?.message ?? state.errors.description;
  const availabilityError = errors.availability?.message ?? state.errors.availability;
  const visibilityError = errors.visibility?.message ?? state.errors.visibility;
  const physicalConditionError =
    errors.physicalCondition?.message ?? state.errors.physicalCondition;
  const addressLabelError = errors.addressLabel?.message ?? state.errors.addressLabel;
  const cityError = errors.city?.message ?? state.errors.city;
  const provinceError = errors.province?.message ?? state.errors.province;
  const regionError = errors.region?.message ?? state.errors.region;
  const countryError = errors.country?.message ?? state.errors.country;
  const coverImageError = state.errors.coverImage;
  const imageUrlsError = errors.imageUrls?.message ?? state.errors.imageUrls;
  const coverLookupMessage = getCoverLookupMessage(coverLookupStatus, t);
  const isbnExtractionMessage = getIsbnExtractionMessage(isbnExtractionStatus, t);
  const metadataLookupMessage = getMetadataLookupMessage(metadataLookupStatus, t);
  const metadataPreviewRows = metadataSuggestion
    ? getMetadataPreviewRows(metadataSuggestion, getValues(), coverPreviewUrl, t)
    : [];
  const ocrLookupMessage = getOcrLookupMessage(ocrLookupStatus, t);

  return (
    <form className="space-y-5" noValidate onSubmit={handleSubmit(onSubmit)} ref={formRef}>
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

      <div className="space-y-4 rounded-xl border bg-muted/20 p-4">
        <div className="space-y-1">
          <h2 className="text-base font-semibold">{t("books.new.catalogingPanelTitle")}</h2>
          <p className="text-sm text-muted-foreground">
            {t("books.new.catalogingPanelDescription")}
          </p>
        </div>

        <div className="grid gap-3 lg:grid-cols-3">
          <section className="space-y-3 rounded-lg border bg-background p-3">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t("books.new.catalogingStepImageLabel")}
              </p>
              <h3 className="text-sm font-semibold">{t("books.new.ocrLookupTitle")}</h3>
              <p className="text-sm text-muted-foreground">{t("books.new.ocrLookupDescription")}</p>
            </div>
            <Input
              accept="image/jpeg,image/png,image/webp"
              id="ocrImage"
              onChange={() => {
                setOcrLookupStatus("idle");
                setOcrTextPreview(undefined);
              }}
              ref={ocrImageInputRef}
              type="file"
            />
            <Button
              className="w-full"
              disabled={ocrLookupStatus === "loading"}
              onClick={extractIsbnFromImage}
              type="button"
              variant="outline"
            >
              {ocrLookupStatus === "loading"
                ? t("books.new.ocrLookupPendingLabel")
                : t("books.new.ocrLookupLabel")}
            </Button>
            {ocrLookupMessage ? (
              <p className="text-sm text-muted-foreground" role="status">
                {ocrLookupMessage}
              </p>
            ) : null}
          </section>

          <section className="space-y-3 rounded-lg border bg-background p-3">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t("books.new.catalogingStepTextLabel")}
              </p>
              <h3 className="text-sm font-semibold">{t("books.new.isbnExtractionTitle")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("books.new.isbnExtractionDescription")}
              </p>
            </div>
            <textarea
              className="flex min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              onChange={(event) => {
                setIsbnSourceText(event.target.value);
                setIsbnExtractionStatus("idle");
              }}
              placeholder={t("books.new.isbnExtractionPlaceholder")}
              value={isbnSourceText}
            />
            <Button
              className="w-full"
              disabled={!isbnSourceText.trim()}
              onClick={extractIsbn}
              type="button"
              variant="outline"
            >
              {t("books.new.isbnExtractionLabel")}
            </Button>
            {isbnExtractionMessage ? (
              <p className="text-sm text-muted-foreground" role="status">
                {isbnExtractionMessage}
              </p>
            ) : null}
          </section>

          <section className="space-y-3 rounded-lg border bg-background p-3">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t("books.new.catalogingStepMetadataLabel")}
              </p>
              <h3 className="text-sm font-semibold">{t("books.new.metadataLookupTitle")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("books.new.metadataLookupDescription")}
              </p>
            </div>
            <Button
              className="w-full"
              disabled={metadataLookupStatus === "loading"}
              onClick={lookupMetadataByIsbn}
              type="button"
              variant="outline"
            >
              {metadataLookupStatus === "loading"
                ? t("books.new.metadataLookupPendingLabel")
                : t("books.new.metadataLookupLabel")}
            </Button>

            {metadataLookupMessage ? (
              <p className="text-sm text-muted-foreground" role="status">
                {metadataLookupMessage}
              </p>
            ) : null}

            {metadataSuggestion ? (
              <div className="space-y-3 rounded-md border bg-muted/20 p-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium">{t("books.new.metadataPreviewTitle")}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("books.new.metadataSourceLabel")} {getMetadataSourceLabel(metadataSuggestionSource, t)}
                  </p>
                </div>
                <div className="grid gap-2 text-sm">
                  {metadataPreviewRows.map((row) => {
                    const checkboxId = `metadata-field-${row.field}`;

                    return (
                      <label
                        className="flex gap-3 rounded-md border bg-background px-3 py-2"
                        htmlFor={checkboxId}
                        key={row.field}
                      >
                        <Checkbox
                          checked={selectedMetadataFields.includes(row.field)}
                          className="mt-1"
                          id={checkboxId}
                          onChange={() => toggleMetadataField(row.field)}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            {row.label}
                          </span>
                          <span className="mt-1 block break-words text-foreground">
                            {row.value}
                          </span>
                          {row.willOverwrite ? (
                            <span className="mt-1 block text-xs text-amber-700">
                              {t("books.new.metadataOverwriteWarningLabel")}: {row.currentValue}
                            </span>
                          ) : null}
                        </span>
                      </label>
                    );
                  })}
                </div>
                <Button
                  className="w-full"
                  disabled={selectedMetadataFields.length === 0}
                  onClick={applyMetadataSuggestion}
                  type="button"
                  variant="secondary"
                >
                  {t("books.new.metadataApplyLabel")}
                </Button>
              </div>
            ) : null}
          </section>
        </div>

        {ocrTextPreview ? (
          <details className="rounded-md border bg-background p-3 text-sm text-muted-foreground">
            <summary className="cursor-pointer font-medium text-foreground">
              {t("books.new.ocrTextPreviewLabel")}
            </summary>
            <p className="mt-2 whitespace-pre-wrap">{ocrTextPreview}</p>
          </details>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="publisher">{t("books.new.fields.publisher.label")}</Label>
          <Input
            aria-describedby={publisherError ? "book-publisher-error" : undefined}
            aria-invalid={Boolean(publisherError)}
            id="publisher"
            placeholder={t("books.new.fields.publisher.placeholder")}
            {...register("publisher")}
          />
          {publisherError ? (
            <p className="text-sm text-destructive" id="book-publisher-error">
              {publisherError}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="publishedYear">{t("books.new.fields.publishedYear.label")}</Label>
          <Input
            aria-describedby={publishedYearError ? "book-published-year-error" : undefined}
            aria-invalid={Boolean(publishedYearError)}
            id="publishedYear"
            inputMode="numeric"
            placeholder={t("books.new.fields.publishedYear.placeholder")}
            {...register("publishedYear")}
          />
          {publishedYearError ? (
            <p className="text-sm text-destructive" id="book-published-year-error">
              {publishedYearError}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="language">{t("books.new.fields.language.label")}</Label>
          <Input
            aria-describedby={languageError ? "book-language-error" : undefined}
            aria-invalid={Boolean(languageError)}
            id="language"
            placeholder={t("books.new.fields.language.placeholder")}
            {...register("language")}
          />
          {languageError ? (
            <p className="text-sm text-destructive" id="book-language-error">
              {languageError}
            </p>
          ) : null}
        </div>
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

      <div className="space-y-2 rounded-lg border bg-muted/20 p-4">
        <div>
          <h2 className="text-sm font-semibold">{t("books.new.locationTitle")}</h2>
          <p className="text-sm text-muted-foreground">{t("books.new.locationDescription")}</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="addressLabel">{t("books.new.fields.addressLabel.label")}</Label>
          <Input
            aria-describedby={addressLabelError ? "book-address-error" : undefined}
            aria-invalid={Boolean(addressLabelError)}
            id="addressLabel"
            placeholder={t("books.new.fields.addressLabel.placeholder")}
            {...register("addressLabel")}
          />
          {addressLabelError ? (
            <p className="text-sm text-destructive" id="book-address-error">
              {addressLabelError}
            </p>
          ) : null}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="city">{t("books.new.fields.city.label")}</Label>
            <Input
              aria-describedby={cityError ? "book-city-error" : undefined}
              aria-invalid={Boolean(cityError)}
              id="city"
              placeholder={t("books.new.fields.city.placeholder")}
              {...register("city")}
            />
            {cityError ? (
              <p className="text-sm text-destructive" id="book-city-error">
                {cityError}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="province">{t("books.new.fields.province.label")}</Label>
            <Input
              aria-describedby={provinceError ? "book-province-error" : undefined}
              aria-invalid={Boolean(provinceError)}
              id="province"
              placeholder={t("books.new.fields.province.placeholder")}
              {...register("province")}
            />
            {provinceError ? (
              <p className="text-sm text-destructive" id="book-province-error">
                {provinceError}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="region">{t("books.new.fields.region.label")}</Label>
            <Input
              aria-describedby={regionError ? "book-region-error" : undefined}
              aria-invalid={Boolean(regionError)}
              id="region"
              placeholder={t("books.new.fields.region.placeholder")}
              {...register("region")}
            />
            {regionError ? (
              <p className="text-sm text-destructive" id="book-region-error">
                {regionError}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">{t("books.new.fields.country.label")}</Label>
            <Input
              aria-describedby={countryError ? "book-country-error" : undefined}
              aria-invalid={Boolean(countryError)}
              id="country"
              placeholder={t("books.new.fields.country.placeholder")}
              {...register("country")}
            />
            {countryError ? (
              <p className="text-sm text-destructive" id="book-country-error">
                {countryError}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="space-y-2 rounded-lg border bg-muted/20 p-4">
        <div>
          <h2 className="text-sm font-semibold">{t("books.new.imagesTitle")}</h2>
          <p className="text-sm text-muted-foreground">{t("books.new.imagesDescription")}</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="coverImage">{t("books.new.fields.coverImage.label")}</Label>
          <Input
            accept="image/jpeg,image/png,image/webp"
            aria-describedby={coverImageError ? "book-cover-image-error" : undefined}
            aria-invalid={Boolean(coverImageError)}
            id="coverImage"
            name="coverImage"
            onChange={handleCoverImageChange}
            type="file"
          />
          {coverImageError ? (
            <p className="text-sm text-destructive" id="book-cover-image-error">
              {coverImageError}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 rounded-md border bg-background p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">{t("books.new.coverLookupTitle")}</p>
            <p className="text-sm text-muted-foreground">{t("books.new.coverLookupDescription")}</p>
          </div>
          <Button
            disabled={coverLookupStatus === "loading"}
            onClick={lookupCoverByIsbn}
            type="button"
            variant="outline"
          >
            {coverLookupStatus === "loading"
              ? t("books.new.coverLookupPendingLabel")
              : t("books.new.coverLookupLabel")}
          </Button>
        </div>

        <input type="hidden" {...register("externalCoverUrl")} />

        {coverLookupMessage ? (
          <p className="text-sm text-muted-foreground" role="status">
            {coverLookupMessage}
          </p>
        ) : null}

        {coverPreviewUrl ? (
          <div className="overflow-hidden rounded-lg border bg-background p-3">
            <Image
              alt={t("books.new.coverPreviewAlt")}
              className="h-52 w-full rounded-md object-contain"
              height={208}
              src={coverPreviewUrl}
              unoptimized
              width={360}
            />
          </div>
        ) : null}

        <Label htmlFor="imageUrls">{t("books.new.fields.imageUrls.label")}</Label>
        <textarea
          aria-describedby={imageUrlsError ? "book-images-error" : undefined}
          aria-invalid={Boolean(imageUrlsError)}
          className="flex min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          id="imageUrls"
          placeholder={t("books.new.fields.imageUrls.placeholder")}
          {...register("imageUrls")}
        />
        {imageUrlsError ? (
          <p className="text-sm text-destructive" id="book-images-error">
            {imageUrlsError}
          </p>
        ) : null}
      </div>

      <p className="text-sm text-muted-foreground">{t("books.new.imagesHelpText")}</p>

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

function getMetadataSourceLabel(
  source: MetadataSuggestionSource,
  t: ReturnType<typeof useTranslation>,
) {
  const labels = {
    ocr: t("books.new.metadataSourceOcr"),
    "open-library": t("books.new.metadataSourceOpenLibrary"),
  } satisfies Record<MetadataSuggestionSource, string>;

  return labels[source];
}

function getMetadataPreviewRows(
  metadata: Extract<LookupBookMetadataResult, { success: true }>["metadata"],
  currentValues: BookFormInput,
  coverPreviewUrl: string | undefined,
  t: ReturnType<typeof useTranslation>,
) {
  const metadataValues = getMetadataFieldValues(metadata);
  const rows: { field: MetadataApplyField; label: string; value: string | undefined }[] = [
    {
      field: "isbn",
      label: t("books.new.fields.isbn.label"),
      value: metadataValues.isbn,
    },
    {
      field: "title",
      label: t("books.new.fields.title.label"),
      value: metadataValues.title,
    },
    {
      field: "author",
      label: t("books.new.fields.author.label"),
      value: metadataValues.author,
    },
    {
      field: "publisher",
      label: t("books.new.fields.publisher.label"),
      value: metadataValues.publisher,
    },
    {
      field: "publishedYear",
      label: t("books.new.fields.publishedYear.label"),
      value: metadataValues.publishedYear,
    },
    {
      field: "language",
      label: t("books.new.fields.language.label"),
      value: metadataValues.language,
    },
    {
      field: "category",
      label: t("books.new.fields.category.label"),
      value: metadataValues.category,
    },
    {
      field: "description",
      label: t("books.new.fields.description.label"),
      value: metadataValues.description,
    },
    {
      field: "coverUrl",
      label: t("books.new.fields.coverImage.label"),
      value: metadataValues.coverUrl ? t("books.new.metadataCoverAvailableLabel") : undefined,
    },
  ];

  return rows
    .map((row) => {
      const currentValue = getCurrentMetadataFieldValue(row.field, currentValues, coverPreviewUrl);

      return {
        ...row,
        currentValue,
        willOverwrite: Boolean(currentValue),
      };
    })
    .filter(
      (
        row,
      ): row is {
        currentValue: string | undefined;
        field: MetadataApplyField;
        label: string;
        value: string;
        willOverwrite: boolean;
      } => Boolean(row.value),
    );
}

function getDefaultSelectedMetadataFields(
  metadata: Extract<LookupBookMetadataResult, { success: true }>["metadata"],
  currentValues: BookFormInput,
  coverPreviewUrl: string | undefined,
) {
  return Object.entries(getMetadataFieldValues(metadata)).flatMap(([field, value]) => {
    const metadataField = field as MetadataApplyField;

    if (!value || getCurrentMetadataFieldValue(metadataField, currentValues, coverPreviewUrl)) {
      return [];
    }

    return [metadataField];
  });
}

function getMetadataFieldValues(
  metadata: Extract<LookupBookMetadataResult, { success: true }>["metadata"],
): Record<MetadataApplyField, string | undefined> {
  return {
    author: metadata.authors.join(", ") || undefined,
    category: metadata.categories.join(", ") || undefined,
    coverUrl: metadata.coverUrl,
    description: metadata.description,
    isbn: metadata.isbn,
    language: metadata.language,
    publishedYear: metadata.publishedYear,
    publisher: metadata.publisher,
    title: metadata.title,
  };
}

function getCurrentMetadataFieldValue(
  field: MetadataApplyField,
  currentValues: BookFormInput,
  coverPreviewUrl: string | undefined,
) {
  if (field === "coverUrl") {
    return cleanMetadataValue(currentValues.externalCoverUrl) || coverPreviewUrl;
  }

  return cleanMetadataValue(currentValues[field]);
}

function cleanMetadataValue(value: unknown) {
  return typeof value === "string" ? value.trim() || undefined : undefined;
}

function getCoverLookupMessage(status: CoverLookupStatus, t: ReturnType<typeof useTranslation>) {
  const messages = {
    idle: undefined,
    loading: undefined,
    found: t("books.new.coverLookupFoundMessage"),
    "not-found": t("books.new.coverLookupNotFoundMessage"),
    error: t("books.new.coverLookupErrorMessage"),
    "missing-isbn": t("books.new.coverLookupMissingIsbnMessage"),
  } satisfies Record<CoverLookupStatus, string | undefined>;

  return messages[status];
}

function getIsbnExtractionMessage(
  status: IsbnExtractionStatus,
  t: ReturnType<typeof useTranslation>,
) {
  const messages = {
    idle: undefined,
    found: t("books.new.isbnExtractionFoundMessage"),
    "not-found": t("books.new.isbnExtractionNotFoundMessage"),
  } satisfies Record<IsbnExtractionStatus, string | undefined>;

  return messages[status];
}

function getMetadataLookupMessage(
  status: MetadataLookupStatus,
  t: ReturnType<typeof useTranslation>,
) {
  const messages = {
    idle: undefined,
    loading: undefined,
    found: t("books.new.metadataLookupFoundMessage"),
    "not-found": t("books.new.metadataLookupNotFoundMessage"),
    error: t("books.new.metadataLookupErrorMessage"),
    "missing-isbn": t("books.new.metadataLookupMissingIsbnMessage"),
  } satisfies Record<MetadataLookupStatus, string | undefined>;

  return messages[status];
}

function getOcrLookupMessage(status: OcrLookupStatus, t: ReturnType<typeof useTranslation>) {
  const messages = {
    idle: undefined,
    loading: undefined,
    "empty-response": t("books.new.ocrLookupEmptyResponseMessage"),
    found: t("books.new.ocrLookupFoundMessage"),
    "http-error": t("books.new.ocrLookupHttpErrorMessage"),
    "invalid-file": t("books.new.ocrLookupErrorMessage"),
    "missing-image": t("books.new.ocrLookupMissingImageMessage"),
    "network-error": t("books.new.ocrLookupNetworkErrorMessage"),
    "not-configured": t("books.new.ocrLookupNotConfiguredMessage"),
    "not-found": t("books.new.ocrLookupNotFoundMessage"),
    timeout: t("books.new.ocrLookupTimeoutMessage"),
    "too-large": t("books.new.ocrLookupTooLargeMessage"),
    "unsupported-type": t("books.new.ocrLookupUnsupportedTypeMessage"),
  } satisfies Record<OcrLookupStatus, string | undefined>;

  return messages[status];
}
