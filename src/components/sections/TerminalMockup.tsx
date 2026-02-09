import React from 'react';

export const TerminalMockup = () => (
  <div className="mt-20 relative p-px rounded-2xl bg-linear-to-b from-white/20 via-white/5 to-transparent shadow-2xl max-w-4xl mx-auto">
    <div className="rounded-2xl bg-black border border-white/5 overflow-hidden">
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-zinc-900/40 border-b border-white/5">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-[#FF5F56] opacity-80" />
          <div className="w-3 h-3 rounded-full bg-[#FFBD2E] opacity-80" />
          <div className="w-3 h-3 rounded-full bg-[#27C93F] opacity-80" />
        </div>
        <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">
          bash — readme-generator
        </div>
      </div>

      {/* Terminal Content */}
      <div className="p-8 text-left font-mono text-sm md:text-base leading-relaxed">
        <div className="flex gap-3">
          <span className="text-blue-500 font-bold">➜</span>
          <span className="text-zinc-300">npx readmegenai init</span>
        </div>
        
        <div className="mt-4 space-y-1">
          <p className="text-blue-400 flex items-center gap-2">
            <span className="animate-pulse">●</span> Analyzing codebase...
          </p>
          <p className="text-zinc-500">✓ Detected Next.js 15 & TailwindCSS</p>
          <p className="text-zinc-500">✓ Parsed 14 API endpoints</p>
          <p className="text-zinc-500">✓ Metadata successfully pulled from Octokit</p>
        </div>

        <div className="mt-6 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
          <p className="text-emerald-400 font-bold">✨ README.md generated successfully!</p>
        </div>

        <div className="mt-6 flex gap-3">
          <span className="text-blue-500 font-bold">➜</span>
          <span className="w-2 h-5 bg-white/40 animate-pulse" />
        </div>
      </div>
    </div>
  </div>
);