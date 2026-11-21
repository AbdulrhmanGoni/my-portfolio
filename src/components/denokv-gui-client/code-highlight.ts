import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";

hljs.registerLanguage("javascript", javascript);

/**
 * Highlights a JavaScript value with the shared highlight.js instance.
 *
 * highlight.js escapes the input before wrapping it in token spans, so the
 * returned markup is safe to inject with `{@html}`.
 */
export function highlightCode(code: string): string {
  return hljs.highlight(code, { language: "javascript" }).value;
}
