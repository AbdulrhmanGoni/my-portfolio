// Registry for every desktop window. It owns the shared viewport clamp and the
// active-window stack, so windows do not need to know about each other.

import {
  AppWindow,
  type AppWindowOptions,
} from "./app-window";
import { optionsFromElement } from "./options";

const windows = new Map<string, AppWindow>();

/**
 * How to create a window that does not exist yet. Applications register a
 * factory for the windows they open on demand.
 */
const factories = new Map<string, () => AppWindow | null>();

let activeWindow: AppWindow | null = null;
let frontmostWindow: AppWindow | null = null;
let zIndex = 0;
let viewportClampWired = false;

/**
 * Keep the dock in sync with the windows that exist.
 *
 * `active` marks that the app has a window open — it stays on while the
 * window is minimized, and only goes away when the window is disposed.
 * `is-focused` marks the window that currently has focus.
 */
function syncDockState(): void {
  for (const win of windows.values()) {
    const item = win.dock?.closest("li");
    if (!item) continue;

    item.classList.add("active");
    item.classList.toggle("is-focused", win === activeWindow && !win.isMinimized);
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
  syncDockState();
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
      syncDockState();
    },
    onDispose: (disposed) => {
      windows.delete(disposed.id);
      if (activeWindow === disposed) activeWindow = null;
      if (frontmostWindow === disposed) frontmostWindow = null;
      // The app no longer has a window open, so the dock stops showing it.
      disposed.dock?.closest("li")?.classList.remove("active", "is-focused");
      syncDockState();
    },
  });

  windows.set(win.id, win);

  // The app now has a window open, so its dock icon shows the running
  // indicator. It stays until the window is disposed.
  win.dock?.closest("li")?.classList.add("active");

  // Give every window an explicit stacking level. Without one it would sit at
  // `z-index: auto` and be buried by any window that was activated, leaving
  // no way to click it and bring it forward.
  raiseWindow(win);

  return win;
}

export function getAppWindow(id: string): AppWindow | undefined {
  return windows.get(id);
}

/**
 * Register how a window is created the first time it is opened. Windows that
 * ship their markup in the page do not need a factory — the registry finds
 * them on its own.
 */
export function registerAppWindowFactory(
  id: string,
  factory: () => AppWindow | null,
): void {
  factories.set(id, factory);
}

/**
 * Open an application window.
 *
 * A window that already exists is brought to the front and given focus. A
 * window that has not been created yet is created from its factory first, so
 * an app can start out closed and only build its window once the user asks for
 * it.
 */
export function openAppWindow(id: string): AppWindow | null {
  const existing = windows.get(id);
  if (existing) {
    if (existing.isMinimized) {
      existing.restore();
    } else {
      existing.activate();
      existing.focus();
    }
    return existing;
  }

  const factory = factories.get(id);
  if (!factory) return null;

  const win = factory();
  if (!win) return null;

  activateWindow(win);
  win.focus();
  return win;
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

    createAppWindow(optionsFromElement(element, desktop));
  }

  wireViewportClamp();

  // Windows are stacked in creation order, so the last one registered is the
  // frontmost. Make it the active window to keep "active" and "frontmost" in
  // agreement.
  const visible = [...windows.values()].filter((win) => !win.isMinimized);
  const frontmost = visible[visible.length - 1];
  if (frontmost) activateWindow(frontmost);
}
