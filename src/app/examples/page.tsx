"use client";
import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import {  ExternalLink, Star, Box, Cpu, Globe } from 'lucide-react';
import Link from 'next/link';

const examples = [
  {
    title: "Modern Web App",
    repo: "nextjs-saas-template",
    icon: <Globe className="text-blue-400" />,
    tags: ["Next.js 16", "Tailwind", "Prisma"],
    stars: "1.2k",
    description: "A comprehensive README featuring deployment guides, environment variable tables, and architecture diagrams."
  },
  {
    title: "Utility Library",
    repo: "ts-utils-core",
    icon: <Box className="text-emerald-400" />,
    tags: ["TypeScript", "Rollup", "Vitest"],
    stars: "850",
    description: "Technical-heavy documentation with API references, installation via multiple package managers, and usage snippets."
  },
  {
    title: "Backend Engine",
    repo: "go-stream-processor",
    icon: <Cpu className="text-purple-400" />,
    tags: ["Go", "Docker", "Redis"],
    stars: "2.4k",
    description: "High-performance oriented README focusing on benchmark results, configuration flags, and horizontal scaling."
  }
];

export default function ExamplesPage() {
  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Features', href: '/#features' },
    { name: 'Examples', href: '/examples' },
    { name: 'Docs', href: '#docs' },
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white/30">
      <Navbar links={navLinks} />

      <main className="pt-32 pb-20 px-4">
        {/* Header Section */}
        <div className="max-w-5xl mx-auto text-center mb-20">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-6">
            Trusted by developers <br />
            <span className="bg-clip-text text-transparent bg-linear-to-b from-white to-white/40">
              to tell their story.
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Explore how ReadmeGenAI adapts to different tech stacks and project scales to create documentation that converts visitors into users.
          </p>
        </div>

        {/* Examples Grid */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {examples.map((example, idx) => (
            <div 
              key={idx} 
              className="group relative p-8 rounded-3xl bg-zinc-950 border border-white/5 hover:border-white/20 transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 rounded-2xl bg-white/5 group-hover:bg-white/10 transition-colors">
                  {example.icon}
                </div>
                <div className="flex items-center gap-1 text-xs font-medium text-gray-500">
                  <Star size={12} className="fill-current text-amber-500/50" />
                  {example.stars}
                </div>
              </div>

              <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">
                {example.title}
              </h3>
              <p className="text-sm text-gray-500 font-mono mb-4">
                {example.repo}
              </p>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                {example.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-8">
                {example.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 rounded-md bg-white/5 text-[10px] font-semibold tracking-wider uppercase text-gray-400">
                    {tag}
                  </span>
                ))}
              </div>

              <Link href="/#search-input">
                <Button variant="outline" className="w-full text-sm py-2">
                  Try this style
                  <ExternalLink size={14} />
                </Button>
              </Link>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-32 max-w-4xl mx-auto p-12 rounded-[3rem] bg-linear-to-b from-zinc-900 to-black border border-white/5 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to document your project?</h2>
          <Link href="/generate">
            <Button className="px-12 py-6 text-lg">
              Start Generating for Free
            </Button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}