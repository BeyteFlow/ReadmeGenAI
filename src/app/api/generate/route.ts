import { NextRequest, NextResponse } from "next/server";
import { MultiStepReadmeGenerator } from "@/lib/multi-step-readme-generator";

export const dynamic = "force-dynamic";

/**
 * Enhanced Multi-Step README Generation Endpoint
 *
 * This endpoint uses a sophisticated multi-step approach to generate READMEs:
 * 1. Repository Analysis - Smart analysis with token-conscious filtering
 * 2. Section Planning - Dynamic sections based on project type
 * 3. Section Generation - Individual section generation within token limits
 * 4. Assembly & Validation - Retry logic and fallback mechanisms
 *
 * Fixes token limit issues from issue #101 by generating sections individually.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url: githubUrl } = body;

    // Validate required fields
    if (!githubUrl) {
      return NextResponse.json(
        { error: "GitHub URL is required" },
        { status: 400 },
      );
    }

    // Validate GitHub URL format
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(githubUrl.trim());
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

    // Initialize the multi-step generator with enhanced configuration
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const githubToken = process.env.GITHUB_TOKEN;
    
    if (!geminiApiKey) {
      console.error('GEMINI_API_KEY environment variable is not set');
      return NextResponse.json(
        { error: 'Server configuration error: Missing AI API key' },
        { status: 500 }
      );
    }
    
    console.log('Initializing generator with API key length:', geminiApiKey.length);
    
    const generator = new MultiStepReadmeGenerator(
      geminiApiKey,
      githubToken, // Optional GitHub token for higher rate limits
      {
        maxRetries: 3,
        maxTokensPerSection: 800, // Smaller token limit per section
        temperature: 0.7,
        concurrentSections: 3, // Generate multiple sections in parallel
        enableContinuation: true, // Enable automatic continuation for truncated content
      },
    );

    // Generate README with detailed tracking
    const startTime = Date.now();
    console.log("Starting multi-step README generation for", githubUrl);

    const result = await generator.generateReadme(githubUrl);
    const endTime = Date.now();

    // Log generation statistics for monitoring
    console.log("README generation completed for", githubUrl, {
      success: result.success,
      sectionsGenerated: result.stats.sectionsGenerated,
      sectionsTotal: result.stats.sectionsTotal,
      tokensUsed: result.stats.tokensUsed,
      timeElapsed: endTime - startTime,
      errors: result.errors.length,
    });

    if (!result.success) {
      console.error("README generation failed:", result.errors);
      return NextResponse.json(
        {
          error: "Failed to generate README using multi-step pipeline",
          details: result.errors,
          stats: result.stats,
        },
        { status: 500 },
      );
    }

    // Return successful result with enhanced metadata
    return NextResponse.json({
      success: true,
      markdown: result.readme, // Keep 'markdown' key for compatibility with existing frontend
      stats: {
        sectionsGenerated: result.stats.sectionsGenerated,
        sectionsTotal: result.stats.sectionsTotal,
        tokensUsed: result.stats.tokensUsed,
        timeElapsed: result.stats.timeElapsed,
        generationMethod: "multi-step", // Indicate the method used
      },
      metadata: {
        name: result.metadata?.name,
        description: result.metadata?.description,
        language: result.metadata?.language,
        stars: result.metadata?.stars,
        license: result.metadata?.license,
        projectType: result.structure?.projectType,
        techStack: result.structure?.techStack.primary,
        frameworks: result.structure?.techStack.frameworks,
      },
      warnings: result.errors.length > 0 ? result.errors : undefined,
    });
  } catch (error) {
    console.error("Multi-step README generation API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error in multi-step README generation",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
