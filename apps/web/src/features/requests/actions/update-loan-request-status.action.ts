"use server";

import type { LoanRequestStatus } from "@culturando/types";
import { revalidatePath } from "next/cache";

import { auth } from "@/config/auth";
import { routes } from "@/config/routes";
import { updatePendingLoanRequestStatus } from "./loan-requests.repository";

export async function updateLoanRequestStatusAction(
  requestId: string,
  status: Extract<LoanRequestStatus, "accepted" | "rejected">,
) {
  const session = await auth();
  const ownerId = session?.user?.id;

  if (!ownerId) {
    return;
  }

  await updatePendingLoanRequestStatus({
    ownerId,
    requestId,
    status,
  });

  revalidatePath(routes.dashboard);
}
