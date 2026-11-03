// Window sizing and positioning: measuring, placing, clamping, and the
// minimize/restore transitions. Owns the shared placement state
// (positionPinnedByUser / preMinimizeGeometry) privately.

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

/** Mark the window position as user-controlled (dragged or resized). */
export function pinPosition() {
  positionPinnedByUser = true;
}

/** Discard the geometry snapshot taken when the window was minimized. */
export function clearPreMinimizeGeometry() {
  preMinimizeGeometry = null;
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
  positionPinnedByUser = false;
}

export function clampTerminalPosition() {
  if (!terminal || !desktop) return;
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
