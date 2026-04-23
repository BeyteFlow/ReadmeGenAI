"use client";
import React, { useState } from "react";
import { Loader2, Github, AlertCircle } from "lucide-react";
import { Button } from "../ui/Button";
import GitHubLoginButton from "../GitHubLoginButton";

interface SearchInputProps {
  onGenerate: (url: string, language: string, ackPrivateRepo: boolean) => void;
  isLoading: boolean;
  initialValue?: string; // optional initial value
  ariaLabel?: string; // optional aria-label for accessibility
  serverError?: string | null;
  authRequired?: boolean;
  privateRepoConsentRequired?: boolean;
}

/**
 * SearchInput Component
 * Renders a responsive form for GitHub URL input and language selection.
 *
 * @param {SearchInputProps} props - The component props.
 * @returns {JSX.Element} The rendered search input form.
 */
export const SearchInput = ({
  onGenerate,
  isLoading,
  initialValue,
  ariaLabel,
  serverError,
  authRequired = false,
  privateRepoConsentRequired = false,
}: SearchInputProps) => {
  // Initialize state directly from initialValue once
  const [url, setUrl] = useState(initialValue || "");
  const [language, setLanguage] = useState("English");
  const [error, setError] = useState<string | null>(null);
  const [ackPrivateRepo, setAckPrivateRepo] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const githubUrlPattern =
      /^https?:\/\/(www\.)?github\.com\/[\w.-]+\/[\w.-]+\/?$/;

    if (githubUrlPattern.test(url.trim())) {
      onGenerate(url.trim(), language, ackPrivateRepo);
    } else {
      setError("Please enter a valid GitHub repository URL.");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      <form
        onSubmit={handleSubmit}
        className="relative group flex flex-col md:flex-row gap-4"
      >
        <div className="relative flex-grow">
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
            aria-label={ariaLabel}
            className={`w-full bg-zinc-900/50 border ${
              error ? "border-red-500/50" : "border-white/10"
            } rounded-2xl py-6 pl-14 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all backdrop-blur-xl`}
          />
        </div>

        <div className="flex gap-4">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-zinc-900/50 border border-white/10 rounded-2xl px-6 py-6 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all backdrop-blur-xl appearance-none cursor-pointer min-w-[140px]"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option
                key={lang}
                value={lang}
                className="bg-zinc-900 text-white"
              >
                {lang}
              </option>
            ))}
          </select>

          <Button
            type="submit"
            disabled={isLoading || !url}
            className="h-full px-8 shadow-lg shadow-blue-500/20 whitespace-nowrap"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              "Generate"
            )}
          </Button>
        </div>
      </form>
      {privateRepoConsentRequired && (
        <div className="flex items-start gap-3 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-200">
          <input
            id="private-repo-consent"
            type="checkbox"
            checked={ackPrivateRepo}
            onChange={(e) => setAckPrivateRepo(e.target.checked)}
            className="mt-1 h-4 w-4 accent-yellow-400"
          />
          <label htmlFor="private-repo-consent" className="leading-relaxed">
            I understand this repository is private and consent to send its
            metadata and file list to the AI model for README generation.
          </label>
        </div>
      )}
      {(error || serverError) && (
        <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-2 text-red-300">
            <AlertCircle size={14} />
            {error || serverError}
          </div>
          {authRequired && Boolean(serverError) && !error && (
            <div className="mt-3">
              <GitHubLoginButton />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
