// Registry for every desktop window. It owns the shared viewport clamp and the
// active-window stack, so windows do not need to know about each other.

import {
  AppWindow,
  DEFAULT_MIN_WINDOW_HEIGHT,
  DEFAULT_MIN_WINDOW_WIDTH,
  type AppWindowOptions,
} from "./app-window";

const windows = new Map<string, AppWindow>();

let activeWindow: AppWindow | null = null;
let frontmostWindow: AppWindow | null = null;
let zIndex = 0;
let viewportClampWired = false;

function numberFromData(value: string | undefined, fallback: number): number {
  const parsed = value === undefined ? Number.NaN : Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function booleanFromData(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  return value !== "false";
}

function syncDockFocus(): void {
  for (const win of windows.values()) {
    const item = win.dock?.closest("li");
    item?.classList.toggle("is-focused", win === activeWindow && !win.isMinimized);
  }
}

/** Move a window to the top of the stacking order. */
function raiseWindow(win: AppWindow): void {
  if (frontmostWindow === win) return;
  frontmostWindow = win;
  win.root.style.zIndex = String(++zIndex);
}

/** Bring a window to the front and make it the active window. */
export function activateWindow(win: AppWindow): void {
  if (win.isMinimized) return;

  if (activeWindow !== win) {
    activeWindow?.setActive(false);
    activeWindow = win;
    win.setActive(true);
  }

  // Always raise, even when the window was already active: another window may
  // have been raised above it in the meantime.
  raiseWindow(win);
  syncDockFocus();
}

export function createAppWindow(options: AppWindowOptions): AppWindow {
  const win = new AppWindow({
    ...options,
    onActivate: (activated) => activateWindow(activated),
    onMinimizeChange: (changed, minimized) => {
      if (minimized && activeWindow === changed) {
        activeWindow = null;
        changed.setActive(false);
      }
      // A minimized window is no longer on screen, so it no longer counts as
      // the frontmost one. This lets it be raised again when it is restored.
      if (minimized && frontmostWindow === changed) {
        frontmostWindow = null;
      }
      syncDockFocus();
    },
    onDispose: (disposed) => {
      windows.delete(disposed.id);
      if (activeWindow === disposed) activeWindow = null;
      if (frontmostWindow === disposed) frontmostWindow = null;
      syncDockFocus();
    },
  });

  windows.set(win.id, win);

  // Give every window an explicit stacking level. Without one it would sit at
  // `z-index: auto` and be buried by any window that was activated, leaving
  // no way to click it and bring it forward.
  raiseWindow(win);

  return win;
}

export function getAppWindow(id: string): AppWindow | undefined {
  return windows.get(id);
}

export function getActiveAppWindow(): AppWindow | null {
  return activeWindow;
}

export function disposeAppWindow(id: string): void {
  windows.get(id)?.dispose();
}

function wireViewportClamp(): void {
  if (viewportClampWired) return;
  viewportClampWired = true;

  let resizeFrame = 0;
  window.addEventListener("resize", () => {
    if (resizeFrame) return;
    resizeFrame = window.requestAnimationFrame(() => {
      resizeFrame = 0;
      for (const win of windows.values()) win.clampToDesktop();
    });
  });
}

/**
 * Create a window instance for every `[data-app-window]` element in the DOM.
 * Application modules can then look their window up by `data-app-id` and add
 * custom behavior.
 */
export function initAppWindows(): void {
  for (const element of document.querySelectorAll<HTMLElement>("[data-app-window]")) {
    const id = element.dataset.appId;
    if (!id || windows.has(id)) continue;

    const desktop = element.closest<HTMLElement>("[data-desktop]") ?? element.parentElement;
    if (!desktop) continue;

    const dockId = element.dataset.dock;
    const dock = dockId
      ? Array.from(document.querySelectorAll<HTMLElement>("[data-dock-app]")).find(
          (candidate) => candidate.dataset.dockApp === dockId,
        ) ?? null
      : null;

    createAppWindow({
      id,
      root: element,
      desktop,
      dock,
      minWidth: numberFromData(element.dataset.minWidth, DEFAULT_MIN_WINDOW_WIDTH),
      minHeight: numberFromData(element.dataset.minHeight, DEFAULT_MIN_WINDOW_HEIGHT),
      draggable: booleanFromData(element.dataset.draggable, true),
      resizable: booleanFromData(element.dataset.resizable, true),
      minimizable: booleanFromData(element.dataset.minimizable, true),
      maximizable: booleanFromData(element.dataset.maximizable, true),
    });
  }

  wireViewportClamp();

  // Windows are stacked in creation order, so the last one registered is the
  // frontmost. Make it the active window to keep "active" and "frontmost" in
  // agreement.
  const visible = [...windows.values()].filter((win) => !win.isMinimized);
  const frontmost = visible[visible.length - 1];
  if (frontmost) activateWindow(frontmost);
}
