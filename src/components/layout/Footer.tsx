import { Github } from "lucide-react";

export const Footer = () => (
  <footer className="py-16 border-t border-white/5 bg-black">
    <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
          <span className="text-black font-black text-sm">R</span>
        </div>
        <span className="font-bold text-lg tracking-tighter">ReadmeGenAI</span>
      </div>

      <p className="text-zinc-500 text-sm">
        © 2026 ReadmeGenAI. Designed for the high-performance developer.
      </p>

      <div className="flex gap-6 items-center">
        <a
          href="https://github.com/BeyteFlow/ReadmeGenAI"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
          className="text-zinc-500 hover:text-white transition-colors"
        >
          <Github size={22} />
        </a>
        <a
          href="https://naheel.me"
          target="_blank"
          rel="noopener noreferrer"
          className="text-zinc-500 text-sm hover:text-white transition-colors"
        >
          Maintained by Naheel
        </a>
      </div>
    </div>
  </footer>
);
