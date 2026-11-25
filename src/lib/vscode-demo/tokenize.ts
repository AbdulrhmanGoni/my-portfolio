// Build-time Shiki tokenization for the demo project.
//
// This module is imported only by the static JSON endpoint, never by the
// browser bundle. Each file is tokenized once per build.

import { createHighlighter, type BundledLanguage } from "shiki";
import type { DemoToken } from "../../components/vscode/types";
import { SHIKI_LANGS, type DemoTextEntry } from "./manifest";

const highlighter = await createHighlighter({
  themes: ["dark-plus"],
  langs: SHIKI_LANGS as BundledLanguage[],
});

export async function tokenizeDemoEntry(
  entry: DemoTextEntry,
): Promise<DemoToken[][]> {
  const { tokens } = highlighter.codeToTokens(entry.content, {
    lang: entry.lang as BundledLanguage,
    theme: "dark-plus",
  });

  return tokens.map((line) =>
    line.map((token) => ({
      content: token.content,
      ...(token.color ? { color: token.color } : {}),
      ...(token.fontStyle ? { fontStyle: token.fontStyle } : {}),
    })),
  );
}
