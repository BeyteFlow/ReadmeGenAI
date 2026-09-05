"use client";
import React, { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SearchInput } from "@/components/Generator/SearchInput";
import { MarkdownPreview } from "@/components/Generator/MarkdownPreview";
import { GenerationHistory } from "@/components/Generator/GenerationHistory";
import LoadingOverlay from "@/components/Generator/LoadingOverlay";
import { navLinks } from "@/constants/navLinks";
import { TerminalMockup } from "@/components/sections/TerminalMockup";
import {
  appendGeneration,
  clearHistory,
  loadHistory,
  removeHistoryEntry,
  saveHistory,
  saveHistoryWithoutEviction,
  GENERATION_HISTORY_KEY,
  type GenerationHistoryEntry,
} from "@/lib/generationHistory";

interface GeneratePageProps {
  repoSlug?: string;
}

export default function GeneratePageClient({ repoSlug }: GeneratePageProps) {
  const [markdown, setMarkdown] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [authRequired, setAuthRequired] = useState(false);
  const [privateRepoConsentRequired, setPrivateRepoConsentRequired] =
    useState(false);
  const [history, setHistory] = useState<GenerationHistoryEntry[]>([]);
  const [activeHistoryEntryId, setActiveHistoryEntryId] = useState<string>();
  const [restoredForm, setRestoredForm] = useState<{
    url: string;
    language: string;
  } | null>(null);
  const [restoreKey, setRestoreKey] = useState(0);
  const previewRef = useRef<HTMLDivElement>(null);

  // Optional: Update document title for SPA navigation
  useEffect(() => {
    if (repoSlug) {
      const repoName = repoSlug.split("/").pop();
      document.title = `Generate README for ${repoName} | ReadmeGenAI`;
    } else {
      document.title = "ReadmeGenAI – AI GitHub README Generator";
    }
  }, [repoSlug]);

  useEffect(() => {
    setHistory(loadHistory());

    const handleStorage = (event: StorageEvent) => {
      if (event.key === GENERATION_HISTORY_KEY) {
        setHistory(loadHistory());
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const handleGenerate = async (
    githubUrl: string,
    language: string = "English",
    ackPrivateRepo: boolean = false,
  ) => {
    setIsLoading(true);
    setMarkdown("");
    setErrorMessage(null);
    setErrorCode(null);
    setAuthRequired(false);
    setPrivateRepoConsentRequired(false);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: githubUrl, language, ackPrivateRepo }),
      });

      if (!response.ok) {
        let extractedMessage: string;
        let requiresAuth = false;
        let extractedErrorCode: string | null = null;
        const contentType = response.headers.get("content-type") || "";

        if (contentType.includes("application/json")) {
          const errorData = await response.json();
          extractedMessage =
            errorData.message || errorData.error || response.statusText;
          requiresAuth = Boolean(errorData.authRequired);
          extractedErrorCode =
            typeof errorData.error === "string" ? errorData.error : null;
          setPrivateRepoConsentRequired(
            errorData.error === "private_repo_consent_required",
          );
        } else {
          const errorText = await response.text();
          console.error(
            "Non-JSON error response from /api/generate:",
            errorText,
          );
          extractedMessage =
            "The server hit an unexpected error while generating the README. Please try again, and check the local server logs if it keeps happening.";
        }

        setAuthRequired(requiresAuth);
        setErrorCode(extractedErrorCode?.toLowerCase() ?? null);
        throw new Error(extractedMessage);
      }

      const data = await response.json();
      if (data && typeof data.markdown === "string") {
        setMarkdown(data.markdown);
        const nextHistory = appendGeneration(
          history,
          githubUrl,
          language,
          data.markdown,
        );
        const persisted = saveHistory(nextHistory);
        const committedHistory = persisted ?? nextHistory;
        setHistory(committedHistory);
        setActiveHistoryEntryId(committedHistory[0]?.id);
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

  const clearGenerateFormState = () => {
    setPrivateRepoConsentRequired(false);
    setErrorMessage(null);
    setErrorCode(null);
    setAuthRequired(false);
  };

  const handleRestoreGeneration = (entry: GenerationHistoryEntry) => {
    setRestoredForm({ url: entry.url, language: entry.language });
    setActiveHistoryEntryId(entry.id);
    setRestoreKey((key) => key + 1);
    setMarkdown(entry.markdown);
    setErrorMessage(null);
    setErrorCode(null);
    setAuthRequired(false);
    setPrivateRepoConsentRequired(false);
    previewRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
    clearHistory();
  };

  const handleDeleteHistoryEntry = (entryId: string) => {
    const nextHistory = removeHistoryEntry(history, entryId);
    if (!saveHistoryWithoutEviction(nextHistory)) return;

    setHistory(nextHistory);

    if (activeHistoryEntryId === entryId) {
      setActiveHistoryEntryId(undefined);
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
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-10 text-center">
          Generate Your AI-Powered README
        </h1>
        <SearchInput
          key={`${restoreKey}|${restoredForm?.url ?? ""}|${restoredForm?.language ?? ""}`}
          onGenerate={handleGenerate}
          isLoading={isLoading}
          initialValue={
            restoredForm?.url ??
            (repoSlug ? `https://github.com/${repoSlug}` : "")
          }
          initialLanguage={restoredForm?.language ?? "English"}
          ariaLabel="Enter GitHub repository URL to generate README"
          serverError={errorMessage}
          authRequired={authRequired}
          serverErrorCode={errorCode}
          privateRepoConsentRequired={privateRepoConsentRequired}
          onClearPrivateRepoConsent={clearGenerateFormState}
        />
        <div className="mt-4">
          <GenerationHistory
            entries={history}
            activeEntryId={activeHistoryEntryId}
            onRestore={handleRestoreGeneration}
            onDelete={handleDeleteHistoryEntry}
            onClearAll={handleClearHistory}
          />
        </div>
        <div ref={previewRef} className="scroll-mt-24">
          <MarkdownPreview content={markdown} />
        </div>
      </main>
      <TerminalMockup />
      <Footer />
    </div>
  );
}
