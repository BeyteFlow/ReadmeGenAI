import { Octokit } from "octokit";

// Private variable for Singleton pattern
let _octokit: Octokit | null = null;

export function getOctokit(): Octokit {
  if (_octokit) return _octokit;

  const auth = process.env.GITHUB_TOKEN;
  
  // We don't throw an error here because Octokit can work without a token 
  // (unauthenticated), though it will be heavily rate-limited.
  _octokit = new Octokit({
    auth: auth || undefined,
  });

  return _octokit;
}

/**
 * Fetches repository metadata safely.
 * Notice we only log the error message, NOT the full error object.
 */
export async function getRepoData(owner: string, repo: string) {
  const client = getOctokit();
  
  try {
    const { data } = await client.rest.repos.get({
      owner,
      repo,
    });
    return data;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Error fetching GitHub repo:", message);
    
    return null;
  }
}
