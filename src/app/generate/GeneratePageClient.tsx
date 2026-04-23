"use client";
import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SearchInput } from "@/components/Generator/SearchInput";
import { MarkdownPreview } from "@/components/Generator/MarkdownPreview";
import LoadingOverlay from "@/components/Generator/LoadingOverlay";
import { navLinks } from "@/constants/navLinks";
import { TerminalMockup } from "@/components/sections/TerminalMockup";

interface GeneratePageProps {
  repoSlug?: string;
}

export default function GeneratePageClient({ repoSlug }: GeneratePageProps) {
  const [markdown, setMarkdown] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [authRequired, setAuthRequired] = useState(false);
  const [privateRepoConsentRequired, setPrivateRepoConsentRequired] =
    useState(false);

  // Optional: Update document title for SPA navigation
  useEffect(() => {
    if (repoSlug) {
      const repoName = repoSlug.split("/").pop();
      document.title = `Generate README for ${repoName} | ReadmeGenAI`;
    } else {
      document.title = "ReadmeGenAI – AI GitHub README Generator";
    }
  }, [repoSlug]);

  const handleGenerate = async (
    githubUrl: string,
    language: string = "English",
    ackPrivateRepo: boolean = false,
  ) => {
    setIsLoading(true);
    setMarkdown("");
    setErrorMessage(null);
    setAuthRequired(false);
    setPrivateRepoConsentRequired(false);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: githubUrl, language, ackPrivateRepo }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage: string;
        let requiresAuth = false;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.message || errorText;
          requiresAuth = Boolean(errorData.authRequired);
          setPrivateRepoConsentRequired(
            errorData.error === "private_repo_consent_required",
          );
        } catch {
          errorMessage = errorText || response.statusText;
        }

        setAuthRequired(requiresAuth);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      if (data && typeof data.markdown === "string") {
        setMarkdown(data.markdown);
      } else {
        setMarkdown("");
        throw new Error(
          "Invalid response: markdown content is missing or invalid",
        );
      }
    } catch (error: unknown) {
      console.error("Generation Error:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-black text-white">
      {/* UI LOADING OVERLAY 
         Renders on top of everything when isLoading is true 
      */}
      {isLoading && <LoadingOverlay />}

      <Navbar links={navLinks} />

      <main className="pt-40 pb-20 px-4 max-w-6xl mx-auto">
        <SearchInput
          onGenerate={handleGenerate}
          isLoading={isLoading}
          initialValue={repoSlug ? `https://github.com/${repoSlug}` : ""}
          ariaLabel="Enter GitHub repository URL to generate README"
          serverError={errorMessage}
          authRequired={authRequired}
          privateRepoConsentRequired={privateRepoConsentRequired}
        />
        <MarkdownPreview content={markdown} />
      </main>
      <TerminalMockup />
      <Footer />
    </div>
  );
}
