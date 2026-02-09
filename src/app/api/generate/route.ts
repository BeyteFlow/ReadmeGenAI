import { NextResponse } from "next/server";
import { getGeminiModel } from "@/lib/gemini";
import { getRepoData, getRepoContents } from "@/lib/octokit";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    // 1. URL Cleanup & Validation
    if (!url || !url.includes("github.com")) {
      return NextResponse.json({ error: "Please provide a valid GitHub URL" }, { status: 400 });
    }

    const cleanUrl = url.replace(/\/$/, ""); 
    const parts = cleanUrl.split("github.com/")[1]?.split("/");
    const owner = parts?.[0];
    const repo = parts?.[1];

    if (!owner || !repo) {
      return NextResponse.json({ error: "Could not parse repository owner or name" }, { status: 400 });
    }

    // 2. Fetch Metadata and File Structure in Parallel
    // We use the new helpers from your lib/octokit.ts
    const [repoInfo, repoContents] = await Promise.all([
      getRepoData(owner, repo),
      getRepoContents(owner, repo)
    ]);

    // Create a comma-separated list of root files to guide the AI
    type RepoFile = { name: string };

const fileList =
  repoContents.length > 0
    ? repoContents.map((f: RepoFile) => f.name).join(", ")
    : "Standard repository structure";

    // 3. Initialize Gemini 2.5
    const model = getGeminiModel();

    // 4. The "Expert Technical Writer" Prompt
    const prompt = `
      You are an expert Technical Writer specializing in developer documentation. 
      Generate a professional, comprehensive README.md for the following repository:
      
      Name: ${repo}
      Description: ${repoInfo?.description || "A modern software project."}
      Primary Language: ${repoInfo?.language}
      Root Directory Files: ${fileList}

      Requirements:
      - Add a clean title and professional SVG badges from shields.io.
      - Create a visual "Directory Structure" section (tree style).
      - Include "Features", "Installation", and "Usage" sections.
      - If 'package.json' exists, provide Node.js installation steps. 
      - If 'requirements.txt' exists, provide Python installation steps.
      - Ensure the tone is welcoming and documentation is clear.
      
      Return ONLY the Markdown content.
    `;

    // 5. AI Generation
    const result = await model.generateContent(prompt);
    const markdown = result.response.text();

    return NextResponse.json({ markdown });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("README Generation Failed:", message);

    return NextResponse.json(
      { error: "Failed to generate README. Ensure your API keys are correct." },
      { status: 500 }
    );
  }
}