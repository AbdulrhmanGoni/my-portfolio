// Window sizing and positioning: measuring, placing, clamping, and the
// maximize/restore transition. Owns the shared placement state privately.

import {
  MIN_WINDOW_HEIGHT,
  MIN_WINDOW_WIDTH,
  contentPane,
  desktop,
  sidebarTerminalApp,
  terminal,
  trafficMin,
} from "./dom";

export type TerminalGeometry = {
  left: number;
  top: number;
  width: number;
  height: number;
};

let positionPinnedByUser = false;
let preMaximizeGeometry: TerminalGeometry | null = null;
let maximized = false;
let minimized = false;

/** Mark the window position as user-controlled (dragged or resized). */
export function pinPosition() {
  positionPinnedByUser = true;
}

/** Whether the window is currently filling its desktop parent. */
export function isTerminalMaximized() {
  return maximized;
}

/** Whether the window is scaled away into the sidebar dock. */
export function isTerminalMinimized() {
  return minimized;
}

/**
 * Record the minimized state. The caller applies the visual scale; this keeps
 * the window and its controls in sync for keyboard and assistive technology.
 */
export function setTerminalMinimized(value: boolean) {
  if (minimized === value) return;

  minimized = value;

  if (terminal) {
    if (value) {
      // Move focus out before hiding the window from assistive technology.
      sidebarTerminalApp?.focus();
      terminal.setAttribute("inert", "");
      terminal.setAttribute("aria-hidden", "true");
    } else {
      terminal.removeAttribute("aria-hidden");
      terminal.removeAttribute("inert");
      contentPane?.focus();
    }
  }

  trafficMin?.setAttribute("aria-pressed", String(value));
  sidebarTerminalApp?.setAttribute("aria-expanded", String(!value));
  sidebarTerminalApp?.closest("li")?.classList.toggle("is-focused", !value);
}

/**
 * Layout geometry that ignores CSS transforms, so it stays accurate while the
 * window is scaled to zero. `offsetParent` is the desktop, matching the
 * coordinate space used by `getTerminalGeometry`.
 */
export function getLayoutGeometry(): TerminalGeometry | null {
  if (!terminal || !desktop) return null;
  return {
    left: terminal.offsetLeft,
    top: terminal.offsetTop,
    width: terminal.offsetWidth,
    height: terminal.offsetHeight,
  };
}

/**
 * Center of a dock icon expressed in the window's own border-box coordinates.
 * Uses layout offsets so it also works while the window is scaled down.
 */
export function getDockOrigin(icon: Element): { x: number; y: number } | null {
  if (!terminal || !desktop) return null;
  const bounds = desktop.getBoundingClientRect();
  const iconRect = icon.getBoundingClientRect();
  return {
    x: iconRect.left + iconRect.width / 2 - (bounds.left + terminal.offsetLeft),
    y: iconRect.top + iconRect.height / 2 - (bounds.top + terminal.offsetTop),
  };
}

/** Leave maximize mode without restoring the saved geometry. */
export function clearMaximizeState() {
  maximized = false;
  preMaximizeGeometry = null;
  terminal?.classList.remove("is-maximized");
}

/** Fill the whole desktop parent, remembering the current geometry. */
export function maximizeTerminal() {
  if (!terminal || !desktop || maximized || minimized) return;

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
  if (terminal.style.width || terminal.style.height) {
    // Measure the layout box, not the transformed rect: a minimized window is
    // scaled to zero, and clamping that would overwrite the real geometry.
    const geometry = getLayoutGeometry();
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
