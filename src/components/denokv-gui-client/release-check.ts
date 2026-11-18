// Client-side update check for the recreated denokv-gui-client window.
//
// The real application delegates this to electron-updater. The portfolio asks
// the public GitHub API for the latest release instead, which serves CORS
// headers for any origin, so the static site needs no backend or proxy.
//
// Results are cached in sessionStorage because unauthenticated GitHub requests
// are limited to 60 per hour per IP: an automatic check on every reload would
// burn through that quickly.

export type UpdateCheckResult = {
  hasUpdate: boolean;
  latestVersion: string | null;
  latestReleaseUrl: string | null;
  latestPublishedAt: string | null;
  checkedAt: number;
  currentVersion: string;
};

type GitHubRelease = {
  tag_name: string;
  html_url: string;
  published_at?: string | null;
  draft?: boolean;
  prerelease?: boolean;
};

type ParsedVersion = {
  numbers: [number, number, number];
  prerelease: string;
};

const GITHUB_API_URL = "https://api.github.com";
const CACHE_STORAGE_KEY = "denokv-gui-client:update-check";
const CACHE_TTL_MS = 30 * 60 * 1000;

function parseVersion(value: string): ParsedVersion | null {
  const match = value
    .trim()
    .match(/^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$/);

  if (!match) return null;

  return {
    numbers: [Number(match[1]), Number(match[2]), Number(match[3])],
    prerelease: match[4] ?? "",
  };
}

function compareVersions(left: string, right: string): number {
  const leftVersion = parseVersion(left);
  const rightVersion = parseVersion(right);

  if (!leftVersion || !rightVersion) return 0;

  for (let index = 0; index < leftVersion.numbers.length; index += 1) {
    const difference =
      leftVersion.numbers[index] - rightVersion.numbers[index];

    if (difference !== 0) return Math.sign(difference);
  }

  // A release outranks any prerelease of the same version.
  if (!leftVersion.prerelease && rightVersion.prerelease) return 1;
  if (leftVersion.prerelease && !rightVersion.prerelease) return -1;

  return leftVersion.prerelease.localeCompare(rightVersion.prerelease);
}

/** Turns https://github.com/owner/repo into "owner/repo". */
function resolveRepositorySlug(repositoryUrl: string): string | null {
  const match = repositoryUrl.match(
    /github\.com[/:]([^/]+)\/([^/#?]+?)(?:\.git)?(?:[/#?]|$)/i,
  );

  if (!match) return null;

  return `${match[1]}/${match[2]}`;
}

async function requestLatestRelease(
  repository: string,
  signal?: AbortSignal,
): Promise<GitHubRelease> {
  let response: Response;

  try {
    response = await fetch(
      `${GITHUB_API_URL}/repos/${repository}/releases/latest`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
        signal,
      },
    );
  } catch (error) {
    if ((error as Error)?.name === "AbortError") throw error;

    throw new Error("Network connectivity Error");
  }

  if (response.status === 403 || response.status === 429) {
    throw new Error("GitHub rate limit reached. Try again later.");
  }

  if (response.status === 404) {
    throw new Error("The release repository could not be found.");
  }

  if (!response.ok) {
    throw new Error(`Checking for updates failed (${response.status}).`);
  }

  const payload: unknown = await response.json();

  if (
    !payload ||
    typeof payload !== "object" ||
    typeof (payload as GitHubRelease).tag_name !== "string" ||
    typeof (payload as GitHubRelease).html_url !== "string"
  ) {
    throw new Error("GitHub returned an unexpected response.");
  }

  return payload as GitHubRelease;
}

function readCachedResult(currentVersion: string): UpdateCheckResult | null {
  if (typeof sessionStorage === "undefined") return null;

  try {
    const rawValue = sessionStorage.getItem(CACHE_STORAGE_KEY);
    if (!rawValue) return null;

    const cached = JSON.parse(rawValue) as Partial<UpdateCheckResult>;

    if (cached.currentVersion !== currentVersion) return null;
    if (typeof cached.checkedAt !== "number") return null;
    if (Date.now() - cached.checkedAt > CACHE_TTL_MS) return null;
    if (typeof cached.hasUpdate !== "boolean") return null;
    if (
      cached.latestVersion !== null &&
      typeof cached.latestVersion !== "string"
    ) {
      return null;
    }
    if (
      cached.latestReleaseUrl !== null &&
      typeof cached.latestReleaseUrl !== "string"
    ) {
      return null;
    }

    return cached as UpdateCheckResult;
  } catch {
    return null;
  }
}

function writeCachedResult(result: UpdateCheckResult): void {
  if (typeof sessionStorage === "undefined") return;

  try {
    sessionStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(result));
  } catch {
    // Storage can be unavailable (private mode, quota, ...). The in-memory
    // state still works; only the cache is lost.
  }
}

export async function fetchLatestRelease(
  currentVersion: string,
  repositoryUrl: string,
  options: { signal?: AbortSignal; force?: boolean } = {},
): Promise<UpdateCheckResult> {
  const { signal, force = false } = options;

  if (!force) {
    const cached = readCachedResult(currentVersion);
    if (cached) return cached;
  }

  const repository = resolveRepositorySlug(repositoryUrl);

  if (!repository) {
    throw new Error("The release repository is not configured.");
  }

  const release = await requestLatestRelease(repository, signal);
  const version = release.tag_name.replace(/^v/i, "");
  const hasUpdate =
    !release.draft &&
    !release.prerelease &&
    parseVersion(version) !== null &&
    compareVersions(version, currentVersion) > 0;

  const result: UpdateCheckResult = {
    hasUpdate,
    latestVersion: hasUpdate ? version : null,
    latestReleaseUrl: hasUpdate ? release.html_url : null,
    latestPublishedAt: hasUpdate ? (release.published_at ?? null) : null,
    checkedAt: Date.now(),
    currentVersion,
  };

  writeCachedResult(result);

  return result;
}
