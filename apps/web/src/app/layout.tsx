import { assets } from "@culturando/assets";
import { appConfig } from "@culturando/config";
import type { Metadata } from "next";
import "maplibre-gl/dist/maplibre-gl.css";
import "./global.css";
import { JetBrains_Mono, Lora, Poppins } from "next/font/google";
import { Toaster } from "sonner";
import { AppFloatingBar } from "@/components/AppFloatingBar";
import { InactivityWatchdog } from "@/components/InactivityWatchdog";
import { LocaleProvider } from "@/components/LocaleProvider";
import { getCurrentLocale } from "@/lib/locale";

export const metadata: Metadata = {
  title: {
    default: appConfig.name,
    template: `%s | ${appConfig.name}`,
  },
  description: appConfig.description,
  authors: [...appConfig.authors],
  publisher: appConfig.publisher,
  manifest: assets.icons.manifest,
  icons: {
    icon: [
      {
        url: assets.icons.faviconDark,
        media: "(prefers-color-scheme: light)",
        type: "image/svg+xml",
      },
      {
        url: assets.icons.faviconLight,
        media: "(prefers-color-scheme: dark)",
        type: "image/svg+xml",
      },
    ],
    apple: [{ url: assets.icons.appleTouch, sizes: "180x180", type: "image/png" }],
  },
};

const fontSans = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

const fontSerif = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif",
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getCurrentLocale();

  return (
    <html lang={locale}>
      <body
        className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable} antialiased`}
      >
        <LocaleProvider initialLocale={locale}>
          <AppFloatingBar />
          {children}
          <InactivityWatchdog />
          <Toaster richColors />
        </LocaleProvider>
      </body>
    </html>
  );
}
