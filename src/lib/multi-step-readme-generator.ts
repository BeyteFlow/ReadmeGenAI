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

import { GoogleGenerativeAI } from '@google/generative-ai';
import { Octokit } from '@octokit/rest';

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
  | 'web-frontend' 
  | 'web-backend' 
  | 'mobile-app' 
  | 'desktop-app' 
  | 'library' 
  | 'cli-tool' 
  | 'data-science' 
  | 'devops' 
  | 'documentation'
  | 'other';

export interface ReadmeSection {
  id: string;
  title: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
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
  async analyzeRepository(owner: string, repo: string): Promise<{
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
  private async getRepositoryMetadata(owner: string, repo: string): Promise<RepositoryMetadata> {
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
  private async getRepositoryContents(owner: string, repo: string, path = '', maxDepth = 2): Promise<any[]> {
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
        .filter(item => this.isRelevantFile(item.name))
        .slice(0, 100); // Prevent token overflow

      if (maxDepth > 0) {
        // Recursively get important subdirectories
        const subdirectories = filteredContents.filter(item => 
          item.type === 'dir' && this.isImportantDirectory(item.name)
        );

        for (const dir of subdirectories.slice(0, 5)) { // Limit subdirectory exploration
          try {
            const subContents = await this.getRepositoryContents(owner, repo, dir.path, maxDepth - 1);
            filteredContents.push(...subContents);
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
      '.md', '.txt', '.json', '.yml', '.yaml', '.toml', '.ini', '.cfg',
      '.js', '.ts', '.py', '.java', '.go', '.rs', '.cpp', '.c', '.h',
      '.html', '.css', '.scss', '.vue', '.jsx', '.tsx',
      '.dockerfile', '.gitignore', '.env.example'
    ];

    const relevantFiles = [
      'README', 'LICENSE', 'package.json', 'requirements.txt', 'setup.py',
      'Dockerfile', 'docker-compose', 'Makefile', 'cargo.toml', 'go.mod',
      'pom.xml', 'build.gradle', 'composer.json', 'package-lock.json',
      'yarn.lock', '.env.example', '.gitignore', 'tsconfig.json'
    ];

    const lowerFilename = filename.toLowerCase();
    
    return relevantFiles.some(file => lowerFilename.includes(file.toLowerCase())) ||
           relevantExtensions.some(ext => lowerFilename.endsWith(ext)) ||
           lowerFilename.startsWith('.');
  }

  /**
   * Identify important directories for exploration
   */
  private isImportantDirectory(dirname: string): boolean {
    const importantDirs = [
      'src', 'lib', 'app', 'components', 'pages', 'api', 'utils',
      'config', 'scripts', 'docs', 'examples', 'test', 'tests',
      '__tests__', 'spec', 'public', 'assets', 'static'
    ];

    const lowerDirname = dirname.toLowerCase();
    return importantDirs.includes(lowerDirname) && 
           !lowerDirname.includes('node_modules') &&
           !lowerDirname.includes('.git');
  }

  /**
   * Analyze repository structure and detect tech stack
   */
  private analyzeStructure(contents: any[]): RepositoryStructure {
    const files = contents.map(item => item.name || item.path).filter(Boolean);
    
    const rootFiles = files.filter(file => !file.includes('/'));
    const directories = [...new Set(
      files
        .filter(file => file.includes('/'))
        .map(file => file.split('/')[0])
    )];

    // Categorize files
    const packageFiles = files.filter(file => this.isPackageFile(file));
    const configFiles = files.filter(file => this.isConfigFile(file));
    const documentationFiles = files.filter(file => this.isDocumentationFile(file));

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
      'package.json', 'package-lock.json', 'yarn.lock',
      'requirements.txt', 'setup.py', 'pyproject.toml',
      'cargo.toml', 'cargo.lock', 'go.mod', 'go.sum',
      'pom.xml', 'build.gradle', 'composer.json'
    ];
    return packageFiles.some(file => filename.toLowerCase().includes(file));
  }

  private isConfigFile(filename: string): boolean {
    const configFiles = [
      'tsconfig', 'webpack', 'babel', 'eslint', 'prettier',
      'jest', 'cypress', 'dockerfile', 'docker-compose',
      '.env', 'config', 'settings'
    ];
    return configFiles.some(config => filename.toLowerCase().includes(config));
  }

  private isDocumentationFile(filename: string): boolean {
    const lowerFilename = filename.toLowerCase();
    return lowerFilename.includes('readme') ||
           lowerFilename.includes('docs') ||
           lowerFilename.includes('license') ||
           lowerFilename.endsWith('.md') ||
           lowerFilename.endsWith('.txt');
  }

  /**
   * Advanced tech stack detection with confidence scoring
   */
  private detectTechStack(files: string[]): TechStackInfo {
    const techStack: TechStackInfo = {
      primary: 'unknown',
      frameworks: [],
      tools: [],
      databases: [],
      deployment: [],
    };

    // Primary language detection
    const languageIndicators = {
      javascript: ['package.json', '.js', '.jsx'],
      typescript: ['tsconfig.json', '.ts', '.tsx'],
      python: ['requirements.txt', 'setup.py', '.py'],
      java: ['pom.xml', 'build.gradle', '.java'],
      go: ['go.mod', '.go'],
      rust: ['cargo.toml', '.rs'],
      cpp: ['.cpp', '.c', '.h'],
      csharp: ['.cs', '.csproj'],
      php: ['composer.json', '.php'],
      ruby: ['gemfile', '.rb'],
      swift: ['.swift', 'package.swift'],
    };

    let maxScore = 0;
    for (const [lang, indicators] of Object.entries(languageIndicators)) {
      const score = indicators.reduce((sum, indicator) => 
        sum + files.filter(f => f.toLowerCase().includes(indicator.toLowerCase())).length, 0
      );
      if (score > maxScore) {
        maxScore = score;
        techStack.primary = lang;
      }
    }

    // Framework detection
    const frameworkIndicators = {
      react: ['react', 'jsx', 'tsx'],
      vue: ['vue.config', '.vue'],
      angular: ['angular.json', '@angular'],
      svelte: ['svelte.config', '.svelte'],
      nextjs: ['next.config', 'pages/', 'app/'],
      nuxt: ['nuxt.config'],
      express: ['express'],
      django: ['django', 'manage.py'],
      fastapi: ['fastapi'],
      flask: ['flask'],
      spring: ['spring', 'application.properties'],
    };

    for (const [framework, indicators] of Object.entries(frameworkIndicators)) {
      if (indicators.some(indicator => 
        files.some(file => file.toLowerCase().includes(indicator.toLowerCase()))
      )) {
        techStack.frameworks.push(framework);
      }
    }

    // Tool detection
    const toolIndicators = {
      webpack: ['webpack.config'],
      vite: ['vite.config'],
      eslint: ['.eslintrc', 'eslint.config'],
      prettier: ['.prettierrc', 'prettier.config'],
      jest: ['jest.config', 'jest.json'],
      cypress: ['cypress.config', 'cypress/'],
      docker: ['dockerfile', 'docker-compose'],
      github_actions: ['.github/workflows'],
    };

    for (const [tool, indicators] of Object.entries(toolIndicators)) {
      if (indicators.some(indicator => 
        files.some(file => file.toLowerCase().includes(indicator.toLowerCase()))
      )) {
        techStack.tools.push(tool);
      }
    }

    return techStack;
  }

  /**
   * Detect project type based on structure and tech stack
   */
  private detectProjectType(files: string[], directories: string[], techStack: TechStackInfo): ProjectType {
    const hasDirectory = (names: string[]) => 
      names.some(name => directories.some(dir => dir.toLowerCase().includes(name.toLowerCase())));

    const hasFile = (patterns: string[]) =>
      patterns.some(pattern => files.some(file => file.toLowerCase().includes(pattern.toLowerCase())));

    // CLI tool detection
    if (hasFile(['bin/', 'cli.', 'command.', 'main.']) || 
        techStack.frameworks.length === 0 && hasFile(['index.js', 'main.py', 'main.go'])) {
      return 'cli-tool';
    }

    // Mobile app detection
    if (hasFile(['react-native', 'flutter', 'ionic', 'expo']) ||
        hasDirectory(['ios', 'android', 'mobile'])) {
      return 'mobile-app';
    }

    // Desktop app detection
    if (hasFile(['electron', 'tauri', 'nwjs']) ||
        techStack.frameworks.some(f => ['electron', 'tauri'].includes(f))) {
      return 'desktop-app';
    }

    // Web frontend detection
    if (techStack.frameworks.some(f => ['react', 'vue', 'angular', 'svelte'].includes(f)) ||
        hasDirectory(['components', 'pages', 'views']) ||
        hasFile(['index.html', 'app.js', 'main.js'])) {
      return 'web-frontend';
    }

    // Web backend detection
    if (techStack.frameworks.some(f => ['express', 'django', 'flask', 'spring'].includes(f)) ||
        hasDirectory(['api', 'routes', 'controllers', 'models']) ||
        hasFile(['server.', 'app.py', 'main.py'])) {
      return 'web-backend';
    }

    // Library detection
    if (hasFile(['lib/', 'src/lib', 'dist/', 'build/', 'setup.py', 'package.json']) &&
        !hasDirectory(['pages', 'components', 'views'])) {
      return 'library';
    }

    // Data science detection
    if (hasFile(['jupyter', '.ipynb', 'requirements.txt']) &&
        techStack.primary === 'python') {
      return 'data-science';
    }

    // DevOps detection
    if (hasFile(['dockerfile', 'docker-compose', 'kubernetes', 'terraform', '.yml', '.yaml']) ||
        hasDirectory(['k8s', 'kubernetes', 'terraform', 'ansible'])) {
      return 'devops';
    }

    // Documentation detection
    if (hasDirectory(['docs', 'documentation']) &&
        files.filter(f => f.endsWith('.md')).length > 3) {
      return 'documentation';
    }

    return 'other';
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
    structure: RepositoryStructure
  ): ReadmeSection[] {
    const baseSections: ReadmeSection[] = [
      {
        id: 'header',
        title: 'Project Header',
        priority: 'critical',
        order: 1,
        estimatedTokens: 200,
        dependencies: [],
      },
      {
        id: 'description',
        title: 'Description',
        priority: 'critical',
        order: 2,
        estimatedTokens: 300,
        dependencies: ['header'],
      },
      {
        id: 'features',
        title: 'Features',
        priority: 'high',
        order: 3,
        estimatedTokens: 400,
        dependencies: ['description'],
      },
      {
        id: 'installation',
        title: 'Installation',
        priority: 'critical',
        order: 4,
        estimatedTokens: 500,
        dependencies: ['features'],
      },
      {
        id: 'usage',
        title: 'Usage',
        priority: 'high',
        order: 5,
        estimatedTokens: 600,
        dependencies: ['installation'],
      },
      {
        id: 'license',
        title: 'License',
        priority: 'medium',
        order: 10,
        estimatedTokens: 100,
        dependencies: [],
      },
    ];

    // Add conditional sections based on project type and structure
    const conditionalSections = this.getConditionalSections(metadata, structure);
    
    const allSections = [...baseSections, ...conditionalSections];
    
    // Sort by order and return
    return allSections.sort((a, b) => a.order - b.order);
  }

  /**
   * Get additional sections based on project characteristics
   */
  private static getConditionalSections(
    metadata: RepositoryMetadata,
    structure: RepositoryStructure
  ): ReadmeSection[] {
    const sections: ReadmeSection[] = [];

    // API Documentation for backend projects
    if (structure.projectType === 'web-backend' || 
        structure.directories.some(d => d.includes('api'))) {
      sections.push({
        id: 'api',
        title: 'API Documentation',
        priority: 'high',
        order: 6,
        estimatedTokens: 800,
        dependencies: ['usage'],
      });
    }

    // Configuration section for complex projects
    if (structure.configFiles.length > 3) {
      sections.push({
        id: 'configuration',
        title: 'Configuration',
        priority: 'medium',
        order: 7,
        estimatedTokens: 400,
        dependencies: ['installation'],
      });
    }

    // Development section for open-source projects
    if (!metadata.isPrivate && metadata.forks > 0) {
      sections.push({
        id: 'development',
        title: 'Development',
        priority: 'medium',
        order: 8,
        estimatedTokens: 500,
        dependencies: ['usage'],
      });
    }

    // Contributing section for popular projects
    if (metadata.stars > 50 || metadata.forks > 10) {
      sections.push({
        id: 'contributing',
        title: 'Contributing',
        priority: 'medium',
        order: 9,
        estimatedTokens: 300,
        dependencies: [],
      });
    }

    // Deployment section for web applications
    if (structure.projectType === 'web-frontend' || structure.projectType === 'web-backend') {
      sections.push({
        id: 'deployment',
        title: 'Deployment',
        priority: 'medium',
        order: 6.5,
        estimatedTokens: 400,
        dependencies: ['usage'],
      });
    }

    // Examples section for libraries
    if (structure.projectType === 'library' || 
        structure.directories.some(d => d.includes('example'))) {
      sections.push({
        id: 'examples',
        title: 'Examples',
        priority: 'high',
        order: 5.5,
        estimatedTokens: 600,
        dependencies: ['usage'],
      });
    }

    // Testing section for projects with test infrastructure
    if (structure.directories.some(d => d.includes('test')) ||
        structure.techStack.tools.some(t => ['jest', 'cypress', 'pytest'].includes(t))) {
      sections.push({
        id: 'testing',
        title: 'Testing',
        priority: 'low',
        order: 8.5,
        estimatedTokens: 300,
        dependencies: ['development'],
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
        throw new Error(`Circular dependency detected involving section: ${section.id}`);
      }
      if (visited.has(section.id)) {
        return;
      }

      visiting.add(section.id);

      // Visit dependencies first
      for (const depId of section.dependencies) {
        const depSection = sections.find(s => s.id === depId);
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
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
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