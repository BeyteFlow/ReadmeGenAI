"use client";
import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Hero } from '@/components/sections/Hero';
import { Features } from '@/components/sections/Features';
import { Footer } from '@/components/layout/Footer';
import { Code, Layout, FileText } from 'lucide-react';
import { navLinks } from '@/constants/navLinks';

export default function Home() {
  const featureList = [
    { 
      icon: <Code size={24} />, 
      title: "Context Awareness", 
      desc: "Detects frameworks and dependencies automatically using advanced AST parsing." 
    },
    { 
      icon: <Layout size={24} />, 
      title: "Clean Templates", 
      desc: "Formatted Markdown following GitHub best practices for maximum readability." 
    },
    { 
      icon: <FileText size={24} />, 
      title: "AI Optimization", 
      desc: "Leverages Gemini 3 Flash to ensure project clarity and SEO-friendly documentation." 
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500/30">
      <Navbar links={navLinks} />
      
      <main>
        <Hero />
        
        <div id="features">
          <Features items={featureList} />
        </div>
      </main>

      <Footer />
    </div>
  );
}