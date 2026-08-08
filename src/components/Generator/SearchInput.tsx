"use client";
import React, { useState } from "react";
import { Loader2, Github, AlertCircle, ShieldAlert } from "lucide-react";
import { Button } from "../ui/Button";
import GitHubLoginButton from "../GitHubLoginButton";

interface SearchInputProps {
  onGenerate: (url: string, language: string, ackPrivateRepo: boolean) => void;
  onClearPrivateRepoConsent: () => void;
  isLoading: boolean;
  initialValue?: string; // optional initial value
  ariaLabel?: string; // optional aria-label for accessibility
  serverError?: string | null;
  authRequired?: boolean;
  serverErrorCode?: string | null;
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
  onClearPrivateRepoConsent,
  isLoading,
  initialValue,
  ariaLabel,
  serverError,
  authRequired = false,
  serverErrorCode = null,
  privateRepoConsentRequired = false,
}: SearchInputProps) => {
  // Initialize state directly from initialValue once
  const [url, setUrl] = useState(initialValue || "");
  const [language, setLanguage] = useState("English");
  const [error, setError] = useState<string | null>(null);
  const [ackPrivateRepo, setAckPrivateRepo] = useState(false);

  const languages = [
    "English",
    "Spanish",
    "French",
    "German",
    "Chinese",
    "Japanese",
    "Korean",
    "Portuguese",
    "Russian",
    "Arabic",
    "Turkish",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const githubUrlPattern =
      /^https?:\/\/(www\.)?github\.com\/[\w.-]+\/[\w.-]+\/?$/;

    if (githubUrlPattern.test(url.trim())) {
      if (privateRepoConsentRequired && !ackPrivateRepo) {
        setError(
          "Please confirm the private repository consent checkbox, then click Generate again.",
        );
        return;
      }

      if (privateRepoConsentRequired && ackPrivateRepo) {
        onClearPrivateRepoConsent();
      }

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
              if (
                privateRepoConsentRequired ||
                authRequired ||
                Boolean(serverError)
              ) {
                onClearPrivateRepoConsent();
              }
              if (ackPrivateRepo) {
                setAckPrivateRepo(false);
              }
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
            {languages.map((lang) => (
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
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-4 text-sm text-amber-100">
          <div className="flex items-start gap-3">
            <ShieldAlert size={18} className="mt-0.5 shrink-0 text-amber-300" />
            <div className="space-y-3">
              <div>
                <p className="font-semibold text-amber-50">
                  Private repository confirmation required
                </p>
                <p className="mt-1 leading-relaxed text-amber-100/90">
                  To generate a README, we need to send this private
                  repository&apos;s metadata and top-level file list to the AI
                  model. Confirm below, then click Generate again.
                </p>
              </div>
              <label
                htmlFor="private-repo-consent"
                className="flex items-start gap-3 leading-relaxed"
              >
                <input
                  id="private-repo-consent"
                  type="checkbox"
                  checked={ackPrivateRepo}
                  onChange={(e) => {
                    setAckPrivateRepo(e.target.checked);
                    if (error) setError(null);
                  }}
                  className="mt-1 h-4 w-4 accent-amber-400"
                />
                <span>
                  I understand and consent to sending private repository
                  metadata and file names for README generation.
                </span>
              </label>
            </div>
          </div>
        </div>
      )}
      {(error || (serverError && !privateRepoConsentRequired)) && (
        <div
          className={`mt-4 rounded-2xl border px-4 py-3 text-sm animate-in fade-in slide-in-from-top-1 ${
            serverErrorCode === "rate_limited" || serverErrorCode === "timeout"
              ? "border-amber-500/30 bg-amber-500/10"
              : "border-red-500/20 bg-red-500/10"
          }`}
        >
          {serverError ? (
            <>
              <div
                className={`flex items-center gap-2 ${
                  serverErrorCode === "rate_limited" ||
                  serverErrorCode === "timeout"
                    ? "text-amber-300"
                    : "text-red-300"
                }`}
              >
                <AlertCircle size={14} />
                <span className="font-semibold">
                  {serverErrorCode === "timeout"
                    ? "Request timed out"
                    : serverErrorCode === "rate_limited"
                      ? "Rate limit reached"
                      : serverErrorCode === "model_error"
                        ? "AI model unavailable"
                        : authRequired
                          ? "GitHub authentication required"
                          : "Generation failed"}
                </span>
              </div>
              <p
                className={`mt-1 leading-relaxed ${
                  serverErrorCode === "rate_limited" ||
                  serverErrorCode === "timeout"
                    ? "text-amber-100/90"
                    : "text-red-100/80"
                }`}
              >
                {serverError}
              </p>
            </>
          ) : (
            <div className="flex items-center gap-2 text-red-300">
              <AlertCircle size={14} />
              {error}
            </div>
          )}
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
