"use client";
import React from "react";
import { Rocket, Settings, HelpCircle, CheckCircle2 } from "lucide-react";

export const DocSections = () => {
  const sections = [
    {
      title: "Getting Started",
      icon: <Rocket size={24} className="text-blue-400" />,
      accentColor: "text-blue-400",
      items: [
        "Sign in via GitHub OAuth",
        "Paste repository SSH or HTTPS URL",
        "Auto-detect project frameworks",
        "Initialize README metadata",
      ],
    },
    {
      title: "Configuration",
      icon: <Settings size={24} className="text-amber-400" />,
      accentColor: "text-amber-400",
      items: [
        "Custom prompt engineering",
        "Toggle badge visibility",
        "Select documentation language",
        "Choose visual layout styles",
      ],
    },
    {
      title: "Troubleshooting",
      icon: <HelpCircle size={24} className="text-purple-400" />,
      accentColor: "text-purple-400",
      items: [
        "API rate limit handling",
        "Private repo access guides",
        "Markdown rendering fixes",
        "Version control integration",
      ],
    },
  ];

  return (
    <section className="py-24 bg-black">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-4 text-white">
            Documentation Sections
          </h2>
          <p className="text-zinc-400 text-lg">
            Everything you need to master your workflow
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sections.map((section, i) => (
            <div
              key={i}
              className="p-10 rounded-3xl bg-zinc-950 border border-white/5 transition-all duration-300 group hover:border-blue-500/30"
            >
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                {section.icon}
              </div>
              <h3 className="text-2xl font-bold mb-6 text-white">
                {section.title}
              </h3>
              <ul className="space-y-4">
                {section.items.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3 text-zinc-400 text-sm leading-relaxed"
                  >
                    <CheckCircle2
                      size={18}
                      className={`${section.accentColor} shrink-0 mt-0.5`}
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
