"use client";

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw'; // Add this
import { Copy, Check, FileCode,  } from 'lucide-react';

export const MarkdownPreview = ({ content }: { content: string }) => {
  const [view, setView] = useState<'code' | 'preview'>('preview');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!content) return null;

  return (
    <div className="mt-12 w-full max-w-4xl mx-auto border border-zinc-800 rounded-xl bg-zinc-950 overflow-hidden shadow-2xl">
      <style jsx global>{`
        /* Fix for centered HTML in Markdown */
        .preview-content [align="center"] { 
          display: block; 
          text-align: center; 
          margin: 0 auto; 
        }
        .preview-content [align="center"] img { 
          display: inline-block; 
          margin: 0 4px; 
        }
        
        /* Typography */
        .preview-content h1 { font-size: 2.25rem; font-weight: 700; margin-bottom: 1.5rem; color: white; border-bottom: 1px solid #27272a; padding-bottom: 0.5rem; }
        .preview-content h2 { font-size: 1.5rem; font-weight: 600; margin-top: 2rem; margin-bottom: 1rem; color: #e4e4e7; }
        .preview-content h3 { font-size: 1.25rem; font-weight: 500; margin-top: 1.5rem; color: #d4d4d8; }
        .preview-content p { margin-bottom: 1.25rem; color: #a1a1aa; line-height: 1.7; }
        .preview-content ul { list-style-type: disc; margin-left: 1.5rem; margin-bottom: 1.25rem; color: #a1a1aa; }
        .preview-content table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; font-size: 0.875rem; }
        .preview-content th { background: #18181b; padding: 0.75rem; text-align: left; border: 1px solid #27272a; color: white; }
        .preview-content td { padding: 0.75rem; border: 1px solid #27272a; color: #a1a1aa; }
        .preview-content code { background: #27272a; padding: 0.2rem 0.4rem; border-radius: 4px; color: #34d399; font-family: monospace; }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/50 border-b border-zinc-800">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-zinc-500 text-xs font-mono">
            <FileCode size={14} />
            <span>README.md</span>
          </div>
          <div className="flex p-1 bg-black rounded-lg border border-zinc-800">
            <button onClick={() => setView('preview')} className={`px-3 py-1 text-xs rounded-md transition ${view === 'preview' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}>Preview</button>
            <button onClick={() => setView('code')} className={`px-3 py-1 text-xs rounded-md transition ${view === 'code' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}>Code</button>
          </div>
        </div>
        <button onClick={handleCopy} className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-2">
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      {/* Content */}
      <div className="p-6 md:p-10 min-h-100">
        {view === 'code' ? (
          <pre className="text-zinc-500 font-mono text-xs whitespace-pre-wrap leading-relaxed">{content}</pre>
        ) : (
          <div className="preview-content">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]} 
              rehypePlugins={[rehypeRaw]} 
            >
              {content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};