import { Octokit } from "octokit";

/**
 *  Note: 
 * We use an environment variable for the token to keep it out of the source code.
 * Even if the token is missing, we initialize the client (it will just be rate-limited).
 */
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

export const octokit = new Octokit({
  auth: GITHUB_TOKEN || undefined,
});

/**
 * Helper to fetch repo metadata safely
 */
export async function getRepoData(owner: string, repo: string) {
  try {
    const { data } = await octokit.rest.repos.get({
      owner,
      repo,
    });
    return data;
  } catch (error) {
    console.error("Error fetching GitHub repo:", error);
    return null;
  }
}