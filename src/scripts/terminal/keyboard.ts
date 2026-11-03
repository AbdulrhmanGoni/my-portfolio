// Global keyboard shortcuts

import { commandInput, helpDialog } from "./dom";
import { openHelpDialog } from "./help";
import { scrollToId } from "./navigation";

export function wireKeyboard() {
  window.addEventListener("keydown", (e) => {
    const target = e.target as HTMLElement | null;
    const typing =
      target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);

    if (e.key === "Escape") {
      helpDialog?.close();
      commandInput?.blur();
      return;
    }

    if (typing) return;

    if (e.key === "/" || e.key === ":") {
      e.preventDefault();
      commandInput?.focus();
      return;
    }

    if (e.key === "?" && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      openHelpDialog();
      return;
    }

    if (e.key === "1") scrollToId("home");
    if (e.key === "2") scrollToId("projects");
    if (e.key === "3") scrollToId("skills");
  });
}
