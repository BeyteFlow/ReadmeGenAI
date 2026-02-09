import { NextResponse } from "next/server";
import { getGeminiModel } from "@/lib/gemini";
import { getRepoData, getRepoContents } from "@/lib/octokit";

//  Tip: Force dynamic to ensure API keys are read correctly at runtime
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  // 1. Safe JSON Body Parsing
  let rawUrl: string;
  try {
    const body = await req.json();
    rawUrl = body.url;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    // 2. Strict URL Validation
    const trimmedUrl = rawUrl?.trim();
    if (!trimmedUrl) {
      return NextResponse.json({ error: "GitHub URL is required" }, { status: 400 });
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(trimmedUrl);
    } catch {
      return NextResponse.json({ error: "Please provide a valid URL" }, { status: 400 });
    }

    // Hostname Guard: Only allow GitHub
    if (parsedUrl.hostname !== "github.com" && parsedUrl.hostname !== "www.github.com") {
      return NextResponse.json({ error: "Only GitHub URLs are supported" }, { status: 400 });
    }

    // Extract Owner and Repo securely from the path segments
    const pathSegments = parsedUrl.pathname.split("/").filter(Boolean);
    const owner = pathSegments[0];
    const repo = pathSegments[1];

    if (!owner || !repo) {
      return NextResponse.json({ error: "URL must include owner and repository name" }, { status: 400 });
    }

    // 3. Parallel Data Fetching
    const [repoInfo, repoContents] = await Promise.all([
      getRepoData(owner, repo),
      getRepoContents(owner, repo)
    ]);

    // Format file list for AI context
    const fileList = repoContents.length > 0 
      ? repoContents.map((f: any) => f.name).join(", ") 
      : "Standard structure";

    // 4. Initialize Gemini 2.5 (2026 Standard)
    const model = getGeminiModel();

    // 5. The "Expert Prompt" with Fallbacks (No more "null" or "undefined" strings)
    const prompt = `
      You are an expert Technical Writer. Generate a professional README.md for the following repository:
      
      Name: ${repo}
      Description: ${repoInfo?.description || "A modern software project."}
      Primary Language: ${repoInfo?.language || "Not specified"}
      Root Directory Files: ${fileList}

      Requirements:
      - Use professional shields.io badges.
      - Create a visual "Directory Structure" section (tree style).
      - Include "Features", "Installation", and "Usage" sections.
      - Ensure installation steps match the Primary Language or Root Files (e.g., use npm if package.json exists).
      - Tone: Professional, welcoming, and developer-friendly.

      Return ONLY the Markdown content.
    `;

    // 6. Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const markdown = response.text();

    return NextResponse.json({ markdown });

  } catch (error: unknown) {
    // Sanitize error logging to prevent leaking secrets in logs
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("README Generation Failed:", message);

    return NextResponse.json(
      { error: "Failed to generate README. Please check your URL and try again." },
      { status: 500 }
    );
  }
}
