// Terminal keyboard shortcuts. The listener lives on the terminal window
// element, so shortcuts only fire while that window is focused — never from
// the sidebar, the desktop, or a minimized window.

import { commandInput, contentPane, helpDialog, terminal } from "./dom";
import { isTerminalMinimized } from "./geometry";
import { openHelpDialog } from "./help";
import { scrollToId } from "./navigation";

export function wireKeyboard() {
  if (!terminal) return;

  // Clicking anywhere in the window activates it, so shortcuts work without
  // having to click the prompt first. Interactive controls keep their own
  // focus; the help dialog manages its own focus while it is open.
  terminal.addEventListener("pointerdown", (e) => {
    if (isTerminalMinimized() || helpDialog?.open) return;
    const target = e.target as HTMLElement | null;
    if (target?.closest("input, textarea, select, button, a, [tabindex], .resize-handle")) {
      return;
    }
    contentPane?.focus();
  });

  terminal.addEventListener("keydown", (e) => {
    // A minimized window is inert and scaled away; ignore anything that still
    // bubbles out of it.
    if (isTerminalMinimized()) return;

    const target = e.target as HTMLElement | null;
    const typing =
      target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);

    if (e.key === "Escape") {
      if (helpDialog?.open) {
        helpDialog.close();
      } else if (document.activeElement === commandInput) {
        // Leave insert mode but keep the window focused, otherwise focus
        // falls back to <body> and the window stops receiving shortcuts.
        commandInput!.blur();
        contentPane?.focus({ preventScroll: true });
      }
      return;
    }

    if (typing) return;

    // While the manual is open only Esc (handled above) and the dialog's own
    // controls should respond; don't trigger shortcuts behind the overlay.
    if (helpDialog?.open) return;

    if (e.key === "/") {
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
