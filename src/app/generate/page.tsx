"use client";
import React, { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { SearchInput } from '@/components/Generator/SearchInput';
import { MarkdownPreview } from '@/components/Generator/MarkdownPreview';
import { navLinks } from '@/constants/navLinks';

export default function GeneratePage() {
  const [markdown, setMarkdown] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async (githubUrl: string) => {
    setIsLoading(true);
    setMarkdown('');
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: githubUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Generation failed");
      }

      const data = await response.json();
      setMarkdown(data.markdown);
    } catch (error: unknown) {
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