"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/config/auth";
import { routes } from "@/config/routes";
import { getStoredBookOwnerId } from "@/features/books/actions/books.repository";
import { validateLoanRequestForm } from "../schemas/loan-request.schema";
import type { LoanRequestFormField, LoanRequestFormState } from "../types/loan-request-form.types";
import { createStoredLoanRequest } from "./loan-requests.repository";

export async function createLoanRequestAction(
  bookId: string,
  _state: LoanRequestFormState,
  formData: FormData,
): Promise<LoanRequestFormState> {
  const session = await auth();
  const requesterId = session?.user?.id;

  if (!requesterId) {
    return {
      success: false,
      errors: {},
      messageKey: "requests.form.unauthorizedMessage",
    };
  }

  const ownerId = await getStoredBookOwnerId(bookId);

  if (!ownerId) {
    return {
      success: false,
      errors: {},
      messageKey: "requests.form.unavailableBookMessage",
    };
  }

  if (ownerId === requesterId) {
    return {
      success: false,
      errors: {},
      messageKey: "requests.form.ownerMessage",
    };
  }

  const validation = validateLoanRequestForm({
    type: formData.get("type"),
    message: formData.get("message"),
  });

  if (!validation.isValid) {
    const errors = validation.errors as Partial<Record<LoanRequestFormField, string[]>>;

    return {
      success: false,
      errors: {
        type: errors.type?.[0],
        message: errors.message?.[0],
      },
    };
  }

  if (!validation.data) {
    return {
      success: false,
      errors: {},
      messageKey: "requests.form.genericErrorMessage",
    };
  }

  await createStoredLoanRequest({
    bookId,
    requesterId,
    ownerId,
    type: validation.data.type,
    message: validation.data.message,
  });

  revalidatePath(routes.dashboard);

  return {
    success: true,
    errors: {},
    messageKey: "requests.form.successMessage",
  };
}
