"use client";
import React, { useState, useRef, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import {
  ExternalLink,
  Box,
  Cpu,
  Globe,
  Eye,
  X,
  Copy,
  Check,
} from "lucide-react";
import Link from "next/link";
import { navLinks } from "@/constants/navLinks";

const examples = [
  {
    title: "Modern Web App",
    repo: "nextjs-saas-template",
    icon: <Globe className="text-blue-400" />,
    tags: ["Next.js 16", "Tailwind", "Prisma"],
    stars: "1.2k",
    description:
      "A comprehensive README featuring deployment guides, environment variable tables, and architecture diagrams.",
    markdown: `# 🚀 Next.js SaaS Foundation\n\nA professional starter kit for high-performance web applications.\n\n## 🛠 Features\n- **Authentication:** NextAuth.js with multi-provider support.\n- **Database:** Prisma ORM with automated migrations.\n- **UI:** Server-side rendered components via Radix UI.\n\n## 📦 Getting Started\n1. Clone the repo\n2. Run \`npm install\`\n3. Setup \`.env\` file\n4. \`npm run dev\``,
  },
  {
    title: "Utility Library",
    repo: "ts-utils-core",
    icon: <Box className="text-emerald-400" />,
    tags: ["TypeScript", "Rollup", "Vitest"],
    stars: "850",
    description:
      "Technical documentation with API references, installation via multiple package managers, and usage snippets.",
    markdown: `# 📦 TS-Utils Core\n\nHigh-performance TypeScript utilities for modern engines.\n\n## 📥 Installation\n\`\`\`bash\nnpm install ts-utils-core\n\`\`\`\n\n## 📖 Quick Usage\n\`\`\`typescript\nimport { formatDate } from 'ts-utils-core';\n\nconst date = formatDate(new Date());\n\`\`\``,
  },
  {
    title: "Backend Engine",
    repo: "go-stream-processor",
    icon: <Cpu className="text-purple-400" />,
    tags: ["Go", "Docker", "Redis"],
    stars: "2.4k",
    description:
      "Performance oriented README focusing on benchmark results, configuration flags, and scaling.",
    markdown: `# ⚡ Go Stream Processor\n\nUltra-low latency data streaming engine.\n\n## 📊 Performance Benchmarks\n| Case | Latency | Throughput |\n|------|---------|------------|\n| Sync | 1.2ms   | 50k ops/s  |\n| Async| 0.4ms   | 250k ops/s |\n\n## 🐳 Deployment\n\`\`\`bash\ndocker-compose up -d\n\`\`\``,
  },
];

export default function ExamplesPage() {
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  // Refs for timeout and accessibility management
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Handle Modal Side Effects: Body Scroll, Escape Key, and Initial Focus
  useEffect(() => {
    if (previewContent) {
      // 1. Lock body scroll
      document.body.style.overflow = "hidden";

      // 2. Focus the close button for keyboard accessibility
      closeButtonRef.current?.focus();

      // 3. Close on Escape key press
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") setPreviewContent(null);
      };

      window.addEventListener("keydown", handleKeyDown);
      
      return () => {
        document.body.style.overflow = "unset";
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [previewContent]);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      
      // Clear previous timeout if user clicks rapidly
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      setCopied(true);
      
      // Success path: reset icon after 2 seconds
      timeoutRef.current = setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      // Error path: log rejection and prevent UI from showing "Checked"
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500/30">
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
            Explore how ReadmeGenAI adapts to different tech stacks and project
            scales.
          </p>
        </div>

        {/* Examples Grid */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {examples.map((example, idx) => (
            <div
              key={idx}
              className="group relative p-8 rounded-3xl bg-zinc-950 border border-white/5 hover:border-white/20 transition-all"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 rounded-2xl bg-white/5 group-hover:bg-white/10 transition-colors">
                  {example.icon}
                </div>
                <button
                  onClick={() => setPreviewContent(example.markdown)}
                  className="flex items-center gap-1.5 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <Eye size={14} /> View Sample
                </button>
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
                {example.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 rounded-md bg-white/5 text-[10px] font-semibold tracking-wider uppercase text-gray-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <Button variant="outline" className="w-full text-sm py-2" asChild>
                <Link href="/generate">
                  Try this style
                  <ExternalLink size={14} />
                </Link>
              </Button>
            </div>
          ))}
        </div>

        {/* --- README PREVIEW MODAL --- */}
        {previewContent && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => setPreviewContent(null)} // Close on backdrop click
          >
            <div 
              className="bg-zinc-900 border border-white/10 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
              role="dialog"
              aria-modal="true"
            >
              <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/5">
                <span className="text-xs font-mono text-gray-400">
                  README_PREVIEW.md
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(previewContent)}
                    title="Copy to clipboard"
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                  >
                    {copied ? (
                      <Check size={16} className="text-emerald-400" />
                    ) : (
                      <Copy size={16} />
                    )}
                  </button>
                  <button
                    ref={closeButtonRef}
                    aria-label="Close preview"
                    onClick={() => {
                      setPreviewContent(null);
                      setCopied(false);
                    }}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
              <div className="p-8 max-h-[60vh] overflow-y-auto">
                <pre className="text-sm text-zinc-300 font-mono whitespace-pre-wrap leading-relaxed">
                  {previewContent}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-32 max-w-4xl mx-auto p-12 rounded-[3rem] bg-linear-to-b from-zinc-900 to-black border border-white/5 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to document your project?
          </h2>
          <Button className="px-12 py-6 text-lg" asChild>
            <Link href="/generate">Start Generating for Free</Link>
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
