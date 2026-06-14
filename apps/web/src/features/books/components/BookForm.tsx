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
    },
  });
  const t = useTranslation();

  function onSubmit(values: BookFormValues) {
    const formData = new FormData();

    formData.set("title", values.title);
    formData.set("author", values.author);
    formData.set("isbn", values.isbn ?? "");
    formData.set("publisher", values.publisher ?? "");
    formData.set("publishedYear", values.publishedYear?.toString() ?? "");
    formData.set("language", values.language ?? "");
    formData.set("category", values.category ?? "");
    formData.set("description", values.description ?? "");
    formData.set("availability", values.availability);
    formData.set("visibility", values.visibility);
    formData.set("physicalCondition", values.physicalCondition);
    formData.set("addressLabel", values.addressLabel);
    formData.set("city", values.city ?? "");
    formData.set("province", values.province ?? "");
    formData.set("region", values.region ?? "");
    formData.set("country", values.country);
    formData.set("imageUrls", values.imageUrls ?? "");

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
  const imageUrlsError = errors.imageUrls?.message ?? state.errors.imageUrls;

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

      <div className="space-y-2">
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

      {/* Upload e ricerca copertina esterna arriveranno con storage e provider dedicati. */}
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
