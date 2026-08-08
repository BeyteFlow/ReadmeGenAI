export const GENERATION_HISTORY_KEY = "readmegenai.generationHistory";

export const MAX_HISTORY_ENTRIES = 10;

export const MAX_MARKDOWN_CHARS = 120_000;

export interface GenerationHistoryEntry {
  id: string;
  url: string;
  language: string;
  markdown: string;
  createdAt: number;
}

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function getStorage(): StorageLike | null {
  if (typeof globalThis === "undefined") return null;
  const storage = (globalThis as { localStorage?: StorageLike }).localStorage;
  return storage ?? null;
}

function createId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function normalizeRepoUrl(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

function urlForCompare(url: string): string {
  return normalizeRepoUrl(url).toLowerCase();
}

function isEntry(value: unknown): value is GenerationHistoryEntry {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    typeof record.url === "string" &&
    typeof record.language === "string" &&
    typeof record.markdown === "string" &&
    typeof record.createdAt === "number"
  );
}

function sanitizeEntries(values: unknown): GenerationHistoryEntry[] {
  if (!Array.isArray(values)) return [];
  return values
    .filter(isEntry)
    .map((entry) => ({
      ...entry,
      markdown: entry.markdown.slice(0, MAX_MARKDOWN_CHARS),
    }))
    .slice(0, MAX_HISTORY_ENTRIES);
}

export function loadHistory(
  storage: StorageLike | null = getStorage(),
): GenerationHistoryEntry[] {
  if (!storage) return [];
  try {
    const raw = storage.getItem(GENERATION_HISTORY_KEY);
    if (!raw) return [];
    return sanitizeEntries(JSON.parse(raw));
  } catch {
    return [];
  }
}

export function appendGeneration(
  current: GenerationHistoryEntry[],
  url: string,
  language: string,
  markdown: string,
  now: number = Date.now(),
): GenerationHistoryEntry[] {
  const normalizedUrl = normalizeRepoUrl(url);
  const normalizedLanguage = language.trim() || "English";
  const existingIndex = current.findIndex(
    (entry) =>
      urlForCompare(entry.url) === urlForCompare(normalizedUrl) &&
      entry.language === normalizedLanguage,
  );

  const next: GenerationHistoryEntry[] = [
    {
      id: createId(),
      url: normalizedUrl,
      language: normalizedLanguage,
      markdown: markdown.slice(0, MAX_MARKDOWN_CHARS),
      createdAt: now,
    },
    ...current.filter((_, index) => index !== existingIndex),
  ];

  return next.slice(0, MAX_HISTORY_ENTRIES);
}

export function removeHistoryEntry(
  current: GenerationHistoryEntry[],
  id: string,
): GenerationHistoryEntry[] {
  return current.filter((entry) => entry.id !== id);
}

export function saveHistory(
  entries: GenerationHistoryEntry[],
  storage: StorageLike | null = getStorage(),
): void {
  if (!storage) return;
  let pool = entries;
  for (;;) {
    try {
      storage.setItem(GENERATION_HISTORY_KEY, JSON.stringify(pool));
      return;
    } catch {
      if (pool.length <= 1) return;
      pool = pool.slice(0, Math.ceil(pool.length / 2));
    }
  }
}

export function clearHistory(storage: StorageLike | null = getStorage()): void {
  if (!storage) return;
  try {
    storage.removeItem(GENERATION_HISTORY_KEY);
  } catch {
    // Ignore storage errors; in-memory state is cleared by the caller.
  }
}
