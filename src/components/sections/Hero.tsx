import React from 'react';
import { Zap, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { TerminalMockup } from './TerminalMockup';

export const Hero = () => (
  <section className="relative pt-40 pb-20 overflow-hidden">
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-250 h-150 bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
    <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-blue-400 mb-8">
        <Zap size={12} fill="currentColor" />
        <span>v2.0: Now with real-time codebase context</span>
      </div>
      <h1 className="text-5xl md:text-8xl font-extrabold tracking-tighter mb-8 leading-[1.1]">
        Ship documentation <br />
        <span className="bg-clip-text text-transparent bg-linear-to-b from-white to-white/40">as fast as your code.</span>
      </h1>
      <p className="max-w-2xl mx-auto text-gray-400 text-lg md:text-xl mb-10 leading-relaxed">
        ReadmeGenAI scans your repository and crafts professional README files automatically.
      </p>
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
        <Button className="w-full sm:w-auto px-10 py-4 text-base">
          Get Started <ArrowRight size={18} />
        </Button>
        <Button variant="outline" className="w-full sm:w-auto px-10 py-4 text-base">
          View Examples
        </Button>
      </div>
      <TerminalMockup />
    </div>
  </section>
);