#!/usr/bin/env node

// Fetch the current denokv-gui-client release and write it to
// src/data/denokv-gui-client-release.json.
//
// The JSON file is a committed, permanent cache. Astro reads it at build time
// and inlines the values into the generated app. Builds keep using the
// committed snapshot until this script is run again; only the update check
// contacts GitHub at runtime.
//
// Usage:
//   pnpm sync:denokv-release
//   pnpm sync:denokv-release v1.32.0

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPOSITORY = "AbdulrhmanGoni/denokv-gui-client";
const REPOSITORY_URL = `https://github.com/${REPOSITORY}`;
const ELECTRON_RELEASES_URL = "https://releases.electronjs.org/releases.json";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const outputPath = path.resolve(
  scriptDirectory,
  "../src/data/denokv-gui-client-release.json",
);

function parseTag(argv) {
  const tag = argv[0];

  if (tag === undefined) return null;

  if (!/^v\d+\.\d+\.\d+$/.test(tag)) {
    throw new Error(`Invalid release tag "${tag}". Expected a tag like v1.32.1`);
  }

  return tag;
}

function readSnapshotText(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return null;
  }
}

function parseSnapshot(text) {
  if (!text) return null;

  try {
    const snapshot = JSON.parse(text);
    return snapshot && typeof snapshot === "object" ? snapshot : null;
  } catch {
    return null;
  }
}

async function fetchJson(url, options = {}) {
  const { githubApi = false, timeout = 15_000 } = options;
  const headers = {
    "User-Agent": "my-portfolio-denokv-release-sync",
  };

  if (githubApi) {
    headers.Accept = "application/vnd.github+json";
  }

  const response = await fetch(url, {
    headers,
    signal: AbortSignal.timeout(timeout),
  });

  if (!response.ok) {
    throw new Error(
      `${url} responded with ${response.status} ${response.statusText}`,
    );
  }

  return response.json();
}

async function fetchRelease(tag) {
  const url = tag
    ? `https://api.github.com/repos/${REPOSITORY}/releases/tags/${encodeURIComponent(tag)}`
    : `https://api.github.com/repos/${REPOSITORY}/releases/latest`;

  console.log(
    tag
      ? `[denokv-release] Fetching release ${tag}...`
      : "[denokv-release] Fetching the latest release...",
  );

  const release = await fetchJson(url, { githubApi: true });

  if (!release?.tag_name || !release?.html_url) {
    throw new Error("GitHub returned an invalid release payload");
  }

  return release;
}

async function fetchPackageJson(tag) {
  console.log(`[denokv-release] Fetching package.json at ${tag}...`);

  const packageJson = await fetchJson(
    `https://raw.githubusercontent.com/${REPOSITORY}/${encodeURIComponent(tag)}/package.json`,
  );

  if (!packageJson?.name || !packageJson?.version) {
    throw new Error("The tagged package.json is missing its name or version");
  }

  return packageJson;
}

function resolveElectronVersion(packageJson) {
  const electronSpecifier = packageJson.devDependencies?.electron;

  if (!electronSpecifier) {
    throw new Error("The tagged package.json does not declare Electron");
  }

  const versionMatch = String(electronSpecifier).match(
    /v?(\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?)/,
  );

  if (!versionMatch) {
    throw new Error(
      `Could not resolve the Electron version from "${electronSpecifier}"`,
    );
  }

  return versionMatch[1];
}

async function fetchRuntimeVersions(electronVersion) {
  console.log(
    `[denokv-release] Fetching Node and Chromium versions for Electron ${electronVersion}...`,
  );

  const releases = await fetchJson(ELECTRON_RELEASES_URL, {
    timeout: 60_000,
  });
  const release = Array.isArray(releases)
    ? releases.find((item) => item?.version === electronVersion)
    : null;

  if (!release?.node || !release?.chrome) {
    throw new Error(
      `Could not find Node and Chromium versions for Electron ${electronVersion}`,
    );
  }

  return {
    electron: electronVersion,
    node: release.node,
    chromium: release.chrome,
  };
}

async function resolveRuntimeVersions(electronVersion, previousSnapshot) {
  const previousRuntime = previousSnapshot?.runtime;

  if (
    previousRuntime?.electron === electronVersion &&
    previousRuntime.node &&
    previousRuntime.chromium
  ) {
    console.log(
      `[denokv-release] Reusing Node ${previousRuntime.node} and Chromium ${previousRuntime.chromium} from the existing snapshot`,
    );

    return {
      electron: previousRuntime.electron,
      node: previousRuntime.node,
      chromium: previousRuntime.chromium,
    };
  }

  return fetchRuntimeVersions(electronVersion);
}

async function buildSnapshot(tag, previousSnapshot) {
  const release = await fetchRelease(tag);
  const packageJson = await fetchPackageJson(release.tag_name);
  const electronVersion = resolveElectronVersion(packageJson);

  if (release.tag_name.replace(/^v/, "") !== packageJson.version) {
    console.warn(
      `[denokv-release] Release tag ${release.tag_name} does not match package.json version ${packageJson.version}`,
    );
  }

  const runtime = await resolveRuntimeVersions(
    electronVersion,
    previousSnapshot,
  );

  console.log(
    `[denokv-release] ${packageJson.name} v${packageJson.version}: Electron ${runtime.electron}, Node ${runtime.node}, Chromium ${runtime.chromium}`,
  );

  return {
    schemaVersion: 1,
    app: {
      name: packageJson.name,
      version: packageJson.version,
      tag: release.tag_name,
      repository: REPOSITORY_URL,
      publishedAt: release.published_at ?? null,
      releaseUrl: release.html_url,
    },
    runtime,
  };
}

async function main() {
  const tag = parseTag(process.argv.slice(2));
  const previousText = readSnapshotText(outputPath);
  const previousSnapshot = parseSnapshot(previousText);
  const snapshot = await buildSnapshot(tag, previousSnapshot);
  const serialized = `${JSON.stringify(snapshot, null, 2)}\n`;

  if (serialized === previousText) {
    console.log("[denokv-release] The release snapshot is up to date.");
    return;
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  const temporaryPath = `${outputPath}.tmp`;
  fs.writeFileSync(temporaryPath, serialized);
  fs.renameSync(temporaryPath, outputPath);

  console.log(
    `[denokv-release] Wrote ${path.relative(process.cwd(), outputPath)}.`,
  );
}

try {
  await main();
} catch (error) {
  console.error(`[denokv-release] ${error.message}`);
  process.exitCode = 1;
}
