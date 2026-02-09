import { NextResponse } from "next/server";
import { getGeminiModel } from "@/lib/gemini";
import { getRepoData, getRepoContents } from "@/lib/octokit";

// Ensure API keys are read at runtime
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

    // Hostname Guard
    if (parsedUrl.hostname !== "github.com" && parsedUrl.hostname !== "www.github.com") {
      return NextResponse.json({ error: "Only GitHub URLs are supported" }, { status: 400 });
    }

    // Extract Owner and Repo from path
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

    // 4. Type-Safe File Mapping (Fixes the 'any' linting error)
    // We define the shape { name: string } inline to satisfy ESLint
    const fileList = Array.isArray(repoContents) && repoContents.length > 0 
      ? repoContents.map((f: { name: string }) => f.name).join(", ") 
      : "Standard repository structure";

    // 5. Initialize Gemini 2.5
    const model = getGeminiModel();

    // 6. The "Expert Prompt" with Fallbacks
    const prompt = `
      You are an expert Technical Writer. Generate a professional README.md for:
      
      Name: ${repo}
      Description: ${repoInfo?.description || "A modern software project."}
      Primary Language: ${repoInfo?.language || "Not specified"}
      Root Directory Files: ${fileList}

      Requirements:
      - Include professional SVG badges from shields.io.
      - Create a visual "Directory Structure" section (tree style).
      - Include "Features", "Installation", and "Usage" sections.
      - If 'package.json' exists, provide Node.js installation steps.
      - Ensure a welcoming, professional developer-centric tone.
      
      Return ONLY the Markdown content.
    `;

    // 7. AI Generation
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const markdown = response.text();

    return NextResponse.json({ markdown });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("README Generation Failed:", message);

    return NextResponse.json(
      { error: "Failed to generate README. Check your URL and try again." },
      { status: 500 }
    );
  }
}
