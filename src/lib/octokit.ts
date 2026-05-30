import { Octokit } from "octokit";

type RepoAccessErrorCode =
  | "AUTH_REQUIRED"
  | "NOT_FOUND"
  | "FORBIDDEN"
  | "RATE_LIMITED"
  | "UNKNOWN";

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
      ? error.response.headers
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

  const rateLimitRemaining =
    responseHeaders &&
    "x-ratelimit-remaining" in responseHeaders &&
    responseHeaders["x-ratelimit-remaining"];

  const retryAfter =
    responseHeaders &&
    "retry-after" in responseHeaders &&
    responseHeaders["retry-after"];

  if (
    status === 429 ||
    (status === 403 &&
      (String(rateLimitRemaining) === "0" ||
        retryAfter !== undefined ||
        responseMessage.toLowerCase().includes("rate limit")))
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

  if ((status === 403 || status === 404) && !hasUserAccessToken) {
    return new RepoAccessError(
      "Repository not accessible. It may be private or unavailable. Log in with GitHub if you need access to a private repository.",
      401,
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

  try {
    const { data: repoInfo } = await client.rest.repos.get({
      owner,
      repo,
    });

    const { data: repoTree } = await client.rest.git.getTree({
      owner,
      repo,
      tree_sha: repoInfo.default_branch,
    });

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
