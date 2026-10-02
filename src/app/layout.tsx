import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IMDb Ratings | Statistics & Probability Project",
  description:
    "A statistical analysis and machine-learning prediction of IMDb movie ratings using 1,000 top-rated films. B.Tech Statistics & Probability project.",
  keywords: [
    "IMDb",
    "statistics",
    "probability",
    "machine learning",
    "data science",
    "regression",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="relative min-h-full flex flex-col overflow-x-hidden">
        <div className="pointer-events-none fixed inset-0 -z-10">
          <div className="absolute inset-0 grid-bg opacity-40" />
          <div className="absolute -top-40 -left-32 h-[36rem] w-[36rem] rounded-full bg-imdb/10 blur-[130px] animate-pulse-glow" />
          <div className="absolute top-1/3 -right-40 h-[32rem] w-[32rem] rounded-full bg-imdb-deep/10 blur-[130px] animate-pulse-glow" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-imdb/60 to-transparent" />
        </div>
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
