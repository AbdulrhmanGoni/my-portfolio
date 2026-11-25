// Build-time description of the demo project shown in the VS Code window.
//
// scripts/sync-vscode-demo.mjs downloads a pinned copy of the
// denokv-gui-client repository into .cache/vscode-demo/repo. This module walks
// that directory at build time and keeps text files and PNG images.
// Tokenization happens in ./tokenize.ts and is exposed as one static JSON asset
// per text file by src/pages/vscode/files/[id].json.ts. PNG bytes are served by
// src/pages/vscode/files/[id].png.ts.
//
// Reading with node:fs instead of import.meta.glob keeps the demo sources out
// of Vite's plugin pipeline. Otherwise the Svelte plugin tries to compile the
// demo's .svelte files and resolve their own tsconfig.

import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";

const PROJECT_ROOT = join(process.cwd(), ".cache/vscode-demo/repo");

export const PROJECT_NAME = "denokv-gui-client";

type BaseEntry = {
  /** URL-safe id derived from the path and contents. */
  id: string;
  /** Path relative to the demo project root, e.g. "src/main.ts". */
  path: string;
  /** Human readable language name for the status bar. */
  language: string;
};

export type DemoEntry =
  | (BaseEntry & {
      kind: "text";
      /** Shiki language id. */
      lang: string;
      /** Raw source, only used during the build. */
      content: string;
    })
  | (BaseEntry & {
      kind: "image";
      mime: "image/png";
      /** Raw image data, only used during the build. */
      bytes: Buffer;
    });

/** A text entry, the only kind that goes through Shiki. */
export type DemoTextEntry = Extract<DemoEntry, { kind: "text" }>;

/** An image entry, served as raw PNG bytes. */
export type DemoImageEntry = Extract<DemoEntry, { kind: "image" }>;

type LanguageInfo = {
  lang: string;
  label: string;
};

const plainText: LanguageInfo = { lang: "text", label: "Plain Text" };

const languageByExtension: Record<string, LanguageInfo> = {
  astro: { lang: "astro", label: "Astro" },
  cjs: { lang: "javascript", label: "JavaScript" },
  css: { lang: "css", label: "CSS" },
  cts: { lang: "typescript", label: "TypeScript" },
  html: { lang: "html", label: "HTML" },
  js: { lang: "javascript", label: "JavaScript" },
  json: { lang: "json", label: "JSON" },
  md: { lang: "markdown", label: "Markdown" },
  mjs: { lang: "javascript", label: "JavaScript" },
  mts: { lang: "typescript", label: "TypeScript" },
  png: { lang: "image", label: "Image" },
  sh: { lang: "shellscript", label: "Shell Script" },
  sql: { lang: "sql", label: "SQL" },
  svelte: { lang: "svelte", label: "Svelte" },
  svg: { lang: "xml", label: "XML" },
  ts: { lang: "typescript", label: "TypeScript" },
  tsx: { lang: "tsx", label: "TypeScript React" },
  txt: plainText,
  xml: { lang: "xml", label: "XML" },
  yaml: { lang: "yaml", label: "YAML" },
  yml: { lang: "yaml", label: "YAML" },
};

const languageByFileName: Record<string, LanguageInfo> = {
  LICENSE: plainText,
  ".gitignore": { lang: "text", label: "Ignore" },
  ".npmrc": { lang: "ini", label: "INI" },
  ".nojekyll": plainText,
  ".gitkeep": plainText,
};

const includeExtensions = new Set(Object.keys(languageByExtension));

const includeFileNames = new Set([
  ...Object.keys(languageByFileName),
  "CNAME",
]);

/** Binary formats that get a dedicated preview instead of tokenized text. */
const imageExtensions = new Set(["png"]);

const excludedFileNames = new Set(["pnpm-lock.yaml"]);

/** Binary formats that real VS Code would refuse to open as text. */
const excludedExtensions = new Set(["icns"]);

const skipDirectories = new Set([
  ".git",
  ".astro",
  "dist",
  "node_modules",
]);

function extensionOf(path: string): string {
  const name = path.split("/").pop() ?? "";

  return name.includes(".")
    ? name.slice(name.lastIndexOf(".") + 1).toLowerCase()
    : "";
}

function languageForPath(path: string): LanguageInfo {
  const name = path.split("/").pop() ?? "";
  const special = languageByFileName[name];

  if (special) return special;

  return languageByExtension[extensionOf(path)] ?? plainText;
}

function isIncluded(name: string): boolean {
  if (excludedFileNames.has(name)) return false;

  const extension = extensionOf(name);
  if (excludedExtensions.has(extension)) return false;
  if (includeFileNames.has(name)) return true;

  return includeExtensions.has(extension) || imageExtensions.has(extension);
}

function collectFiles(directory: string): string[] {
  const files: string[] = [];

  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (skipDirectories.has(entry.name)) continue;
      files.push(...collectFiles(join(directory, entry.name)));
      continue;
    }

    if (entry.isFile() && isIncluded(entry.name)) {
      files.push(join(directory, entry.name));
    }
  }

  return files;
}

let sourceFiles: string[];

try {
  sourceFiles = collectFiles(PROJECT_ROOT);
} catch (error) {
  throw new Error(
    `The VS Code demo source is missing. Run \`pnpm demo:sync\` to download it.\n${error instanceof Error ? error.message : String(error)}`,
  );
}

/**
 * Stable, URL-safe id for a file.
 *
 * Hashing the contents lets the JSON response be cached forever: when a file
 * changes, its id (and therefore its URL) changes too.
 */
function contentId(path: string, content: string): string {
  return createHash("sha256")
    .update(`${path}\0${content}`)
    .digest("hex")
    .slice(0, 16);
}

/** Same content-addressing scheme as text files, using the raw bytes. */
function binaryId(path: string, bytes: Buffer): string {
  return createHash("sha256")
    .update(path)
    .update("\0")
    .update(bytes)
    .digest("hex")
    .slice(0, 16);
}

export const demoEntries: DemoEntry[] = sourceFiles
  .map((fullPath): DemoEntry => {
    const path = relative(PROJECT_ROOT, fullPath).split(sep).join("/");
    const language = languageForPath(path);

    if (imageExtensions.has(extensionOf(path))) {
      const bytes = readFileSync(fullPath);

      return {
        id: binaryId(path, bytes),
        path,
        language: language.label,
        kind: "image",
        mime: "image/png",
        bytes,
      };
    }

    const content = readFileSync(fullPath, "utf8");

    return {
      id: contentId(path, content),
      path,
      language: language.label,
      kind: "text",
      lang: language.lang,
      content,
    };
  })
  .sort((a, b) => a.path.localeCompare(b.path));

if (demoEntries.length === 0) {
  throw new Error(
    "The VS Code demo source is empty. Run `pnpm demo:sync` to download it.",
  );
}

/** Metadata safe to serialize into the client. */
export const demoManifest = demoEntries.map(({ id, path, language, kind }) => ({
  id,
  path,
  language,
  kind,
}));

/** Grammars that need to be loaded into Shiki during the build. */
export const SHIKI_LANGS = [
  ...new Set(
    demoEntries
      .filter((entry) => entry.kind === "text")
      .map((entry) => entry.lang)
      .filter((lang) => lang !== "text"),
  ),
];
