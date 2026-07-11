import { assets } from "@culturando/assets";
import { appConfig } from "@culturando/config";
import type { Metadata } from "next";
import "maplibre-gl/dist/maplibre-gl.css";
import "./global.css";
import { JetBrains_Mono, Lora, Poppins } from "next/font/google";
import { AppFloatingBar } from "@/components/AppFloatingBar";

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
      { url: assets.favicon, sizes: "any" },
      { url: assets.icons.favicon16, sizes: "16x16", type: "image/png" },
      { url: assets.icons.favicon32, sizes: "32x32", type: "image/png" },
      { url: assets.icons.icon192, sizes: "192x192", type: "image/png" },
      { url: assets.icons.icon512, sizes: "512x512", type: "image/png" },
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={appConfig.defaultLocale}>
      <body
        className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable} antialiased`}
      >
        <AppFloatingBar />
        {children}
      </body>
    </html>
  );
}
