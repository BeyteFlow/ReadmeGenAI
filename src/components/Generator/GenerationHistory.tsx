"use client";

import React, { useState } from "react";
import { ChevronDown, Clock, History, RotateCcw, Trash2 } from "lucide-react";
import type { GenerationHistoryEntry } from "@/lib/generationHistory";

interface GenerationHistoryProps {
  entries: GenerationHistoryEntry[];
  activeEntryId?: string;
  onRestore: (entry: GenerationHistoryEntry) => void;
  onDelete: (entryId: string) => void;
  onClearAll: () => void;
}

function formatRelativeTime(timestamp: number): string {
  const diffSeconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (diffSeconds < 60) return "just now";

  const minutes = Math.floor(diffSeconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export const GenerationHistory = ({
  entries,
  activeEntryId,
  onRestore,
  onDelete,
  onClearAll,
}: GenerationHistoryProps) => {
  const [open, setOpen] = useState(true);
  const [confirmClear, setConfirmClear] = useState(false);

  if (entries.length === 0) return null;

  const handleClear = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    setConfirmClear(false);
    onClearAll();
  };

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-zinc-900/40 backdrop-blur-xl overflow-hidden">
      <div className="flex items-center justify-between gap-4 px-4 py-3">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          className="flex items-center gap-2 text-sm font-medium text-zinc-300 transition-colors hover:text-white"
        >
          <History size={16} className="text-blue-400" />
          Recent generations
          <span className="text-xs text-zinc-500">({entries.length})</span>
          <ChevronDown
            size={14}
            className={`transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>

        {confirmClear ? (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-zinc-400">Clear all?</span>
            <button
              type="button"
              onClick={handleClear}
              className="font-semibold text-red-400 transition-colors hover:text-red-300"
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => setConfirmClear(false)}
              className="text-zinc-400 transition-colors hover:text-white"
            >
              No
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-1.5 text-xs text-zinc-500 transition-colors hover:text-red-400"
          >
            <Trash2 size={14} />
            Clear history
          </button>
        )}
      </div>

      {open && (
        <ul className="divide-y divide-white/5 border-t border-white/10">
          {entries.map((entry) => {
            const isActive = entry.id === activeEntryId;
            return (
              <li key={entry.id} className="group flex items-center">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    onRestore(entry);
                  }}
                  className={`flex min-w-0 flex-1 items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/5 ${
                    isActive ? "bg-blue-500/10" : ""
                  }`}
                >
                  <RotateCcw size={14} className="shrink-0 text-zinc-500" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-mono text-xs text-zinc-200">
                      {entry.url}
                    </span>
                    <span className="mt-0.5 flex items-center gap-1.5 text-[11px] text-zinc-500">
                      <Clock size={11} />
                      {formatRelativeTime(entry.createdAt)}
                      <span className="sr-only">generated</span>
                    </span>
                  </span>
                  <span className="shrink-0 rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-zinc-400">
                    {entry.language}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(entry.id)}
                  aria-label={`Delete generation for ${entry.url}`}
                  title="Delete generation"
                  className="mr-4 shrink-0 rounded p-1.5 text-zinc-600 opacity-0 transition-colors hover:bg-red-500/10 hover:text-red-400 focus:opacity-100 group-hover:opacity-100"
                >
                  <Trash2 size={14} />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <p className="border-t border-white/10 px-4 py-2 text-[10px] text-zinc-600">
        Saved only in this browser on this device.
      </p>
    </div>
  );
};

export default GenerationHistory;
