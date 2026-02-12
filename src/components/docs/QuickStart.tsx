"use client";
import React from "react";
import { Github, FileText, Zap, Download } from "lucide-react";

export const QuickStart = () => {
  const steps = [
    {
      icon: <Github size={24} className="text-blue-400" />,
      title: "Connect GitHub",
      desc: "Sign in with your GitHub account to access your repositories",
      step: 1,
      accent: "text-blue-400",
    },
    {
      icon: <FileText size={24} className="text-emerald-400" />,
      title: "Select Repository",
      desc: "Choose a repository or paste a GitHub URL to analyze",
      step: 2,
      accent: "text-emerald-400",
    },
    {
      icon: <Zap size={24} className="text-amber-400" />,
      title: "Generate README",
      desc: "Let our AI analyze your project and create documentation",
      step: 3,
      accent: "text-amber-400",
    },
    {
      icon: <Download size={24} className="text-pink-400" />,
      title: "Download & Use",
      desc: "Download your README and add it to your repository",
      step: 4,
      accent: "text-pink-400",
    },
  ];

  return (
    <section className="py-24 bg-black">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-4 text-white">
            Quick Start Guide
          </h2>
          <p className="text-zinc-400 text-lg">
            Get up and running in just 4 simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <div
              key={i}
              className="relative p-8 rounded-3xl bg-zinc-950 border border-white/5
                         transition-all duration-300
                         hover:-translate-y-1
                         hover:border-white/20
                         hover:bg-zinc-900/40"
            >
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center transition-transform duration-300 hover:scale-110">
                    {s.icon}
                  </div>
                  <div
                    className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-black border border-white/10 text-[10px] font-bold ${s.accent}`}
                  >
                    STEP {s.step}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">{s.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
