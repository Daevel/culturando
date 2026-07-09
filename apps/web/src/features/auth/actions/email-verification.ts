import { createHash, randomBytes } from "node:crypto";
import { prisma } from "@culturando/db";
import { Resend } from "resend";

const tokenTtlMs = 1000 * 60 * 60 * 24;

type SendVerificationEmailInput = {
  email: string;
  name: string;
  verificationUrl: string;
};

export async function createEmailVerificationToken(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashVerificationToken(token);
  const expiresAt = new Date(Date.now() + tokenTtlMs);

  await prisma.emailVerificationToken.deleteMany({
    where: {
      userId,
    },
  });

  await prisma.emailVerificationToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
  });

  return token;
}

export async function confirmEmailVerificationToken(token: string) {
  const tokenHash = hashVerificationToken(token);
  const verificationToken = await prisma.emailVerificationToken.findUnique({
    where: {
      tokenHash,
    },
    select: {
      expiresAt: true,
      userId: true,
    },
  });

  if (!verificationToken || verificationToken.expiresAt < new Date()) {
    return { success: false };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: {
        id: verificationToken.userId,
      },
      data: {
        emailVerifiedAt: new Date(),
      },
    }),
    prisma.emailVerificationToken.deleteMany({
      where: {
        userId: verificationToken.userId,
      },
    }),
  ]);

  return { success: true };
}

export function buildEmailVerificationUrl(token: string) {
  const baseUrl = getAppBaseUrl();
  const url = new URL("/auth/confirm-email", baseUrl);
  url.searchParams.set("token", token);

  return url.toString();
}

export async function sendVerificationEmail({
  email,
  name,
  verificationUrl,
}: SendVerificationEmailInput) {
  const provider = process.env.EMAIL_PROVIDER?.trim() || "console";

  if (provider === "http") {
    await sendHttpVerificationEmail({ email, name, verificationUrl });
    return;
  }

  if (provider === "resend") {
    await sendResendVerificationEmail({ email, name, verificationUrl });
    return;
  }

  console.info("Email verification link", {
    email,
    name,
    verificationUrl,
  });
}

async function sendResendVerificationEmail({
  email,
  name,
  verificationUrl,
}: SendVerificationEmailInput) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim();

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is required when EMAIL_PROVIDER=resend.");
  }

  if (!from) {
    throw new Error("EMAIL_FROM is required when EMAIL_PROVIDER=resend.");
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to: email,
    subject: "Conferma il tuo account Culturando",
    html: buildVerificationEmailHtml({ name, verificationUrl }),
    text: buildVerificationEmailText({ name, verificationUrl }),
  });

  if (error) {
    throw new Error(`Resend failed to send verification email: ${error.message}`);
  }
}

async function sendHttpVerificationEmail(input: SendVerificationEmailInput) {
  const endpoint = process.env.EMAIL_PROVIDER_ENDPOINT?.trim();
  const token = process.env.EMAIL_PROVIDER_TOKEN?.trim();

  if (!endpoint) {
    throw new Error("EMAIL_PROVIDER_ENDPOINT is required when EMAIL_PROVIDER=http.");
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      to: input.email,
      subject: "Conferma il tuo account Culturando",
      template: "email-verification",
      data: input,
    }),
  });

  if (!response.ok) {
    throw new Error(`Email provider failed with status ${response.status}.`);
  }
}

function hashVerificationToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function buildVerificationEmailText({
  name,
  verificationUrl,
}: Pick<SendVerificationEmailInput, "name" | "verificationUrl">) {
  return [
    `Ciao ${name},`,
    "",
    "conferma il tuo account Culturando aprendo questo link:",
    verificationUrl,
    "",
    "Il link scade tra 24 ore.",
  ].join("\n");
}

function buildVerificationEmailHtml({
  name,
  verificationUrl,
}: Pick<SendVerificationEmailInput, "name" | "verificationUrl">) {
  const safeName = escapeHtml(name);
  const safeVerificationUrl = escapeHtml(verificationUrl);

  return `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#2f1018;max-width:560px;margin:0 auto;padding:24px;">
      <h1 style="font-family:Georgia,serif;margin:0 0 16px;color:#5a1e2a;">Conferma il tuo account Culturando</h1>
      <p>Ciao ${safeName},</p>
      <p>per attivare il tuo account e iniziare a usare Culturando, conferma il tuo indirizzo email.</p>
      <p style="margin:28px 0;">
        <a href="${safeVerificationUrl}" style="display:inline-block;border-radius:10px;background:#5a1e2a;color:#ffffff;padding:12px 18px;text-decoration:none;font-weight:700;">Conferma account</a>
      </p>
      <p style="font-size:14px;color:#6b4a52;">Il link scade tra 24 ore. Se non hai richiesto tu questa registrazione, puoi ignorare questa email.</p>
    </div>
  `;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getAppBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.AUTH_URL?.trim() ||
    "http://localhost:3000"
  );
}
