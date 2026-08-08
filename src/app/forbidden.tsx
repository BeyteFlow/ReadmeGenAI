"use client";

import React from "react";
import Link from "next/link";
import { Home, MoveLeft, ShieldAlert, Ban } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function Forbidden() {
  return (
    <section className="relative min-h-screen pt-8 pb-20 overflow-hidden bg-black flex flex-col items-center justify-center">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-250 h-150 bg-red-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 text-center relative z-10 w-full flex flex-col items-center">
        <div className="mb-8 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/20 bg-red-500/5 text-red-400 text-xs font-semibold uppercase tracking-wider animate-in fade-in slide-in-from-bottom-3 duration-700">
          <ShieldAlert size={14} />
          Status 403: Access Forbidden
        </div>

        <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-8 leading-[1.1] animate-in fade-in slide-in-from-bottom-4 duration-1000">
          Permissions <br />
          <span className="bg-linear-to-b from-white to-red-600 bg-clip-text text-transparent">
            denied.
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-gray-400 text-lg md:text-xl mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-5 duration-1000">
          You don&apos;t have permission to access this resource. This area is
          restricted to authorized users only.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20 animate-in fade-in slide-in-from-bottom-6 duration-1000">
          <Link href="/">
            <Button
              variant="primary"
              className="w-full sm:w-auto px-10 py-4 text-lg shadow-xl shadow-red-500/10"
            >
              <Home size={20} />
              Back to Safety
            </Button>
          </Link>

          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="w-full sm:w-auto px-10 py-4 text-lg"
          >
            <MoveLeft size={20} />
            Go Back
          </Button>
        </div>

        <div className="w-full max-w-3xl bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-1000">
          <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/5 text-[10px] font-mono text-gray-500 tracking-widest uppercase">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56]/50 shadow-inner"></div>
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]/50 shadow-inner"></div>
              <div className="w-3 h-3 rounded-full bg-[#27c93f]/50 shadow-inner"></div>
            </div>
            <span>BASH — ACL_LOG</span>
          </div>

          <div className="p-6 md:p-8 font-mono text-sm md:text-base text-left space-y-2 leading-relaxed">
            <p className="flex items-center gap-2">
              <span className="text-red-400 font-bold">➜</span>
              <span>
                readmegenai check-access{" "}
                <span className="text-gray-600">--resource</span>
              </span>
            </p>
            <p className="text-gray-400">● Evaluating access control list...</p>
            <p className="text-red-400/90 bg-red-400/5 px-2 py-0.5 rounded inline-block">
              ✗ Error: Permission denied for this request
            </p>
            <p className="flex items-center gap-2 text-emerald-500/80">
              ✓ Suggested action: Verify your github scope
            </p>
            <p className="flex items-center gap-2 text-gray-500">
              <Ban size={14} />
              <span>
                This resource is restricted and access cannot be granted.
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
