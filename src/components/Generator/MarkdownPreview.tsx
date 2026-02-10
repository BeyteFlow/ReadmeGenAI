"use client";
import React, { useState } from 'react';
import { Copy, Check, FileCode } from 'lucide-react';

export const MarkdownPreview = ({ content }: { content: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  if (!content) return null;

  return (
    <div className="mt-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="rounded-2xl border border-white/10 bg-zinc-950 overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/5">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <FileCode size={16} />
            <span>README.md</span>
          </div>
          <button onClick={handleCopy} className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-white">
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy Markdown'}
          </button>
        </div>
        <div className="p-8 overflow-x-auto font-mono text-sm text-gray-300 whitespace-pre-wrap">
          {content}
        </div>
      </div>
    </div>
  );
};