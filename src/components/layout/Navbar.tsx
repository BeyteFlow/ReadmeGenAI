"use client";
import React, { useState, useEffect } from 'react';
import { Menu, X, Github } from 'lucide-react';
import { Button } from '../ui/Button';

export const Navbar = ({ links }: { links: { name: string; href: string }[] }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      scrolled ? 'bg-black/80 backdrop-blur-md border-b border-white/10 py-3' : 'bg-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative w-9 h-9 bg-white rounded-lg flex items-center justify-center overflow-hidden transition-transform group-hover:rotate-3">
              <span className="text-black font-black text-xl">R</span>
            </div>
            <span className="font-bold text-xl tracking-tighter">ReadmeGenAI</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            {links.map((link) => (
              <a 
                key={link.name} 
                href={link.href} 
                className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Using an anchor tag with button styling for the GitHub Link */}
            <a
              href="https://github.com/your-username/ReadmeGenAI"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-white/30 hover:bg-white/10 transition-all text-xs font-medium"
            >
              <Github size={14} />
              <span>Star on GitHub</span>
            </a>

            {/* Mobile Menu Toggle using your custom Button component (Ghost variant) */}
            <Button 
              variant="ghost" 
              className="md:hidden p-2 px-2" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle Menu"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMenuOpen && (
        <div className="md:hidden bg-black border-b border-white/10 px-4 py-6 space-y-4 animate-in slide-in-from-top duration-300">
          {links.map((link) => (
            <a 
              key={link.name} 
              href={link.href} 
              className="block text-lg font-medium text-gray-400 hover:text-white"
              onClick={() => setIsMenuOpen(false)}
            >
              {link.name}
            </a>
          ))}
          <Button variant="primary" className="w-full justify-center mt-4">
            <Github size={18} /> Star our Repo
          </Button>
        </div>
      )}
    </nav>
  );
};