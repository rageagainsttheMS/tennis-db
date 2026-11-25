import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

import ClientRoot from "./ClientRoot";
import Header from "@/components/ui/shared/Header";
import Footer from "@/components/ui/shared/Footer";
import { SessionProvider } from "next-auth/react";

const heading = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const body = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tennis DB",
  description: "Look up careers, results and draws from across the ATP tour.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // The font variables go on <html> because Chakra's font tokens are defined on :root.
    <html lang="en" className={`${heading.variable} ${body.variable}`} suppressHydrationWarning>
      <body>
        <SessionProvider>
          <ClientRoot>
            <Header />
            <main style={{ minHeight: "70vh" }}>{children}</main>
            <Footer />
          </ClientRoot>
        </SessionProvider>
      </body>
    </html>
  );
}
