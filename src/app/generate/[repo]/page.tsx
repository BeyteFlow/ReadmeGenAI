import type { Metadata } from "next";
import GeneratePageClient from "@/app/generate/GeneratePageClient";

interface PageProps {
  params: {
    repo: string; // e.g., "facebook/react"
  };
}

// Dynamic Metadata for SEO and social sharing
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const repoName = resolvedParams.repo; // full repo slug like "facebook/react"
  const repoDisplayName = repoName.split("/").pop(); // e.g., "react"

  return {
    title: `AI-Generated README for ${repoDisplayName} | ReadmeGenAI`,
    description: `Use ReadmeGenAI to automatically generate a professional README.md for the ${repoName} repository. Paste your repo URL and get documentation instantly.`,
    openGraph: {
      title: `README for ${repoDisplayName} | ReadmeGenAI`,
      description: `Generate a polished README.md for ${repoName} using ReadmeGenAI.`,
      url: `https://readmegen-ai.vercel.app/generate/${repoName}`,
      siteName: "ReadmeGenAI",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: `ReadmeGenAI - AI README Generator for ${repoDisplayName}`,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `AI-Generated README for ${repoDisplayName}`,
      description: `Generate a professional README for ${repoName} using ReadmeGenAI in seconds.`,
      images: ["/og-image.png"],
    },
  };
}

// Server-side wrapper for your client component
export default async function GeneratePageServer({ params }: PageProps) {
  // Pass the repoSlug to the client component so it can pre-fill input & update title
  const resolvedParams = await params;
  return <GeneratePageClient repoSlug={resolvedParams.repo} />;
}
