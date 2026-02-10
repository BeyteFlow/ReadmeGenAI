"use client";
import React, { useState } from 'react';
import { Loader2, Github, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';

interface SearchInputProps {
  onGenerate: (url: string) => void;
  isLoading: boolean;
}

export const SearchInput = ({ onGenerate, isLoading }: SearchInputProps) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Stricter Regex: Matches https://github.com/user/repo
    const githubUrlPattern = /^https?:\/\/(www\.)?github\.com\/[\w.-]+\/[\w.-]+\/?$/;
    
    if (githubUrlPattern.test(url.trim())) {
      onGenerate(url.trim());
    } else {
      setError("Please enter a valid GitHub repository URL.");
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
          onChange={(e) => {
            setUrl(e.target.value);
            if (error) setError(null);
          }}
          placeholder="https://github.com/username/repo"
          className={`w-full bg-zinc-900/50 border ${error ? 'border-red-500/50' : 'border-white/10'} rounded-2xl py-6 pl-14 pr-40 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all backdrop-blur-xl`}
        />
        <div className="absolute inset-y-2 right-2 flex items-center">
          <Button type="submit" disabled={isLoading || !url} className="h-full px-8 shadow-lg shadow-blue-500/20">
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : 'Generate'}
          </Button>
        </div>
      </form>
      {error && (
        <div className="mt-4 flex items-center gap-2 text-red-400 text-sm animate-in fade-in slide-in-from-top-1">
          <AlertCircle size={14} />
          {error}
        </div>
      )}
    </div>
  );
};