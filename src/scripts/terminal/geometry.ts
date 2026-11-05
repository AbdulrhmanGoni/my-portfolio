// Window sizing and positioning: measuring, placing, clamping, and the
// minimize/restore and maximize/restore transitions. Owns the shared
// placement state privately.

import { MIN_WINDOW_HEIGHT, MIN_WINDOW_WIDTH, desktop, terminal } from "./dom";

export type TerminalGeometry = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export type SavedGeometry = {
  left: number;
  top: number;
  width?: number;
  height?: number;
};

let positionPinnedByUser = false;
let preMinimizeGeometry: SavedGeometry | null = null;
let preMaximizeGeometry: TerminalGeometry | null = null;
let maximized = false;

/** Mark the window position as user-controlled (dragged or resized). */
export function pinPosition() {
  positionPinnedByUser = true;
}

/** Discard the geometry snapshot taken when the window was minimized. */
export function clearPreMinimizeGeometry() {
  preMinimizeGeometry = null;
}

/** Whether the window is currently filling its desktop parent. */
export function isTerminalMaximized() {
  return maximized;
}

/** Leave maximize mode without restoring the saved geometry. */
export function clearMaximizeState() {
  maximized = false;
  preMaximizeGeometry = null;
  terminal?.classList.remove("is-maximized");
}

/** Fill the whole desktop parent, remembering the current geometry. */
export function maximizeTerminal() {
  if (!terminal || !desktop || maximized) return;

  if (terminal.classList.contains("is-minimized")) {
    terminal.classList.remove("is-minimized");
    clearPreMinimizeGeometry();
  }

  preMaximizeGeometry = getTerminalGeometry();

  // Drop the inline size/position so the maximize CSS rule can take over
  // (and keep filling the desktop as the viewport changes).
  terminal.style.removeProperty("left");
  terminal.style.removeProperty("top");
  terminal.style.removeProperty("width");
  terminal.style.removeProperty("height");

  maximized = true;
  terminal.classList.add("is-maximized");
}

/** Restore the geometry saved before the window was maximized. */
export function restoreMaximizedTerminal() {
  if (!terminal || !maximized) return;

  const geometry = preMaximizeGeometry;
  clearMaximizeState();

  if (!geometry) {
    resetTerminalGeometry();
    return;
  }

  applyTerminalGeometry(geometry.left, geometry.top, geometry.width, geometry.height);
  positionPinnedByUser = true;
}

/** Toggle between maximized and restored geometry; returns the new state. */
export function toggleTerminalMaximized() {
  if (maximized) {
    restoreMaximizedTerminal();
  } else {
    maximizeTerminal();
  }
  return maximized;
}

export function getTerminalGeometry(): TerminalGeometry | null {
  if (!terminal || !desktop) return null;
  const rect = terminal.getBoundingClientRect();
  const bounds = desktop.getBoundingClientRect();
  return {
    left: rect.left - bounds.left,
    top: rect.top - bounds.top,
    width: rect.width,
    height: rect.height,
  };
}

export function applyTerminalGeometry(left: number, top: number, width: number, height: number) {
  if (!terminal || !desktop) return;
  const bounds = desktop.getBoundingClientRect();
  const minWidth = Math.min(MIN_WINDOW_WIDTH, bounds.width);
  const minHeight = Math.min(MIN_WINDOW_HEIGHT, bounds.height);
  const nextWidth = Math.min(Math.max(width, minWidth), bounds.width);
  const nextHeight = Math.min(Math.max(height, minHeight), bounds.height);
  const nextLeft = Math.min(Math.max(left, 0), Math.max(0, bounds.width - nextWidth));
  const nextTop = Math.min(Math.max(top, 0), Math.max(0, bounds.height - nextHeight));

  terminal.style.left = `${Math.round(nextLeft)}px`;
  terminal.style.top = `${Math.round(nextTop)}px`;
  terminal.style.width = `${Math.round(nextWidth)}px`;
  terminal.style.height = `${Math.round(nextHeight)}px`;
}

export function setTerminalPosition(left: number, top: number) {
  if (!terminal || !desktop) return;
  const bounds = desktop.getBoundingClientRect();
  const maxLeft = Math.max(0, bounds.width - terminal.offsetWidth);
  const maxTop = Math.max(0, bounds.height - terminal.offsetHeight);
  terminal.style.left = `${Math.round(Math.min(Math.max(left, 0), maxLeft))}px`;
  terminal.style.top = `${Math.round(Math.min(Math.max(top, 0), maxTop))}px`;
}

export function centerTerminal() {
  if (!terminal || !desktop) return;
  const bounds = desktop.getBoundingClientRect();
  setTerminalPosition(
    (bounds.width - terminal.offsetWidth) / 2,
    (bounds.height - terminal.offsetHeight) / 2,
  );
  positionPinnedByUser = false;
}

export function resetTerminalGeometry() {
  terminal?.style.removeProperty("left");
  terminal?.style.removeProperty("top");
  terminal?.style.removeProperty("width");
  terminal?.style.removeProperty("height");
  clearMaximizeState();
  positionPinnedByUser = false;
}

export function clampTerminalPosition() {
  if (!terminal || !desktop) return;
  // The maximize rule keeps the window at 100% of the desktop, so there is
  // nothing to clamp while it is active.
  if (maximized) return;
  if (terminal.classList.contains("is-minimized") && !positionPinnedByUser) {
    centerTerminal();
    return;
  }
  if (terminal.style.width || terminal.style.height) {
    const geometry = getTerminalGeometry();
    if (!geometry) return;
    applyTerminalGeometry(geometry.left, geometry.top, geometry.width, geometry.height);
    return;
  }
  if (!terminal.style.left && !terminal.style.top) return;
  setTerminalPosition(
    Number.parseFloat(terminal.style.left) || 0,
    Number.parseFloat(terminal.style.top) || 0,
  );
}

export function minimizeTerminal() {
  if (!terminal) return;
  const geometry = getTerminalGeometry();
  const hasCustomSize = Boolean(terminal.style.width || terminal.style.height);
  const hasCustomPosition = Boolean(terminal.style.left || terminal.style.top);

  preMinimizeGeometry =
    hasCustomSize && geometry
      ? geometry
      : hasCustomPosition && geometry
        ? { left: geometry.left, top: geometry.top }
        : null;

  resetTerminalGeometry();
  terminal.classList.add("is-minimized");
  centerTerminal();
}

export function restoreTerminal() {
  if (!terminal) return;
  terminal.classList.remove("is-minimized");

  const geometry = preMinimizeGeometry;
  preMinimizeGeometry = null;

  if (!geometry) {
    resetTerminalGeometry();
    return;
  }

  if (geometry.width !== undefined && geometry.height !== undefined) {
    applyTerminalGeometry(geometry.left, geometry.top, geometry.width, geometry.height);
  } else {
    setTerminalPosition(geometry.left, geometry.top);
  }
  positionPinnedByUser = true;
}

/** Keep the window inside the desktop whenever the viewport is resized. */
export function wireViewportClamp() {
  let resizeFrame = 0;
  window.addEventListener("resize", () => {
    if (resizeFrame) return;
    resizeFrame = window.requestAnimationFrame(() => {
      resizeFrame = 0;
      clampTerminalPosition();
    });
  });
}
