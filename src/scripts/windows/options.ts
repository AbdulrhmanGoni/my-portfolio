// Reading a window's configuration out of its markup.
//
// A window describes its own capabilities through data attributes, so the
// markup can be written as a component and still be understood by the
// registry — whether the window was rendered into the page or cloned out of
// a template when it was first opened.

import {
  DEFAULT_MIN_WINDOW_HEIGHT,
  DEFAULT_MIN_WINDOW_WIDTH,
  type AppWindowOptions,
} from "./app-window";

export function numberFromData(value: string | undefined, fallback: number): number {
  const parsed = value === undefined ? Number.NaN : Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function booleanFromData(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  return value !== "false";
}

/** Find the dock icon that opens the window with the given app id. */
export function resolveDock(dockId: string | undefined): HTMLElement | null {
  if (!dockId) return null;

  return (
    Array.from(document.querySelectorAll<HTMLElement>("[data-dock-app]")).find(
      (candidate) => candidate.dataset.dockApp === dockId,
    ) ?? null
  );
}

/** Build the window options described by a window element's data attributes. */
export function optionsFromElement(
  element: HTMLElement,
  desktop: HTMLElement,
): AppWindowOptions {
  return {
    id: element.dataset.appId ?? element.id,
    root: element,
    desktop,
    dock: resolveDock(element.dataset.dock),
    minWidth: numberFromData(element.dataset.minWidth, DEFAULT_MIN_WINDOW_WIDTH),
    minHeight: numberFromData(element.dataset.minHeight, DEFAULT_MIN_WINDOW_HEIGHT),
    draggable: booleanFromData(element.dataset.draggable, true),
    resizable: booleanFromData(element.dataset.resizable, true),
    minimizable: booleanFromData(element.dataset.minimizable, true),
    maximizable: booleanFromData(element.dataset.maximizable, true),
  };
}
