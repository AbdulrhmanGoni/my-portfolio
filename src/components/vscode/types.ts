// Shared types for the read-only VS Code demo window.
//
// Files are tokenized at build time and exposed as one static JSON asset per
// file. The browser fetches a file's tokens the first time it is opened.

export type DemoToken = {
  content: string;
  color?: string;
  /**
   * Shiki font style flags: 1 = italic, 2 = bold, 4 = underline. Kept as a
   * number so the token data can cross the build -> browser boundary as-is.
   */
  fontStyle?: number;
};

export type DemoFileMeta = {
  /** Path relative to the demo project root, e.g. "src/main.ts". */
  path: string;
  /** Human readable language name for the status bar. */
  language: string;
  /** What kind of viewer the editor should use. */
  kind: "text" | "image";
  /**
   * URL of the pre-tokenized JSON for text files, or the PNG asset for images.
   */
  url: string;
};

export type TreeNode = {
  name: string;
  path: string;
  type: "file" | "folder";
  children?: TreeNode[];
};
