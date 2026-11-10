import { getAppWindow } from "../windows";

export function wireSidebar() {
  document.querySelectorAll<HTMLElement>("[data-dock-app]").forEach((button) => {
    const appId = button.dataset.dockApp;
    if (!appId) return;

    button.addEventListener("click", () => {
      const win = getAppWindow(appId);
      if (!win) return;

      if (win.isMinimized) {
        win.restore();
      } else {
        win.activate();
      }
    });
  });
}
