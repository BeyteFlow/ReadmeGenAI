import { describe, it, expect } from "vitest";
import {
  appendGeneration,
  clearHistory,
  GENERATION_HISTORY_KEY,
  loadHistory,
  MAX_HISTORY_ENTRIES,
  MAX_MARKDOWN_CHARS,
  removeHistoryEntry,
  saveHistory,
  type GenerationHistoryEntry,
} from "@/lib/generationHistory";

type FakeStorage = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
  dump: () => Record<string, string>;
};

function createFakeStorage(initial?: Record<string, string>): FakeStorage {
  const store = new Map<string, string>(Object.entries(initial ?? {}));
  return {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => {
      store.set(key, value);
    },
    removeItem: (key) => {
      store.delete(key);
    },
    dump: () => Object.fromEntries(store),
  };
}

function makeEntry(
  url: string,
  language = "English",
  markdown = "# Readme",
): GenerationHistoryEntry {
  return {
    id: `id-${url}-${language}`,
    url,
    language,
    markdown,
    createdAt: 1_000_000,
  };
}

describe("appendGeneration", () => {
  it("adds a new entry at the front and normalizes the URL", () => {
    const next = appendGeneration(
      [],
      "  https://github.com/Owner/Repo/ ",
      "English",
      "# Hi",
    );
    expect(next).toHaveLength(1);
    expect(next[0].url).toBe("https://github.com/Owner/Repo");
    expect(next[0].language).toBe("English");
    expect(next[0].markdown).toBe("# Hi");
  });

  it("dedupes by URL + language, moving the existing entry to the front", () => {
    const first = [makeEntry("https://github.com/a/b", "English")];
    const oldDate = 100;
    const firstWithDate = [{ ...first[0], createdAt: oldDate }];
    const next = appendGeneration(
      firstWithDate,
      "https://github.com/A/B",
      "English",
      "# v2",
      500,
    );
    expect(next).toHaveLength(1);
    expect(next[0].markdown).toBe("# v2");
    expect(next[0].createdAt).toBe(500);
  });

  it("keeps separate entries for different languages", () => {
    const next = appendGeneration(
      [makeEntry("https://github.com/a/b", "English")],
      "https://github.com/a/b",
      "Spanish",
      "# v2",
    );
    expect(next).toHaveLength(2);
  });

  it("evicts the oldest entries beyond the maximum", () => {
    let entries: GenerationHistoryEntry[] = [];
    for (let i = 0; i < MAX_HISTORY_ENTRIES + 5; i++) {
      entries = appendGeneration(
        entries,
        `https://github.com/owner/repo${i}`,
        "English",
        "# x",
      );
    }
    expect(entries).toHaveLength(MAX_HISTORY_ENTRIES);
    expect(entries[0].url).toBe(
      `https://github.com/owner/repo${MAX_HISTORY_ENTRIES + 4}`,
    );
  });

  it("truncates oversized markdown", () => {
    const hugeMarkdown = "x".repeat(MAX_MARKDOWN_CHARS + 500);
    const next = appendGeneration(
      [],
      "https://github.com/a/b",
      "English",
      hugeMarkdown,
    );
    expect(next[0].markdown.length).toBe(MAX_MARKDOWN_CHARS);
  });
});

describe("loadHistory", () => {
  it("returns [] when no key exists", () => {
    expect(loadHistory(createFakeStorage())).toEqual([]);
  });

  it("returns [] for corrupt JSON", () => {
    const storage = createFakeStorage({
      [GENERATION_HISTORY_KEY]: "{not json",
    });
    expect(loadHistory(storage)).toEqual([]);
  });

  it("returns [] when the payload is not an array", () => {
    const storage = createFakeStorage({
      [GENERATION_HISTORY_KEY]: JSON.stringify({ url: "x" }),
    });
    expect(loadHistory(storage)).toEqual([]);
  });

  it("drops malformed entries and keeps valid ones", () => {
    const payload = [
      makeEntry("https://github.com/good/repo"),
      { url: "https://github.com/broken/repo" },
      "junk",
      null,
    ];
    const storage = createFakeStorage({
      [GENERATION_HISTORY_KEY]: JSON.stringify(payload),
    });
    const loaded = loadHistory(storage);
    expect(loaded).toHaveLength(1);
    expect(loaded[0].url).toBe("https://github.com/good/repo");
  });

  it("enforces the entry cap and markdown cap on load", () => {
    const many = Array.from({ length: MAX_HISTORY_ENTRIES + 5 }, (_, i) =>
      makeEntry(`https://github.com/o/r${i}`),
    ).map((entry) => ({
      ...entry,
      markdown: entry.markdown.repeat(MAX_MARKDOWN_CHARS),
    }));
    const storage = createFakeStorage({
      [GENERATION_HISTORY_KEY]: JSON.stringify(many),
    });
    const loaded = loadHistory(storage);
    expect(loaded).toHaveLength(MAX_HISTORY_ENTRIES);
    expect(
      loaded.every((entry) => entry.markdown.length <= MAX_MARKDOWN_CHARS),
    ).toBe(true);
  });
});

describe("saveHistory", () => {
  it("round-trips entries through localStorage", () => {
    const storage = createFakeStorage();
    const entries = [makeEntry("https://github.com/a/b", "English")];
    const persisted = saveHistory(entries, storage);
    expect(persisted).toEqual(entries);
    expect(loadHistory(storage)).toEqual(entries);
  });

  it("returns null when no storage is available", () => {
    expect(saveHistory([makeEntry("https://github.com/a/b", "English")], null)).toBeNull();
  });

  it("returns the persisted subset when the quota forces eviction", () => {
    const store = new Map<string, string>();
    const storage: FakeStorage = {
      getItem: (key) => store.get(key) ?? null,
      setItem: (key, value) => {
        const parsedLength = (JSON.parse(value) as unknown[]).length;
        if (parsedLength >= 4) {
          throw new Error("QuotaExceededError");
        }
        store.set(key, value);
      },
      removeItem: (key) => {
        store.delete(key);
      },
      dump: () => Object.fromEntries(store),
    };

    let entries: GenerationHistoryEntry[] = [];
    for (let i = 0; i < 6; i++) {
      entries = appendGeneration(
        entries,
        `https://github.com/owner/repo${i}`,
        "English",
        "# x",
      );
    }
    expect(entries).toHaveLength(6);

    const persisted = saveHistory(entries, storage);
    expect(persisted).not.toBeNull();
    expect(persisted!.length).toBeLessThan(6);
    expect(persisted).toEqual(loadHistory(storage));
  });
});

describe("removeHistoryEntry", () => {
  it("removes the requested entry and keeps the rest", () => {
    const entries = [
      makeEntry("https://github.com/a/b", "English"),
      makeEntry("https://github.com/c/d", "English"),
    ];
    const next = removeHistoryEntry(entries, entries[0].id);
    expect(next).toHaveLength(1);
    expect(next[0].url).toBe("https://github.com/c/d");
  });
});

describe("clearHistory", () => {
  it("removes the stored key", () => {
    const storage = createFakeStorage({
      [GENERATION_HISTORY_KEY]: JSON.stringify([
        makeEntry("https://github.com/a/b"),
      ]),
    });
    clearHistory(storage);
    expect(storage.dump()).toEqual({});
  });
});
