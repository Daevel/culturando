import { getTranslation, type TranslationKey } from "@culturando/translation";
import { type BrowserContext, expect, type Page, test } from "@playwright/test";

import { waitForVerificationUrl } from "./support/server-log";

// Labels come from the same dictionary the UI uses (default locale "it"), so copy changes do
// not break selectors.
const t = (key: TranslationKey) => getTranslation(key, "it");

// Real Open Library and Nominatim calls happen in the steps below, and packages/geo has no
// timeout of its own: these budgets make a slow provider fail explicitly at its own step.
const ADDRESS_SUGGESTIONS_TIMEOUT_MS = 20_000;
const BOOK_CREATION_TIMEOUT_MS = 30_000;

type TestUser = { name: string; email: string };

const PASSWORD = "E2e-Password-123!";
// Syntactically valid but unknown to Open Library: the cover lookup answers 404 and nothing is
// downloaded into public/uploads.
const UNKNOWN_ISBN = "9780000000002";
const ADDRESS_QUERY = "Piazza del Plebiscito, Napoli";

test("critical path: signup, email confirmation, login, book, request, acceptance", async ({
  browser,
}) => {
  // Sum of the explicit step budgets (~50s of network waits plus default 10s expects) with
  // margin: the test-level timeout must never fire before a step's own, clearer timeout.
  test.setTimeout(120_000);

  // Unique per run: the e2e database is not reset, and email is the only unique signup field.
  const runId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const owner: TestUser = {
    name: `E2E Owner ${runId}`,
    email: `e2e-owner-${runId}@example.com`,
  };
  const requester: TestUser = {
    name: `E2E Requester ${runId}`,
    email: `e2e-requester-${runId}@example.com`,
  };
  const bookTitle = `E2E Smoke Book ${runId}`;

  // Two contexts: owner and requester each keep their own Auth.js session cookie.
  const ownerContext = await browser.newContext();
  const requesterContext = await browser.newContext();
  const ownerPage = await ownerContext.newPage();
  const requesterPage = await requesterContext.newPage();

  try {
    await test.step("owner signs up, confirms the email and logs in", () =>
      signUpConfirmAndLogIn(ownerPage, owner));

    // Known source of flakiness outside the app: this step depends on Nominatim (free public
    // OpenStreetMap service, rate-limited, no application-level timeout in packages/geo) for
    // both address suggestions and server-side geocoding. A timeout here with Nominatim slow or
    // down is an external dependency failure, not an app bug: rerun before investigating.
    const bookPath = await test.step("owner creates a public book", () =>
      createBook(ownerPage, bookTitle));

    await test.step("requester signs up, confirms the email and logs in", () =>
      signUpConfirmAndLogIn(requesterPage, requester));

    await test.step("requester sends a request for the book", async () => {
      await requesterPage.goto(bookPath);
      await requesterPage.locator("#request-message").fill(`E2E smoke request ${runId}`);
      await requesterPage
        .getByRole("button", { name: t("requests.form.submitLabel"), exact: true })
        .click();
      await expect(requesterPage.getByText(t("requests.form.successMessage"))).toBeVisible();
    });

    await test.step("owner accepts the request", async () => {
      await ownerPage.goto("/dashboard");

      const receivedRequest = ownerPage
        .locator("article", { hasText: bookTitle })
        .filter({ hasText: requester.name });

      await expect(receivedRequest).toHaveCount(1);
      await expect(receivedRequest.getByText(t("requests.status.pending"))).toBeVisible();

      await receivedRequest
        .getByRole("button", { name: t("requests.received.acceptLabel"), exact: true })
        .click();

      await expect(receivedRequest.getByText(t("requests.status.accepted"))).toBeVisible();
      await expect(
        receivedRequest.getByRole("button", { name: t("requests.received.acceptLabel") }),
      ).toHaveCount(0);
    });
  } finally {
    await closeContexts(ownerContext, requesterContext);
  }
});

async function signUpConfirmAndLogIn(page: Page, user: TestUser) {
  const nextButton = page.getByRole("button", {
    name: t("auth.signup.wizard.nextLabel"),
    exact: true,
  });

  await page.goto("/auth/signup");
  await page.locator("#name").fill(user.name);
  await page.locator("#email").fill(user.email);
  await nextButton.click();

  await page.locator("#password").fill(PASSWORD);
  await page.locator("#confirmPassword").fill(PASSWORD);
  await nextButton.click();

  await page.getByRole("button", { name: t("auth.signup.submitLabel"), exact: true }).click();
  await expect(page).toHaveURL(/\/auth\/check-email/);

  await page.goto(await waitForVerificationUrl(user.email));
  await expect(page.getByText(t("auth.confirmEmail.success.title")).first()).toBeVisible();

  await page.goto("/auth/login");
  await page.locator("#email").fill(user.email);
  await page.locator("#password").fill(PASSWORD);
  await page.getByRole("button", { name: t("auth.login.submitLabel"), exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

/** Creates a book through the wizard and returns its detail path (e.g. /books/<id>). */
async function createBook(page: Page, title: string) {
  const nextButton = page.getByRole("button", {
    name: t("books.new.wizard.nextLabel"),
    exact: true,
  });

  await page.goto("/dashboard/books/new");

  // Step 1: assisted cataloging (OCR / ISBN lookup) is optional.
  await nextButton.click();

  // Step 2: essentials.
  await page.locator("#title").fill(title);
  await page.locator("#author").fill("E2E Author");
  await page.locator("#isbn").fill(UNKNOWN_ISBN);
  await nextButton.click();

  // Step 3: sharing. City, province and region are only set by picking an address suggestion.
  // Visibility and availability keep their defaults (public, available).
  await page.locator("#book-location").fill(ADDRESS_QUERY);
  const firstSuggestion = page
    .locator("#book-location")
    .locator("xpath=following-sibling::div//button")
    .first();
  await expect(
    firstSuggestion,
    `Address suggestions (Nominatim) did not appear within ${ADDRESS_SUGGESTIONS_TIMEOUT_MS}ms`,
  ).toBeVisible({ timeout: ADDRESS_SUGGESTIONS_TIMEOUT_MS });
  await firstSuggestion.click();
  await nextButton.click();

  // Step 4: images are optional.
  await page.getByRole("button", { name: t("books.new.submitLabel"), exact: true }).click();

  // The create action waits for server-side geocoding (Nominatim) and the Open Library cover
  // lookup before redirecting to the dashboard.
  await expect(
    page,
    `Book creation did not complete within ${BOOK_CREATION_TIMEOUT_MS}ms (server-side geocoding or Open Library lookup)`,
  ).toHaveURL(/\/dashboard$/, { timeout: BOOK_CREATION_TIMEOUT_MS });

  const bookLink = page.locator('a[href^="/books/"]', { hasText: title }).first();
  await expect(bookLink).toBeVisible();

  const bookPath = await bookLink.getAttribute("href");

  if (!bookPath) {
    throw new Error(`Link to the created book "${title}" has no href`);
  }

  return bookPath;
}

async function closeContexts(...contexts: BrowserContext[]) {
  await Promise.all(contexts.map((context) => context.close()));
}
