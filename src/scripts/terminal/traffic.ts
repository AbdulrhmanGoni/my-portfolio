// The traffic-light buttons: close, minimize, and maximize.

import { sidebarTerminalApp, terminal, trafficMax, trafficMin } from "./dom";
import {
  getDockOrigin,
  isTerminalMaximized,
  setTerminalMinimized,
  toggleTerminalMaximized,
} from "./geometry";

export function wireTraffic() {
  const maxBtn = trafficMax;
  const minBtn = trafficMin;

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

  minBtn?.addEventListener("click", () => {
    if (!terminal || !sidebarTerminalApp) return;

    // transform-origin is relative to the window's own border box; anchor it
    // to the dock icon's center so the window collapses into the dock.
    const origin = getDockOrigin(sidebarTerminalApp);
    if (!origin) return;

    terminal.style.transformOrigin = `${origin.x.toFixed(2)}px ${origin.y.toFixed(2)}px`;
    terminal.style.scale = "0";
    setTerminalMinimized(true);
  });

  syncMaxState();
}
