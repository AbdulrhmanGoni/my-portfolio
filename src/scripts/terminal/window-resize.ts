// Resizing the window via the edge/corner handles.

import {
  MIN_WINDOW_HEIGHT,
  MIN_WINDOW_WIDTH,
  desktop,
  smallScreenQuery,
  terminal,
} from "./dom";
import {
  applyTerminalGeometry,
  clearMaximizeState,
  getTerminalGeometry,
  pinPosition,
} from "./geometry";

export function wireWindowResize() {
  if (!terminal || !desktop) return;
  const win = terminal;
  const desk = desktop;

  const handles = win.querySelectorAll<HTMLElement>(".resize-handle");
  if (!handles.length) return;

  type ResizeState = {
    pointerId: number;
    direction: string;
    startX: number;
    startY: number;
    startLeft: number;
    startTop: number;
    startWidth: number;
    startHeight: number;
  };

  let resize: ResizeState | null = null;

  const beginResize = (e: PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (smallScreenQuery.matches) return;

    const handle = e.currentTarget as HTMLElement;
    const direction = handle.dataset.resize;
    const geometry = getTerminalGeometry();
    if (!direction || !geometry) return;

    // Take ownership of the current size/position so the CSS defaults can no
    // longer affect the window.
    applyTerminalGeometry(geometry.left, geometry.top, geometry.width, geometry.height);
    clearMaximizeState();
    pinPosition();

    resize = {
      pointerId: e.pointerId,
      direction,
      startX: e.clientX,
      startY: e.clientY,
      startLeft: geometry.left,
      startTop: geometry.top,
      startWidth: geometry.width,
      startHeight: geometry.height,
    };

    win.classList.add("is-resizing");
    handle.setPointerCapture(e.pointerId);
    e.preventDefault();
  };

  const updateResize = (e: PointerEvent) => {
    if (!resize || e.pointerId !== resize.pointerId) return;

    const bounds = desk.getBoundingClientRect();
    const dx = e.clientX - resize.startX;
    const dy = e.clientY - resize.startY;
    const minWidth = Math.min(MIN_WINDOW_WIDTH, bounds.width);
    const minHeight = Math.min(MIN_WINDOW_HEIGHT, bounds.height);
    const { direction } = resize;

    let left = resize.startLeft;
    let top = resize.startTop;
    let width = resize.startWidth;
    let height = resize.startHeight;

    if (direction.includes("w")) {
      left = Math.min(Math.max(left + dx, 0), resize.startLeft + resize.startWidth - minWidth);
      width = resize.startLeft + resize.startWidth - left;
    } else if (direction.includes("e")) {
      width = Math.min(Math.max(width + dx, minWidth), bounds.width - left);
    }

    if (direction.includes("n")) {
      top = Math.min(Math.max(top + dy, 0), resize.startTop + resize.startHeight - minHeight);
      height = resize.startTop + resize.startHeight - top;
    } else if (direction.includes("s")) {
      height = Math.min(Math.max(height + dy, minHeight), bounds.height - top);
    }

    applyTerminalGeometry(left, top, width, height);
  };

  const endResize = (e: PointerEvent) => {
    if (!resize || e.pointerId !== resize.pointerId) return;
    const handle = e.currentTarget as HTMLElement | null;
    resize = null;
    win.classList.remove("is-resizing");
    if (handle?.hasPointerCapture(e.pointerId)) {
      handle.releasePointerCapture(e.pointerId);
    }
  };

  handles.forEach((handle) => {
    handle.addEventListener("pointerdown", beginResize);
    handle.addEventListener("pointermove", updateResize);
    handle.addEventListener("pointerup", endResize);
    handle.addEventListener("pointercancel", endResize);
    handle.addEventListener("lostpointercapture", () => {
      resize = null;
      win.classList.remove("is-resizing");
    });
  });
}
