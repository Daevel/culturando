import type { Session } from "next-auth";

/**
 * Extracted from apps/web/src/app/dashboard/admin/page.tsx so the role gate
 * is a plain function: unit-testable without rendering a Server Component,
 * and reusable if a second admin-only route or action is added later.
 */
export function isAdminSession(session: Session | null | undefined): boolean {
  return session?.user?.role === "admin";
}
