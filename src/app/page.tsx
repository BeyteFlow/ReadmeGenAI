import { Navbar } from '@/components/layout/Navbar';
import { Hero } from '@/components/sections/Hero';
import { Features } from '@/components/sections/Features';
import { Footer } from '@/components/layout/Footer';
import { Code, Layout, FileText } from 'lucide-react';

export default function Home() {
  const navLinks = [
    { name: 'Home', href: '#' },
    { name: 'Features', href: '#features' },
    { name: 'Examples', href: '#examples' },
    { name: 'Docs', href: '#docs' },
  ];

  const featureList = [
    { icon: <Code size={24} />, title: "Context Awareness", desc: "Detects frameworks and dependencies automatically." },
    { icon: <Layout size={24} />, title: "Clean Templates", desc: "Formatted Markdown following GitHub best practices." },
    { icon: <FileText size={24} />, title: "AI Optimization", desc: "Optimized for project clarity and searchability." },
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white/30">
      <Navbar links={navLinks} />
      <main>
        <Hero />
        <Features items={featureList} />
      </main>
      <Footer />
    </div>
  );
}