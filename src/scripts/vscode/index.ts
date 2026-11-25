// The VS Code application.
//
// The app starts closed: its window is created the first time the dock icon is
// clicked, so the markup stays in a template until the user asks for it.

import { createAppWindowFromTemplate, registerAppWindowFactory } from "../windows";

const APP_ID = "vscode";

const template = document.querySelector<HTMLTemplateElement>(
  `[data-app-template="${APP_ID}"]`,
);
const desktop = document.querySelector<HTMLElement>("[data-desktop]");

if (template && desktop) {
  registerAppWindowFactory(APP_ID, () => {
    const win = createAppWindowFromTemplate(template, desktop);
    if (!win) return null;

    // Focus the embedded app so it is ready for keyboard input.
    const frame = win.root.querySelector<HTMLIFrameElement>("iframe");
    win.setFocusTarget(() => frame);

    return win;
  });
}
