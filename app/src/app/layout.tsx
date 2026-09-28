import type { Metadata } from "next";
import "@fontsource-variable/roboto";
import "@fontsource-variable/roboto-mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "Seguimiento BenchHub · MVP Ecopetrol",
  description: "Seguimiento del proyecto BenchHub para el MVP Ecopetrol.",
  robots: { index: false, follow: false, nocache: true },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}