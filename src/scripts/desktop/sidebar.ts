import { sidebarTerminalApp, terminal } from "../terminal/dom";
import {
  clampTerminalPosition,
  getDockOrigin,
  isTerminalMinimized,
  setTerminalMinimized,
} from "../terminal/geometry";

export function wireSidebar() {
  sidebarTerminalApp?.addEventListener("click", () => {
    if (!terminal || !isTerminalMinimized()) return;

    setTerminalMinimized(false);
    // Bring the window back inside the current viewport before revealing it.
    clampTerminalPosition();

    // Clamping may have moved the window while it was invisible, so re-anchor
    // the grow animation to the dock icon.
    const origin = getDockOrigin(sidebarTerminalApp!);
    if (origin) {
      terminal.style.transformOrigin = `${origin.x.toFixed(2)}px ${origin.y.toFixed(2)}px`;
    }

    terminal.style.scale = "1";
  })
}