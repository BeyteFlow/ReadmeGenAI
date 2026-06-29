import { Octokit } from "octokit";

type RepoAccessErrorCode =
  "AUTH_REQUIRED" | "NOT_FOUND" | "FORBIDDEN" | "RATE_LIMITED" | "UNKNOWN";

export class RepoAccessError extends Error {
  constructor(
    message: string,
    public status: number,
    public code: RepoAccessErrorCode,
  ) {
    super(message);
    this.name = "RepoAccessError";
  }
}

function createOctokit(accessToken?: string): Octokit {
  return new Octokit({
    auth: accessToken || undefined,
    request: {
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    },
  });
}

function toRepoAccessError(
  error: unknown,
  hasUserAccessToken: boolean,
): RepoAccessError {
  const status =
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof error.status === "number"
      ? error.status
      : 500;

  const responseHeaders =
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null &&
    "headers" in error.response &&
    typeof error.response.headers === "object" &&
    error.response.headers !== null
      ? (error.response.headers as Record<string, unknown>)
      : undefined;

  const responseMessage =
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null &&
    "data" in error.response &&
    typeof error.response.data === "object" &&
    error.response.data !== null &&
    "message" in error.response.data &&
    typeof error.response.data.message === "string"
      ? error.response.data.message
      : "";

  // Normalize header lookup to be case-insensitive
  const getHeader = (name: string) => {
    if (!responseHeaders) return undefined;
    const found = Object.keys(responseHeaders).find(
      (k) => k.toLowerCase() === name.toLowerCase(),
    );
    return found ? responseHeaders[found] : undefined;
  };

  const rateLimitRemaining = getHeader("x-ratelimit-remaining");
  const retryAfter = getHeader("retry-after");

  if (
    status === 429 ||
    (status === 403 &&
      (String(rateLimitRemaining) === "0" ||
        retryAfter !== undefined ||
        (typeof responseMessage === "string" &&
          responseMessage.toLowerCase().includes("rate limit"))))
  ) {
    return new RepoAccessError(
      "GitHub API rate limit reached. Please wait a few minutes and try again.",
      429,
      "RATE_LIMITED",
    );
  }

  if (status === 401) {
    return new RepoAccessError(
      "Access token expired or invalid. Please re-authenticate with GitHub.",
      401,
      "AUTH_REQUIRED",
    );
  }

  if (status === 403 && !hasUserAccessToken) {
    return new RepoAccessError(
      "Repository not accessible. It may be private or unavailable. Log in with GitHub if you need access to a private repository.",
      403,
      "AUTH_REQUIRED",
    );
  }

  if (status === 404) {
    return new RepoAccessError(
      "Repository not found. Please check the URL and try again.",
      404,
      "NOT_FOUND",
    );
  }

  if (status === 403) {
    return new RepoAccessError(
      "GitHub denied access to this repository.",
      403,
      "FORBIDDEN",
    );
  }

  const message =
    error instanceof Error ? error.message : "Could not fetch repository data";

  return new RepoAccessError(message, status, "UNKNOWN");
}

export async function getRepoSnapshot(
  owner: string,
  repo: string,
  accessToken?: string,
) {
  const client = createOctokit(accessToken);

  const getNestedString = (
    obj: unknown,
    path: string[],
  ): string | undefined => {
    let cur: unknown = obj;
    for (const p of path) {
      if (
        typeof cur === "object" &&
        cur !== null &&
        p in (cur as Record<string, unknown>)
      ) {
        cur = (cur as Record<string, unknown>)[p];
      } else {
        return undefined;
      }
    }
    return typeof cur === "string" ? cur : undefined;
  };

  try {
    const { data: repoInfo } = await client.rest.repos.get({
      owner,
      repo,
    });
    let repoTree: Awaited<ReturnType<typeof client.rest.git.getTree>>["data"];
    try {
      ({ data: repoTree } = await client.rest.git.getTree({
        owner,
        repo,
        tree_sha: repoInfo.default_branch,
      }));
    } catch (initialTreeError: unknown) {
      let resolvedTreeSha: string | undefined;

      try {
        const { data: branch } = await client.rest.repos.getBranch({
          owner,
          repo,
          branch: repoInfo.default_branch,
        });

        resolvedTreeSha = getNestedString(branch, [
          "commit",
          "commit",
          "tree",
          "sha",
        ]);

        if (!resolvedTreeSha) {
          const commitSha = getNestedString(branch, ["commit", "sha"]);
          if (commitSha) {
            const { data: commit } = await client.rest.git.getCommit({
              owner,
              repo,
              commit_sha: commitSha,
            });
            resolvedTreeSha =
              typeof commit.tree?.sha === "string"
                ? commit.tree.sha
                : undefined;
          }
        }
      } catch {
        // Ignore fallback resolution errors and rethrow the original tree lookup error below.
      }

      if (!resolvedTreeSha) {
        throw initialTreeError;
      }

      ({ data: repoTree } = await client.rest.git.getTree({
        owner,
        repo,
        tree_sha: resolvedTreeSha,
      }));
    }

    type RepoTreeItem = (typeof repoTree.tree)[number];
    const repoContents = repoTree.tree.filter(
      (item): item is RepoTreeItem & { path: string } =>
        typeof item.path === "string" && !item.path.includes("/"),
    );

    return {
      repoInfo,
      repoContents,
    };
  } catch (error: unknown) {
    throw toRepoAccessError(error, Boolean(accessToken));
  }
}
