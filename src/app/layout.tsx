import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
    default: "ReadmeGenAI – AI GitHub README Generator",
    template: "%s | ReadmeGenAI",
  },
  description:
    "ReadmeGenAI is an AI-powered tool that automatically generates professional README files for your GitHub projects. Paste your repo URL and get a polished readme.md instantly.",
  icons: {
    icon: "/ReadmeGenAI.png",
    shortcut: "/ReadmeGenAI.png",
    apple: "/ReadmeGenAI.png",
  },
  openGraph: {
    title: "ReadmeGenAI – AI GitHub README Generator",
    description:
      "Automatically generate professional README files from your GitHub repositories using AI.",
    url: "/",
    siteName: "ReadmeGenAI",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ReadmeGenAI - AI README Generator",
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
    images: ["/og-image.png"],
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

  return (
    <html lang="en">
      <head>
        {/* JSON-LD structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "ReadmeGenAI",
              applicationCategory: "DeveloperTool",
              operatingSystem: "Web",
              description:
                "AI-powered GitHub README generator that creates markdown documentation automatically.",
              url: siteUrl,
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
