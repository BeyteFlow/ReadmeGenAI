"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [markdown, setMarkdown] = useState("");
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    setMarkdown("");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Failed to generate");

      setMarkdown(data.markdown);
    } catch (err:  unknown) {
      if (err instanceof Error) {
    setError(err.message);
  } else {
    setError(String(err));
  }
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(markdown);
    alert("Copied to clipboard!");
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-blue-400">ReadmeGenAI</h1>
          <p className="text-slate-400">Turn any GitHub URL into a professional README in seconds.</p>
        </div>

        {/* Input Section */}
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="https://github.com/username/repo"
            className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button
            onClick={handleGenerate}
            disabled={loading || !url}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-6 py-2 rounded-lg font-medium transition-all"
          >
            {loading ? "Generating..." : "Generate"}
          </button>
        </div>

        {error && <div className="p-4 bg-red-900/20 border border-red-900 text-red-400 rounded-lg">{error}</div>}

        {/* Output Section */}
        {markdown && (
          <div className="space-y-4 animate-in fade-in duration-700">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-slate-300">Preview</h2>
              <button 
                onClick={copyToClipboard}
                className="text-sm bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded border border-slate-700"
              >
                Copy Markdown
              </button>
            </div>
            <div className="prose prose-invert max-w-none bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-xl">
              <ReactMarkdown>{markdown}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}