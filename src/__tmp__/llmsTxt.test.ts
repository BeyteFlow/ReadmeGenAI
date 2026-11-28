import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(__dirname, "..", "..");
const LLMS_TXT_PATH = join(ROOT, "public", "llms.txt");
const SITE_ORIGIN = "https://readmegen-ai.vercel.app";

function readLinks(text: string): string[] {
  return [...text.matchAll(/\[[^\]]+\]\(([^)\s]+)\)/g)].map((m) => m[1]);
}

function pageFileFor(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  return join(ROOT, "src", "app", ...segments, "page.tsx");
}

describe("public/llms.txt", () => {
  it("is served from the site root", () => {
    expect(existsSync(LLMS_TXT_PATH)).toBe(true);
  });

  it("starts with an H1 followed by a blockquote summary", () => {
    const lines = readFileSync(LLMS_TXT_PATH, "utf8")
      .split("\n")
      .filter((line) => line.trim() !== "");
    expect(lines[0]).toBe("# ReadmeGenAI");
    expect(lines[1]).toMatch(/^> \S/);
  });

  it("uses absolute links that point to existing site pages", () => {
    const links = readLinks(readFileSync(LLMS_TXT_PATH, "utf8"));
    expect(links.length).toBeGreaterThan(0);

    for (const link of links) {
      const url = new URL(link);
      expect(url.protocol).toBe("https:");
      if (url.origin === SITE_ORIGIN) {
        expect(existsSync(pageFileFor(url.pathname)), link).toBe(true);
      }
    }
  });
});
