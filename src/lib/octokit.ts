import { Octokit } from "octokit";

let _octokit: Octokit | null = null;

export function getOctokit(): Octokit {
  if (_octokit) return _octokit;

  const auth = process.env.GITHUB_TOKEN;
  
  _octokit = new Octokit({
    auth: auth || undefined,
  });

  return _octokit;
}

/**
 * Fetches repository metadata (stars, description, language)
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
    console.error("Error fetching GitHub repo metadata:", message);
    return null;
  }
}

/**
 * NEW: Fetches the root contents to help Gemini build the File Structure
 */
export async function getRepoContents(owner: string, repo: string) {
  const client = getOctokit();
  
  try {
    const { data } = await client.rest.repos.getContent({
      owner,
      repo,
      path: "", // Root directory
    });
    
    // Return the array of files/folders
    return Array.isArray(data) ? data : [];
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Could not fetch contents";
    console.error("Error fetching GitHub repo contents:", message);
    return [];
  }
}