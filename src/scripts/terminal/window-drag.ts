// Moving the window by dragging its titlebar.

import { desktop, terminal } from "./dom";
import { pinPosition, setTerminalPosition } from "./geometry";

export function wireWindowDrag() {
  if (!terminal || !desktop) return;
  const win = terminal;
  const desk = desktop;
  const titlebar = win.querySelector<HTMLElement>(".titlebar");
  if (!titlebar) return;

  let drag: {
    pointerId: number;
    startX: number;
    startY: number;
    startLeft: number;
    startTop: number;
  } | null = null;

  titlebar.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const target = e.target;
    if (target instanceof Element && target.closest("button, a, input, textarea, select, .traffic, .resize-handle")) {
      return;
    }

    const termRect = win.getBoundingClientRect();
    const desktopRect = desk.getBoundingClientRect();
    drag = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startLeft: termRect.left - desktopRect.left,
      startTop: termRect.top - desktopRect.top,
    };

    win.classList.add("is-dragging");
    titlebar.setPointerCapture(e.pointerId);
    e.preventDefault();
  });

  titlebar.addEventListener("pointermove", (e) => {
    if (!drag || e.pointerId !== drag.pointerId) return;
    pinPosition();
    setTerminalPosition(
      drag.startLeft + (e.clientX - drag.startX),
      drag.startTop + (e.clientY - drag.startY),
    );
  });

  const endDrag = (e: PointerEvent) => {
    if (!drag || e.pointerId !== drag.pointerId) return;
    drag = null;
    win.classList.remove("is-dragging");
    if (titlebar.hasPointerCapture(e.pointerId)) {
      titlebar.releasePointerCapture(e.pointerId);
    }
  };

  titlebar.addEventListener("pointerup", endDrag);
  titlebar.addEventListener("pointercancel", endDrag);
  titlebar.addEventListener("lostpointercapture", () => {
    drag = null;
    win.classList.remove("is-dragging");
  });
}
