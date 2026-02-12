"use client";
import React, { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SearchInput } from "@/components/Generator/SearchInput";
import { MarkdownPreview } from "@/components/Generator/MarkdownPreview";
import { navLinks } from "@/constants/navLinks";

export default function GeneratePage() {
  const [markdown, setMarkdown] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async (githubUrl: string) => {
    setIsLoading(true);
    setMarkdown("");
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: githubUrl }),
      });

      // Updated Error Handling logic
      if (!response.ok) {
        // First, get the raw text to avoid JSON parsing errors on HTML responses
        const errorText = await response.text();
        let errorMessage: string;

        try {
          // Attempt to parse the text as JSON
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.message || errorText;
        } catch {
          // Fallback to raw text if JSON.parse fails (e.g., 502 Bad Gateway HTML)
          errorMessage = errorText || response.statusText;
        }

        // Throw an error that includes the HTTP status for better debugging
        throw new Error(
          `[${response.status} ${response.statusText}]: ${errorMessage}`,
        );
      }

      const data = await response.json();
      setMarkdown(data.markdown);
    } catch (error: unknown) {
      console.error("Generation Error:", error);
      alert(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar links={navLinks} />
      <main className="pt-40 pb-20 px-4 max-w-6xl mx-auto">
        <SearchInput onGenerate={handleGenerate} isLoading={isLoading} />
        <MarkdownPreview content={markdown} />
      </main>
      <Footer />
    </div>
  );
}
