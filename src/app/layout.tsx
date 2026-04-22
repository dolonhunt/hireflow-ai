import type { Metadata } from "next";
import { JetBrains_Mono, Manrope, Noto_Sans_Bengali } from "next/font/google";
import { AuthProvider } from "@/components/auth-provider";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const notoBangla = Noto_Sans_Bengali({
  variable: "--font-bangla",
  subsets: ["bengali"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HireFlow AI v2",
  description: "Cloud-ready Bangladesh media recruitment workspace built for compliant sourcing and outreach.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${notoBangla.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}