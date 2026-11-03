// The traffic-light buttons: minimize/restore and fullscreen toggle.

import { compactQuery, terminal, trafficMax, trafficMin } from "./dom";
import {
  clearPreMinimizeGeometry,
  minimizeTerminal,
  resetTerminalGeometry,
  restoreTerminal,
} from "./geometry";

export function wireTraffic() {
  const minBtn = trafficMin;

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
  });

  compactQuery.addEventListener("change", syncMinAvailability);
  syncMinAvailability();

  trafficMax?.addEventListener("click", async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch { }
  });
}
