"use client";
import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ChevronRight, Terminal } from 'lucide-react';

export default function DocsPage() {
  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Features', href: '/features' },
    { name: 'Examples', href: '/examples' },
    { name: 'Docs', href: '/docs' },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar links={navLinks} />
      <main className="pt-32 pb-20 max-w-7xl mx-auto px-4 flex flex-col md:flex-row gap-12">
        
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 space-y-8">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-4">Introduction</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="text-white font-medium cursor-pointer">Getting Started</li>
              <li className="hover:text-white cursor-pointer">Core Concepts</li>
              <li className="hover:text-white cursor-pointer">Security</li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Configuration</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="hover:text-white cursor-pointer">Custom Prompts</li>
              <li className="hover:text-white cursor-pointer">Template Styles</li>
            </ul>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 max-w-3xl">
          <h1 className="text-4xl font-bold mb-6">Getting Started</h1>
          <p className="text-gray-400 text-lg mb-8 leading-relaxed">
            ReadmeGenAI is designed to be plug-and-play. Our goal is to remove the friction 
            of writing documentation so you can focus on writing code.
          </p>

          <div className="space-y-12">
            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                1. Provide your URL
              </h2>
              <p className="text-gray-400 mb-4">
                Enter your public GitHub repository URL into the generator. Ensure the repo 
                contains at least a main entry point (like `index.js` or `main.py`).
              </p>
            </section>

            <section className="p-6 rounded-2xl bg-zinc-900 border border-white/5">
              <div className="flex items-center gap-2 mb-4 text-blue-400 font-mono text-sm">
                <Terminal size={16} />
                <span>Quick Start Command</span>
              </div>
              <code className="text-sm bg-black p-4 rounded-lg block border border-white/10 text-zinc-300">
                npx readmegenai@latest --repo [your-url]
              </code>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">2. AI Analysis</h2>
              <p className="text-gray-400 mb-4">
                Our engine uses Octokit to build a virtual file tree. This tree is passed to 
                Gemini 2.5 Flash with a specific context window optimized for software architecture.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}