import React from "react";
import Link from "next/link";
import { Zap, ArrowRight } from "lucide-react";
import { Button } from "../ui/Button";
import { TerminalMockup } from "./TerminalMockup";

export const Hero = () => {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden bg-black">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-250 h-150 bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-blue-400 mb-8 animate-in fade-in slide-in-from-bottom-3 duration-700">
          <Zap size={12} fill="currentColor" />
          <span>v1.0: Now with real-time codebase context</span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-8xl font-extrabold tracking-tighter mb-8 leading-[1.1] animate-in fade-in slide-in-from-bottom-4 duration-1000">
          Ship documentation <br />
          <span className="bg-clip-text text-transparent bg-linear-to-b from-white to-white/40">
            as fast as your code.
          </span>
        </h1>

        {/* Sub-headline */}
        <p className="max-w-2xl mx-auto text-gray-400 text-lg md:text-xl mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-5 duration-1000">
          ReadmeGenAI scans your repository and crafts professional, engaging
          README files automatically. The perfect intro for your next big
          project.
        </p>

        {/* CTA Buttons - Now Functional */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-20 animate-in fade-in slide-in-from-bottom-6 duration-1000">
          <Link href="generate" className="w-full sm:w-auto">
            <Button className="w-full px-10 py-4 text-base shadow-xl shadow-white/5">
              Get Started
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Button>
          </Link>

          <Link href="/examples" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full px-10 py-4 text-base">
              View Examples
            </Button>
          </Link>
        </div>

        <TerminalMockup />
      </div>
    </section>
  );
};
