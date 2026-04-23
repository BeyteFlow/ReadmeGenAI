import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import pkg from "../../package.json";
import { Providers } from "./providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://readmegen-ai.vercel.app",
  ),
  title: {
    default: "AI README Generator for GitHub Projects | ReadmeGenAI",
    template: "%s | ReadmeGenAI",
  },
  description:
    "Instantly create professional GitHub README files with ReadmeGenAI. Our AI README generator analyzes your repo and produces polished markdown docs in seconds.",
  icons: {
    icon: "/ReadmeGenAI.png",
    shortcut: "/ReadmeGenAI.png",
    apple: "/ReadmeGenAI.png",
  },
  openGraph: {
    title: "AI README Generator for GitHub Projects | ReadmeGenAI",
    description:
      "Instantly create professional GitHub README files with ReadmeGenAI. Our AI README generator analyzes your repo and produces polished markdown docs in seconds.",
    url: "/",
    siteName: "ReadmeGenAI",
    images: [
      {
        url: "/ReadmeGenAI.png",
        width: 1200,
        height: 630,
        alt: "ReadmeGenAI - AI README Generator for GitHub Projects",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Generate README Files with AI",
    description:
      "Paste your GitHub repository URL and get a professional readme.md instantly.",
    images: ["/ReadmeGenAI.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://readmegen-ai.vercel.app";

  const softwareAppJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "ReadmeGenAI",
    applicationCategory: "DeveloperTool",
    applicationSubCategory: "Documentation Generator",
    operatingSystem: "Web",
    description:
      "AI-powered GitHub README generator that creates professional markdown documentation automatically from any public GitHub repository.",
    url: siteUrl,
    image: `${siteUrl}/ReadmeGenAI.png`,
    screenshot: `${siteUrl}/ReadmeGenAI.png`,
    softwareVersion: pkg.version,
    datePublished: "2024-01-01",
    inLanguage: "en",
    keywords:
      "AI README generator, GitHub documentation, markdown generator, README automation, developer tool",
    author: {
      "@type": "Organization",
      name: "BeyteFlow",
      url: "https://github.com/BeyteFlow",
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/OnlineOnly",
      url: siteUrl,
    },
    featureList: [
      "AI-generated GitHub README files",
      "Framework and dependency detection",
      "Instant markdown output",
      "GitHub Octokit integration",
      "Automated tech stack analysis",
      "Professional markdown formatting",
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      bestRating: "5",
      worstRating: "1",
      ratingCount: "27",
    },
    sameAs: ["https://github.com/BeyteFlow/ReadmeGenAI"],
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(softwareAppJsonLd),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}