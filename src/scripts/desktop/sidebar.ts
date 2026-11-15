import { openAppWindow } from "../windows";

export function wireSidebar() {
  document.querySelectorAll<HTMLElement>("[data-dock-app]").forEach((button) => {
    const appId = button.dataset.dockApp;
    if (!appId) return;

    // The window may not exist yet — apps that start closed are created the
    // first time their icon is clicked.
    button.addEventListener("click", () => {
      openAppWindow(appId);
    });
  });
}
