// The traffic-light buttons: maximize/restore.

import { trafficMax } from "./dom";
import { isTerminalMaximized, toggleTerminalMaximized } from "./geometry";

export function wireTraffic() {
  const maxBtn = trafficMax;

  const syncMaxState = () => {
    const maximized = isTerminalMaximized();
    maxBtn?.setAttribute("aria-pressed", String(maximized));
    if (maxBtn) {
      maxBtn.title = maximized ? "restore" : "maximize";
      maxBtn.setAttribute("aria-label", maximized ? "Restore" : "Maximize");
    }
  };

  maxBtn?.addEventListener("click", () => {
    toggleTerminalMaximized();
    syncMaxState();
  });

  syncMaxState();
}
