"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/config/auth";
import { routes } from "@/config/routes";
import { cancelPendingLoanRequest } from "./loan-requests.repository";

export async function cancelLoanRequestAction(requestId: string) {
  const session = await auth();
  const requesterId = session?.user?.id;

  if (!requesterId) {
    return;
  }

  await cancelPendingLoanRequest({
    requestId,
    requesterId,
  });

  revalidatePath(routes.dashboardRequests);
}
