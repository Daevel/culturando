import type { Metadata } from "next";
import "./global.css";

export const metadata: Metadata = {
  title: {
    default: "Culturando",
    template: "%s | Culturando",
  },
  description:
    "Culturando è una piattaforma web geolocalizzata per la valorizzazione e condivisione del patrimonio librario privato.",
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
