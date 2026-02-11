import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../src/app/api/generate/route';

// Mock external libs
vi.mock('@/lib/octokit', () => ({
  getRepoData: vi.fn(async () => ({
    description: 'Mock repo',
    language: 'TypeScript',
    license: { name: 'MIT' },
  })),
  getRepoContents: vi.fn(async () => [
    { name: 'package.json' },
    { name: 'README.md' },
  ]),
}));

vi.mock('@/lib/gemini', () => ({
  getGeminiModel: () => ({
    generateContent: async () => ({
      response: {
        text: () => '# my-repo\n\nGenerated README',
      },
    }),
  }),
}));

describe('POST /api/generate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns generated markdown for a valid GitHub URL', async () => {
    const req = new Request('http://localhost/api/generate', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://github.com/example/my-repo' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.markdown).toContain('# my-repo');
  });

  it('returns error for invalid JSON body', async () => {
    const req = new Request('http://localhost/api/generate', {
      method: 'POST',
      body: 'not-json',
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('Invalid JSON body');
  });

  it('returns error for non-GitHub URL', async () => {
    const req = new Request('http://localhost/api/generate', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://gitlab.com/example/repo' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('Only GitHub URLs are supported');
  });
});
