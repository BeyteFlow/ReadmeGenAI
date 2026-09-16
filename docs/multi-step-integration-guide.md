# Multi-Step README Generation Pipeline - Integration Guide

This guide provides complete instructions for integrating the multi-step README generation pipeline into an existing Next.js application, specifically for the ReadmeGenAI project.

## 📋 Overview

The new pipeline solves the token limit issues by:
- **Section-by-section generation**: Each section is generated individually within token limits
- **Retry logic**: Failed sections are automatically retried with simplified prompts
- **Smart dependency management**: Sections are generated in optimal order based on dependencies
- **Continuation support**: Truncated content can be automatically completed
- **Fallback mechanisms**: Critical sections always have fallback content

## 🚀 Quick Integration

### 1. Install Dependencies

```bash
npm install @google/generative-ai @octokit/rest
```

### 2. Replace Existing API Route

Replace the content of `src/app/api/generate/route.ts`:

```typescript
import { handleReadmeGeneration } from '@/lib/multi-step-readme-generator';

export async function POST(request: Request) {
  return handleReadmeGeneration(request);
}
```

### 3. Environment Variables

Ensure these environment variables are set:

```env
GEMINI_API_KEY=your_gemini_api_key
GITHUB_TOKEN=your_github_token  # Optional but recommended for higher rate limits
```

### 4. Update Frontend (Optional)

Enhance the frontend to show generation progress:

```typescript
// In your component
const [generationStats, setGenerationStats] = useState(null);

const handleGenerate = async (githubUrl: string) => {
  setIsLoading(true);
  
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ githubUrl }),
    });

    const result = await response.json();
    
    if (result.success) {
      setReadme(result.readme);
      setGenerationStats(result.stats);
    } else {
      setError(result.error);
    }
  } catch (error) {
    setError('Generation failed');
  } finally {
    setIsLoading(false);
  }
};
```

## 🔧 Advanced Configuration

### Custom Configuration

You can customize the generation behavior:

```typescript
import { MultiStepReadmeGenerator } from '@/lib/multi-step-readme-generator';

const generator = new MultiStepReadmeGenerator(
  process.env.GEMINI_API_KEY!,
  process.env.GITHUB_TOKEN,
  {
    maxRetries: 5,              // Increase retries for better reliability
    maxTokensPerSection: 1000,  // Allow longer sections
    temperature: 0.5,           // More conservative generation
    concurrentSections: 2,      // Reduce concurrency to avoid rate limits
    enableContinuation: true,   // Enable automatic continuation
  }
);
```

### Custom Section Planning

Define custom sections for specific project types:

```typescript
import { SectionPlanner, ReadmeSection } from '@/lib/multi-step-readme-generator';

// Custom sections for a specific project type
const customSections: ReadmeSection[] = [
  {
    id: 'header',
    title: 'Project Header',
    priority: 'critical',
    order: 1,
    estimatedTokens: 200,
    dependencies: [],
  },
  {
    id: 'quick-start',
    title: 'Quick Start',
    priority: 'high',
    order: 2,
    estimatedTokens: 400,
    dependencies: ['header'],
  },
  // ... more sections
];

const result = await assembler.generateCompleteReadme(
  metadata,
  structure,
  customSections
);
```

## 📊 Monitoring and Analytics

### Generation Stats

The new pipeline provides detailed statistics:

```typescript
interface GenerationStats {
  sectionsGenerated: number;  // How many sections were successfully generated
  sectionsTotal: number;      // Total sections planned
  tokensUsed: number;         // Total tokens consumed
  timeElapsed: number;        // Generation time in milliseconds
}
```

### Error Handling

Comprehensive error information:

```typescript
interface GenerationResult {
  success: boolean;
  readme?: string;
  stats: GenerationStats;
  errors: string[];          // Detailed error messages
}
```

### Logging Integration

Add logging to track generation performance:

```typescript
// In your API route
const result = await generator.generateReadme(githubUrl);

// Log metrics
console.log(`README generated for ${githubUrl}:`, {
  success: result.success,
  sectionsGenerated: result.stats.sectionsGenerated,
  timeElapsed: result.stats.timeElapsed,
  tokensUsed: result.stats.tokensUsed,
});

// Log errors for debugging
if (result.errors.length > 0) {
  console.error('Generation errors:', result.errors);
}
```

## 🔄 Migration from Existing Implementation

### Step 1: Backup Current Implementation

```bash
# Backup current generate route
cp src/app/api/generate/route.ts src/app/api/generate/route.ts.backup
```

### Step 2: Gradual Migration

Implement a feature flag for gradual rollout:

```typescript
// src/app/api/generate/route.ts
import { handleReadmeGeneration as newHandler } from '@/lib/multi-step-readme-generator';
import { handleReadmeGeneration as oldHandler } from '@/lib/old-readme-generator';

export async function POST(request: Request) {
  const useNewPipeline = process.env.USE_NEW_README_PIPELINE === 'true';
  
  if (useNewPipeline) {
    return newHandler(request);
  } else {
    return oldHandler(request);
  }
}
```

### Step 3: A/B Testing

Compare old vs new implementation:

```typescript
export async function POST(request: Request) {
  const body = await request.json();
  const { githubUrl, useNewPipeline } = body;

  if (useNewPipeline) {
    return handleReadmeGeneration(request);
  } else {
    // Use old implementation
    return oldReadmeGeneration(request);
  }
}
```

## 🛠️ Troubleshooting

### Common Issues and Solutions

#### 1. Token Limit Exceeded

**Problem**: Even individual sections exceed token limits
**Solution**: Reduce `maxTokensPerSection` or simplify prompts

```typescript
const generator = new MultiStepReadmeGenerator(apiKey, githubToken, {
  maxTokensPerSection: 600,  // Reduce from default 800
});
```

#### 2. Rate Limiting

**Problem**: API rate limits exceeded
**Solution**: Reduce concurrency and add delays

```typescript
const generator = new MultiStepReadmeGenerator(apiKey, githubToken, {
  concurrentSections: 1,  // Generate one section at a time
});
```

#### 3. GitHub API Rate Limits

**Problem**: Repository analysis fails due to rate limits
**Solution**: Provide GitHub token and implement caching

```typescript
// Implement simple caching
const cache = new Map();

class CachedRepositoryAnalyzer extends RepositoryAnalyzer {
  async analyzeRepository(owner: string, repo: string) {
    const key = `${owner}/${repo}`;
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = await super.analyzeRepository(owner, repo);
    cache.set(key, result);
    
    return result;
  }
}
```

#### 4. Incomplete Sections

**Problem**: Some sections are consistently incomplete
**Solution**: Increase retries or customize prompts

```typescript
// Custom prompt for problematic section
const customPrompts = {
  installation: `Generate concise installation instructions for "${metadata.name}".
  
  Context: ${structure.techStack.primary} project
  
  Requirements:
  - Prerequisites (if any)
  - Single command installation
  - Verification step
  
  Keep it under 300 words. Return only markdown.`,
};
```

### Debug Mode

Enable detailed logging:

```typescript
// Set environment variable
process.env.DEBUG_README_GENERATION = 'true';

// In the generator
if (process.env.DEBUG_README_GENERATION === 'true') {
  console.log('Section generation details:', {
    sectionId,
    prompt: prompt.substring(0, 200) + '...',
    result: result.success ? 'success' : 'failed',
    tokensUsed: result.tokensUsed,
  });
}
```

## 📈 Performance Optimizations

### 1. Caching Strategy

Implement Redis caching for repository analysis:

```typescript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

class CachedAnalyzer extends RepositoryAnalyzer {
  async analyzeRepository(owner: string, repo: string) {
    const key = `repo:${owner}:${repo}`;
    const cached = await redis.get(key);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    const result = await super.analyzeRepository(owner, repo);
    await redis.setex(key, 3600, JSON.stringify(result)); // 1 hour cache
    
    return result;
  }
}
```

### 2. Background Processing

For large repositories, use background jobs:

```typescript
import Bull from 'bull';

const readmeQueue = new Bull('readme generation');

// API route for immediate response
export async function POST(request: Request) {
  const { githubUrl } = await request.json();
  
  const job = await readmeQueue.add('generate', { githubUrl });
  
  return Response.json({
    jobId: job.id,
    status: 'queued',
  });
}

// Background worker
readmeQueue.process('generate', async (job) => {
  const { githubUrl } = job.data;
  const generator = new MultiStepReadmeGenerator(...);
  
  return generator.generateReadme(githubUrl);
});
```

### 3. Streaming Responses

Stream sections as they're generated:

```typescript
export async function POST(request: Request) {
  const { githubUrl } = await request.json();
  
  const stream = new ReadableStream({
    async start(controller) {
      const generator = new MultiStepReadmeGenerator(...);
      
      // Override assembler to stream results
      const originalAssembler = generator.assembler;
      generator.assembler.generateSectionsInBatches = async (...args) => {
        // Stream each section as it's completed
        // Implementation details...
      };
      
      const result = await generator.generateReadme(githubUrl);
      controller.close();
    },
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

## 🧪 Testing

### Unit Tests

```typescript
// __tests__/readme-generator.test.ts
import { MultiStepReadmeGenerator, RepositoryAnalyzer } from '@/lib/multi-step-readme-generator';

describe('MultiStepReadmeGenerator', () => {
  it('should generate complete README for public repository', async () => {
    const generator = new MultiStepReadmeGenerator(
      process.env.GEMINI_API_KEY,
      process.env.GITHUB_TOKEN
    );
    
    const result = await generator.generateReadme(
      'https://github.com/octocat/Hello-World'
    );
    
    expect(result.success).toBe(true);
    expect(result.readme).toContain('# Hello-World');
    expect(result.stats.sectionsGenerated).toBeGreaterThan(0);
  });
});
```

### Integration Tests

```typescript
describe('API Integration', () => {
  it('should handle README generation request', async () => {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        githubUrl: 'https://github.com/octocat/Hello-World'
      }),
    });
    
    const result = await response.json();
    
    expect(response.status).toBe(200);
    expect(result.success).toBe(true);
    expect(result.readme).toBeDefined();
  });
});
```

## 📚 API Reference

### Main Classes

- **`MultiStepReadmeGenerator`**: Main orchestrator class
- **`RepositoryAnalyzer`**: Analyzes GitHub repositories
- **`SectionPlanner`**: Plans optimal README sections
- **`SectionGenerator`**: Generates individual sections
- **`ReadmeAssembler`**: Assembles and validates final README

### Configuration Options

```typescript
interface GenerationConfig {
  maxRetries: number;           // Default: 3
  maxTokensPerSection: number;  // Default: 800
  temperature: number;          // Default: 0.7
  concurrentSections: number;   // Default: 3
  enableContinuation: boolean;  // Default: true
}
```

### Section Types

- **Critical**: `header`, `description`, `installation`
- **High**: `features`, `usage`, `api`
- **Medium**: `configuration`, `development`, `contributing`, `deployment`
- **Low**: `testing`, `examples`

This comprehensive integration guide provides everything needed to successfully implement the multi-step README generation pipeline in the ReadmeGenAI project, solving the token limit issues while providing a more robust and reliable generation process.