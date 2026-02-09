"use client";
import React, { useState } from 'react';
import { Search, Loader2, Github } from 'lucide-react';
import { Button } from '../ui/Button';

interface SearchInputProps {
  onGenerate: (url: string) => void;
  isLoading: boolean;
}

export const SearchInput = ({ onGenerate, isLoading }: SearchInputProps) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.includes('github.com')) {
      onGenerate(url);
    } else {
      alert("Please enter a valid GitHub URL");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-gray-500 group-focus-within:text-blue-500 transition-colors">
          <Github size={20} />
        </div>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://github.com/username/repo"
          className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl py-6 pl-14 pr-40 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all backdrop-blur-xl"
          required
        />
        <div className="absolute inset-y-2 right-2 flex items-center">
          <Button 
            type="submit" 
            disabled={isLoading || !url}
            className="h-full px-8 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Analyzing...
              </>
            ) : (
              'Generate'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};