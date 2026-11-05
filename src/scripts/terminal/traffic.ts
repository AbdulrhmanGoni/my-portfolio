// The traffic-light buttons: minimize/restore and maximize/restore.

import { compactQuery, terminal, trafficMax, trafficMin } from "./dom";
import {
  clearPreMinimizeGeometry,
  isTerminalMaximized,
  minimizeTerminal,
  resetTerminalGeometry,
  restoreTerminal,
  toggleTerminalMaximized,
} from "./geometry";

export function wireTraffic() {
  const minBtn = trafficMin;
  const maxBtn = trafficMax;

  const syncMaxState = () => {
    const maximized = isTerminalMaximized();
    maxBtn?.setAttribute("aria-pressed", String(maximized));
    if (maxBtn) {
      maxBtn.title = maximized ? "restore" : "maximize";
      maxBtn.setAttribute("aria-label", maximized ? "Restore" : "Maximize");
    }
  };

  const syncMinAvailability = () => {
    const available = compactQuery.matches;
    minBtn?.classList.toggle("is-unavailable", !available);
    minBtn?.setAttribute("aria-disabled", String(!available));
    if (minBtn) {
      minBtn.title = available ? "minimize" : "minimize (unavailable on small screens)";
    }
    if (!available) {
      terminal?.classList.remove("is-minimized");
      resetTerminalGeometry();
      clearPreMinimizeGeometry();
      minBtn?.setAttribute("aria-pressed", "false");
      syncMaxState();
    }
  };

  minBtn?.addEventListener("click", () => {
    if (!compactQuery.matches || !terminal) return;
    const shouldMinimize = !terminal.classList.contains("is-minimized");
    if (shouldMinimize) {
      minimizeTerminal();
    } else {
      restoreTerminal();
    }
    minBtn.setAttribute("aria-pressed", String(shouldMinimize));
    syncMaxState();
  });

  compactQuery.addEventListener("change", syncMinAvailability);
  syncMinAvailability();

  maxBtn?.addEventListener("click", () => {
    toggleTerminalMaximized();
    minBtn?.setAttribute("aria-pressed", "false");
    syncMaxState();
  });
}
