import { commandBar, contentPane, helpDialog } from "./dom";

// Elements that should not respond while the manual is open. The dialog is
// non-modal (it lives inside the terminal window), so the browser will not
// make the rest of the page inert for us.
const behind = [contentPane, commandBar];
let previouslyFocused: HTMLElement | null = null;

function setBehindInert(inert: boolean) {
  for (const el of behind) {
    if (el) el.inert = inert;
  }
}

export function openHelpDialog() {
  if (!helpDialog || helpDialog.open) return;
  previouslyFocused =
    document.activeElement instanceof HTMLElement ? document.activeElement : null;
  setBehindInert(true);
  // Not showModal(): a modal dialog is promoted to the browser's top layer,
  // which escapes the terminal window. show() keeps it clipped to the
  // content pane.
  helpDialog.show();
  // Focus the dialog itself rather than the close button so nothing looks
  // selected when it opens; Tab still reaches the button.
  helpDialog.focus();
}

export function closeHelpDialog() {
  helpDialog?.close();
}

export function wireHelpDialog() {
  if (!helpDialog) return;
  const dialog = helpDialog;

  // The dialog element itself is the dimming layer, so a click that targets it
  // landed on the scrim; clicks on the panel target its descendants.
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) dialog.close();
  });

  // Runs for every close path: close button, Esc, backdrop click, `clear`.
  dialog.addEventListener("close", () => {
    setBehindInert(false);
    previouslyFocused?.focus();
    previouslyFocused = null;
  });

  // Keep Tab focus inside the dialog while it is open.
  dialog.addEventListener("keydown", (e) => {
    if (e.key !== "Tab") return;

    const focusable = dialog.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (e.shiftKey && (active === first || active === dialog)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  });
}
