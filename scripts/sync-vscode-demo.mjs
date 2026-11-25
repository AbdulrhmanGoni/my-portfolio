// Download the pinned denokv-gui-client source used by the VS Code demo.
//
// The repository is extracted into .cache/vscode-demo/repo, which is
// gitignored and kept outside src so tooling does not scan the demo's own
// config files. The build only needs the text files; binaries and lockfiles
// are filtered out by src/lib/vscode-demo/manifest.ts.
//
// Usage:
//   node scripts/sync-vscode-demo.mjs
//   node scripts/sync-vscode-demo.mjs --latest   (bump to main and sync)

import { execFileSync } from "node:child_process";
import { access, mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { x as extract } from "tar";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const configPath = join(root, "scripts/vscode-demo.json");
const target = join(root, ".cache/vscode-demo/repo");
const cacheDir = join(root, ".cache/vscode-demo");
const extractDir = join(cacheDir, "extract");
const marker = join(target, ".demo-ref");

const config = JSON.parse(await readFile(configPath, "utf8"));
let ref = process.env.VSCODE_DEMO_REF ?? config.ref;

if (!ref) {
  throw new Error(`No ref configured in ${configPath}.`);
}

if (process.argv.includes("--latest")) {
  const output = execFileSync(
    "git",
    ["ls-remote", `https://github.com/${config.repo}.git`, "refs/heads/main"],
    { encoding: "utf8" },
  );
  const latest = output.trim().split(/\s+/)[0];

  if (!latest) {
    throw new Error(`Could not resolve refs/heads/main for ${config.repo}.`);
  }

  if (latest !== config.ref) {
    config.ref = latest;
    await writeFile(configPath, `${JSON.stringify(config, null, 2)}\n`);
    console.log(`[vscode-demo] Updated ${configPath} to ${latest}`);
  }

  ref = latest;
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function isCurrent() {
  if (!(await exists(join(target, "package.json")))) return false;
  if (!(await exists(marker))) return false;

  const current = (await readFile(marker, "utf8")).trim();
  return current === ref;
}

if (await isCurrent()) {
  console.log(`[vscode-demo] denokv-gui-client@${ref} is already in place.`);
  process.exit(0);
}

const tarball = join(cacheDir, `${ref}.tar.gz`);
const url = `https://codeload.github.com/${config.repo}/tar.gz/${ref}`;

async function download() {
  if (await exists(tarball)) return;

  console.log(`[vscode-demo] Downloading ${url}`);
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Download failed with status ${response.status} ${response.statusText}.`,
    );
  }

  await writeFile(tarball, Buffer.from(await response.arrayBuffer()));
}

await mkdir(cacheDir, { recursive: true });

try {
  await download();
} catch (error) {
  if (await exists(join(target, "package.json"))) {
    console.warn(`[vscode-demo] Could not download denokv-gui-client@${ref}.`);
    console.warn(`[vscode-demo] Using the existing copy in ${target}.`);
    console.warn(`[vscode-demo] ${error.message}`);
    process.exit(0);
  }

  throw error;
}

console.log(`[vscode-demo] Extracting denokv-gui-client@${ref}`);
await rm(extractDir, { recursive: true, force: true });
await mkdir(extractDir, { recursive: true });

try {
  await extract({ file: tarball, cwd: extractDir, strip: 1 });
} catch (error) {
  await rm(tarball, { force: true });
  throw new Error(
    `Could not extract ${tarball}. The cached download may be corrupt; run the command again.\n${error.message}`,
  );
}

if (
  !(await exists(join(extractDir, "package.json"))) ||
  !(await exists(join(extractDir, "packages/renderer")))
) {
  throw new Error("The downloaded archive does not look like denokv-gui-client.");
}

await mkdir(dirname(target), { recursive: true });
await rm(target, { recursive: true, force: true });
await rename(extractDir, target);
await writeFile(marker, `${ref}\n`);
console.log(`[vscode-demo] Ready: ${target}`);
