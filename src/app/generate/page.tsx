"use client";
import React, { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { SearchInput } from '@/components/Generator/SearchInput';
import { MarkdownPreview } from '@/components/Generator/MarkdownPreview';

export default function GeneratePage() {
  const [markdown, setMarkdown] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async (githubUrl: string) => {
    setIsLoading(true);
    setMarkdown(''); // Clear previous results
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: githubUrl }),
      });

      const data = await response.json();
      if (data.markdown) {
        setMarkdown(data.markdown);
      } else {
        alert(data.error || "Something went wrong");
      }
    } catch (error) {
      console.error("Generation failed:", error);
      alert("Failed to connect to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Features', href: '/features' },
    { name: 'Examples', href: '/examples' },
    { name: 'Docs', href: '/docs' },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar links={navLinks} />
      
      <main className="pt-40 pb-20 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Generate Documentation</h1>
          <p className="text-gray-400">Enter your repository URL and let the AI do the heavy lifting.</p>
        </div>

        <SearchInput onGenerate={handleGenerate} isLoading={isLoading} />
        
        {/* Results will appear here once generated */}
        <MarkdownPreview content={markdown} />

        {/* Empty state helper */}
        {!markdown && !isLoading && (
          <div className="mt-20 text-center border border-dashed border-white/5 rounded-3xl py-20 bg-zinc-950/30">
            <p className="text-gray-600 font-mono text-sm">Waiting for repository URL...</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}