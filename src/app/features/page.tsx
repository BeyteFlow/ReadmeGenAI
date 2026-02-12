"use client";
import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Cpu, Globe, ShieldCheck, Sparkles, Zap, Code2 } from "lucide-react";

const features = [
  {
    icon: <Sparkles className="text-blue-400" />,
    title: "Gemini 2.5 Intelligence",
    desc: "Leverages the latest LLM to understand not just your files, but the intent behind your code.",
  },
  {
    icon: <Globe className="text-emerald-400" />,
    title: "Octokit Integration",
    desc: "Seamlessly pulls repository metadata, stars, and real-time structure directly from GitHub.",
  },
  {
    icon: <ShieldCheck className="text-purple-400" />,
    title: "Security First",
    desc: "We never store your code. We only analyze structure and public metadata to ensure your IP stays yours.",
  },
  {
    icon: <Zap className="text-amber-400" />,
    title: "Instant Generation",
    desc: "Generate a complete, production-ready README in under 5 seconds—saving hours of manual writing.",
  },
  {
    icon: <Code2 className="text-pink-400" />,
    title: "Framework Aware",
    desc: "Automatically detects Next.js, Go, Python, and more to provide relevant setup instructions.",
  },
  {
    icon: <Cpu className="text-indigo-400" />,
    title: "Custom Logic",
    desc: "Uses custom-tuned prompts to ensure your documentation sounds human, professional, and clear.",
  },
];

export default function FeaturesPage() {
  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Features", href: "/features" },
    { name: "Examples", href: "/examples" },
    { name: "Docs", href: "/docs" },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar links={navLinks} />
      <main className="pt-32 pb-20 px-4">
        <div className="max-w-5xl mx-auto text-center mb-20">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-6">
            Documentation <br />
            <span className="bg-clip-text text-transparent bg-linear-to-b from-white to-white/40">
              reimagined.
            </span>
          </h1>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="p-8 rounded-3xl bg-zinc-950 border border-white/5 hover:border-blue-500/30 transition-all group"
            >
              <div className="mb-6 p-3 rounded-xl bg-white/5 w-fit group-hover:scale-110 transition-transform">
                {f.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
