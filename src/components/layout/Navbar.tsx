"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Github } from "lucide-react";
import { Button } from "../ui/Button";
import GitHubLoginButton from "../GitHubLoginButton";

export const Navbar = ({
  links,
}: {
  links: { name: string; href: string }[];
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "border-b border-white/10 bg-black/80 py-3 backdrop-blur-md"
          : "bg-transparent py-5"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center">
          <div className="flex min-w-0 flex-1 items-center">
            {/* Brand Logo */}
            <Link
              href="/"
              className="group flex min-w-0 cursor-pointer items-center gap-3"
              aria-label="ReadmeGenAI Home"
            >
              <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white transition-transform group-hover:rotate-3">
                <span className="text-xl font-black text-black">R</span>
              </div>
              <span className="truncate text-lg font-bold tracking-tighter sm:text-xl">
                ReadmeGenAI
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden items-center justify-center space-x-1 md:flex">
            {links.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-gray-400 transition-colors hover:text-white"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:gap-3">
            <GitHubLoginButton compact />

            {/* Using an anchor tag with button styling for the GitHub Link */}
            <a
              href="https://github.com/BeyteFlow/ReadmeGenAI"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden min-h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium transition-all hover:border-white/30 hover:bg-white/10 sm:flex"
            >
              <Github size={14} className="shrink-0" />
              <span>Star on GitHub</span>
            </a>

            {/* Mobile Menu Toggle using your custom Button component (Ghost variant) */}
            <Button
              variant="ghost"
              className="min-h-10 shrink-0 p-2 px-2 md:hidden"
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
        <div className="space-y-4 border-b border-white/10 bg-black px-4 py-6 animate-in slide-in-from-top duration-300 md:hidden">
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
          <GitHubLoginButton onBeforeSignIn={() => setIsMenuOpen(false)} />
          <a
            href="https://github.com/BeyteFlow/ReadmeGenAI"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full"
          >
            <Button variant="primary" className="mt-4 w-full justify-center">
              <Github size={18} /> Star our Repo
            </Button>
          </a>
        </div>
      )}
    </nav>
  );
};
