import { helpDialog } from "./dom";

export function openHelpDialog() {
  if (!helpDialog || helpDialog.open) return;
  helpDialog.showModal();
  // showModal() moves focus to the first focusable element (the close
  // button). Focus the dialog itself instead so nothing looks selected
  // when it opens; Tab still reaches the button.
  helpDialog.focus();
}

export function closeHelpDialog() {
  helpDialog?.close();
}

export function wireHelpDialog() {
  if (!helpDialog) return;
  const dialog = helpDialog;

  // Native <dialog> only closes on Esc by default, but we want to treat clicks on the
  // backdrop (outside the dialog box) as a close request too.
  dialog.addEventListener("click", (e) => {
    if (e.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    const inside =
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom;
    if (!inside) dialog.close();
  });
}
