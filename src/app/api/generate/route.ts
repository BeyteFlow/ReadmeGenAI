import { NextResponse } from "next/server";
import { getGeminiModel } from "@/lib/gemini";
import { getRepoData, getRepoContents } from "@/lib/octokit";

export const dynamic = "force-dynamic";

/**
 * AI README Generation Endpoint
 * Optimized for data accuracy and clean prompt interpolation.
 */
export async function POST(req: Request) {
  let rawUrl: string;
  try {
    const body = await req.json();
    rawUrl = body.url;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const trimmedUrl = rawUrl?.trim();
    if (!trimmedUrl) {
      return NextResponse.json(
        { error: "GitHub URL is required" },
        { status: 400 },
      );
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(trimmedUrl);
    } catch {
      return NextResponse.json(
        { error: "Please provide a valid URL" },
        { status: 400 },
      );
    }

    if (
      parsedUrl.hostname !== "github.com" &&
      parsedUrl.hostname !== "www.github.com"
    ) {
      return NextResponse.json(
        { error: "Only GitHub URLs are supported" },
        { status: 400 },
      );
    }

    const pathSegments = parsedUrl.pathname.split("/").filter(Boolean);
    const owner = pathSegments[0];
    const repo = pathSegments[1];

    if (!owner || !repo) {
      return NextResponse.json(
        { error: "URL must include owner and repository name" },
        { status: 400 },
      );
    }

    const [repoInfo, repoContents] = await Promise.all([
      getRepoData(owner, repo),
      getRepoContents(owner, repo),
    ]);

    const files = Array.isArray(repoContents)
      ? repoContents.map((f: { name: string }) => f.name)
      : [];
    const fileListString =
      files.length > 0 ? files.join(", ") : "Standard repository structure";

    // Tech Stack detection logic
    const hasNode = files.includes("package.json");
    const hasPython =
      files.includes("requirements.txt") || files.includes("setup.py");
    const hasDocker =
      files.includes("Dockerfile") || files.includes("docker-compose.yml");

    // Fix: Cleanly joined Tech Stack labels
    const stackLabels =
      [
        hasNode && "Node.js Environment",
        hasPython && "Python Environment",
        hasDocker && "Containerized",
      ]
        .filter(Boolean)
        .join(", ") || "Generic Software Environment";

    // Fix: Dynamic License detection
    const licenseName =
      repoInfo?.license?.name ||
      repoInfo?.license?.spdx_id ||
      "the repository's license file";

    const model = getGeminiModel();

    // Fix: Prompt updated with neutral fallbacks and dynamic license
    const prompt = `
**Role**: You are a Principal Solutions Architect and World-Class Technical Writer. 
**Task**: Generate a professional, high-conversion README.md for the GitHub repository: "${repo}".

---
### 1. PROJECT CONTEXT (VERIFIED DATA)
- **Project Name**: ${repo}
- **Description**: ${repoInfo?.description || "No description provided."}
- **Primary Language**: ${repoInfo?.language || "Language unknown"}
- **Detected Root Files**: ${fileListString}
- **Tech Stack Context**: ${stackLabels}

---
### 2. STRICT README STRUCTURE REQUIREMENTS

1. **Visual Header**:
   - Center-aligned H1 with project name.
   - A compelling 1-sentence tagline describing the **Value Proposition**.
   - A centered row of Shields.io badges (Build, License, PRs Welcome, Stars).

2. **The Strategic "Why" (Overview)**:
   - **The Problem**: Use a blockquote to describe the real-world pain point this project solves.
   - **The Solution**: Explain how this project provides a superior outcome for the user.

3. **Key Features**:
   - Minimum 5 features. Use emojis and focus on **User Benefits**.

4. **Technical Architecture**:
   - Provide a table of the tech stack: | Technology | Purpose | Key Benefit |.
   - Create a tree-style directory structure code block using 📁 for folders and 📄 for files based on the file manifest provided.

5. **Operational Setup**:
   - **Prerequisites**: List required runtimes.
   - **Installation**: Provide step-by-step terminal commands. 
     ${hasNode ? "- Use npm/yarn/pnpm since package.json was detected." : ""}
     ${hasPython ? "- Use pip/venv since Python markers were detected." : ""}
   - **Environment**: If any .env or config files are in the manifest, include a configuration section.

6. **Community & Governance**:
   - Professional "Contributing" section (Fork -> Branch -> PR).
   - Detailed "License" section: Reference ${licenseName} and provide a summary of permissions.

---
### 3. TONE & STYLE
- **Tone**: Authoritative, polished, and developer-centric.
- **Visuals**: Extensive use of Markdown formatting.
- **Constraint**: Return ONLY the raw Markdown. No conversational filler.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const markdown = response.text();

    return NextResponse.json({ markdown });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    console.error("README Generation Failed:", message);

    return NextResponse.json(
      { error: "Failed to generate README. Check your URL and try again." },
      { status: 500 },
    );
  }
}
