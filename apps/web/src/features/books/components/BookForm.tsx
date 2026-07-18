"use client";

import type { BookMetadataSuggestion } from "@culturando/ai";
import type { AddressSuggestion } from "@culturando/geo";
import type { Book } from "@culturando/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus, Upload } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  startTransition,
  useActionState,
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DropdownSelect } from "@/components/ui/dropdown-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wizard, type WizardStep } from "@/components/ui/wizard";
import { routes } from "@/config/routes";
import {
  type ExtractIsbnFromImageResult,
  extractIsbnFromImageAction,
} from "@/features/cataloging/actions/extract-isbn-from-image.action";
import { searchAddressSuggestions } from "@/features/location/actions/search-address-suggestions.action";
import { useTranslation } from "@/hooks/useTranslation";
import { createBookAction } from "../actions/create-book.action";
import { bookSchema } from "../schemas/book.schema";
import type { BookFormState } from "../types/book-form.types";

type BookFormInput = z.input<typeof bookSchema>;
type BookFormValues = z.output<typeof bookSchema>;

type BookPreviewImage = {
  alt: string;
  id: string;
  url: string;
};

type BookFormProps = {
  action?: (state: BookFormState, formData: FormData) => Promise<BookFormState>;
  book?: Book;
  mode?: "create" | "edit";
};

const initialState: BookFormState = {
  success: false,
  errors: {},
};

type CoverLookupStatus = "idle" | "loading" | "found" | "not-found" | "error" | "missing-isbn";
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
type OcrLookupStatus =
  | "idle"
  | "loading"
  | "found"
  | Extract<ExtractIsbnFromImageResult, { success: false }>["reason"];

const bookStepFields = [
  [],
  ["title", "author", "isbn"],
  [
    "publisher",
    "publishedYear",
    "language",
    "category",
    "description",
    "availability",
    "visibility",
    "physicalCondition",
    "addressLabel",
    "city",
    "province",
    "region",
    "country",
  ],
  ["imageUrls", "externalCoverUrl"],
] satisfies Array<Array<keyof BookFormInput>>;

export function BookForm({ action = createBookAction, book, mode = "create" }: BookFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const coverObjectUrlRef = useRef<string[]>([]);
  const coverImageInputRef = useRef<HTMLInputElement | null>(null);
  const ocrImageInputRef = useRef<HTMLInputElement | null>(null);
  const [isSearchingAddress, startAddressSearch] = useTransition();
  const [addressQuery, setAddressQuery] = useState(book?.location?.addressLabel ?? "");
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [hasInteractedWithAddress, setHasInteractedWithAddress] = useState(false);
  const [coverPreviewImages, setCoverPreviewImages] = useState<BookPreviewImage[]>(() =>
    getInitialPreviewImages(book),
  );
  const [coverImageFiles, setCoverImageFiles] = useState<File[]>([]);
  const [coverLookupStatus, setCoverLookupStatus] = useState<CoverLookupStatus>("idle");
  const [metadataLookupStatus, setMetadataLookupStatus] = useState<MetadataLookupStatus>("idle");
  const [ocrLookupStatus, setOcrLookupStatus] = useState<OcrLookupStatus>("idle");
  const [currentStep, setCurrentStep] = useState(0);
  const [state, formAction, isPending] = useActionState(action, initialState);
  const {
    handleSubmit,
    getValues,
    register,
    reset,
    setValue,
    trigger,
    watch,
    formState: { errors },
  } = useForm<BookFormInput, unknown, BookFormValues>({
    resolver: zodResolver(bookSchema),
    defaultValues: getDefaultBookFormValues(book),
  });
  const t = useTranslation();
  const isbnValue = watch("isbn");
  const availabilityValue = watch("availability");
  const visibilityValue = watch("visibility");
  const physicalConditionValue = watch("physicalCondition");
  const successToastTitle =
    mode === "edit" ? t("books.edit.toast.successTitle") : t("books.new.toast.successTitle");
  const successMessage =
    mode === "edit" ? t("books.edit.successMessage") : t("books.new.successMessage");

  const clearCoverObjectUrl = useCallback(() => {
    for (const objectUrl of coverObjectUrlRef.current) {
      URL.revokeObjectURL(objectUrl);
    }

    coverObjectUrlRef.current = [];
  }, []);

  function onSubmit(_values: BookFormValues) {
    const formData = new FormData();
    const values = getValues();

    for (const [key, value] of Object.entries(values)) {
      formData.set(key, value === undefined ? "" : String(value));
    }

    const coverImage = formRef.current?.elements.namedItem("coverImages");

    if (coverImage instanceof HTMLInputElement && coverImage.files && coverImage.files.length > 0) {
      for (const file of Array.from(coverImage.files)) {
        formData.append("coverImages", file);
      }
    } else {
      for (const file of coverImageFiles) {
        formData.append("coverImages", file);
      }
    }

    startTransition(() => {
      formAction(formData);
    });
  }

  useEffect(() => {
    if (state.success) {
      toast.success(successToastTitle, {
        description: state.messageKey ? t(state.messageKey) : successMessage,
      });

      if (mode === "edit" && book) {
        router.push(routes.bookDetail(book.id));
        return;
      }

      reset();
      formRef.current?.reset();
      clearCoverObjectUrl();
      setCoverPreviewImages([]);
      setCoverImageFiles([]);
      setCoverLookupStatus("idle");
      setMetadataLookupStatus("idle");
      setOcrLookupStatus("idle");
      setAddressQuery("");
      setAddressSuggestions([]);
      setHasInteractedWithAddress(false);
      setCurrentStep(0);
      router.push(routes.dashboard);
    }
  }, [
    book,
    clearCoverObjectUrl,
    mode,
    reset,
    router,
    state.messageKey,
    state.success,
    successMessage,
    successToastTitle,
    t,
  ]);

  useEffect(() => {
    const normalizedQuery = addressQuery.trim();

    if (!hasInteractedWithAddress || normalizedQuery.length < 3) {
      setAddressSuggestions([]);
      return;
    }

    const timeout = window.setTimeout(() => {
      startAddressSearch(async () => {
        const suggestions = await searchAddressSuggestions(normalizedQuery);
        setAddressSuggestions(suggestions);
      });
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [addressQuery, hasInteractedWithAddress]);

  useEffect(() => {
    if (state.errors.title || state.errors.author || state.errors.isbn) {
      setCurrentStep(1);
      return;
    }

    if (
      state.errors.publisher ||
      state.errors.publishedYear ||
      state.errors.language ||
      state.errors.category ||
      state.errors.description ||
      state.errors.availability ||
      state.errors.visibility ||
      state.errors.physicalCondition ||
      state.errors.addressLabel ||
      state.errors.city ||
      state.errors.province ||
      state.errors.region ||
      state.errors.country
    ) {
      setCurrentStep(2);
      return;
    }

    if (state.errors.coverImage || state.errors.imageUrls || state.errors.externalCoverUrl) {
      setCurrentStep(3);
    }
  }, [state.errors]);

  useEffect(() => {
    return () => {
      clearCoverObjectUrl();
    };
  }, [clearCoverObjectUrl]);

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
      setCoverPreviewImages([{ alt: t("books.new.coverPreviewAlt"), id: coverUrl, url: coverUrl }]);
      setValue("externalCoverUrl", coverUrl, { shouldDirty: true });
      setCoverLookupStatus("found");
    } catch {
      setCoverLookupStatus("error");
    }
  }

  async function extractIsbnFromImage(imageOverrides?: File[]) {
    const images = imageOverrides ?? Array.from(ocrImageInputRef.current?.files ?? []);

    setMetadataLookupStatus("idle");
    setOcrLookupStatus("loading");

    const formData = new FormData();

    for (const image of images) {
      formData.append("images", image);
    }

    const result = await extractIsbnFromImageAction(formData);

    if (!result.success) {
      setOcrLookupStatus(result.reason);
      return;
    }

    if (result.isbn) {
      setValue("isbn", result.isbn, { shouldDirty: true, shouldValidate: true });
    }

    if (result.metadata) {
      setMetadataLookupStatus("found");
      applyMetadataFields(result.metadata);
    }

    setOcrLookupStatus("found");
  }

  function applyMetadataFields(metadata: BookMetadataSuggestion) {
    const metadataValues = getMetadataFieldValues(metadata);

    if (metadataValues.isbn) {
      setValue("isbn", metadataValues.isbn, { shouldDirty: true, shouldValidate: true });
    }

    if (metadataValues.title) {
      setValue("title", metadataValues.title, { shouldDirty: true, shouldValidate: true });
    }

    if (metadataValues.author) {
      setValue("author", metadataValues.author, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }

    if (metadataValues.publisher) {
      setValue("publisher", metadataValues.publisher, { shouldDirty: true });
    }

    if (metadataValues.publishedYear) {
      setValue("publishedYear", metadataValues.publishedYear, { shouldDirty: true });
    }

    if (metadataValues.language) {
      setValue("language", metadataValues.language, { shouldDirty: true });
    }

    if (metadataValues.category) {
      setValue("category", metadataValues.category, { shouldDirty: true });
    }

    if (metadataValues.description) {
      setValue("description", metadataValues.description, { shouldDirty: true });
    }

    if (metadataValues.coverUrl) {
      if (coverImageFiles.length === 0) {
        clearCoverObjectUrl();
        setCoverPreviewImages([
          {
            alt: t("books.new.coverPreviewAlt"),
            id: metadataValues.coverUrl,
            url: metadataValues.coverUrl,
          },
        ]);
      }
      setValue("externalCoverUrl", metadataValues.coverUrl, { shouldDirty: true });
      setCoverLookupStatus("found");
    }
  }

  function handleCoverImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);

    setValue("externalCoverUrl", "", { shouldDirty: true });
    setCoverLookupStatus("idle");
    clearCoverObjectUrl();

    if (files.length === 0) {
      setCoverImageFiles([]);
      setCoverPreviewImages([]);
      return;
    }

    setCoverImageFiles(files);
    const objectUrls = files.map((file) => URL.createObjectURL(file));

    coverObjectUrlRef.current = objectUrls;
    setCoverPreviewImages(
      objectUrls.map((url, index) => ({
        alt: files[index].name,
        id: `${files[index].name}-${files[index].lastModified}-${index}`,
        url,
      })),
    );
  }

  function handleCatalogingImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    handleCoverImageChange(event);

    const files = Array.from(event.target.files ?? []);

    if (files.length === 0) {
      setOcrLookupStatus("idle");
      return;
    }

    void extractIsbnFromImage(files);
  }

  function handleAddressQueryChange(event: React.ChangeEvent<HTMLInputElement>) {
    const nextQuery = event.target.value;

    setHasInteractedWithAddress(true);
    setAddressQuery(nextQuery);
    setValue("addressLabel", nextQuery, { shouldDirty: true, shouldValidate: true });
    setValue("city", "", { shouldDirty: true, shouldValidate: true });
    setValue("province", "", { shouldDirty: true, shouldValidate: true });
    setValue("region", "", { shouldDirty: true, shouldValidate: true });
    setValue("country", "Italia", { shouldDirty: true, shouldValidate: true });
  }

  function applyAddressSuggestion(suggestion: AddressSuggestion) {
    setAddressQuery(suggestion.displayName);
    setValue("addressLabel", suggestion.addressLabel, { shouldDirty: true, shouldValidate: true });
    setValue("city", suggestion.city, { shouldDirty: true, shouldValidate: true });
    setValue("province", suggestion.province, { shouldDirty: true, shouldValidate: true });
    setValue("region", suggestion.region, { shouldDirty: true, shouldValidate: true });
    setValue("country", "Italia", { shouldDirty: true, shouldValidate: true });
    setAddressSuggestions([]);
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
  const locationError =
    addressLabelError ?? cityError ?? provinceError ?? regionError ?? countryError;
  const coverImageError = state.errors.coverImage;
  const imageUrlsError = errors.imageUrls?.message ?? state.errors.imageUrls;
  const coverLookupMessage = getCoverLookupMessage(coverLookupStatus, t);
  const metadataLookupMessage = getMetadataLookupMessage(metadataLookupStatus, t);
  const ocrLookupMessage = getOcrLookupMessage(ocrLookupStatus, t);
  const availabilityOptions = [
    { value: "available", label: t("books.availability.available") },
    { value: "consultation_only", label: t("books.availability.consultationOnly") },
    { value: "loanable", label: t("books.availability.loanable") },
    { value: "unavailable", label: t("books.availability.unavailable") },
  ] as const;
  const visibilityOptions = [
    { value: "public", label: t("books.visibility.public") },
    { value: "private", label: t("books.visibility.private") },
  ] as const;
  const physicalConditionOptions = [
    { value: "new", label: t("books.physicalCondition.new") },
    { value: "good", label: t("books.physicalCondition.good") },
    { value: "worn", label: t("books.physicalCondition.worn") },
    { value: "damaged", label: t("books.physicalCondition.damaged") },
  ] as const;
  const bookSteps: WizardStep[] = [
    {
      id: "assist",
      title: t("books.new.wizard.steps.assist.title"),
      description: t("books.new.wizard.steps.assist.description"),
    },
    {
      id: "essentials",
      title: t("books.new.wizard.steps.essentials.title"),
      description: t("books.new.wizard.steps.essentials.description"),
    },
    {
      id: "sharing",
      title: t("books.new.wizard.steps.sharing.title"),
      description: t("books.new.wizard.steps.sharing.description"),
    },
    {
      id: "images",
      title: t("books.new.wizard.steps.images.title"),
      description: t("books.new.wizard.steps.images.description"),
    },
  ];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === bookSteps.length - 1;
  const isWaitingForCataloging = currentStep === 0 && ocrLookupStatus === "loading";

  async function goToNextStep() {
    if (isWaitingForCataloging) {
      return;
    }

    const fieldsToValidate = bookStepFields[currentStep];
    const isStepValid = fieldsToValidate.length === 0 || (await trigger(fieldsToValidate));

    if (!isStepValid) {
      return;
    }

    setCurrentStep((step) => Math.min(step + 1, bookSteps.length - 1));
  }

  function goToPreviousStep() {
    setCurrentStep((step) => Math.max(step - 1, 0));
  }

  async function completeBookCreation() {
    if (!isLastStep) {
      return;
    }

    await handleSubmit(onSubmit)();
  }

  return (
    <Wizard
      className="w-full"
      currentStep={currentStep}
      description={t("books.new.formDescription")}
      progressLabel={t("books.new.wizard.progressLabel")}
      stepCounterLabel={(current, total) =>
        `${t("books.new.wizard.stepLabel")} ${current} ${t("books.new.wizard.ofLabel")} ${total}`
      }
      steps={bookSteps}
      title={t("books.new.formTitle")}
    >
      <form
        className="space-y-5"
        noValidate
        onKeyDown={(event) => {
          if (event.key !== "Enter" || isLastStep) {
            return;
          }

          event.preventDefault();
          void goToNextStep();
        }}
        onSubmit={(event) => event.preventDefault()}
        ref={formRef}
      >
        {currentStep === 0 ? (
          <div className="space-y-4 rounded-xl border bg-muted/20 p-4">
            {/* OCR and metadata lookup assist cataloging, but the user keeps control before saving. */}
            <div className="space-y-1">
              <h2 className="text-base font-semibold">{t("books.new.catalogingPanelTitle")}</h2>
              <p className="text-sm text-muted-foreground">
                {t("books.new.catalogingPanelDescription")}
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.8fr)]">
              <section className="space-y-4 rounded-lg border bg-background p-4">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("books.new.catalogingStepImageLabel")}
                  </p>
                  <h3 className="text-sm font-semibold">{t("books.new.ocrLookupTitle")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("books.new.ocrLookupDescription")}
                  </p>
                </div>
                <Input
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  id="ocrImage"
                  multiple
                  name="coverImages"
                  onChange={handleCatalogingImageChange}
                  ref={ocrImageInputRef}
                  type="file"
                />
                <FileUploadDropdown
                  description={t("books.new.fileUploadDescription")}
                  inputId="ocrImage"
                  label={t("books.new.fileUploadLabel")}
                  onChooseFile={() => ocrImageInputRef.current?.click()}
                  uploadLabel={t("books.new.fileUploadFromDeviceLabel")}
                />
                {coverImageFiles.length > 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {t("books.new.selectedImagesLabel").replace(
                      "{count}",
                      String(coverImageFiles.length),
                    )}
                  </p>
                ) : null}
                {ocrLookupMessage ? (
                  <p className="text-sm text-muted-foreground" role="status">
                    {ocrLookupMessage}
                  </p>
                ) : null}

                {metadataLookupMessage ? (
                  <p className="text-sm text-muted-foreground" role="status">
                    {metadataLookupMessage}
                  </p>
                ) : null}
              </section>

              <aside className="space-y-3 rounded-lg border bg-muted/20 p-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold">
                    {t("books.new.catalogingFallbackTitle")}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t("books.new.catalogingFallbackDescription")}
                  </p>
                </div>

                {coverPreviewImages.length > 0 ? (
                  <Carousel opts={{ loop: coverPreviewImages.length > 1 }}>
                    <CarouselContent>
                      {coverPreviewImages.map((image) => (
                        <CarouselItem key={image.id}>
                          <div className="relative aspect-[16/9] overflow-hidden rounded-lg border bg-background">
                            <Image
                              alt={image.alt}
                              className="h-full w-full object-contain"
                              fill
                              sizes="(min-width: 768px) 896px, 100vw"
                              src={image.url}
                              unoptimized
                            />
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    {coverPreviewImages.length > 1 ? (
                      <>
                        <CarouselPrevious
                          aria-label={t("books.imageCarousel.previousLabel")}
                          className="left-3 bg-background/90 shadow-lg backdrop-blur hover:bg-background"
                        />
                        <CarouselNext
                          aria-label={t("books.imageCarousel.nextLabel")}
                          className="right-3 bg-background/90 shadow-lg backdrop-blur hover:bg-background"
                        />
                      </>
                    ) : null}
                  </Carousel>
                ) : null}
              </aside>
            </div>
          </div>
        ) : null}

        {currentStep === 1 ? (
          <>
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
          </>
        ) : null}

        {currentStep === 2 ? (
          <>
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
                <DropdownSelect
                  aria-describedby={availabilityError ? "book-availability-error" : undefined}
                  aria-invalid={Boolean(availabilityError)}
                  id="availability"
                  name="availability"
                  onValueChange={(nextAvailability) =>
                    setValue("availability", nextAvailability, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                  options={availabilityOptions}
                  value={availabilityValue}
                />
                {availabilityError ? (
                  <p className="text-sm text-destructive" id="book-availability-error">
                    {availabilityError}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="visibility">{t("books.new.fields.visibility.label")}</Label>
                <DropdownSelect
                  aria-describedby={visibilityError ? "book-visibility-error" : undefined}
                  aria-invalid={Boolean(visibilityError)}
                  id="visibility"
                  name="visibility"
                  onValueChange={(nextVisibility) =>
                    setValue("visibility", nextVisibility, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                  options={visibilityOptions}
                  value={visibilityValue}
                />
                {visibilityError ? (
                  <p className="text-sm text-destructive" id="book-visibility-error">
                    {visibilityError}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="physicalCondition">
                  {t("books.new.fields.physicalCondition.label")}
                </Label>
                <DropdownSelect
                  aria-describedby={
                    physicalConditionError ? "book-physical-condition-error" : undefined
                  }
                  aria-invalid={Boolean(physicalConditionError)}
                  id="physicalCondition"
                  name="physicalCondition"
                  onValueChange={(nextPhysicalCondition) =>
                    setValue("physicalCondition", nextPhysicalCondition, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                  options={physicalConditionOptions}
                  value={physicalConditionValue}
                />
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
                <p className="text-sm text-muted-foreground">
                  {t("books.new.locationDescription")}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="book-location">{t("books.new.fields.addressLabel.label")}</Label>
                <div className="relative">
                  <Input
                    aria-describedby={locationError ? "book-location-error" : undefined}
                    aria-invalid={Boolean(locationError)}
                    autoComplete="street-address"
                    id="book-location"
                    onChange={handleAddressQueryChange}
                    placeholder={t("books.new.fields.addressLabel.placeholder")}
                    value={addressQuery}
                  />
                  {addressSuggestions.length > 0 ? (
                    <div className="absolute z-20 mt-2 max-h-72 w-full overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
                      {addressSuggestions.map((suggestion) => (
                        <button
                          className="w-full rounded-sm px-3 py-2 text-left text-sm outline-none transition hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground"
                          key={suggestion.id}
                          onClick={() => applyAddressSuggestion(suggestion)}
                          type="button"
                        >
                          {suggestion.displayName}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
                <input type="hidden" {...register("addressLabel")} />
                <input type="hidden" {...register("city")} />
                <input type="hidden" {...register("province")} />
                <input type="hidden" {...register("region")} />
                <input type="hidden" {...register("country")} />
                {locationError ? (
                  <p className="text-sm text-destructive" id="book-location-error">
                    {locationError}
                  </p>
                ) : null}
                {isSearchingAddress || hasInteractedWithAddress ? (
                  <p className="text-sm text-muted-foreground">
                    {isSearchingAddress
                      ? t("books.new.locationSearchingLabel")
                      : t("books.new.locationAutocompleteDescription")}
                  </p>
                ) : null}
              </div>
            </div>
          </>
        ) : null}

        {currentStep === 3 ? (
          <>
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
                  className="sr-only"
                  id="coverImage"
                  multiple
                  name="coverImages"
                  onChange={handleCoverImageChange}
                  ref={coverImageInputRef}
                  type="file"
                />
                <FileUploadDropdown
                  description={t("books.new.fileUploadDescription")}
                  inputId="coverImage"
                  label={t("books.new.fileUploadLabel")}
                  onChooseFile={() => coverImageInputRef.current?.click()}
                  uploadLabel={t("books.new.fileUploadFromDeviceLabel")}
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
                  <p className="text-sm text-muted-foreground">
                    {t("books.new.coverLookupDescription")}
                  </p>
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

              {coverPreviewImages.length > 0 ? (
                <Carousel opts={{ loop: coverPreviewImages.length > 1 }}>
                  <CarouselContent>
                    {coverPreviewImages.map((image) => (
                      <CarouselItem key={image.id}>
                        <div className="relative aspect-[16/9] overflow-hidden rounded-lg border bg-background">
                          <Image
                            alt={image.alt}
                            className="h-full w-full object-contain"
                            fill
                            sizes="(min-width: 768px) 896px, 100vw"
                            src={image.url}
                            unoptimized
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  {coverPreviewImages.length > 1 ? (
                    <>
                      <CarouselPrevious
                        aria-label={t("books.imageCarousel.previousLabel")}
                        className="left-3 bg-background/90 shadow-lg backdrop-blur hover:bg-background"
                      />
                      <CarouselNext
                        aria-label={t("books.imageCarousel.nextLabel")}
                        className="right-3 bg-background/90 shadow-lg backdrop-blur hover:bg-background"
                      />
                    </>
                  ) : null}
                </Carousel>
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
          </>
        ) : null}

        {state.messageKey ? (
          <p className={cnMessageClass(state.success)} role="status">
            {t(state.messageKey)}
          </p>
        ) : null}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          {isFirstStep ? (
            <span />
          ) : (
            <Button disabled={isPending} onClick={goToPreviousStep} type="button" variant="outline">
              {t("books.new.wizard.previousLabel")}
            </Button>
          )}

          {isLastStep ? (
            <Button isLoading={isPending} onClick={completeBookCreation} type="button">
              {isPending ? t("books.new.pendingLabel") : t("books.new.submitLabel")}
            </Button>
          ) : (
            <Button
              disabled={isPending || isWaitingForCataloging}
              onClick={goToNextStep}
              type="button"
            >
              {isWaitingForCataloging
                ? t("books.new.wizard.waitForCatalogingLabel")
                : t("books.new.wizard.nextLabel")}
            </Button>
          )}
        </div>
      </form>
    </Wizard>
  );
}

function cnMessageClass(success: boolean) {
  return success ? "text-sm text-muted-foreground" : "text-sm text-destructive";
}

function FileUploadDropdown({
  description,
  inputId,
  label,
  onChooseFile,
  uploadLabel,
}: {
  description: string;
  inputId: string;
  label: string;
  onChooseFile: () => void;
  uploadLabel: string;
}) {
  return (
    <div className="rounded-lg border bg-background p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              aria-controls={inputId}
              className="w-full sm:w-auto"
              type="button"
              variant="outline"
            >
              <ImagePlus className="size-4" />
              {label}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                onChooseFile();
              }}
            >
              <Upload className="size-4" />
              {uploadLabel}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function getMetadataFieldValues(
  metadata: BookMetadataSuggestion,
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

function getDefaultBookFormValues(book: Book | undefined): BookFormInput {
  return {
    title: book?.title ?? "",
    author: book?.author ?? "",
    isbn: book?.isbn ?? "",
    publisher: book?.publisher ?? "",
    publishedYear: book?.publishedYear ? String(book.publishedYear) : "",
    language: book?.language ?? "",
    category: book?.category ?? "",
    description: book?.description ?? "",
    availability: book?.availability ?? "available",
    visibility: book?.visibility ?? "public",
    physicalCondition: book?.physicalCondition ?? "good",
    addressLabel: book?.location?.addressLabel ?? "",
    city: book?.location?.city ?? "",
    province: book?.location?.province ?? "",
    region: book?.location?.region ?? "",
    country: book?.location?.country ?? "Italia",
    imageUrls: "",
    externalCoverUrl: "",
  };
}

function getInitialPreviewImages(book: Book | undefined): BookPreviewImage[] {
  return (
    book?.images.map((image) => ({
      alt: image.alt ?? book.title,
      id: image.id,
      url: image.url,
    })) ?? []
  );
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

function getMetadataLookupMessage(
  status: MetadataLookupStatus,
  t: ReturnType<typeof useTranslation>,
) {
  const messages = {
    idle: undefined,
    loading: t("books.new.ocrLookupPendingLabel"),
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
