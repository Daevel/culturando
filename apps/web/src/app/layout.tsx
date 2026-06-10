import "./global.css";
import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Source_Serif_4 } from "next/font/google";

export const metadata: Metadata = {
  title: {
    default: "Culturando",
    template: "%s | Culturando",
  },
  description:
    "Culturando è una piattaforma web geolocalizzata per la valorizzazione e condivisione del patrimonio librario privato.",
};

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontSerif = Source_Serif_4({
  subsets: ["latin"],
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
    <html lang="en">
      <body
        className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
