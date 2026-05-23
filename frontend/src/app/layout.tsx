import type { Metadata } from "next";
import { Inter, Courier_Prime, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AmbientBackground from "@/components/effects/AmbientBackground";
import PageTransition from "@/components/layout/PageTransition";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const courierPrime = Courier_Prime({
  variable: "--font-typewriter",
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "retrowave — Turn memories into mixtapes",
  description:
    "A social music platform inspired by late-night radio and cassette culture. Create, share, and discover mixtapes that capture moments.",
  openGraph: {
    title: "retrowave",
    description: "Turn memories into mixtapes.",
    siteName: "retrowave",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "retrowave",
    description: "Turn memories into mixtapes.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${courierPrime.variable} ${jetbrainsMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased">
        <AmbientBackground />
        <Navbar />
        <main className="flex-1 relative z-10">
          <PageTransition>{children}</PageTransition>
        </main>
        <Footer />
      </body>
    </html>
  );
}
