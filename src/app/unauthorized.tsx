"use client";

import React from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Home, LogIn, Lock, ShieldQuestion } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function Unauthorized() {
  return (
    <section className="relative min-h-screen pt-8 pb-20 overflow-hidden bg-black flex flex-col items-center justify-center">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-250 h-150 bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 text-center relative z-10 w-full flex flex-col items-center">
        <div className="mb-8 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/5 text-amber-400 text-xs font-semibold uppercase tracking-wider animate-in fade-in slide-in-from-bottom-3 duration-700">
          <ShieldQuestion size={14} />
          Status 401: Authentication Required
        </div>

        <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-8 leading-[1.1] animate-in fade-in slide-in-from-bottom-4 duration-1000">
          Identity check <br />
          <span className="bg-linear-to-b from-white to-amber-500/70 bg-clip-text text-transparent">
            failed.
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-gray-400 text-lg md:text-xl mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-5 duration-1000">
          You need to sign in before accessing this area. Authenticate with
          GitHub to securely continue where you left off.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20 animate-in fade-in slide-in-from-bottom-6 duration-1000">
          <Button
            variant="primary"
            onClick={() => signIn("github")}
            className="w-full sm:w-auto px-10 py-4 text-lg shadow-xl shadow-amber-500/10"
          >
            <LogIn size={20} />
            Sign in with GitHub
          </Button>

          <Link href="/">
            <Button
              variant="outline"
              className="w-full sm:w-auto px-10 py-4 text-lg"
            >
              <Home size={20} />
              Return Home
            </Button>
          </Link>
        </div>

        <div className="w-full max-w-3xl bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-1000">
          <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/5 text-[10px] font-mono text-gray-500 tracking-widest uppercase">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56]/50 shadow-inner"></div>
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]/50 shadow-inner"></div>
              <div className="w-3 h-3 rounded-full bg-[#27c93f]/50 shadow-inner"></div>
            </div>
            <span>BASH — AUTH_LOG</span>
          </div>

          <div className="p-6 md:p-8 font-mono text-sm md:text-base text-left space-y-2 leading-relaxed">
            <p className="flex items-center gap-2">
              <span className="text-amber-400 font-bold">➜</span>
              <span>
                readmegenai verify-session{" "}
                <span className="text-gray-600">--required</span>
              </span>
            </p>
            <p className="text-gray-400">● Checking for active session...</p>
            <p className="text-red-400/90 bg-red-400/5 px-2 py-0.5 rounded inline-block">
              ✗ Error: No authenticated session found
            </p>
            <p className="flex items-center gap-2 text-emerald-500/80">
              ✓ Suggested action: Authenticate with GitHub
            </p>
            <p className="flex items-center gap-2 text-gray-500">
              <Lock size={14} />
              <span>
                Protected resources stay encrypted until identity is verified.
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
