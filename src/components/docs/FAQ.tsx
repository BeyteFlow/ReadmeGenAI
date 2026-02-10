"use client";
import React from 'react';
import { HelpCircle } from 'lucide-react';

export const FAQ = () => {
  const faqs = [
    { q: "How does the AI analyze my code?", a: "We use AST parsing and heuristic analysis to identify entry points and dependencies without storing your actual source code." },
    { q: "Can I use this for private repos?", a: "Yes, by connecting your GitHub account, we can securely analyze private repositories with your permission." }
  ];

  return (
    <section className="py-20 pb-32">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="p-8 rounded-4xl bg-zinc-900/30 border border-white/5 hover:border-blue-500/20 transition-all">
              <div className="flex gap-5">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                  <HelpCircle size={20} />
                </div>
                <div>
                  <h4 className="text-lg font-bold mb-2">{faq.q}</h4>
                  <p className="text-zinc-500 text-sm leading-relaxed">{faq.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};