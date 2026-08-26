export function createVerificationUrl(token: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (!appUrl) {
    throw new Error("NEXT_PUBLIC_APP_URL is missing.");
  }

  const url = new URL("/auth/verify-email", appUrl);
  url.searchParams.set("token", token);

  return url.toString();
}
