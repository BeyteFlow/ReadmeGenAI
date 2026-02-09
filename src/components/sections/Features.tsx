import React from 'react';

interface FeatureItem {
  icon: React.ReactNode;
  title: string;
  desc: string;
}

export const Features = ({ items }: { items: FeatureItem[] }) => (
  <section id="features" className="py-24 border-t border-white/5 bg-black">
    <div className="max-w-7xl mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {items.map((feature, idx) => (
          <div 
            key={idx} 
            className="group p-8 rounded-3xl bg-zinc-950 border border-white/5 hover:border-blue-500/50 hover:bg-zinc-900/50 transition-all duration-300 shadow-2xl"
          >
            <div className="mb-6 p-4 rounded-2xl bg-white/5 w-fit group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 text-blue-400">
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold mb-3 text-white tracking-tight">
              {feature.title}
            </h3>
            <p className="text-gray-400 leading-relaxed text-sm">
              {feature.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);