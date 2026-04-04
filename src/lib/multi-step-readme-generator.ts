/**
 * Multi-Step README Generation Pipeline
 *
 * This module provides a robust, section-by-section approach to README generation
 * that solves token limit issues and ensures complete README files.
 *
 * Architecture:
 * 1. Repository Analysis - Extract metadata and structure
 * 2. Section Planning - Determine optimal sections based on repo type
 * 3. Section Generation - Generate each section individually
 * 4. Assembly & Validation - Combine sections with retry logic
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { Octokit } from "octokit";

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface RepositoryMetadata {
  name: string;
  description?: string;
  language?: string;
  license?: string;
  stars: number;
  forks: number;
  isPrivate: boolean;
  topics: string[];
  homepage?: string;
  size: number;
  defaultBranch: string;
  createdAt: string;
  updatedAt: string;
}

export interface RepositoryStructure {
  rootFiles: string[];
  directories: string[];
  packageFiles: string[];
  configFiles: string[];
  documentationFiles: string[];
  techStack: TechStackInfo;
  projectType: ProjectType;
}

export interface TechStackInfo {
  primary: string;
  frameworks: string[];
  tools: string[];
  databases: string[];
  deployment: string[];
}

export type ProjectType =
  | "web-frontend"
  | "web-backend"
  | "mobile-app"
  | "desktop-app"
  | "library"
  | "cli-tool"
  | "data-science"
  | "devops"
  | "documentation"
  | "other";

export interface GitHubContentItem {
  name: string;
  path: string;
  type: 'file' | 'dir' | 'symlink' | 'submodule';
  size?: number;
  sha?: string;
  url?: string;
  git_url?: string | null;
  html_url?: string | null;
  download_url?: string | null;
  encoding?: string;
  content?: string;
  target?: string;
  submodule_git_url?: string;
  _links?: Record<string, unknown>;
  [key: string]: unknown; // Allow additional properties
}

export type GitHubContentResponse = GitHubContentItem | GitHubContentItem[];

export interface ReadmeSection {
  id: string;
  title: string;
  priority: "critical" | "high" | "medium" | "low";
  order: number;
  estimatedTokens: number;
  dependencies: string[]; // IDs of sections this depends on
}

export interface GenerationResult {
  success: boolean;
  content?: string;
  tokensUsed?: number;
  error?: string;
  truncated?: boolean;
}

export interface GenerationConfig {
  maxRetries: number;
  maxTokensPerSection: number;
  temperature: number;
  concurrentSections: number;
  enableContinuation: boolean;
}

// ============================================================================
// REPOSITORY ANALYZER
// ============================================================================

export class RepositoryAnalyzer {
  private octokit: Octokit;

  constructor(githubToken?: string) {
    this.octokit = new Octokit({
      auth: githubToken,
    });
  }

  /**
   * Comprehensive repository analysis including metadata, structure, and tech stack
   */
  async analyzeRepository(
    owner: string,
    repo: string,
  ): Promise<{
    metadata: RepositoryMetadata;
    structure: RepositoryStructure;
  }> {
    try {
      // Fetch metadata and contents in parallel for efficiency
      const [repoData, contentsData] = await Promise.all([
        this.getRepositoryMetadata(owner, repo),
        this.getRepositoryContents(owner, repo),
      ]);

      const structure = this.analyzeStructure(contentsData);

      return {
        metadata: repoData,
        structure,
      };
    } catch (error) {
      throw new Error(`Failed to analyze repository: ${error}`);
    }
  }

  /**
   * Extract repository metadata with enhanced fields
   */
  private async getRepositoryMetadata(
    owner: string,
    repo: string,
  ): Promise<RepositoryMetadata> {
    const { data } = await this.octokit.rest.repos.get({ owner, repo });

    return {
      name: data.name,
      description: data.description || undefined,
      language: data.language || undefined,
      license: data.license?.name,
      stars: data.stargazers_count,
      forks: data.forks_count,
      isPrivate: data.private,
      topics: data.topics || [],
      homepage: data.homepage || undefined,
      size: data.size,
      defaultBranch: data.default_branch,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  /**
   * Get repository contents with smart filtering to avoid token overflow
   */
  private async getRepositoryContents(
    owner: string,
    repo: string,
    path = "",
    maxDepth = 2,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any[]> {
    try {
      const { data } = await this.octokit.rest.repos.getContent({
        owner,
        repo,
        path,
      });

      if (!Array.isArray(data)) {
        return [data];
      }

      // Filter out unimportant files and limit results
      const filteredContents = data
        .filter((item) => this.isRelevantFile(item.name))
        .slice(0, 100); // Prevent token overflow

      if (maxDepth > 0) {
        // Recursively get important subdirectories
        const subdirectories = filteredContents.filter(
          (item) => item.type === "dir" && this.isImportantDirectory(item.name),
        );

        for (const dir of subdirectories.slice(0, 5)) {
          // Limit subdirectory exploration
          try {
            const subContents = await this.getRepositoryContents(
              owner,
              repo,
              dir.path,
              maxDepth - 1,
            );
            for (const item of subContents) {
              filteredContents.push(item);
            }
          } catch (error) {
            // Continue if subdirectory is inaccessible
            console.warn(`Could not access directory ${dir.path}: ${error}`);
          }
        }
      }

      return filteredContents;
    } catch (error) {
      throw new Error(`Failed to fetch repository contents: ${error}`);
    }
  }

  /**
   * Filter relevant files to reduce token usage
   */
  private isRelevantFile(filename: string): boolean {
    const relevantExtensions = [
      ".md",
      ".txt",
      ".json",
      ".yml",
      ".yaml",
      ".toml",
      ".ini",
      ".cfg",
      ".js",
      ".ts",
      ".py",
      ".java",
      ".go",
      ".rs",
      ".cpp",
      ".c",
      ".h",
      ".html",
      ".css",
      ".scss",
      ".vue",
      ".jsx",
      ".tsx",
      ".dockerfile",
      ".gitignore",
      ".env.example",
    ];

    const relevantFiles = [
      "README",
      "LICENSE",
      "package.json",
      "requirements.txt",
      "setup.py",
      "Dockerfile",
      "docker-compose",
      "Makefile",
      "cargo.toml",
      "go.mod",
      "pom.xml",
      "build.gradle",
      "composer.json",
      "package-lock.json",
      "yarn.lock",
      ".env.example",
      ".gitignore",
      "tsconfig.json",
    ];

    const lowerFilename = filename.toLowerCase();

    return (
      relevantFiles.some((file) =>
        lowerFilename.includes(file.toLowerCase()),
      ) ||
      relevantExtensions.some((ext) => lowerFilename.endsWith(ext)) ||
      lowerFilename.startsWith(".")
    );
  }

  /**
   * Identify important directories for exploration
   */
  private isImportantDirectory(dirname: string): boolean {
    const importantDirs = [
      "src",
      "lib",
      "app",
      "components",
      "pages",
      "api",
      "utils",
      "config",
      "scripts",
      "docs",
      "examples",
      "test",
      "tests",
      "__tests__",
      "spec",
      "public",
      "assets",
      "static",
    ];

    const lowerDirname = dirname.toLowerCase();
    return (
      importantDirs.includes(lowerDirname) &&
      !lowerDirname.includes("node_modules") &&
      !lowerDirname.includes(".git")
    );
  }

  /**
   * Analyze repository structure and detect tech stack
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private analyzeStructure(contents: any[]): RepositoryStructure {
    const files = contents
      .map((item) => item.name || item.path)
      .filter(Boolean);

    const rootFiles = files.filter((file) => !file.includes("/"));
    const directories = [
      ...new Set(
        files
          .filter((file) => file.includes("/"))
          .map((file) => file.split("/")[0]),
      ),
    ];

    // Categorize files
    const packageFiles = files.filter((file) => this.isPackageFile(file));
    const configFiles = files.filter((file) => this.isConfigFile(file));
    const documentationFiles = files.filter((file) =>
      this.isDocumentationFile(file),
    );

    // Detect tech stack and project type
    const techStack = this.detectTechStack(files);
    const projectType = this.detectProjectType(files, directories, techStack);

    return {
      rootFiles,
      directories,
      packageFiles,
      configFiles,
      documentationFiles,
      techStack,
      projectType,
    };
  }

  private isPackageFile(filename: string): boolean {
    const packageFiles = [
      "package.json",
      "package-lock.json",
      "yarn.lock",
      "requirements.txt",
      "setup.py",
      "pyproject.toml",
      "cargo.toml",
      "cargo.lock",
      "go.mod",
      "go.sum",
      "pom.xml",
      "build.gradle",
      "composer.json",
    ];
    return packageFiles.some((file) => filename.toLowerCase().includes(file));
  }

  private isConfigFile(filename: string): boolean {
    const configFiles = [
      "tsconfig",
      "webpack",
      "babel",
      "eslint",
      "prettier",
      "jest",
      "cypress",
      "dockerfile",
      "docker-compose",
      ".env",
      "config",
      "settings",
    ];
    return configFiles.some((config) =>
      filename.toLowerCase().includes(config),
    );
  }

  private isDocumentationFile(filename: string): boolean {
    const lowerFilename = filename.toLowerCase();
    return (
      lowerFilename.includes("readme") ||
      lowerFilename.includes("docs") ||
      lowerFilename.includes("license") ||
      lowerFilename.endsWith(".md") ||
      lowerFilename.endsWith(".txt")
    );
  }

  /**
   * Advanced tech stack detection with confidence scoring
   */
  private detectTechStack(files: string[]): TechStackInfo {
    const techStack: TechStackInfo = {
      primary: "unknown",
      frameworks: [],
      tools: [],
      databases: [],
      deployment: [],
    };

    // Primary language detection
    const languageIndicators = {
      javascript: ["package.json", ".js", ".jsx"],
      typescript: ["tsconfig.json", ".ts", ".tsx"],
      python: ["requirements.txt", "setup.py", ".py"],
      java: ["pom.xml", "build.gradle", ".java"],
      go: ["go.mod", ".go"],
      rust: ["cargo.toml", ".rs"],
      cpp: [".cpp", ".c", ".h"],
      csharp: [".cs", ".csproj"],
      php: ["composer.json", ".php"],
      ruby: ["gemfile", ".rb"],
      swift: [".swift", "package.swift"],
    };

    let maxScore = 0;
    for (const [lang, indicators] of Object.entries(languageIndicators)) {
      const score = indicators.reduce(
        (sum, indicator) =>
          sum +
          files.filter((f) => f.toLowerCase().includes(indicator.toLowerCase()))
            .length,
        0,
      );
      if (score > maxScore) {
        maxScore = score;
        techStack.primary = lang;
      }
    }

    // Framework detection
    const frameworkIndicators = {
      react: ["react", "jsx", "tsx"],
      vue: ["vue.config", ".vue"],
      angular: ["angular.json", "@angular"],
      svelte: ["svelte.config", ".svelte"],
      nextjs: ["next.config", "pages/", "app/"],
      nuxt: ["nuxt.config"],
      express: ["express"],
      django: ["django", "manage.py"],
      fastapi: ["fastapi"],
      flask: ["flask"],
      spring: ["spring", "application.properties"],
    };

    for (const [framework, indicators] of Object.entries(frameworkIndicators)) {
      if (
        indicators.some((indicator) =>
          files.some((file) =>
            file.toLowerCase().includes(indicator.toLowerCase()),
          ),
        )
      ) {
        techStack.frameworks.push(framework);
      }
    }

    // Tool detection
    const toolIndicators = {
      webpack: ["webpack.config"],
      vite: ["vite.config"],
      eslint: [".eslintrc", "eslint.config"],
      prettier: [".prettierrc", "prettier.config"],
      jest: ["jest.config", "jest.json"],
      cypress: ["cypress.config", "cypress/"],
      docker: ["dockerfile", "docker-compose"],
      github_actions: [".github/workflows"],
    };

    for (const [tool, indicators] of Object.entries(toolIndicators)) {
      if (
        indicators.some((indicator) =>
          files.some((file) =>
            file.toLowerCase().includes(indicator.toLowerCase()),
          ),
        )
      ) {
        techStack.tools.push(tool);
      }
    }

    return techStack;
  }

  /**
   * Detect project type based on structure and tech stack
   */
  private detectProjectType(
    files: string[],
    directories: string[],
    techStack: TechStackInfo,
  ): ProjectType {
    const hasDirectory = (names: string[]) =>
      names.some((name) =>
        directories.some((dir) =>
          dir.toLowerCase().includes(name.toLowerCase()),
        ),
      );

    const hasFile = (patterns: string[]) =>
      patterns.some((pattern) =>
        files.some((file) =>
          file.toLowerCase().includes(pattern.toLowerCase()),
        ),
      );

    // CLI tool detection
    if (
      hasFile(["bin/", "cli.", "command.", "main."]) ||
      (techStack.frameworks.length === 0 &&
        hasFile(["index.js", "main.py", "main.go"]))
    ) {
      return "cli-tool";
    }

    // Mobile app detection
    if (
      hasFile(["react-native", "flutter", "ionic", "expo"]) ||
      hasDirectory(["ios", "android", "mobile"])
    ) {
      return "mobile-app";
    }

    // Desktop app detection
    if (
      hasFile(["electron", "tauri", "nwjs"]) ||
      techStack.frameworks.some((f) => ["electron", "tauri"].includes(f))
    ) {
      return "desktop-app";
    }

    // Web frontend detection
    if (
      techStack.frameworks.some((f) =>
        ["react", "vue", "angular", "svelte"].includes(f),
      ) ||
      hasDirectory(["components", "pages", "views"]) ||
      hasFile(["index.html", "app.js", "main.js"])
    ) {
      return "web-frontend";
    }

    // Web backend detection
    if (
      techStack.frameworks.some((f) =>
        ["express", "django", "flask", "spring"].includes(f),
      ) ||
      hasDirectory(["api", "routes", "controllers", "models"]) ||
      hasFile(["server.", "app.py", "main.py"])
    ) {
      return "web-backend";
    }

    // Library detection
    if (
      hasFile([
        "lib/",
        "src/lib",
        "dist/",
        "build/",
        "setup.py",
        "package.json",
      ]) &&
      !hasDirectory(["pages", "components", "views"])
    ) {
      return "library";
    }

    // Data science detection
    if (
      hasFile(["jupyter", ".ipynb", "requirements.txt"]) &&
      techStack.primary === "python"
    ) {
      return "data-science";
    }

    // DevOps detection
    if (
      hasFile([
        "dockerfile",
        "docker-compose",
        "kubernetes",
        "terraform",
        ".yml",
        ".yaml",
      ]) ||
      hasDirectory(["k8s", "kubernetes", "terraform", "ansible"])
    ) {
      return "devops";
    }

    // Documentation detection
    if (
      hasDirectory(["docs", "documentation"]) &&
      files.filter((f) => f.endsWith(".md")).length > 3
    ) {
      return "documentation";
    }

    return "other";
  }
}

// ============================================================================
// SECTION PLANNER
// ============================================================================

export class SectionPlanner {
  /**
   * Plan README sections based on repository analysis
   */
  static planSections(
    metadata: RepositoryMetadata,
    structure: RepositoryStructure,
  ): ReadmeSection[] {
    const baseSections: ReadmeSection[] = [
      {
        id: "header",
        title: "Project Header",
        priority: "critical",
        order: 1,
        estimatedTokens: 200,
        dependencies: [],
      },
      {
        id: "description",
        title: "Description",
        priority: "critical",
        order: 2,
        estimatedTokens: 300,
        dependencies: ["header"],
      },
      {
        id: "features",
        title: "Features",
        priority: "high",
        order: 3,
        estimatedTokens: 400,
        dependencies: ["description"],
      },
      {
        id: "architecture",
        title: "Technical Architecture",
        priority: "medium",
        order: 3.5,
        estimatedTokens: 400,
        dependencies: ["features"],
      },
      {
        id: "structure",
        title: "Directory Structure", 
        priority: "low",
        order: 3.7,
        estimatedTokens: 300,
        dependencies: ["architecture"],
      },
      {
        id: "installation",
        title: "Installation",
        priority: "critical",
        order: 4,
        estimatedTokens: 500,
        dependencies: ["features"],
      },
      {
        id: "usage",
        title: "Usage",
        priority: "high",
        order: 5,
        estimatedTokens: 600,
        dependencies: ["installation"],
      },
      {
        id: "license",
        title: "License",
        priority: "medium",
        order: 10,
        estimatedTokens: 100,
        dependencies: [],
      },
    ];

    // Add conditional sections based on project type and structure
    const conditionalSections = this.getConditionalSections(
      metadata,
      structure,
    );

    const allSections = [...baseSections, ...conditionalSections];

    // Sort by order and return
    return allSections.sort((a, b) => a.order - b.order);
  }

  /**
   * Get additional sections based on project characteristics
   */
  private static getConditionalSections(
    metadata: RepositoryMetadata,
    structure: RepositoryStructure,
  ): ReadmeSection[] {
    const sections: ReadmeSection[] = [];

    // API Documentation for backend projects
    if (
      structure.projectType === "web-backend" ||
      structure.directories.some((d) => d.includes("api"))
    ) {
      sections.push({
        id: "api",
        title: "API Documentation",
        priority: "high",
        order: 6,
        estimatedTokens: 800,
        dependencies: ["usage"],
      });
    }

    // Configuration section for complex projects
    if (structure.configFiles.length > 3) {
      sections.push({
        id: "configuration",
        title: "Configuration",
        priority: "medium",
        order: 7,
        estimatedTokens: 400,
        dependencies: ["installation"],
      });
    }

    // Development section for open-source projects
    if (!metadata.isPrivate && metadata.forks > 0) {
      sections.push({
        id: "development",
        title: "Development",
        priority: "medium",
        order: 8,
        estimatedTokens: 500,
        dependencies: ["usage"],
      });
    }

    // Contributing section for popular projects
    if (metadata.stars > 50 || metadata.forks > 10) {
      sections.push({
        id: "contributing",
        title: "Contributing",
        priority: "medium",
        order: 9,
        estimatedTokens: 300,
        dependencies: [],
      });
    }

    // Deployment section for web applications
    if (
      structure.projectType === "web-frontend" ||
      structure.projectType === "web-backend"
    ) {
      sections.push({
        id: "deployment",
        title: "Deployment",
        priority: "medium",
        order: 6.5,
        estimatedTokens: 400,
        dependencies: ["usage"],
      });
    }

    // Examples section for libraries
    if (
      structure.projectType === "library" ||
      structure.directories.some((d) => d.includes("example"))
    ) {
      sections.push({
        id: "examples",
        title: "Examples",
        priority: "high",
        order: 5.5,
        estimatedTokens: 600,
        dependencies: ["usage"],
      });
    }

    // Testing section for projects with test infrastructure
    if (
      structure.directories.some((d) => d.includes("test")) ||
      structure.techStack.tools.some((t) =>
        ["jest", "cypress", "pytest"].includes(t),
      )
    ) {
      sections.push({
        id: "testing",
        title: "Testing",
        priority: "low",
        order: 8.5,
        estimatedTokens: 300,
        dependencies: ["development"],
      });
    }

    return sections;
  }

  /**
   * Optimize section order based on dependencies
   */
  static optimizeSectionOrder(sections: ReadmeSection[]): ReadmeSection[] {
    // Implementation of topological sort for dependencies
    const sorted: ReadmeSection[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (section: ReadmeSection) => {
      if (visiting.has(section.id)) {
        throw new Error(
          `Circular dependency detected involving section: ${section.id}`,
        );
      }
      if (visited.has(section.id)) {
        return;
      }

      visiting.add(section.id);

      // Visit dependencies first
      for (const depId of section.dependencies) {
        const depSection = sections.find((s) => s.id === depId);
        if (depSection) {
          visit(depSection);
        }
      }

      visiting.delete(section.id);
      visited.add(section.id);
      sorted.push(section);
    };

    // Sort by priority first, then by order
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    const sortedByPriority = [...sections].sort((a, b) => {
      const priorityDiff =
        priorityOrder[a.priority] - priorityOrder[b.priority];
      return priorityDiff !== 0 ? priorityDiff : a.order - b.order;
    });

    for (const section of sortedByPriority) {
      if (!visited.has(section.id)) {
        visit(section);
      }
    }

    return sorted;
  }
}

// ============================================================================
// SECTION GENERATOR WITH OPTIMIZED PROMPTS
// ============================================================================

export class SectionGenerator {
  private genAI: GoogleGenerativeAI;
  private config: GenerationConfig;

  constructor(apiKey: string, config: Partial<GenerationConfig> = {}) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.config = {
      maxRetries: 3,
      maxTokensPerSection: 800,
      temperature: 0.7,
      concurrentSections: 3,
      enableContinuation: true,
      ...config,
    };
  }

  /**
   * Generate a specific README section with optimized prompts
   */
  async generateSection(
    sectionId: string,
    metadata: RepositoryMetadata,
    structure: RepositoryStructure,
    context: Record<string, string> = {},
  ): Promise<GenerationResult> {
    const prompt = this.buildSectionPrompt(
      sectionId,
      metadata,
      structure,
      context,
    );

    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        const result = await this.callAI(prompt, sectionId);

        if (result.success && !result.truncated) {
          return result;
        }

        // If truncated and continuation is enabled, try to complete
        if (
          result.truncated &&
          this.config.enableContinuation &&
          result.content
        ) {
          const continuationResult = await this.continueGeneration(
            sectionId,
            result.content,
            metadata,
            structure,
          );
          if (continuationResult.success) {
            return {
              success: true,
              content: result.content + continuationResult.content,
              tokensUsed:
                (result.tokensUsed || 0) + (continuationResult.tokensUsed || 0),
            };
          }
        }

        console.warn(
          `Section ${sectionId} generation attempt ${attempt} failed or truncated`,
        );
      } catch (error) {
        console.error(
          `Section ${sectionId} generation attempt ${attempt} error:`,
          error,
        );

        if (attempt === this.config.maxRetries) {
          return {
            success: false,
            error: `Failed to generate section after ${this.config.maxRetries} attempts: ${error}`,
          };
        }
      }
    }

    return {
      success: false,
      error: `Failed to generate section ${sectionId} after ${this.config.maxRetries} attempts`,
    };
  }

  /**
   * Build optimized prompts for each section type
   */
  private buildSectionPrompt(
    sectionId: string,
    metadata: RepositoryMetadata,
    structure: RepositoryStructure,
    context: Record<string, string>,
  ): string {
    const baseContext = this.buildBaseContext(metadata, structure);
    const contextInfo = Object.keys(context).length > 0 
      ? `\nPrevious sections for reference:\n${Object.entries(context)
          .map(([key, content]) => `${key}:\n${content.slice(0, 200)}...`)
          .join('\n\n')}`
      : '';
    
    const sectionPrompts: Record<string, string> = {
      header: `Generate a stunning, professional README header section for "${metadata.name}".

Context: ${baseContext}${contextInfo}

Create a header that includes:
1. Centered title and tagline using HTML tags
2. Professional badge collection (build status, license, PRs welcome, GitHub stars)
3. Brief compelling description (2-3 sentences)

Example format to follow:
<p align="center">
  <h1>${metadata.name}</h1>
  <p align="center">Compelling one-line tagline that captures the project's essence</p>
  <p align="center">
    <img alt="Build Status" src="https://img.shields.io/badge/build-passing-brightgreen?style=flat-square" />
    <img alt="License" src="https://img.shields.io/badge/license-${metadata.license || 'MIT'}-blue.svg?style=flat-square" />
    <img alt="PRs Welcome" src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square" />
    <img alt="GitHub Stars" src="https://img.shields.io/github/stars/USER/REPO?style=flat-square&color=yellow" />
  </p>
</p>

Requirements:
- Use HTML for perfect alignment
- Create an engaging tagline that explains what the project does
- Include realistic badge URLs appropriate for ${structure.projectType} projects
- Make it visually appealing and professional
- Add a horizontal rule (---) after the header

Return only the markdown/HTML content, no explanations.`,

      description: `Generate a compelling strategic description section for "${metadata.name}".

Context: ${baseContext}
Project Type: ${structure.projectType}
Technologies: ${structure.techStack.primary}, ${structure.techStack.frameworks.join(", ")}

Create two main sections:

## The Strategic "Why"
> Start with a blockquote explaining the problem this project solves. What pain point does it address? Why does this project exist?

Follow with 2-3 paragraphs that explain:
- The core problem in the industry/domain
- How this project solves it uniquely
- The value it provides to users
- Who the target audience is

Make it engaging and professional. Focus on the business case and user benefits, not just technical features.

Requirements:
- Start with "## The Strategic \"Why\"" as the section header
- Use blockquote (>) for the opening problem statement
- Write in a professional, compelling tone
- Avoid technical jargon - focus on benefits
- 3-4 well-structured paragraphs total
- No placeholder text - create realistic, specific content

Return only the markdown content.`,

      features: `Generate a comprehensive "Key Features" section for "${metadata.name}".

Context: ${baseContext}
Tech Stack: ${structure.techStack.primary}, ${structure.techStack.frameworks.join(", ")}
Project Type: ${structure.projectType}

Create a section called "## Key Features" with 6-8 compelling features that highlight:
- Core functionality and capabilities
- Technical advantages (performance, scalability, etc.)
- User experience benefits
- Integration capabilities
- Developer experience improvements

Format each feature as:
*   🚀 **Feature Name**: Clear description explaining the benefit and impact

Example format:
## Key Features

*   ✨ **AI-Powered Analysis**: Intelligently parses your repository's code, dependencies, and structure to understand its core purpose and components.
*   🚀 **Instant Generation**: Get a complete, production-ready solution in mere seconds, drastically reducing development overhead.

Requirements:
- Use bullet points with meaningful emojis
- Bold the feature name
- Focus on user benefits, not just technical specs
- Make each description 1-2 sentences
- Use action-oriented language
- Be specific about value propositions
- No placeholder content - generate realistic features based on the project type

Return only the markdown content.`,

      installation: `Generate comprehensive installation and setup instructions for "${metadata.name}".

Context: ${baseContext}
Package Files: ${structure.packageFiles.join(", ")}
Tech Stack: ${structure.techStack.primary}
Project Type: ${structure.projectType}

Create a detailed "## Operational Setup" section with:

### Prerequisites
List specific software requirements with versions

### Installation
Step-by-step installation process with multiple package managers if applicable

### Environment Configuration  
Explain any required environment variables or configuration files

Format example:
## Operational Setup

Follow these steps to get ${metadata.name} up and running on your local machine.

### Prerequisites

Ensure you have the following installed:

*   **Node.js**: LTS version (e.g., 18.x or 20.x)
*   **npm** (Node Package Manager), **yarn**, or **pnpm** (preferred)

### Installation

1.  **Clone the repository**:
    \`\`\`bash
    git clone https://github.com/user/repo.git
    cd repo
    \`\`\`

2.  **Install dependencies**:
    [Include commands for different package managers]

3.  **Start the development server**:
    [Include appropriate start commands]

### Environment Configuration
[Explain .env setup if needed]

Requirements:
- Use numbered lists for steps
- Include code blocks with proper syntax highlighting
- Provide multiple installation options when relevant
- Be specific about versions and requirements
- Include verification steps
- No placeholder content

Return only the markdown content.`,

      usage: `Generate usage examples for "${metadata.name}".

Context: ${baseContext}
Project Type: ${structure.projectType}

Requirements:
- Basic usage example
- Code examples with syntax highlighting
- Input/output examples if applicable
- Common use cases
- Links to more examples if needed

Return only the markdown content.`,

      api: `Generate API documentation section for "${metadata.name}".

Context: ${baseContext}

Requirements:
- API overview
- Authentication (if applicable)
- Main endpoints or functions
- Request/response examples
- Error handling

Return only the markdown content.`,

      configuration: `Generate configuration section for "${metadata.name}".

Context: ${baseContext}
Config Files: ${structure.configFiles.join(", ")}

Requirements:
- Configuration options
- Environment variables
- Config file examples
- Default values
- Important settings

Return only the markdown content.`,

      development: `Generate development setup section for "${metadata.name}".

Context: ${baseContext}

Requirements:
- Local development setup
- Development dependencies
- Build process
- Development server
- File structure overview

Return only the markdown content.`,

      contributing: `Generate comprehensive contributing guidelines for "${metadata.name}".

Context: ${baseContext}
Project Type: ${structure.projectType}

Create a detailed section explaining how to contribute with:
- Welcoming introduction
- Step-by-step contribution process
- Code standards and requirements
- Reference to code of conduct

Format as subsection of larger "Community & Governance" section:

### Contributing

We encourage and appreciate community contributions. If you're looking to contribute, please follow these guidelines:

1.  **Fork** the repository.
2.  **Create a new branch** for your feature or bug fix: \`git checkout -b feature/your-feature-name\` or \`bugfix/issue-description\`.
3.  **Commit your changes** with clear and concise messages.
4.  **Push your branch** to your forked repository.
5.  **Open a Pull Request** against the \`main\` branch of this repository, describing your changes in detail.

Please ensure your code adheres to the project's coding standards and includes appropriate tests. For more details, please refer to our [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

Requirements:
- Welcoming and encouraging tone
- Clear step-by-step process
- Mention testing and code standards
- Professional formatting
- No placeholder content

Return only the markdown content.`,

      deployment: `Generate deployment section for "${metadata.name}".

Context: ${baseContext}
Project Type: ${structure.projectType}

Requirements:
- Deployment options
- Build process
- Environment setup
- Platform-specific instructions
- Best practices

Return only the markdown content.`,

      examples: `Generate examples section for "${metadata.name}".

Context: ${baseContext}

Requirements:
- Code examples
- Use case scenarios
- Working demos
- Integration examples
- Links to live examples

Return only the markdown content.`,

      testing: `Generate testing section for "${metadata.name}".

Context: ${baseContext}
Tools: ${structure.techStack.tools.join(", ")}

Requirements:
- How to run tests
- Test types available
- Coverage information
- Writing tests
- Testing best practices

Return only the markdown content.`,

      license: `Generate a professional license section for "${metadata.name}".

Context: ${baseContext}
License: ${metadata.license || "MIT License"}

Create a comprehensive "## Community & Governance" section that includes:

### Contributing subsection
### License subsection with detailed explanation

Format example:
## Community & Governance

We welcome contributions and feedback from the community to make ${metadata.name} even better!

### Contributing

We encourage and appreciate community contributions. If you're looking to contribute, please follow these guidelines:

1.  **Fork** the repository.
2.  **Create a new branch** for your feature or bug fix: \`git checkout -b feature/your-feature-name\`.
3.  **Commit your changes** with clear and concise messages.
4.  **Push your branch** to your forked repository.
5.  **Open a Pull Request** against the \`main\` branch, describing your changes in detail.

### License

This project is licensed under the **${metadata.license || "MIT License"}**.

[Include 2-3 sentences explaining what this license allows and its key terms]

For the full text of the license, please see the [LICENSE](LICENSE) file in this repository.

Requirements:
- Professional, welcoming tone
- Clear contribution process
- Detailed license explanation
- No placeholder content

Return only the markdown content.`,

      architecture: `Generate a comprehensive "Technical Architecture" section for "${metadata.name}".

Context: ${baseContext}
Tech Stack: ${structure.techStack.primary}, ${structure.techStack.frameworks.join(", ")}, ${structure.techStack.tools.join(", ")}
Project Type: ${structure.projectType}

Create a section that includes:
1. Architecture overview paragraph
2. Technology stack table
3. Key benefits explanation

Format example:
## Technical Architecture

${metadata.name} is built on a robust and modern tech stack designed for performance, scalability, and an excellent developer experience.

| Technology    | Purpose                    | Key Benefit                                |
| :------------ | :------------------------- | :----------------------------------------- |
| **Technology1**   | Primary Purpose        | Main advantage or benefit                  |
| **Technology2**| Secondary Purpose       | Performance/Developer experience benefit    |

Requirements:
- Start with compelling architecture description
- Use a well-formatted table with technology, purpose, and benefit columns
- Include 4-8 key technologies from the tech stack
- Focus on business benefits, not just technical specs
- Professional tone
- No placeholder content - use actual technologies detected

Return only the markdown content.`,

      structure: `Generate a "Directory Structure" visualization for "${metadata.name}".

Context: ${baseContext}
Directories: ${structure.directories.join(", ")}
Root Files: ${structure.rootFiles.join(", ")}
Project Type: ${structure.projectType}

Create a section with:
1. Brief introduction
2. Tree-style directory structure
3. Explanations for key directories/files

Format example:
### Directory Structure

\`\`\`
.
├── 📁 directory1                    # Purpose description
├── 📁 directory2                    # Purpose description  
├── 📄 important-file.json          # File description
├── 📄 config-file.js               # Configuration file purpose
└── 📄 README.md                    # This README file
\`\`\`

Requirements:
- Use tree structure with appropriate Unicode characters
- Add folder (📁) and file (📄) emojis
- Include brief descriptions for each major item
- Focus on the most important 8-12 items
- Make descriptions helpful for new developers
- Use actual directories and files detected in the repository

Return only the markdown content.`,
    };

    return (
      sectionPrompts[sectionId] ||
      this.buildGenericSectionPrompt(sectionId, metadata, structure)
    );
  }

  /**
   * Build base context string to avoid repetition
   */
  private buildBaseContext(
    metadata: RepositoryMetadata,
    structure: RepositoryStructure,
  ): string {
    return `
Repository: ${metadata.name}
Description: ${metadata.description || "No description provided"}
Language: ${metadata.language || "Multiple"}
Stars: ${metadata.stars}
Project Type: ${structure.projectType}
Primary Tech: ${structure.techStack.primary}
Frameworks: ${structure.techStack.frameworks.join(", ") || "None"}
`.trim();
  }

  /**
   * Generic section prompt for unknown sections
   */
  private buildGenericSectionPrompt(
    sectionId: string,
    metadata: RepositoryMetadata,
    structure: RepositoryStructure,
  ): string {
    return `Generate a "${sectionId}" section for the repository "${metadata.name}".

Context: ${this.buildBaseContext(metadata, structure)}

Requirements:
- Professional markdown format
- Clear and concise content
- Relevant to the project type
- Follow README best practices

Return only the markdown content.`;
  }

  /**
   * Continue generation for truncated content
   */
  private async continueGeneration(
    sectionId: string,
    partialContent: string,
    metadata: RepositoryMetadata,
    structure: RepositoryStructure,
  ): Promise<GenerationResult> {
    const prompt = `Continue the following "${sectionId}" section for "${metadata.name}":

${partialContent}

Project Context: ${this.buildBaseContext(metadata, structure)}

Continue from where it left off. Complete the section with proper markdown formatting.
Return only the continuation content.`;

    return this.callAI(prompt, `${sectionId}-continuation`);
  }

  /**
   * Call AI model with proper error handling and token management
   */
  private async callAI(
    prompt: string,
    sectionId: string,
  ): Promise<GenerationResult> {
    try {
      const model = this.genAI.getGenerativeModel({
        model: "gemini-1.5-pro",
        generationConfig: {
          temperature: this.config.temperature,
          topP: 0.95,
          maxOutputTokens: this.config.maxTokensPerSection,
        },
      });

      const result = await model.generateContent(prompt);
      const response = result.response;
      const content = response.text();

      // Check if response was truncated
      const truncated = this.isResponseTruncated(content, sectionId);

      return {
        success: true,
        content: content.trim(),
        tokensUsed: this.estimateTokens(prompt + content),
        truncated,
      };
    } catch (error) {
      return {
        success: false,
        error: `AI generation failed: ${error}`,
      };
    }
  }

  /**
   * Detect if response was truncated
   */
  private isResponseTruncated(content: string, sectionId: string): boolean {
    const truncationIndicators = [
      "...",
      "truncated",
      "continued",
      "[end of response]",
    ];

    const contentLower = content.toLowerCase();
    const hasIndicators = truncationIndicators.some((indicator) =>
      contentLower.includes(indicator),
    );

    // Check if content ends abruptly without proper markdown closure
    const endsAbruptly =
      !content.trim().endsWith(".") &&
      !content.trim().endsWith("\n") &&
      content.length > 100;

    // Section-specific checks
    const sectionChecks: Record<string, boolean> = {
      installation: !content.includes("```") && content.length > 200,
      usage: !content.includes("```") && content.length > 200,
      api: !content.includes("```") && content.length > 300,
    };

    return hasIndicators || endsAbruptly || sectionChecks[sectionId] || false;
  }

  /**
   * Estimate token usage (rough approximation)
   */
  private estimateTokens(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters for English text
    return Math.ceil(text.length / 4);
  }
}

// ============================================================================
// README ASSEMBLER WITH RETRY LOGIC
// ============================================================================

export class ReadmeAssembler {
  private sectionGenerator: SectionGenerator;
  private config: GenerationConfig;

  constructor(
    sectionGenerator: SectionGenerator,
    config: Partial<GenerationConfig> = {},
  ) {
    this.sectionGenerator = sectionGenerator;
    this.config = {
      maxRetries: 3,
      maxTokensPerSection: 800,
      temperature: 0.7,
      concurrentSections: 3,
      enableContinuation: true,
      ...config,
    };
  }

  /**
   * Generate complete README with retry logic and section management
   */
  async generateCompleteReadme(
    metadata: RepositoryMetadata,
    structure: RepositoryStructure,
    customSections?: ReadmeSection[],
  ): Promise<{
    success: boolean;
    readme?: string;
    sectionsGenerated: number;
    sectionsTotal: number;
    errors: string[];
    tokensUsed: number;
  }> {
    // Plan sections
    const sections =
      customSections || SectionPlanner.planSections(metadata, structure);
    const optimizedSections = SectionPlanner.optimizeSectionOrder(sections);

    const results: Record<string, GenerationResult> = {};
    const errors: string[] = [];
    let totalTokens = 0;

    // Generate sections with controlled concurrency
    await this.generateSectionsInBatches(
      optimizedSections,
      metadata,
      structure,
      results,
      errors,
    );

    // Calculate tokens used
    totalTokens = Object.values(results).reduce(
      (sum, result) => sum + (result.tokensUsed || 0),
      0,
    );

    // Assemble final README
    const readme = this.assembleReadme(optimizedSections, results);
    const successfulSections = Object.values(results).filter(
      (r) => r.success,
    ).length;

    return {
      success: successfulSections > 0,
      readme,
      sectionsGenerated: successfulSections,
      sectionsTotal: optimizedSections.length,
      errors,
      tokensUsed: totalTokens,
    };
  }

  /**
   * Generate sections in controlled batches to manage API limits
   */
  private async generateSectionsInBatches(
    sections: ReadmeSection[],
    metadata: RepositoryMetadata,
    structure: RepositoryStructure,
    results: Record<string, GenerationResult>,
    errors: string[],
  ): Promise<void> {
    const batches = this.createSectionBatches(sections);

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      console.log(
        `Generating batch ${batchIndex + 1}/${batches.length} with sections: ${batch.map((s) => s.id).join(", ")}`,
      );

      // Generate sections in current batch concurrently
      const batchPromises = batch.map(async (section) => {
        const context = this.buildSectionContext(section, results);
        const result = await this.sectionGenerator.generateSection(
          section.id,
          metadata,
          structure,
          context,
        );

        results[section.id] = result;

        if (!result.success) {
          errors.push(`Failed to generate ${section.id}: ${result.error}`);
        }

        return result;
      });

      await Promise.all(batchPromises);

      // Add delay between batches to respect API limits
      if (batchIndex < batches.length - 1) {
        await this.delay(1000); // 1 second delay
      }
    }

    // Retry failed critical sections
    await this.retryFailedCriticalSections(
      sections,
      metadata,
      structure,
      results,
      errors,
    );
  }

  /**
   * Create batches respecting dependencies and concurrency limits
   */
  private createSectionBatches(sections: ReadmeSection[]): ReadmeSection[][] {
    const batches: ReadmeSection[][] = [];
    const processed = new Set<string>();
    const remaining = [...sections];

    while (remaining.length > 0) {
      const currentBatch: ReadmeSection[] = [];
      const toRemove: number[] = [];

      for (
        let i = 0;
        i < remaining.length &&
        currentBatch.length < this.config.concurrentSections;
        i++
      ) {
        const section = remaining[i];

        // Check if dependencies are satisfied
        const dependenciesSatisfied = section.dependencies.every((depId) =>
          processed.has(depId),
        );

        if (dependenciesSatisfied) {
          currentBatch.push(section);
          processed.add(section.id);
          toRemove.push(i);
        }
      }

      // Remove processed sections (in reverse order to maintain indices)
      for (let i = toRemove.length - 1; i >= 0; i--) {
        remaining.splice(toRemove[i], 1);
      }

      if (currentBatch.length > 0) {
        batches.push(currentBatch);
      } else if (remaining.length > 0) {
        // If no sections can be processed, there might be circular dependencies
        // Add the first remaining section to break the cycle
        const section = remaining.shift()!;
        processed.add(section.id);
        batches.push([section]);
      }
    }

    return batches;
  }

  /**
   * Build context for section generation based on previously generated sections
   */
  private buildSectionContext(
    section: ReadmeSection,
    results: Record<string, GenerationResult>,
  ): Record<string, string> {
    const context: Record<string, string> = {};

    for (const depId of section.dependencies) {
      const depResult = results[depId];
      if (depResult && depResult.success && depResult.content) {
        context[depId] = depResult.content;
      }
    }

    return context;
  }

  /**
   * Retry failed critical sections with simplified prompts
   */
  private async retryFailedCriticalSections(
    sections: ReadmeSection[],
    metadata: RepositoryMetadata,
    structure: RepositoryStructure,
    results: Record<string, GenerationResult>,
    errors: string[],
  ): Promise<void> {
    const failedCriticalSections = sections.filter(
      (section) =>
        section.priority === "critical" &&
        (!results[section.id] || !results[section.id].success),
    );

    if (failedCriticalSections.length === 0) {
      return;
    }

    console.log(
      `Retrying ${failedCriticalSections.length} failed critical sections...`,
    );

    for (const section of failedCriticalSections) {
      try {
        // Use simplified prompt for retry
        const simplifiedResult = await this.generateSimplifiedSection(
          section.id,
          metadata,
          structure,
        );

        if (simplifiedResult.success) {
          results[section.id] = simplifiedResult;
          // Remove error from errors array
          const errorIndex = errors.findIndex((error) =>
            error.includes(section.id),
          );
          if (errorIndex !== -1) {
            errors.splice(errorIndex, 1);
          }
        }
      } catch (error) {
        console.error(`Failed to retry section ${section.id}:`, error);
      }
    }
  }

  /**
   * Generate simplified version of section for fallback
   */
  private async generateSimplifiedSection(
    sectionId: string,
    metadata: RepositoryMetadata,
    structure: RepositoryStructure,
  ): Promise<GenerationResult> {
    const simplifiedPrompts: Record<string, string> = {
      header: `# ${metadata.name}\n\n${metadata.description || "A software project."}\n\n![License](https://img.shields.io/badge/license-${metadata.license || "MIT"}-blue.svg)`,
      description: `## Description\n\n${metadata.description || `${metadata.name} is a ${structure.techStack.primary} project.`}`,
      features: `## Features\n\n- Feature 1\n- Feature 2\n- Feature 3`,
      installation: `## Installation\n\n\`\`\`bash\n# Clone the repository\ngit clone https://github.com/user/${metadata.name}.git\ncd ${metadata.name}\n\`\`\``,
      usage: `## Usage\n\nBasic usage example:\n\n\`\`\`${structure.techStack.primary}\n// Your code here\n\`\`\``,
      license: `## License\n\nThis project is licensed under the ${metadata.license || "MIT"} License.`,
    };

    const content =
      simplifiedPrompts[sectionId] ||
      `## ${sectionId.charAt(0).toUpperCase() + sectionId.slice(1)}\n\nTODO: Add ${sectionId} information.`;

    return {
      success: true,
      content,
      tokensUsed: this.estimateTokens(content),
    };
  }

  /**
   * Assemble final README from section results
   */
  private assembleReadme(
    sections: ReadmeSection[],
    results: Record<string, GenerationResult>,
  ): string {
    const readmeParts: string[] = [];

    for (const section of sections) {
      const result = results[section.id];

      if (result && result.success && result.content) {
        readmeParts.push(result.content);
        readmeParts.push(""); // Add empty line between sections
      } else {
        // Add placeholder for failed sections
        readmeParts.push(`## ${section.title}`);
        readmeParts.push(
          "*This section could not be generated automatically.*",
        );
        readmeParts.push("");
      }
    }

    return readmeParts.join("\n").trim();
  }

  /**
   * Utility function to add delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Estimate token usage
   */
  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }
}

// ============================================================================
// MAIN MULTI-STEP README GENERATOR
// ============================================================================

export class MultiStepReadmeGenerator {
  private analyzer: RepositoryAnalyzer;
  private sectionGenerator: SectionGenerator;
  private assembler: ReadmeAssembler;

  constructor(
    geminiApiKey: string,
    githubToken?: string,
    config: Partial<GenerationConfig> = {},
  ) {
    this.analyzer = new RepositoryAnalyzer(githubToken);
    this.sectionGenerator = new SectionGenerator(geminiApiKey, config);
    this.assembler = new ReadmeAssembler(this.sectionGenerator, config);
  }

  /**
   * Main function to generate complete README
   */
  async generateReadme(githubUrl: string): Promise<{
    success: boolean;
    readme?: string;
    metadata?: RepositoryMetadata;
    structure?: RepositoryStructure;
    sections?: ReadmeSection[];
    stats: {
      sectionsGenerated: number;
      sectionsTotal: number;
      tokensUsed: number;
      timeElapsed: number;
    };
    errors: string[];
  }> {
    const startTime = Date.now();

    try {
      // Extract owner and repo from URL
      const { owner, repo } = this.parseGithubUrl(githubUrl);

      // Step 1: Analyze repository
      console.log("Step 1: Analyzing repository...");
      const { metadata, structure } = await this.analyzer.analyzeRepository(
        owner,
        repo,
      );

      // Step 2: Plan sections
      console.log("Step 2: Planning README sections...");
      const sections = SectionPlanner.planSections(metadata, structure);

      // Step 3: Generate README
      console.log("Step 3: Generating README sections...");
      const result = await this.assembler.generateCompleteReadme(
        metadata,
        structure,
        sections,
      );

      const endTime = Date.now();

      return {
        success: result.success,
        readme: result.readme,
        metadata,
        structure,
        sections,
        stats: {
          sectionsGenerated: result.sectionsGenerated,
          sectionsTotal: result.sectionsTotal,
          tokensUsed: result.tokensUsed,
          timeElapsed: endTime - startTime,
        },
        errors: result.errors,
      };
    } catch (error) {
      const endTime = Date.now();

      return {
        success: false,
        stats: {
          sectionsGenerated: 0,
          sectionsTotal: 0,
          tokensUsed: 0,
          timeElapsed: endTime - startTime,
        },
        errors: [`Generation failed: ${error}`],
      };
    }
  }

  /**
   * Parse GitHub URL to extract owner and repository name
   */
  private parseGithubUrl(url: string): { owner: string; repo: string } {
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);

    if (!match) {
      throw new Error("Invalid GitHub URL format");
    }

    return {
      owner: match[1],
      repo: match[2].replace(/\.git$/, ""), // Remove .git suffix if present
    };
  }
}

// ============================================================================
// INTEGRATION HELPER FOR NEXT.JS API ROUTES
// ============================================================================

export async function handleReadmeGeneration(
  request: Request,
): Promise<Response> {
  try {
    const body = await request.json();
    const { githubUrl } = body;

    if (!githubUrl) {
      return Response.json(
        { error: "GitHub URL is required" },
        { status: 400 },
      );
    }

    // Initialize generator with environment variables
    const generator = new MultiStepReadmeGenerator(
      process.env.GEMINI_API_KEY!,
      process.env.GITHUB_TOKEN, // Optional
      {
        maxRetries: 3,
        maxTokensPerSection: 800,
        temperature: 0.7,
        concurrentSections: 3,
        enableContinuation: true,
      },
    );

    const result = await generator.generateReadme(githubUrl);

    if (!result.success) {
      return Response.json(
        {
          error: "Failed to generate README",
          details: result.errors,
        },
        { status: 500 },
      );
    }

    return Response.json({
      success: true,
      readme: result.readme,
      stats: result.stats,
      metadata: {
        name: result.metadata?.name,
        description: result.metadata?.description,
        language: result.metadata?.language,
        stars: result.metadata?.stars,
      },
    });
  } catch (error) {
    return Response.json(
      { error: `Internal server error: ${error}` },
      { status: 500 },
    );
  }
}
