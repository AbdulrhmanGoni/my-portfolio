// The denokv-gui-client application.
//
// The app starts closed: its window is created the first time the dock icon is
// clicked, so the markup stays in a template until the user asks for it.

import { createAppWindowFromTemplate, registerAppWindowFactory } from "../windows";

const APP_ID = "denokv-gui-client";

const template = document.querySelector<HTMLTemplateElement>(
  `[data-app-template="${APP_ID}"]`,
);
const desktop = document.querySelector<HTMLElement>("[data-desktop]");

if (template && desktop) {
  registerAppWindowFactory(APP_ID, () => {
    const win = createAppWindowFromTemplate(template, desktop);
    if (!win) return null;

    // Focus the body of the app so it is ready for keyboard input.
    const body = win.root.querySelector<HTMLElement>("[data-app-body]");
    win.setFocusTarget(() => body);

    return win;
  });
}
