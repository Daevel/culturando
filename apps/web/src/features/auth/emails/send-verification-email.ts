import { createMailerTransporter } from "./mailer";

type SendVerificationEmailParams = {
  to: string;
  name: string;
  verificationUrl: string;
};

export async function sendVerificationEmail({
  to,
  name,
  verificationUrl,
}: SendVerificationEmailParams) {
  const emailProvider = process.env.EMAIL_PROVIDER?.trim();

  if (emailProvider === "console") {
    console.info(
      [
        "[Culturando] Verification email",
        `To: ${to}`,
        `Name: ${name}`,
        `URL: ${verificationUrl}`,
      ].join("\n"),
    );

    return;
  }

  const from = process.env.SMTP_FROM?.trim() || process.env.EMAIL_FROM?.trim();

  if (!from) {
    throw new Error("SMTP_FROM or EMAIL_FROM is missing.");
  }

  const transporter = createMailerTransporter();

  await transporter.sendMail({
    from,
    to,
    subject: "Conferma il tuo account Culturando",
    text: buildVerificationEmailText({ name, verificationUrl }),
    html: buildVerificationEmailHtml({ name, verificationUrl }),
  });
}

function buildVerificationEmailText({
  name,
  verificationUrl,
}: Pick<SendVerificationEmailParams, "name" | "verificationUrl">) {
  return [
    `Ciao ${name},`,
    "",
    "conferma il tuo account Culturando aprendo questo link:",
    verificationUrl,
    "",
    "Il link scade tra 24 ore.",
    "Se non hai richiesto tu questa registrazione, puoi ignorare questa email.",
  ].join("\n");
}

function buildVerificationEmailHtml({
  name,
  verificationUrl,
}: Pick<SendVerificationEmailParams, "name" | "verificationUrl">) {
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
